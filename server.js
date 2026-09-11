import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import cors from "cors";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

//Global CORS setup for all incoming paths
app.all("/health", (req, res) => {
  // Clear the payload entirely if it's a HEAD request to prevent size errors
  if (req.method === "HEAD") {
    return res.status(200).end();
  }

  // Normal response for standard GET pings
  res.status(200).json({ status: "ok" });
});

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// 3. Handle OPTIONS preflight queries safely using an Express wild-card array
app.options(/^(.*)$/, cors());

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Initialize payment ────────────────────────────────────────────────────────
app.post("/api/initialize-payment", async (req, res) => {
  try {
    const { amount, txnRef, mobileNumber, emailAddress, isTest } = req.body;

    const useTest =
      process.env.ZAINPAY_IS_TEST === "false" ? false : isTest !== false;

    const baseUrl = useTest
      ? "https://sandbox.zainpay.ng"
      : "https://api.zainpay.ng";

    const publicKey = useTest
      ? process.env.ZAINPAY_TEST_PUBLIC_KEY
      : process.env.ZAINPAY_LIVE_PUBLIC_KEY;

    const zainboxCode = useTest
      ? process.env.ZAINPAY_TEST_ZAINBOX_CODE
      : process.env.ZAINPAY_LIVE_ZAINBOX_CODE;

    if (!publicKey) {
      return res.status(500).json({
        error: `Missing ZAINPAY ${useTest ? "TEST" : "LIVE"} PUBLIC KEY`,
      });
    }

    if (!zainboxCode) {
      return res.status(500).json({
        error: `Missing ZAINPAY ${useTest ? "TEST" : "LIVE"} ZAINBOX CODE`,
      });
    }

    // txnRef will be returned by Zainpay in the redirect as a query parameter
    // Don't embed txnRef in callBackUrl to avoid URL duplication issues
    // Build baseUrl from request to support proxies, load balancers, and multiple environments
    const protocol =
      req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = req.headers["x-forwarded-host"] || req.get("host");
    const appBaseUrl = process.env.PUBLIC_URL || `${protocol}://${host}`;

    const payload = {
      amount: String(amount),
      txnRef,
      mobileNumber,
      zainboxCode,
      emailAddress,
      callBackUrl: `${appBaseUrl}/#/ticket`,
      allowRecurringPayment: false,
      currencyCode: "NGN",
      logoUrl: "https://fabs-masterclass.onrender.com/flier-pricing.jpg",
    };

    console.log("================================");
    console.log("ZAINPAY INITIALIZE REQUEST");
    console.log(JSON.stringify(payload, null, 2));
    console.log("================================");

    const { data } = await axios.post(
      `${baseUrl}/zainbox/card/initialize/payment`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicKey}`,
        },
      },
    );

    console.log("================================");
    console.log("ZAINPAY INITIALIZE RESPONSE");
    console.log(JSON.stringify(data, null, 2));
    console.log("================================");

    return res.status(200).json(data);
  } catch (error) {
    const errData = error.response?.data;
    const errStatus = error.response?.status || 500;
    console.error(
      "ZainPay Init Error:",
      errStatus,
      JSON.stringify(errData, null, 2),
    );
    return res
      .status(errStatus)
      .json(errData || { code: "99", message: error.message });
  }
});

// ── Verify payment after Zainpay redirect ─────────────────────────────────────
// This now does THREE things instead of one:
//   1. Ask Zainpay: "is this payment confirmed?" (v2 endpoint)
//   2. If Zainpay says "not found" (which happens when a card payment hasn't
//      finished settling into their system yet), automatically ask Zainpay to
//      RECONCILE it — this is Zainpay's own tool for "money left the customer's
//      card but hasn't shown up in my transaction list yet."
//   3. After reconciling, check one more time. This means a customer whose
//      payment landed in your Zainbox but never confirmed in your app will now
//      self-heal, without anyone touching Supabase by hand.
app.post("/api/verify-payment", async (req, res) => {
  try {
    const { txnRef } = req.body;

    if (!txnRef) {
      return res.status(400).json({ verified: false, error: "Missing txnRef" });
    }

    const useTest = process.env.ZAINPAY_IS_TEST === "false" ? false : true;
    const baseUrl = useTest
      ? "https://sandbox.zainpay.ng"
      : "https://api.zainpay.ng";
    const publicKey = useTest
      ? process.env.ZAINPAY_TEST_PUBLIC_KEY
      : process.env.ZAINPAY_LIVE_PUBLIC_KEY;

    if (!publicKey) {
      return res.status(500).json({
        verified: false,
        error: `Missing ZAINPAY ${useTest ? "TEST" : "LIVE"} PUBLIC KEY`,
      });
    }

    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${publicKey}`,
    };

    // Zainpay's amounts come back in KOBO (the smallest unit — 100 kobo = ₦1),
    // same as every other money field in their API. Confirmed against a real
    // transaction: Zainpay returned 2999250, and the real amount paid was
    // ₦29,992.50 — i.e. exactly 2999250 / 100. So we always divide by 100.
    const toNaira = (koboValue) => {
      const n = Number(koboValue);
      return Number.isFinite(n) ? n / 100 : 0;
    };

    const callVerifyV2 = () =>
      axios.get(
        `${baseUrl}/virtual-account/wallet/deposit/verify/v2/${txnRef}`,
        {
          headers: authHeaders,
        },
      );

    const callReconcile = () =>
      axios.get(
        `${baseUrl}/virtual-account/wallet/transaction/reconcile/card-payment`,
        { headers: authHeaders, params: { txnRef } },
      );

    console.log("================================");
    console.log("ZAINPAY VERIFY REQUEST — txnRef:", txnRef);
    console.log("================================");

    let zainpayRes;
    try {
      const { data } = await callVerifyV2();
      zainpayRes = data;
    } catch (err) {
      zainpayRes = err.response?.data || { code: "99" };
    }

    console.log(
      "ZAINPAY VERIFY V2 RESPONSE:",
      JSON.stringify(zainpayRes, null, 2),
    );

    // "Txn not found" (code 04) — the payment may have gone through on the
    // customer's card but hasn't synced into Zainpay's transaction list yet.
    // Ask Zainpay to reconcile it, then check again.
    if (zainpayRes.code !== "00") {
      console.log("Verify failed — attempting reconcile for", txnRef);
      try {
        const { data: reconcileRes } = await callReconcile();
        console.log(
          "ZAINPAY RECONCILE RESPONSE:",
          JSON.stringify(reconcileRes, null, 2),
        );
      } catch (err) {
        console.log(
          "ZAINPAY RECONCILE ERROR:",
          JSON.stringify(err.response?.data || err.message),
        );
      }

      // Try verifying again now that reconcile has run.
      try {
        const { data } = await callVerifyV2();
        zainpayRes = data;
        console.log(
          "ZAINPAY VERIFY RETRY RESPONSE:",
          JSON.stringify(zainpayRes, null, 2),
        );
      } catch (err) {
        zainpayRes = err.response?.data || zainpayRes;
      }
    }

    if (zainpayRes.code !== "00" || !zainpayRes.data) {
      return res.status(400).json({
        verified: false,
        error: "Payment not confirmed by Zainpay, even after reconcile",
        details: zainpayRes,
      });
    }

    // Real amount the customer paid, converted from kobo to naira.
    const exactAmount = toNaira(zainpayRes.data.depositedAmount);

    return res.status(200).json({
      verified: true,
      txnRef,
      amount: exactAmount,
      amountAfterCharges: toNaira(zainpayRes.data.amountAfterCharges),
      txnChargesAmount: toNaira(zainpayRes.data.txnChargesAmount),
      txnStatus: "success",
    });
  } catch (error) {
    const errData = error.response?.data;
    const errStatus = error.response?.status || 500;
    console.error(
      "ZainPay Verify Error:",
      errStatus,
      JSON.stringify(errData, null, 2),
    );
    return res
      .status(errStatus)
      .json(errData || { code: "99", message: error.message });
  }
});

// ── Check the Zainbox directly ────────────────────────────────────────────────
// This calls Zainpay to get the REAL list of card transactions for your
// Zainbox — the same data you'd see in the Zainpay dashboard. Use this to
// answer "did this actually reach the Zainbox?" independent of what your own
// database says. Example:
//   GET /api/zainbox-transactions?email=someone@gmail.com
//   GET /api/zainbox-transactions?txnRef=MCFABS-xxxx
//   GET /api/zainbox-transactions?status=success&count=50
app.get("/api/zainbox-transactions", async (req, res) => {
  try {
    const useTest = process.env.ZAINPAY_IS_TEST === "false" ? false : true;
    const baseUrl = useTest
      ? "https://sandbox.zainpay.ng"
      : "https://api.zainpay.ng";
    const publicKey = useTest
      ? process.env.ZAINPAY_TEST_PUBLIC_KEY
      : process.env.ZAINPAY_LIVE_PUBLIC_KEY;
    const zainboxCode = useTest
      ? process.env.ZAINPAY_TEST_ZAINBOX_CODE
      : process.env.ZAINPAY_LIVE_ZAINBOX_CODE;

    const { count, dateFrom, dateTo, email, status, txnRef } = req.query;

    const { data } = await axios.get(
      `${baseUrl}/zainbox/card/transactions/${zainboxCode}`,
      {
        headers: { Authorization: `Bearer ${publicKey}` },
        params: {
          count: count || 20,
          dateFrom,
          dateTo,
          email,
          status,
          txnRef,
        },
      },
    );

    // Convert every kobo amount in the list to plain naira before sending it
    // back, so whatever displays this never has to guess at units again.
    const transactions = (data.data || []).map((t) => ({
      ...t,
      amount: t.amount ? Number(t.amount) / 100 : t.amount,
    }));

    return res.status(200).json({ ...data, data: transactions });
  } catch (error) {
    const errData = error.response?.data;
    const errStatus = error.response?.status || 500;
    console.error(
      "ZainPay Transactions Error:",
      errStatus,
      JSON.stringify(errData),
    );
    return res
      .status(errStatus)
      .json(errData || { code: "99", message: error.message });
  }
});

app.use(express.static(path.join(__dirname, "dist")));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

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

    // txnRef is embedded in callBackUrl so ticket.js always receives it reliably,
    // regardless of whether Zainpay also appends its own query params.
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
      callBackUrl: `${appBaseUrl}/#/ticket?txnRef=${txnRef}`,
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

    console.log("================================");
    console.log("ZAINPAY VERIFY REQUEST — txnRef:", txnRef);
    console.log("================================");

    const { data: zainpayRes } = await axios.get(
      `${baseUrl}/zainbox/card/verify/v2/payment/${txnRef}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicKey}`,
        },
      },
    );

    console.log("================================");
    console.log("ZAINPAY VERIFY RESPONSE");
    console.log(JSON.stringify(zainpayRes, null, 2));
    console.log("================================");

    // Zainpay success: { code: "00", data: { txnStatus: "success", amount, ... } }
    if (zainpayRes.code !== "00" || zainpayRes.data?.txnStatus !== "success") {
      return res.status(400).json({
        verified: false,
        error: "Payment not confirmed by Zainpay",
        details: zainpayRes,
      });
    }

    return res.status(200).json({
      verified: true,
      txnRef,
      amount: zainpayRes.data.amount,
      txnStatus: zainpayRes.data.txnStatus,
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

// ── Serve the SPA ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "dist")));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

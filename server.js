import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

// ── Zainpay payment initialization (secret key stays server-side) ──────────
app.post("/api/initialize-payment", async (req, res) => {
  const { amount, txnRef, mobileNumber, emailAddress, isTest } = req.body;

  const baseUrl = isTest
    ? "https://sandbox.zainpay.ng"
    : "https://api.zainpay.ng";
  const secretKey = isTest
    ? process.env.ZAINPAY_TEST_SECRET_KEY
    : process.env.ZAINPAY_LIVE_SECRET_KEY;
  const zainboxCode = isTest
    ? process.env.ZAINPAY_TEST_ZAINBOX_CODE
    : process.env.ZAINPAY_LIVE_ZAINBOX_CODE;

  if (!secretKey) {
    return res.status(500).json({
      error: "Missing ZAINPAY secret key",
    });
  }

  if (!zainboxCode) {
    return res.status(500).json({
      error: "Missing ZAINPAY zainbox code",
    });
  }

  try {
    console.log({
      isTest,
      hasSecretKey: !!secretKey,
      hasZainboxCode: !!zainboxCode,
      publicUrl: process.env.PUBLIC_URL,
    });

    if (!secretKey) {
      return res.status(500).json({
        error: "Missing ZAINPAY secret key",
      });
    }

    if (!zainboxCode) {
      return res.status(500).json({
        error: "Missing ZAINPAY zainbox code",
      });
    }

    const response = await fetch(`${baseUrl}/zainbox/card/initialize/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify({
        amount,
        txnRef,
        mobileNumber,
        zainboxCode,
        emailAddress,
        callBackUrl: `${process.env.PUBLIC_URL}/ticket`,
        currencyCode: "NGN",
      }),
    });

    const responseText = await response.text();

    console.log("ZainPay Status:", response.status);
    console.log("================================");
    console.log("ZAINPAY RESPONSE");
    console.log(responseText);
    console.log("================================");

    let result;

    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      return res.status(500).json({
        error: "Invalid response from ZainPay",
        raw: responseText,
      });
    }

    if (!response.ok) {
      return res.status(response.status).json(result);
    }

    if (result.code !== "00") {
      return res.status(400).json(result);
    }

    return res.json({
      redirectUrl: result.data,
    });
  } catch (err) {
    console.error("Payment Initialization Error:", err);

    console.log("RAW ZAINPAY RESPONSE:");
    console.log(responseText);

    return res.status(500).json({
      error: "Invalid response from ZainPay",
      raw: responseText,
    });
  }
});

// ── Verify payment after Zainpay redirect ───────────────────────────────────
app.post("/api/verify-payment", async (req, res) => {
  try {
    const { txnRef } = req.body;

    if (!txnRef) {
      return res.status(400).json({ error: "Missing txnRef" });
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

    // Zainpay success shape: { code: "00", data: { txnStatus: "success", amount, ... } }
    if (zainpayRes.code !== "00" || zainpayRes.data?.txnStatus !== "success") {
      return res.status(400).json({
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

// ── Serve the built Vite app for everything else ────────────────────────────
app.use(express.static(path.join(__dirname, "dist")));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(process.env.PORT || 3000);

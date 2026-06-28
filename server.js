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
    console.log("ZainPay Response:", responseText);

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

    return res.status(500).json({
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
});

// ── Serve the built Vite app for everything else ────────────────────────────
app.use(express.static(path.join(__dirname, "dist")));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(process.env.PORT || 3000);

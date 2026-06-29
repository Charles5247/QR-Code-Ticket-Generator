import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

// ── Zainpay payment initialization (secret key stays server-side) ──────────
app.post("/api/initialize-payment", async (req, res) => {
  let responseText = "";

  try {
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

    console.log({
      isTest,
      amount,
      txnRef,
      mobileNumber,
      emailAddress,
      hasSecretKey: !!secretKey,
      hasZainboxCode: !!zainboxCode,
      publicUrl: process.env.PUBLIC_URL,
    });

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

    responseText = await response.text();

    console.log("Status:", response.status);
    console.log("Body:", responseText);

    // TEMPORARY DEBUGGING
    return res.status(response.status).send(responseText);
  } catch (err) {
    console.error("Payment Initialization Error:", err);

    return res.status(500).json({
      error: err.message,
      raw: responseText,
    });
  }
});

// ── Serve the built Vite app for everything else ────────────────────────────
app.use(express.static(path.join(__dirname, "dist")));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(process.env.PORT || 3000);

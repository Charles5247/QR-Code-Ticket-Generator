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

  try {
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

    const result = await response.json();
    if (result.code !== "00") return res.status(400).json(result);
    res.json({ redirectUrl: result.data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Serve the built Vite app for everything else ────────────────────────────
app.use(express.static(path.join(__dirname, "dist")));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(process.env.PORT || 3000);

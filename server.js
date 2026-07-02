import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

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

    const payload = {
      amount: String(amount),
      txnRef,
      mobileNumber,
      zainboxCode,
      emailAddress,
      callBackUrl: `${process.env.PUBLIC_URL}/#/ticket?txnRef=${txnRef}`,
      allowRecurringPayment: false,
      currencyCode: "NGN",
      logoUrl: "https://fabs-masterclass.onrender.com/flier-pricing.jpg",
    };

    console.log("================================");
    console.log("ZAINPAY REQUEST");
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
    console.log("ZAINPAY RESPONSE");
    console.log(JSON.stringify(data, null, 2));
    console.log("================================");

    return res.status(200).json(data);
  } catch (error) {
    const errData = error.response?.data;
    const errStatus = error.response?.status || 500;

    console.error(
      "ZainPay Error:",
      errStatus,
      JSON.stringify(errData, null, 2),
    );

    return res.status(errStatus).json(
      errData || {
        code: "99",
        message: error.message,
      },
    );
  }
});

app.post("/api/verify-payment", (req, res) => {
  try {
    const { txnRef } = req.body;
    if (!txnRef) {
      return res.status(400).json({
        verified: false,
        error: "Missing txnRef",
      });
    }
    // TODO:
    // Call ZainPay verify endpoint here
    return res.json({
      verified: true,
      txnRef,
    });
  } catch (error) {
    return res.status(500).json({
      verified: false,
      error: error.message,
    });
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

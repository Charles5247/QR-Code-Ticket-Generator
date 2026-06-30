// ============================================================
// MC FABS MASTERCLASS — Express Server (Production-Grade)
// ZainPay Redirect/Card Payment Channel
// ============================================================

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// ── Parse JSON bodies ──────────────────────────────────────────────────────
app.use(express.json());

// ── Request logger (minimal, production-safe) ──────────────────────────────
app.use((req, res, next) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method} ${req.path}`);
  next();
});

// ── Health check (Render uses this to confirm the service is up) ───────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "fabs-masterclass",
    ts: new Date().toISOString(),
  });
});

// ── Diagnostics endpoint (shows non-secret env presence) ──────────────────
app.get("/api/diagnostics", (_req, res) => {
  const isTest = process.env.ZAINPAY_IS_TEST !== "false"; // default sandbox
  res.json({
    environment: process.env.NODE_ENV || "production",
    zainpay_mode: isTest ? "sandbox" : "live",
    // Secret keys — only confirm presence, never expose values
    has_test_secret_key: !!process.env.ZAINPAY_TEST_SECRET_KEY,
    has_live_secret_key: !!process.env.ZAINPAY_LIVE_SECRET_KEY,
    // Public keys — also only confirm presence
    has_test_public_key: !!process.env.ZAINPAY_TEST_PUBLIC_KEY,
    has_live_public_key: !!process.env.ZAINPAY_LIVE_PUBLIC_KEY,
    // Zainbox codes
    has_test_zainbox: !!process.env.ZAINPAY_TEST_ZAINBOX_CODE,
    has_live_zainbox: !!process.env.ZAINPAY_LIVE_ZAINBOX_CODE,
    has_public_url: !!process.env.PUBLIC_URL,
    public_url: process.env.PUBLIC_URL || "(not set)",
    port: process.env.PORT || 3000,
  });
});

// ── ZainPay: Initialize Payment ────────────────────────────────────────────
// POST /api/initialize-payment
// Body: { amount, txnRef, mobileNumber, emailAddress, isTest, publicKey }
app.post("/api/initialize-payment", async (req, res) => {
  console.log(
    "[initialize-payment] Incoming body:",
    JSON.stringify({
      ...req.body,
      publicKey: req.body.publicKey
        ? req.body.publicKey.substring(0, 8) + "..."
        : "missing",
    }),
  );

  const { amount, txnRef, mobileNumber, emailAddress, isTest, publicKey } =
    req.body;

  // ─── Input validation ────────────────────────────────────────────────────
  if (!amount || !txnRef || !emailAddress) {
    return res.status(400).json({
      error: "Missing required fields: amount, txnRef, emailAddress",
    });
  }

  // ─── Determine environment ───────────────────────────────────────────────
  // Server env ZAINPAY_IS_TEST wins when explicitly set to "false" (go-live).
  const useTest =
    process.env.ZAINPAY_IS_TEST === "false" ? false : isTest !== false;

  const baseUrl = useTest
    ? "https://sandbox.zainpay.ng"
    : "https://api.zainpay.ng";

  // ─── Resolve keys ────────────────────────────────────────────────────────
  // Secret key: always from server environment variables (never from frontend)
  const secretKey = useTest
    ? process.env.ZAINPAY_TEST_SECRET_KEY
    : process.env.ZAINPAY_LIVE_SECRET_KEY;

  // Public key: prefer server env variable, fall back to what frontend sent
  const resolvedPublicKey = useTest
    ? process.env.ZAINPAY_TEST_PUBLIC_KEY || publicKey || ""
    : process.env.ZAINPAY_LIVE_PUBLIC_KEY || publicKey || "";

  const zainboxCode = useTest
    ? process.env.ZAINPAY_TEST_ZAINBOX_CODE
    : process.env.ZAINPAY_LIVE_ZAINBOX_CODE;

  // ─── Guard missing credentials ───────────────────────────────────────────
  if (!secretKey) {
    console.error(
      "[initialize-payment] Missing ZAINPAY secret key. Mode:",
      useTest ? "sandbox" : "live",
    );
    return res.status(500).json({
      error: `Missing ZAINPAY secret key for ${useTest ? "sandbox" : "live"} mode. Set ZAINPAY_${useTest ? "TEST" : "LIVE"}_SECRET_KEY on Render.`,
    });
  }

  if (!zainboxCode) {
    console.error(
      "[initialize-payment] Missing ZAINPAY zainbox code. Mode:",
      useTest ? "sandbox" : "live",
    );
    return res.status(500).json({
      error: `Missing ZAINPAY zainbox code for ${useTest ? "sandbox" : "live"} mode. Set ZAINPAY_${useTest ? "TEST" : "LIVE"}_ZAINBOX_CODE on Render.`,
    });
  }

  console.log(
    `[initialize-payment] Mode: ${useTest ? "SANDBOX" : "LIVE"}`,
    `| publicKey present: ${!!resolvedPublicKey}`,
    `| secretKey present: ${!!secretKey}`,
  );

  // ─── Build callBackUrl ───────────────────────────────────────────────────
  const publicUrl = (process.env.PUBLIC_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  const callBackUrl = `${publicUrl}/#/ticket`;

  // ─── Build the ZainPay payload ───────────────────────────────────────────
  const payload = {
    amount: String(amount),
    txnRef: String(txnRef),
    mobileNumber: mobileNumber ? String(mobileNumber) : "08000000000",
    zainboxCode: String(zainboxCode),
    emailAddress: String(emailAddress),
    callBackUrl,
    allowRecurringPayment: false,
    currencyCode: "NGN",
    logoUrl: process.env.LOGO_URL || "",
    ...(resolvedPublicKey && { publicKey: resolvedPublicKey }),
  };

  console.log(
    "[initialize-payment] ZainPay endpoint:",
    `${baseUrl}/zainbox/card/initialize/payment`,
  );
  console.log(
    "[initialize-payment] Payload:",
    JSON.stringify({
      ...payload,
      zainboxCode: "***",
      publicKey: resolvedPublicKey ? "***" : "(none)",
    }),
  );

  try {
    const response = await fetch(`${baseUrl}/zainbox/card/initialize/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    console.log("[initialize-payment] ZainPay HTTP status:", response.status);
    console.log(
      "[initialize-payment] ZainPay raw response:",
      responseText.substring(0, 500),
    );

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseErr) {
      console.error(
        "[initialize-payment] Failed to parse ZainPay response as JSON:",
        parseErr.message,
      );
      return res.status(502).json({
        error: "ZainPay returned a non-JSON response",
        raw: responseText.substring(0, 300),
        zainpay_status: response.status,
      });
    }

    return res.status(response.status).json(result);
  } catch (err) {
    console.error(
      "[initialize-payment] Network or unexpected error:",
      err.message,
      err.stack,
    );
    return res.status(500).json({
      error: "Failed to reach ZainPay API",
      details: err.message,
    });
  }
});

// ── ZainPay: Verify Payment ────────────────────────────────────────────────
// GET /api/verify-payment/:txnRef
// Query param: ?isTest=true|false  (optional, server env takes precedence)
app.get("/api/verify-payment/:txnRef", async (req, res) => {
  const { txnRef } = req.params;

  if (!txnRef) {
    return res.status(400).json({ error: "Missing txnRef" });
  }

  console.log("[verify-payment] txnRef:", txnRef);

  const isTestQuery = req.query.isTest !== "false";
  const useTest = process.env.ZAINPAY_IS_TEST === "false" ? false : isTestQuery;

  const baseUrl = useTest
    ? "https://sandbox.zainpay.ng"
    : "https://api.zainpay.ng";

  const secretKey = useTest
    ? process.env.ZAINPAY_TEST_SECRET_KEY
    : process.env.ZAINPAY_LIVE_SECRET_KEY;

  if (!secretKey) {
    return res.status(500).json({
      error: `Missing ZAINPAY secret key for ${useTest ? "sandbox" : "live"} mode`,
    });
  }

  const verifyUrl = `${baseUrl}/zainbox/card/verify/v2/payment/${encodeURIComponent(txnRef)}`;

  console.log("[verify-payment] Calling:", verifyUrl);

  try {
    const response = await fetch(verifyUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    });

    const responseText = await response.text();
    console.log("[verify-payment] ZainPay HTTP status:", response.status);
    console.log(
      "[verify-payment] ZainPay raw response:",
      responseText.substring(0, 500),
    );

    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      return res.status(502).json({
        error: "ZainPay returned non-JSON response during verification",
        raw: responseText.substring(0, 300),
      });
    }

    const isSuccess =
      result.code === "00" &&
      (result.data?.txnStatus === "success" ||
        result.data?.status === "success" ||
        result.data?.txnStatus === "Successful");

    return res.status(response.status).json({
      ...result,
      _verified: isSuccess,
      _txnRef: txnRef,
    });
  } catch (err) {
    console.error("[verify-payment] Error:", err.message);
    return res.status(500).json({
      error: "Failed to reach ZainPay verification API",
      details: err.message,
    });
  }
});

// ── Serve Vite build ───────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "dist")));

// ── SPA fallback — all unknown routes return index.html ───────────────────
app.use((_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ── Start server ───────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || "3000", 10);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[server] MC FABS Masterclass server started on port ${PORT}`);
  console.log(
    `[server] ZainPay mode: ${process.env.ZAINPAY_IS_TEST === "false" ? "LIVE" : "SANDBOX"}`,
  );
  console.log(
    `[server] Test public key set: ${!!process.env.ZAINPAY_TEST_PUBLIC_KEY}`,
  );
  console.log(
    `[server] Live public key set: ${!!process.env.ZAINPAY_LIVE_PUBLIC_KEY}`,
  );
  console.log(
    `[server] PUBLIC_URL: ${process.env.PUBLIC_URL || "(not set — defaulting to localhost)"}`,
  );
});

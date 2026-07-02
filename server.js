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
  const isTest = process.env.ZAINPAY_IS_TEST !== "false";
  res.json({
    environment: process.env.NODE_ENV || "production",
    zainpay_mode: isTest ? "sandbox" : "live",
    has_test_secret_key: !!process.env.ZAINPAY_TEST_SECRET_KEY,
    has_live_secret_key: !!process.env.ZAINPAY_LIVE_SECRET_KEY,
    has_test_public_key: !!process.env.ZAINPAY_TEST_PUBLIC_KEY,
    has_live_public_key: !!process.env.ZAINPAY_LIVE_PUBLIC_KEY,
    has_test_zainbox: !!process.env.ZAINPAY_TEST_ZAINBOX_CODE,
    has_live_zainbox: !!process.env.ZAINPAY_LIVE_ZAINBOX_CODE,
    has_public_url: !!process.env.PUBLIC_URL,
    public_url: process.env.PUBLIC_URL || "(not set)",
    port: process.env.PORT || 3000,
  });
});

// ── ZainPay: Initialize Payment ────────────────────────────────────────────
// POST /api/initialize-payment
app.post("/api/initialize-payment", async (req, res) => {
  console.log("=".repeat(60));
  console.log("[initialize-payment] ── INCOMING REQUEST ──");
  console.log(
    "[initialize-payment] Full body:",
    JSON.stringify(
      {
        ...req.body,
        publicKey: req.body.publicKey
          ? req.body.publicKey.substring(0, 12) + "..."
          : "missing",
      },
      null,
      2,
    ),
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
  const useTest =
    process.env.ZAINPAY_IS_TEST === "false" ? false : isTest !== false;

  console.log(`[initialize-payment] useTest = ${useTest}`);

  const baseUrl = useTest
    ? "https://sandbox.zainpay.ng"
    : "https://api.zainpay.ng";

  // ─── Resolve keys ────────────────────────────────────────────────────────
  // ✅ FIX: secretKey is used for Authorization header, NOT publicKey
  const secretKey = useTest
    ? process.env.ZAINPAY_TEST_SECRET_KEY
    : process.env.ZAINPAY_LIVE_SECRET_KEY;

  const resolvedPublicKey = useTest
    ? process.env.ZAINPAY_TEST_PUBLIC_KEY || publicKey || ""
    : process.env.ZAINPAY_LIVE_PUBLIC_KEY || publicKey || "";

  const zainboxCode = useTest
    ? process.env.ZAINPAY_TEST_ZAINBOX_CODE
    : process.env.ZAINPAY_LIVE_ZAINBOX_CODE;

  console.log("[initialize-payment] Keys resolved:", {
    secretKey: secretKey ? secretKey.substring(0, 8) + "..." : "MISSING ❌",
    resolvedPublicKey: resolvedPublicKey
      ? resolvedPublicKey.substring(0, 12) + "..."
      : "MISSING ❌",
    zainboxCode: zainboxCode
      ? zainboxCode.substring(0, 6) + "..."
      : "MISSING ❌",
  });

  // ─── Guard missing credentials ───────────────────────────────────────────
  if (!secretKey) {
    console.error(
      "[initialize-payment] ❌ Missing secret key for mode:",
      useTest ? "sandbox" : "live",
    );
    return res.status(500).json({
      error: `Missing ZAINPAY secret key for ${useTest ? "sandbox" : "live"} mode. Set ZAINPAY_${useTest ? "TEST" : "LIVE"}_SECRET_KEY on Render.`,
    });
  }

  if (!zainboxCode) {
    console.error(
      "[initialize-payment] ❌ Missing zainbox code for mode:",
      useTest ? "sandbox" : "live",
    );
    return res.status(500).json({
      error: `Missing ZAINPAY zainbox code for ${useTest ? "sandbox" : "live"} mode. Set ZAINPAY_${useTest ? "TEST" : "LIVE"}_ZAINBOX_CODE on Render.`,
    });
  }

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
    logoUrl:
      process.env.LOGO_URL || "https://fabs-masterclass.onrender.com/fabs.jpg",
    ...(resolvedPublicKey && { publicKey: resolvedPublicKey }),
  };

  const endpoint = `${baseUrl}/zainbox/card/initialize/payment`;

  console.log("[initialize-payment] ── OUTGOING REQUEST ──");
  console.log("[initialize-payment] Endpoint:", endpoint);
  console.log(
    "[initialize-payment] Authorization: Bearer",
    secretKey.substring(0, 8) + "...",
  );
  console.log(
    "[initialize-payment] Full payload:",
    JSON.stringify(
      {
        ...payload,
        zainboxCode: payload.zainboxCode.substring(0, 6) + "***",
        publicKey: resolvedPublicKey
          ? resolvedPublicKey.substring(0, 12) + "***"
          : "(none)",
      },
      null,
      2,
    ),
  );

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // ✅ FIX: Use secretKey here, NOT publicKey
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    console.log("[initialize-payment] ── ZAINPAY RESPONSE ──");
    console.log(
      "[initialize-payment] HTTP Status:",
      response.status,
      response.statusText,
    );
    console.log(
      "[initialize-payment] Response Headers:",
      JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2),
    );
    console.log("[initialize-payment] Full Raw Response:", responseText);
    console.log("=".repeat(60));

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseErr) {
      console.error(
        "[initialize-payment] ❌ Failed to parse response as JSON:",
        parseErr.message,
      );
      return res.status(502).json({
        error: "ZainPay returned a non-JSON response",
        raw: responseText,
        zainpay_status: response.status,
        zainpay_status_text: response.statusText,
        endpoint_called: endpoint,
      });
    }

    console.log(
      "[initialize-payment] Parsed result:",
      JSON.stringify(result, null, 2),
    );

    return res.status(response.status).json(result);
  } catch (err) {
    console.error(
      "[initialize-payment] ❌ Network or unexpected error:",
      err.message,
    );
    console.error("[initialize-payment] Stack:", err.stack);
    return res.status(500).json({
      error: "Failed to reach ZainPay API",
      details: err.message,
      endpoint_called: endpoint,
    });
  }
});

// ── ZainPay: Verify Payment ────────────────────────────────────────────────
// GET /api/verify-payment/:txnRef
app.get("/api/verify-payment/:txnRef", async (req, res) => {
  const { txnRef } = req.params;

  if (!txnRef) {
    return res.status(400).json({ error: "Missing txnRef" });
  }

  console.log("=".repeat(60));
  console.log("[verify-payment] ── INCOMING REQUEST ──");
  console.log("[verify-payment] txnRef:", txnRef);

  const isTestQuery = req.query.isTest !== "false";
  const useTest = process.env.ZAINPAY_IS_TEST === "false" ? false : isTestQuery;

  const baseUrl = useTest
    ? "https://sandbox.zainpay.ng"
    : "https://api.zainpay.ng";

  // ✅ FIX: Use secretKey (not publicKey which was undefined in this scope)
  const secretKey = useTest
    ? process.env.ZAINPAY_TEST_SECRET_KEY
    : process.env.ZAINPAY_LIVE_SECRET_KEY;

  console.log("[verify-payment] Mode:", useTest ? "SANDBOX" : "LIVE");
  console.log(
    "[verify-payment] secretKey:",
    secretKey ? secretKey.substring(0, 8) + "..." : "MISSING ❌",
  );

  if (!secretKey) {
    return res.status(500).json({
      error: `Missing ZAINPAY secret key for ${useTest ? "sandbox" : "live"} mode`,
    });
  }

  const verifyUrl = `${baseUrl}/zainbox/card/verify/v2/payment/${encodeURIComponent(txnRef)}`;

  console.log("[verify-payment] ── OUTGOING REQUEST ──");
  console.log("[verify-payment] URL:", verifyUrl);

  try {
    const response = await fetch(verifyUrl, {
      method: "GET",
      headers: {
        // ✅ FIX: secretKey is correctly scoped here now
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    });

    const responseText = await response.text();

    console.log("[verify-payment] ── ZAINPAY RESPONSE ──");
    console.log(
      "[verify-payment] HTTP Status:",
      response.status,
      response.statusText,
    );
    console.log("[verify-payment] Full Raw Response:", responseText);
    console.log("=".repeat(60));

    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      return res.status(502).json({
        error: "ZainPay returned non-JSON response during verification",
        raw: responseText,
        zainpay_status: response.status,
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
    console.error("[verify-payment] ❌ Error:", err.message);
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
    `[server] Test secret key set: ${!!process.env.ZAINPAY_TEST_SECRET_KEY}`,
  );
  console.log(
    `[server] Test public key set: ${!!process.env.ZAINPAY_TEST_PUBLIC_KEY}`,
  );
  console.log(
    `[server] Live secret key set: ${!!process.env.ZAINPAY_LIVE_SECRET_KEY}`,
  );
  console.log(
    `[server] Live public key set: ${!!process.env.ZAINPAY_LIVE_PUBLIC_KEY}`,
  );
  console.log(
    `[server] PUBLIC_URL: ${process.env.PUBLIC_URL || "(not set — defaulting to localhost)"}`,
  );
});

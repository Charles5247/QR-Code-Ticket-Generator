// ============================================================
// MC FABS EXCLUSIVE MASTERCLASS 1.0 — Configuration
// ============================================================

const CONFIG = {
  // ── Supabase ──────────────────────────────────────────────
  // These are the browser-safe (publishable) keys — NOT the service role key.
  // Safe to ship in the frontend bundle.
  VITE_SUPABASE_URL: "https://vurousvjgwonvabutaom.supabase.co",
  VITE_SUPABASE_PUBLISHABLE_KEY:
    "sb_publishable_KvOghUmo4Lg7k1-7xP67HA_k_H-ItyS",

  // ── Zainpay ───────────────────────────────────────────────
  // PUBLIC keys are safe to put here — they are browser-facing.
  // SECRET keys and zainbox codes live ONLY in Render environment variables.
  //
  // Set ZAINPAY_IS_TEST to false when you are ready to go live.
  ZAINPAY_IS_TEST: true, // ← change to false for production live payments

  // Replace these with your actual keys from the ZainPay dashboard.
  // Test public key  → used when ZAINPAY_IS_TEST = true
  // Live public key  → used when ZAINPAY_IS_TEST = false
  ZAINPAY_TEST_PUBLIC_KEY:
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3phaW5wYXkubmciLCJpYXQiOjE3ODI1MTY2NzQsImlkIjplMzJmMmY0Yy1lNWU0LTQxZjctYTUyNy0wZWM5MDBlNTZhNjAsIm5hbWUiOmNheGlldGVjaG5vbG9naWVzQGdtYWlsLmNvbSwicm9sZSI6Y2F4aWV0ZWNobm9sb2dpZXNAZ21haWwuY29tLCJzZWNyZXRLZXkiOlhxbTBubTdEVjd5NWxFb2ZmRlR4c2Q2MkxXaG5obFRGTEVoSll1U1BSODN6cH0.X94cxjkjmic-DNAkNngYQ80YYQ_sXO0sMYSJ1Va4Stw", // ← paste test public key here
  ZAINPAY_LIVE_PUBLIC_KEY:
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3phaW5wYXkubmciLCJpYXQiOjE3ODI2NTY4MjYsImlkIjo3OTBkOTBjNy1hNTUxLTRhYzYtYjc5Zi1iZTBkY2U3OGI4NTcsIm5hbWUiOmNheGlldGVjaG5vbG9naWVzQGdtYWlsLmNvbSwicm9sZSI6Y2F4aWV0ZWNobm9sb2dpZXNAZ21haWwuY29tLCJzZWNyZXRLZXkiOm1LQ2pTMmpseXVLbTdpWkszVEZTNXkyemw1QlQ2SEk3d1JBQXRlVmpIREZ4T30._vKo2rP86Z5SdyufiWLGnqpiyh7H3ddqp5PFGVd8TDk", // ← paste live public key here

  // ── Event Details ─────────────────────────────────────────
  EVENT: {
    name: "MC FABS Masterclass V1.0",
    tagline: "VOICE . STAGE . IMPACT",
    host: "Faith Abah (MC FABS)",
    date: "2026-09-12",
    time: "10:00 AM WAT",
    venue: "Mystic Falls, Nassarawa GRA Kano, Nigeria",
    city: "Kano, Nigeria",
    eventDate: new Date("2026-09-12T10:00:00"),
    instagram: "https://www.instagram.com/mcfabs.ng/",
    whatsapp: "https://wa.me/2347061647118",
    email: "faithabaheleojo@gmail.com",
  },

  // ── Ticket Categories ─────────────────────────────────────
  TICKETS: [
    {
      id: "general",
      name: "Early Bird",
      price: 30000,
      currency: "NGN",
      prefix: "EAR",
      color: "from-purple-800 to-purple-950",
      features: [
        "Full event access",
        "Masterclass materials",
        "Networking session",
        "Certificate of attendance",
        "Lunch & refreshments",
      ],
      badge: null,
      available: true,
      slots: 100,
    },
  ],

  // ── Admin ─────────────────────────────────────────────────

  // ── App ───────────────────────────────────────────────────
  APP_NAME: "MC FABS Exclusive Masterclass 1.0",
  CURRENCY_SYMBOL: "₦",
  CURRENCY_CODE: "NGN",
};

// Format currency helper
function formatCurrency(amount, symbol = "₦") {
  return `${symbol}${Number(amount).toLocaleString("en-NG")}`;
}

// Format date helper
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Generate ticket code
function generateTicketCode(prefix, index) {
  return `MCFABSEM-2026-${prefix}-${String(index).padStart(4, "0")}`;
}

// Generate seat number
function generateSeatNumber(prefix, index) {
  return `${prefix}-${String(index).padStart(3, "0")}`;
}

// Helper: returns the correct ZainPay public key based on current mode
function getZainpayPublicKey() {
  return CONFIG.ZAINPAY_IS_TEST
    ? CONFIG.ZAINPAY_TEST_PUBLIC_KEY
    : CONFIG.ZAINPAY_LIVE_PUBLIC_KEY;
}

window.CONFIG = CONFIG;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.generateTicketCode = generateTicketCode;
window.generateSeatNumber = generateSeatNumber;
window.getZainpayPublicKey = getZainpayPublicKey;

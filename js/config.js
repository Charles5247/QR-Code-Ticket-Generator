// ============================================================
// MC FABS EXCLUSIVE MASTERCLASS 1.0 — Configuration
// ============================================================

const CONFIG = {
  // ── Supabase ──────────────────────────────────────────────
  VITE_SUPABASE_URL: "https://vurousvjgwonvabutaom.supabase.co",
  VITE_SUPABASE_PUBLISHABLE_KEY:
    "sb_publishable_KvOghUmo4Lg7k1-7xP67HA_k_H-ItyS",

  // ── Zainpay ───────────────────────────────────────────────
  // NOTE: Zainpay uses the Redirect payment channel for this app.
  // The SECRET key and zainbox code live ONLY on the server
  // (see server.js, which reads them from environment variables).
  // Nothing secret belongs in this file since it ships to the browser.
  // ZAINPAY_IS_TEST controls whether the frontend asks the server to
  // initialize a sandbox or live transaction.
  ZAINPAY_IS_TEST: true, // set false for live

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

window.CONFIG = CONFIG;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.generateTicketCode = generateTicketCode;
window.generateSeatNumber = generateSeatNumber;

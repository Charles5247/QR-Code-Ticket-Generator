// ============================================================
// MC FABS EXCLUSIVE MASTERCLASS 1.0 — Configuration
// ============================================================

const CONFIG = {
  // ── Supabase ──────────────────────────────────────────────
  SUPABASE_URL: "https://vurousvjgwonvabutaom.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_KvOghUmo4Lg7k1-7xP67HA_k_H-ItyS",

  // ── Paystack ──────────────────────────────────────────────
  /*PAYSTACK_PUBLIC_KEY: "",
  ZAINPAY_PUBLIC_KEY:
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3phaW5wYXkubmciLCJpYXQiOjE3ODI1MTY2NzQsImlkIjplMzJmMmY0Yy1lNWU0LTQxZjctYTUyNy0wZWM5MDBlNTZhNjAsIm5hbWUiOmNheGlldGVjaG5vbG9naWVzQGdtYWlsLmNvbSwicm9sZSI6Y2F4aWV0ZWNobm9sb2dpZXNAZ21haWwuY29tLCJzZWNyZXRLZXkiOlhxbTBubTdEVjd5NWxFb2ZmRlR4c2Q2MkxXaG5obFRGTEVoSll1U1BSODN6cH0.X94cxjkjmic-DNAkNngYQ80YYQ_sXO0sMYSJ1Va4Stw",
  ZAINPAY_INLINE_KEY:
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3phaW5wYXkubmciLCJpYXQiOjE3ODI1MTY2NzQsImlkIjplMzJmMmY0Yy1lNWU0LTQxZjctYTUyNy0wZWM5MDBlNTZhNjAsIm5hbWUiOmNheGlldGVjaG5vbG9naWVzQGdtYWlsLmNvbSwicm9sZSI6Y2F4aWV0ZWNobm9sb2dpZXNAZ21haWwuY29tLCJzZWNyZXRLZXkiOlhxbTBubTdEVjd5NWxFb2ZmRlR4c2Q2MkxXaG5obFRGTEVoSll1U1BSODN6cH0.Pp8cnRu8ZsNvBcfBXg53rA6bp6avpla3igFGlnIUtWw", // the eyJ... key from your screenshot
  ZAINPAY_ZAINBOX_CODE: "72469_kFe3zJ2x7Rb4BRyhxiW8", // from Zainboxes section
  ZAINPAY_IS_TEST: true, // set false for live*/

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
  ADMIN_EMAIL: "admin@mcfabs.ng",
  ADMIN_PASSWORD: "MCFabs2026!Admin",

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

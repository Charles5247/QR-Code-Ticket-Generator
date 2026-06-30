// ============================================================
// MC FABS MASTERCLASS — Supabase Client & Database Services
// ============================================================

// Initialize Supabase client
const { createClient } = supabase;

// ─── Resolve the correct config keys (supports both naming conventions) ───────
// config.js uses VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY.
// Guard against misconfiguration by also accepting the legacy key names.
const _SUPABASE_URL =
  CONFIG.VITE_SUPABASE_URL ||
  CONFIG.SUPABASE_URL ||
  "";

const _SUPABASE_KEY =
  CONFIG.VITE_SUPABASE_PUBLISHABLE_KEY ||
  CONFIG.SUPABASE_ANON_KEY ||
  "";

let _supabaseClient = null;
function getSupabase() {
  if (!_supabaseClient) {
    if (!_SUPABASE_URL || !_SUPABASE_KEY) {
      console.error("[Supabase] Missing URL or key — check config.js");
      return null;
    }
    _supabaseClient = createClient(_SUPABASE_URL, _SUPABASE_KEY);
  }
  return _supabaseClient;
}

// ─── Demo Mode ────────────────────────────────────────────────────────────────
// Only enter Demo Mode if the URL is missing OR contains the placeholder text.
// This prevents production accidentally running in demo mode with real credentials.
const _isPlaceholder = (v) =>
  !v ||
  v.includes("YOUR_SUPABASE") ||
  v.includes("your_") ||
  v.trim() === "";

const DEMO_MODE = _isPlaceholder(_SUPABASE_URL) || _isPlaceholder(_SUPABASE_KEY);

if (DEMO_MODE) {
  console.warn(
    "[DEMO MODE] Supabase not configured — using in-memory store. " +
    "Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in config.js for production.",
  );
}

// In-memory demo store
const DemoStore = {
  attendees: [
    {
      id: "demo-001",
      full_name: "Amina Bello",
      email: "amina@example.com",
      phone: "08012345678",
      gender: "Female",
      occupation: "Entrepreneur",
      ticket_category: "general",
      ticket_code: "MCFABS-2026-GEN-0004",
      seat_number: "GEN-004",
      payment_reference: "PAY_demo_001",
      payment_status: "paid",
      amount_paid: 50000,
      qr_code_url: null,
      ticket_pdf_url: null,
      checked_in: true,
      checked_in_at: new Date("2026-06-20T10:15:00").toISOString(),
      special_requests: null,
      created_at: new Date("2026-05-01T09:00:00").toISOString(),
    },
    {
      id: "demo-002",
      full_name: "Musa Ibrahim",
      email: "musa@example.com",
      phone: "07023456789",
      gender: "Male",
      occupation: "Media Professional",
      ticket_category: "general",
      ticket_code: "MCFABS-2026-GEN-0001",
      seat_number: "GEN-001",
      payment_reference: "PAY_demo_002",
      payment_status: "paid",
      amount_paid: 50000,
      qr_code_url: null,
      ticket_pdf_url: null,
      checked_in: false,
      checked_in_at: null,
      special_requests: "Vegetarian meal please",
      created_at: new Date("2026-05-02T11:30:00").toISOString(),
    },
    {
      id: "demo-003",
      full_name: "Fatima Yusuf",
      email: "fatima@example.com",
      phone: "09034567890",
      gender: "Female",
      occupation: "Content Creator",
      ticket_category: "general",
      ticket_code: "MCFABS-2026-GEN-0005",
      seat_number: "GEN-005",
      payment_reference: "PAY_demo_003",
      payment_status: "paid",
      amount_paid: 50000,
      qr_code_url: null,
      ticket_pdf_url: null,
      checked_in: false,
      checked_in_at: null,
      special_requests: null,
      created_at: new Date("2026-05-03T14:00:00").toISOString(),
    },
    {
      id: "demo-004",
      full_name: "Kabiru Aliyu",
      email: "kabiru@example.com",
      phone: "08145678901",
      gender: "Male",
      occupation: "Student",
      ticket_category: "general",
      ticket_code: "MCFABS-2026-GEN-0002",
      seat_number: "GEN-002",
      payment_reference: null,
      payment_status: "pending",
      amount_paid: 0,
      qr_code_url: null,
      ticket_pdf_url: null,
      checked_in: false,
      checked_in_at: null,
      special_requests: null,
      created_at: new Date("2026-05-05T08:45:00").toISOString(),
    },
    {
      id: "demo-005",
      full_name: "Zainab Suleiman",
      email: "zainab@example.com",
      phone: "07056789012",
      gender: "Female",
      occupation: "Business Owner",
      ticket_category: "general",
      ticket_code: "MCFABS-2026-GEN-0003",
      seat_number: "GEN-003",
      payment_reference: "PAY_demo_005",
      payment_status: "paid",
      amount_paid: 50000,
      qr_code_url: null,
      ticket_pdf_url: null,
      checked_in: false,
      checked_in_at: null,
      special_requests: null,
      created_at: new Date("2026-05-06T16:20:00").toISOString(),
    },
  ],

  nextIndex: { general: 6 },

  getAll() {
    return [...this.attendees];
  },

  getById(id) {
    return this.attendees.find((a) => a.id === id) || null;
  },

  getByTicketCode(code) {
    return this.attendees.find((a) => a.ticket_code === code) || null;
  },

  add(data) {
    const id = "demo-" + Date.now();
    const attendee = {
      ...data,
      id,
      created_at: new Date().toISOString(),
      scan_attempts: 0,
      last_scan_status: null,
      last_scan_attempt_at: null,
    };
    this.attendees.unshift(attendee);
    return attendee;
  },

  update(id, data) {
    const idx = this.attendees.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.attendees[idx] = { ...this.attendees[idx], ...data };
      return this.attendees[idx];
    }
    return null;
  },
};

// ─── Database Service ──────────────────────────────────────────────────────────
const DB = {
  async getAttendeeCount(category) {
    if (DEMO_MODE) {
      return DemoStore.getAll().filter((a) => a.ticket_category === category)
        .length;
    }
    const db = getSupabase();
    const { count } = await db
      .from("attendees")
      .select("*", { count: "exact", head: true })
      .eq("ticket_category", category);
    return count || 0;
  },

  async createAttendee(data) {
    if (DEMO_MODE) {
      const ticket = CONFIG.TICKETS.find((t) => t.id === data.ticket_category);
      const prefix = ticket ? ticket.prefix : "GEN";
      const count =
        DemoStore.getAll().filter(
          (a) => a.ticket_category === data.ticket_category,
        ).length + 1;
      const ticket_code = generateTicketCode(prefix, count);
      const seat_number = generateSeatNumber(prefix, count);
      const attendee = DemoStore.add({
        ...data,
        ticket_code,
        seat_number,
        payment_status: "pending",
        amount_paid: 0,
        payment_reference: null,
        qr_code_url: null,
        ticket_pdf_url: null,
        checked_in: false,
        checked_in_at: null,
        scan_attempts: 0,
        last_scan_status: null,
        last_scan_attempt_at: null,
      });
      return { data: attendee, error: null };
    }

    const db = getSupabase();
    const ticket = CONFIG.TICKETS.find((t) => t.id === data.ticket_category);
    const prefix = ticket ? ticket.prefix : "GEN";
    const count = (await this.getAttendeeCount(data.ticket_category)) + 1;
    const ticket_code = generateTicketCode(prefix, count);
    const seat_number = generateSeatNumber(prefix, count);

    const insertData = {
      ...data,
      ticket_code,
      seat_number,
      payment_status: "pending",
      amount_paid: 0,
      checked_in: false,
      scan_attempts: 0,
      last_scan_status: null,
      last_scan_attempt_at: null,
    };

    const response = await db
      .from("attendees")
      .insert([insertData])
      .select()
      .single();

    if (response.error && response.error.message?.includes("column")) {
      return await db
        .from("attendees")
        .insert([
          {
            ...data,
            ticket_code,
            seat_number,
            payment_status: "pending",
            amount_paid: 0,
            checked_in: false,
          },
        ])
        .select()
        .single();
    }

    return response;
  },

  async confirmPayment(attendeeId, paymentData) {
    if (DEMO_MODE) {
      const updated = DemoStore.update(attendeeId, {
        payment_status: "paid",
        payment_reference: paymentData.reference,
        amount_paid: paymentData.amount,
        paid_at: new Date().toISOString(),
      });
      return { data: updated, error: null };
    }
    const db = getSupabase();
    return await db
      .from("attendees")
      .update({
        payment_status: "paid",
        payment_reference: paymentData.reference,
        amount_paid: paymentData.amount,
        paid_at: new Date().toISOString(),
      })
      .eq("id", attendeeId)
      .select()
      .single();
  },

  async updateQRCode(attendeeId, qrUrl) {
    if (DEMO_MODE) {
      DemoStore.update(attendeeId, { qr_code_url: qrUrl });
      return { error: null };
    }
    const db = getSupabase();
    return await db
      .from("attendees")
      .update({ qr_code_url: qrUrl })
      .eq("id", attendeeId);
  },

  async getAllAttendees() {
    if (DEMO_MODE) {
      return { data: DemoStore.getAll(), error: null };
    }
    const db = getSupabase();
    return await db
      .from("attendees")
      .select("*")
      .order("created_at", { ascending: false });
  },

  async getByTicketCode(code) {
    if (DEMO_MODE) {
      const found = DemoStore.getByTicketCode(code);
      return { data: found, error: found ? null : { message: "Not found" } };
    }
    const db = getSupabase();
    return await db
      .from("attendees")
      .select("*")
      .eq("ticket_code", code)
      .single();
  },

  async checkIn(attendeeId, currentAttempts = 0) {
    const nextAttempts = (currentAttempts || 0) + 1;
    const scanData = {
      checked_in: true,
      checked_in_at: new Date().toISOString(),
      scan_attempts: nextAttempts,
      last_scan_status: "checked_in",
      last_scan_attempt_at: new Date().toISOString(),
    };

    if (DEMO_MODE) {
      const updated = DemoStore.update(attendeeId, scanData);
      return { data: updated, error: null };
    }

    const db = getSupabase();
    const response = await db
      .from("attendees")
      .update(scanData)
      .eq("id", attendeeId)
      .select()
      .single();

    if (response.error && response.error.message?.includes("column")) {
      return await db
        .from("attendees")
        .update({ checked_in: true, checked_in_at: scanData.checked_in_at })
        .eq("id", attendeeId)
        .select()
        .single();
    }

    return response;
  },

  async recordScanAttempt(attendeeId, currentAttempts = 0, status) {
    const nextAttempts = (currentAttempts || 0) + 1;
    const scanData = {
      scan_attempts: nextAttempts,
      last_scan_status: status,
      last_scan_attempt_at: new Date().toISOString(),
    };

    if (DEMO_MODE) {
      const updated = DemoStore.update(attendeeId, scanData);
      return { data: updated, error: null };
    }

    const db = getSupabase();
    const response = await db
      .from("attendees")
      .update(scanData)
      .eq("id", attendeeId)
      .select()
      .single();

    if (response.error && response.error.message?.includes("column")) {
      console.warn(
        "Scan audit columns not available, skipping audit update.",
        response.error,
      );
      return { data: null, error: null };
    }

    return response;
  },

  async getAnalytics() {
    const { data: attendees } = await this.getAllAttendees();
    if (!attendees) return {};

    const paid = attendees.filter((a) => a.payment_status === "paid");
    const pending = attendees.filter((a) => a.payment_status === "pending");
    const checkedIn = attendees.filter((a) => a.checked_in);
    const revenue = paid.reduce((sum, a) => sum + (a.amount_paid || 0), 0);
    const scanAttemptsTotal = attendees.reduce(
      (sum, a) => sum + (Number(a.scan_attempts) || 0),
      0,
    );
    const duplicateScanAttempts = attendees.filter(
      (a) => Number(a.scan_attempts) > 1,
    ).length;

    const byCategory = CONFIG.TICKETS.reduce((acc, t) => {
      acc[t.id] = attendees.filter((a) => a.ticket_category === t.id).length;
      return acc;
    }, {});

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      days.push({
        date: dateStr,
        label: d.toLocaleDateString("en-NG", {
          month: "short",
          day: "numeric",
        }),
        count: attendees.filter(
          (a) => a.created_at && a.created_at.startsWith(dateStr),
        ).length,
      });
    }

    return {
      total: attendees.length,
      paid: paid.length,
      pending: pending.length,
      checkedIn: checkedIn.length,
      revenue,
      scanAttemptsTotal,
      duplicateScanAttempts,
      byCategory,
      dailyRegistrations: days,
      attendees,
    };
  },
};

// ─── Auth Service ──────────────────────────────────────────────────────────────
const Auth = {
  async signIn(email, password) {
    if (DEMO_MODE) {
      if (email === CONFIG.ADMIN_EMAIL && password === CONFIG.ADMIN_PASSWORD) {
        sessionStorage.setItem("mcfabs_admin", "true");
        return { data: { user: { email } }, error: null };
      }
      return { data: null, error: { message: "Invalid credentials" } };
    }
    const db = getSupabase();
    const result = await db.auth.signInWithPassword({ email, password });
    if (!result.error) {
      // Store session flag so isAuthenticated() works across page navigations
      sessionStorage.setItem("mcfabs_admin", "true");
    }
    return result;
  },

  async signOut() {
    sessionStorage.removeItem("mcfabs_admin");
    if (!DEMO_MODE) {
      const db = getSupabase();
      await db.auth.signOut();
    }
  },

  // Works for both demo mode and live Supabase mode
  isAuthenticated() {
    return sessionStorage.getItem("mcfabs_admin") === "true";
  },
};

window.getSupabase = getSupabase;
window.DEMO_MODE = DEMO_MODE;
window.DemoStore = DemoStore;
window.DB = DB;
window.Auth = Auth;

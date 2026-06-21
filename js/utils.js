// ============================================================
// MC FABS MASTERCLASS — Utilities
// ============================================================

// ─── QR Code Generator ────────────────────────────────────────────────────────
const QRGen = {
  async generate(attendee) {
    const data = JSON.stringify({
      ticket_code: attendee.ticket_code,
      full_name: attendee.full_name,
      email: attendee.email,
      seat_number: attendee.seat_number,
      ticket_category: attendee.ticket_category,
      payment_status: attendee.payment_status,
      event: {
        name: CONFIG.EVENT.name,
        date: CONFIG.EVENT.date,
        venue: CONFIG.EVENT.venue,
      },
    });

    try {
      const url = await QRCode.toDataURL(data, {
        width: 300,
        margin: 2,
        color: { dark: "#1D1A39", light: "#ffffff" },
        errorCorrectionLevel: "H",
      });
      return url;
    } catch (e) {
      console.error("QR generation error:", e);
      return null;
    }
  },

  async generateCanvas(attendee, canvasEl) {
    const data = JSON.stringify({
      ticket_code: attendee.ticket_code,
      full_name: attendee.full_name,
      email: attendee.email,
      seat_number: attendee.seat_number,
      payment_status: attendee.payment_status,
      event: {
        name: CONFIG.EVENT.name,
        date: CONFIG.EVENT.date,
        venue: CONFIG.EVENT.venue,
      },
    });
    try {
      await QRCode.toCanvas(canvasEl, data, {
        width: 200,
        margin: 2,
        color: { dark: "#1D1A39", light: "#ffffff" },
      });
    } catch (e) {
      console.error(e);
    }
  },
};

// ─── PDF Ticket Generator ─────────────────────────────────────────────────────
const PDFTicket = {
  async generate(attendee) {
    const jsPDFClass = window.jsPDF || (window.jspdf && window.jspdf.jsPDF);
    if (!jsPDFClass) {
      throw new Error("PDF library is not loaded");
    }

    const doc = new jsPDFClass({
      orientation: "landscape",
      unit: "mm",
      format: [148, 105],
    });
    const W = 148,
      H = 105;

    const applyOpacity = (opacity) => {
      try {
        const GStateClass =
          window.jsPDF?.GState || window.jspdf?.GState || doc.GState;
        if (
          typeof doc.setGState === "function" &&
          typeof GStateClass === "function"
        ) {
          doc.setGState(new GStateClass({ opacity }));
        }
      } catch (err) {
        // ignore if the current jsPDF build does not support GState
      }
    };

    // Background
    doc.setFillColor(10, 0, 30);
    doc.rect(0, 0, W, H, "F");

    // Purple gradient strip
    doc.setFillColor(124, 58, 237);
    doc.rect(0, 0, 50, H, "F");

    // Gold accent line
    doc.setFillColor(245, 158, 11);
    doc.rect(50, 0, 2, H, "F");

    // Decorative circles
    doc.setFillColor(168, 85, 247);
    applyOpacity(0.15);
    doc.circle(25, 20, 30, "F");
    doc.circle(25, 90, 25, "F");
    applyOpacity(1);

    // Event name (left strip)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("MC FABS", 25, 35, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("MASTERCLASS", 25, 42, { align: "center" });

    // Ticket category badge
    const ticket = CONFIG.TICKETS.find(
      (t) => t.id === attendee.ticket_category,
    );
    const badgeColor =
      attendee.ticket_category === "premium"
        ? [245, 158, 11]
        : attendee.ticket_category === "vip"
          ? [168, 85, 247]
          : [100, 100, 120];
    doc.setFillColor(...badgeColor);
    doc.roundedRect(11, 50, 28, 8, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text((ticket ? ticket.name : "GENERAL").toUpperCase(), 25, 55.5, {
      align: "center",
    });

    // Seat number
    doc.setTextColor(245, 158, 11);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(attendee.seat_number || "N/A", 25, 75, { align: "center" });
    doc.setTextColor(200, 200, 220);
    doc.setFontSize(6);
    doc.text("SEAT NUMBER", 25, 80, { align: "center" });

    // Right side — attendee details
    const rightX = 54;
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    const name = attendee.full_name || "Attendee";
    doc.text(
      name.length > 24 ? name.substring(0, 24) + "..." : name,
      rightX,
      22,
    );

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 180, 255);
    doc.text("Ticket Holder", rightX, 29);

    // Large QR block at top right
    const qrSize = 28;
    const qrX = 111;
    const qrY = 16;
    doc.setFillColor(20, 10, 40);
    doc.roundedRect(qrX - 1.5, qrY - 1.5, qrSize + 3, qrSize + 3, 3, 3, "FD");
    doc.setDrawColor(168, 85, 247);
    doc.roundedRect(qrX - 1.5, qrY - 1.5, qrSize + 3, qrSize + 3, 3, 3, "S");

    const qrDataUrl = await QRGen.generate(attendee);
    if (qrDataUrl) {
      try {
        doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
      } catch (err) {
        console.warn("Failed to render QR in PDF:", err);
      }
    }

    doc.setFontSize(5.5);
    doc.setTextColor(168, 85, 247);
    doc.text("Show at entrance", qrX + qrSize / 2, qrY + qrSize + 6, {
      align: "center",
    });

    // Event details grid
    const details = [
      ["DATE", formatDate(CONFIG.EVENT.date)],
      ["TIME", CONFIG.EVENT.time],
      ["VENUE", CONFIG.EVENT.venue],
      ["TICKET", attendee.ticket_code],
    ];

    let y = 40;
    details.forEach(([label, value]) => {
      doc.setTextColor(168, 85, 247);
      doc.setFontSize(6);
      doc.setFont("helvetica", "bold");
      doc.text(label, rightX, y);
      doc.setTextColor(230, 230, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      const val =
        value && value.length > 34
          ? value.substring(0, 34) + "..."
          : value || "N/A";
      doc.text(val, rightX, y + 5);
      y += 14;
    });

    // Payment status badge
    const badgeX = 96;
    const badgeY = 74;
    const badgeW = 48;
    const badgeH = 20;
    if (attendee.payment_status === "paid") {
      doc.setFillColor(16, 185, 129);
      applyOpacity(0.15);
      doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 4, 4, "F");
      applyOpacity(1);
      doc.setDrawColor(16, 185, 129);
      doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 4, 4, "S");
      doc.setTextColor(16, 185, 129);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("PAYMENT CONFIRMED", badgeX + badgeW / 2, badgeY + 12, {
        align: "center",
      });
    } else {
      doc.setFillColor(245, 158, 11);
      applyOpacity(0.15);
      doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 4, 4, "F");
      applyOpacity(1);
      doc.setDrawColor(245, 158, 11);
      doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 4, 4, "S");
      doc.setTextColor(245, 158, 11);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("PAYMENT PENDING", badgeX + badgeW / 2, badgeY + 12, {
        align: "center",
      });
    }

    // Footer
    doc.setFillColor(124, 58, 237);
    applyOpacity(0.3);
    doc.rect(52, 98, W - 52, 7, "F");
    applyOpacity(1);
    doc.setTextColor(200, 200, 220);
    doc.setFontSize(5.5);
    doc.setFont("helvetica", "normal");
    doc.text(
      `mcfabs.ng  |  ${CONFIG.EVENT.email}  |  ${CONFIG.EVENT.city}`,
      119,
      102.5,
      { align: "center" },
    );

    return doc.output("datauristring");
  },

  download(attendee, pdfDataUri) {
    const link = document.createElement("a");
    link.href = pdfDataUri;
    link.download = `MCFABS-Ticket-${attendee.ticket_code}.pdf`;
    link.click();
  },
};

// ─── Paystack Integration ─────────────────────────────────────────────────────
const PaystackPay = {
  async initialize(attendee, onSuccess, onClose) {
    if (typeof PaystackPop === "undefined") {
      // Load Paystack script dynamically from local vendor assets
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "vendor/js/paystack-inline.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    const ticket = CONFIG.TICKETS.find(
      (t) => t.id === attendee.ticket_category,
    );
    const amount = ticket ? ticket.price * 100 : 15000 * 100; // Convert to kobo

    const handler = PaystackPop.setup({
      key: CONFIG.PAYSTACK_PUBLIC_KEY,
      email: attendee.email,
      amount: amount,
      currency: CONFIG.CURRENCY_CODE,
      ref: `MCFABS-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      metadata: {
        custom_fields: [
          {
            display_name: "Attendee Name",
            variable_name: "attendee_name",
            value: attendee.full_name,
          },
          {
            display_name: "Ticket Code",
            variable_name: "ticket_code",
            value: attendee.ticket_code,
          },
          {
            display_name: "Seat Number",
            variable_name: "seat_number",
            value: attendee.seat_number,
          },
        ],
      },
      callback: (response) => {
        onSuccess({
          reference: response.reference,
          amount: ticket ? ticket.price : 15000,
          status: "paid",
        });
      },
      onClose: () => {
        if (onClose) onClose();
      },
    });

    handler.openIframe();
  },
};

// ─── Email Service (Simulated) ────────────────────────────────────────────────
const EmailService = {
  async sendTicketEmail(attendee) {
    // In production: call Supabase Edge Function or email API
    console.log(`📧 Sending ticket email to ${attendee.email}`);
    // Simulate success
    return { success: true };
  },
};

// ─── Countdown Timer ──────────────────────────────────────────────────────────
function getCountdown(targetDate) {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const diff = target - now;

  if (diff <= 0)
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, expired: false };
}

// ─── CSV Export ───────────────────────────────────────────────────────────────
function exportCSV(data, filename = "mcfabs-attendees.csv") {
  const headers = [
    "Full Name",
    "Email",
    "Phone",
    "Gender",
    "Occupation",
    "Ticket Category",
    "Ticket Code",
    "Seat Number",
    "Payment Status",
    "Amount Paid",
    "Payment Reference",
    "Checked In",
    "Checked In At",
    "Registration Date",
  ];

  const rows = data.map((a) => [
    a.full_name || "",
    a.email || "",
    a.phone || "",
    a.gender || "",
    a.occupation || "",
    a.ticket_category || "",
    a.ticket_code || "",
    a.seat_number || "",
    a.payment_status || "",
    a.amount_paid || 0,
    a.payment_reference || "",
    a.checked_in ? "Yes" : "No",
    a.checked_in_at || "",
    a.created_at || "",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// ─── Validation ───────────────────────────────────────────────────────────────
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^[\+]?[0-9]{10,14}$/.test(phone.replace(/\s/g, ""));
}

// ─── WhatsApp Share ───────────────────────────────────────────────────────────
function shareOnWhatsApp(attendee) {
  const text = encodeURIComponent(
    `🎉 I just registered for MC FABS Masterclass!\n\n` +
      `📋 Name: ${attendee.full_name}\n` +
      `🎟️ Ticket: ${attendee.ticket_code}\n` +
      `💺 Seat: ${attendee.seat_number}\n` +
      `📅 Date: ${formatDate(CONFIG.EVENT.date)}\n` +
      `📍 Venue: ${CONFIG.EVENT.venue}\n\n` +
      `Register now at mcfabs.ng`,
  );
  window.open(`https://wa.me/?text=${text}`, "_blank");
}

window.QRGen = QRGen;
window.PDFTicket = PDFTicket;
window.PaystackPay = PaystackPay;
window.EmailService = EmailService;
window.getCountdown = getCountdown;
window.exportCSV = exportCSV;
window.validateEmail = validateEmail;
window.validatePhone = validatePhone;
window.shareOnWhatsApp = shareOnWhatsApp;

// ============================================================
// MC FABS MASTERCLASS — Registration & Payment Flow
// ============================================================

function RegisterPage({ setPage }) {
  const toast = useToast();
  const [step, setStep] = React.useState(1); // 1=form, 2=payment, 3=success
  const [loading, setLoading] = React.useState(false);
  const [attendee, setAttendee] = React.useState(null);
  const [pdfDataUri, setPdfDataUri] = React.useState(null);
  const [qrDataUrl, setQrDataUrl] = React.useState(null);

  // Pre-selected ticket from landing page
  const preSelected =
    sessionStorage.getItem("mcfabs_selected_ticket") || "general";

  const [form, setForm] = React.useState({
    full_name: "",
    email: "",
    phone: "",
    gender: "",
    occupation: "",
    ticket_category: preSelected,
    special_requests: "",
  });
  const [errors, setErrors] = React.useState({});

  const selectedTicket = CONFIG.TICKETS.find(
    (t) => t.id === form.ticket_category,
  );

  // ── Validation ────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.full_name.trim() || form.full_name.trim().length < 3)
      errs.full_name = "Please enter your full name (min 3 chars)";
    if (!form.email || !validateEmail(form.email))
      errs.email = "Please enter a valid email address";
    if (!form.phone || !validatePhone(form.phone))
      errs.phone = "Please enter a valid phone number (10-14 digits)";
    if (!form.ticket_category)
      errs.ticket_category = "Please select a ticket type";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Handle form submit ────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors below");
      return;
    }
    setLoading(true);

    try {
      const { data, error } = await DB.createAttendee({
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        gender: form.gender,
        occupation: form.occupation.trim(),
        ticket_category: form.ticket_category,
        special_requests: form.special_requests.trim(),
      });

      if (error) throw error;
      setAttendee(data);
      toast.success("Registration saved! Proceeding to payment...");
      setStep(2);
    } catch (err) {
      toast.error("Registration failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Handle Paystack payment ───────────────────────────────
  const handlePayment = async () => {
    if (!attendee) return;
    setLoading(true);
    toast.info("Opening payment gateway...");

    try {
      await PaystackPay.initialize(
        attendee,
        async (paymentData) => {
          // Payment successful
          console.info("Paystack success callback", paymentData);
          toast.loading("Confirming payment...");
          const confirmRes = await DB.confirmPayment(attendee.id, paymentData);
          // Support both { data } and direct object return shapes
          const updated =
            confirmRes && confirmRes.data ? confirmRes.data : confirmRes;
          const updatedAttendee = updated || {
            ...attendee,
            ...paymentData,
            payment_status: "paid",
          };
          setAttendee(updatedAttendee);

          // Generate QR code
          toast.info("Generating your QR code...");
          const qrUrl = await QRGen.generate(updatedAttendee);
          setQrDataUrl(qrUrl);
          if (qrUrl) await DB.updateQRCode(updatedAttendee.id, qrUrl);

          // Generate PDF ticket
          toast.info("Generating your PDF ticket...");
          const pdf = await PDFTicket.generate(updatedAttendee);
          setPdfDataUri(pdf);

          // Send confirmation email
          await EmailService.sendTicketEmail(updatedAttendee);

          toast.success("🎉 Payment confirmed! Your ticket is ready!");
          setStep(3);
        },
        () => {
          toast.warning("Payment cancelled. You can try again anytime.");
          setLoading(false);
        },
      );
    } catch (err) {
      toast.error(
        "Payment initialization failed. Please check your connection and try again.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Demo payment (no Paystack configured) ────────────────
  const handleDemoPayment = async () => {
    setLoading(true);
    toast.loading("Processing demo payment...");

    await new Promise((r) => setTimeout(r, 2000));

    const paymentData = {
      reference: `DEMO-${Date.now()}`,
      amount: selectedTicket ? selectedTicket.price : 15000,
      status: "paid",
    };

    try {
      if (!attendee) throw new Error("No attendee found for demo payment");
      console.info("Simulating demo payment", paymentData, "for", attendee.id);
      const confirmRes = await DB.confirmPayment(attendee.id, paymentData);
      console.info("confirmRes:", confirmRes);
      const updated =
        confirmRes && confirmRes.data ? confirmRes.data : confirmRes;
      const updatedAttendee = updated || {
        ...attendee,
        ...paymentData,
        payment_status: "paid",
      };
      console.info("updatedAttendee:", updatedAttendee);
      setAttendee(updatedAttendee);

      // Generate QR code (safe)
      let qrUrl = null;
      try {
        qrUrl = await QRGen.generate(updatedAttendee);
        setQrDataUrl(qrUrl);
        if (qrUrl) {
          const qrRes = await DB.updateQRCode(updatedAttendee.id, qrUrl);
          console.info("updateQRCode result:", qrRes);
        }
      } catch (err) {
        console.error("QR generation/update failed", err);
      }

      // Generate PDF ticket (safe)
      try {
        const pdf = await PDFTicket.generate(updatedAttendee);
        setPdfDataUri(pdf);
      } catch (err) {
        console.error("PDF generation failed", err);
      }

      // Send confirmation email (safe)
      try {
        const emailRes = await EmailService.sendTicketEmail(updatedAttendee);
        console.info("EmailService.sendTicketEmail result:", emailRes);
      } catch (err) {
        console.error("Email send failed", err);
      }

      toast.success("🎉 Demo payment confirmed! Your ticket is ready!");
      setStep(3);
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isDemoMode = CONFIG.PAYSTACK_PUBLIC_KEY.includes("YOUR_PAYSTACK");

  return React.createElement(
    "div",
    {
      style: {
        minHeight: "100vh",
        background: "#1D1A39",
        paddingTop: 80,
        paddingBottom: 60,
      },
    },
    // Back button
    React.createElement(
      "div",
      { className: "max-w-3xl mx-auto px-4", style: { marginBottom: 24 } },
      React.createElement(
        "button",
        {
          onClick: () => setPage("landing"),
          style: {
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.5)",
            cursor: "pointer",
            fontSize: 14,
            fontFamily: "Inter, sans-serif",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 0",
          },
        },
        "← Back to Event Page",
      ),
    ),

    // Progress steps
    React.createElement(
      "div",
      { className: "max-w-3xl mx-auto px-4", style: { marginBottom: 40 } },
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        [
          { n: 1, label: "Your Details" },
          { n: 2, label: "Payment" },
          { n: 3, label: "Ticket" },
        ].map((s, i, arr) =>
          React.createElement(
            React.Fragment,
            { key: s.n },
            React.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 10 } },
              React.createElement(
                "div",
                {
                  style: {
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      step >= s.n
                        ? "linear-gradient(135deg, #F39F5A, #AE445A)"
                        : "rgba(255,255,255,0.08)",
                    color: step >= s.n ? "white" : "rgba(255,255,255,0.3)",
                    fontWeight: 700,
                    fontSize: 14,
                    flexShrink: 0,
                  },
                },
                step > s.n ? "✓" : s.n,
              ),
              React.createElement(
                "span",
                {
                  style: {
                    color: step >= s.n ? "white" : "rgba(255,255,255,0.3)",
                    fontSize: 14,
                    fontWeight: step >= s.n ? 600 : 400,
                    whiteSpace: "nowrap",
                  },
                },
                s.label,
              ),
            ),
            i < arr.length - 1 &&
              React.createElement("div", {
                style: {
                  flex: 1,
                  height: 1,
                  background:
                    step > s.n
                      ? "rgba(102,103,171,0.5)"
                      : "rgba(255,255,255,0.1)",
                  minWidth: 20,
                },
              }),
          ),
        ),
      ),
    ),

    // Step content
    step === 1 &&
      React.createElement(RegistrationForm, {
        form,
        setForm,
        errors,
        loading,
        selectedTicket,
        onSubmit: handleSubmit,
      }),
    step === 2 &&
      React.createElement(PaymentStep, {
        attendee,
        selectedTicket,
        loading,
        onPay: isDemoMode ? handleDemoPayment : handlePayment,
        isDemoMode,
      }),
    step === 3 &&
      React.createElement(TicketSuccess, {
        attendee,
        qrDataUrl,
        pdfDataUri,
        setPage,
      }),
  );
}

// ─── Registration Form ────────────────────────────────────────────────────────
function RegistrationForm({
  form,
  setForm,
  errors,
  loading,
  selectedTicket,
  onSubmit,
}) {
  const update = (field, val) => setForm((prev) => ({ ...prev, [field]: val }));

  return React.createElement(
    "div",
    { className: "max-w-3xl mx-auto px-4 page-enter" },
    // Header
    React.createElement(
      "div",
      { style: { textAlign: "center", marginBottom: 40 } },
      React.createElement(
        "h2",
        {
          className: "gradient-text",
          style: {
            fontSize: 36,
            fontWeight: 800,
            marginBottom: 10,
            fontFamily: "Playfair Display, serif",
          },
        },
        "Register for the Masterclass",
      ),
      React.createElement(
        "p",
        { style: { color: "rgba(255,255,255,0.5)", fontSize: 16 } },
        "Fill in your details below to secure your seat.",
      ),
    ),

    React.createElement(
      "form",
      { onSubmit },
      React.createElement(
        "div",
        {
          style: {
            background:
              "linear-gradient(135deg, rgba(102,103,171,0.1) 0%, rgba(33,6,53,0.9) 100%)",
            border: "1px solid rgba(123,51,126,0.2)",
            borderRadius: 20,
            padding: "32px 28px",
            marginBottom: 24,
          },
        },
        React.createElement(
          "h3",
          {
            style: {
              color: "white",
              fontWeight: 700,
              fontSize: 18,
              marginBottom: 24,
            },
          },
          "👤 Personal Information",
        ),

        // Row 1: Name + Email
        React.createElement(
          "div",
          {
            style: {
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 20,
              marginBottom: 20,
            },
          },
          React.createElement(FormField, {
            label: "Full Name *",
            value: form.full_name,
            error: errors.full_name,
            onChange: (v) => update("full_name", v),
            placeholder: "e.g. Faith Bello",
            icon: "👤",
          }),
          React.createElement(FormField, {
            label: "Email Address *",
            type: "email",
            value: form.email,
            error: errors.email,
            onChange: (v) => update("email", v),
            placeholder: "you@example.com",
            icon: "✉️",
          }),
        ),

        // Row 2: Phone + Gender
        React.createElement(
          "div",
          {
            style: {
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 20,
              marginBottom: 20,
            },
          },
          React.createElement(FormField, {
            label: "Phone Number *",
            type: "tel",
            value: form.phone,
            error: errors.phone,
            onChange: (v) => update("phone", v),
            placeholder: "08012345678",
            icon: "📱",
          }),
          React.createElement(
            "div",
            null,
            React.createElement(
              "label",
              {
                style: {
                  display: "block",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 8,
                },
              },
              "⚧ Gender (Optional)",
            ),
            React.createElement(
              "select",
              {
                className: "form-input",
                value: form.gender,
                onChange: (e) => update("gender", e.target.value),
                style: {
                  background: "rgba(255,255,255,0.05)",
                  color: form.gender ? "white" : "rgba(255,255,255,0.3)",
                },
              },
              React.createElement("option", { value: "" }, "Select gender"),
              React.createElement("option", { value: "Male" }, "Male"),
              React.createElement("option", { value: "Female" }, "Female"),
              React.createElement(
                "option",
                { value: "Prefer not to say" },
                "Prefer not to say",
              ),
            ),
          ),
        ),

        // Occupation
        React.createElement(FormField, {
          label: "Occupation (Optional)",
          value: form.occupation,
          onChange: (v) => update("occupation", v),
          placeholder: "e.g. Event Host, Entrepreneur, Media Personality",
          icon: "💼",
          style: { marginBottom: 20 },
        }),

        // Special requests
        React.createElement(
          "div",
          null,
          React.createElement(
            "label",
            {
              style: {
                display: "block",
                color: "rgba(255,255,255,0.7)",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 8,
              },
            },
            "📝 Special Requests (Optional)",
          ),
          React.createElement("textarea", {
            className: "form-input",
            value: form.special_requests,
            onChange: (e) => update("special_requests", e.target.value),
            placeholder:
              "Dietary requirements, accessibility needs, other requests...",
            rows: 3,
            style: { resize: "vertical", minHeight: 80 },
          }),
        ),
      ),

      // Ticket selection
      React.createElement(
        "div",
        {
          style: {
            background:
              "linear-gradient(135deg, rgba(102,103,171,0.1) 0%, rgba(33,6,53,0.9) 100%)",
            border: "1px solid rgba(123,51,126,0.2)",
            borderRadius: 20,
            padding: "32px 28px",
            marginBottom: 24,
          },
        },
        React.createElement(
          "h3",
          {
            style: {
              color: "white",
              fontWeight: 700,
              fontSize: 18,
              marginBottom: 24,
            },
          },
          "🎟️ Select Your Ticket",
        ),
        errors.ticket_category &&
          React.createElement(
            "p",
            { style: { color: "#ef4444", fontSize: 13, marginBottom: 16 } },
            errors.ticket_category,
          ),

        React.createElement(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: 12 } },
          CONFIG.TICKETS.map((ticket) => {
            const isSelected = form.ticket_category === ticket.id;
            return React.createElement(
              "label",
              {
                key: ticket.id,
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 20px",
                  borderRadius: 14,
                  cursor: "pointer",
                  background: isSelected
                    ? "rgba(102,103,171,0.2)"
                    : "rgba(255,255,255,0.03)",
                  border: `2px solid ${isSelected ? "#F39F5A" : "rgba(255,255,255,0.08)"}`,
                  transition: "all 0.2s ease",
                },
              },
              React.createElement("input", {
                type: "radio",
                name: "ticket_category",
                value: ticket.id,
                checked: isSelected,
                onChange: () => update("ticket_category", ticket.id),
                style: {
                  accentColor: "#F39F5A",
                  width: 18,
                  height: 18,
                  flexShrink: 0,
                },
              }),
              React.createElement(
                "div",
                { style: { flex: 1 } },
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 8,
                    },
                  },
                  React.createElement(
                    "div",
                    {
                      style: { display: "flex", alignItems: "center", gap: 8 },
                    },
                    React.createElement(
                      "span",
                      {
                        style: {
                          color: "white",
                          fontWeight: 700,
                          fontSize: 16,
                        },
                      },
                      ticket.name,
                    ),
                    ticket.badge &&
                      React.createElement(
                        "span",
                        {
                          style: {
                            background:
                              ticket.badge === "Most Popular"
                                ? "rgba(102,103,171,0.3)"
                                : "rgba(245,213,224,0.3)",
                            color:
                              ticket.badge === "Most Popular"
                                ? "#E8BCB9"
                                : "#E8BCB9",
                            borderRadius: 999,
                            padding: "2px 10px",
                            fontSize: 11,
                            fontWeight: 700,
                          },
                        },
                        ticket.badge,
                      ),
                  ),
                  React.createElement(
                    "span",
                    {
                      style: {
                        color: "#E8BCB9",
                        fontWeight: 800,
                        fontSize: 18,
                        fontFamily: "Space Grotesk, sans-serif",
                      },
                    },
                    formatCurrency(ticket.price),
                  ),
                ),
                React.createElement(
                  "p",
                  {
                    style: {
                      color: "rgba(255,255,255,0.45)",
                      fontSize: 12,
                      marginTop: 4,
                    },
                  },
                  ticket.features.slice(0, 2).join(" • "),
                ),
              ),
            );
          }),
        ),
      ),

      // Summary & Submit
      React.createElement(
        "div",
        {
          style: {
            background:
              "linear-gradient(135deg, rgba(102,103,171,0.2) 0%, rgba(245,213,224,0.1) 100%)",
            border: "1px solid rgba(123,51,126,0.3)",
            borderRadius: 20,
            padding: "24px 28px",
            marginBottom: 24,
          },
        },
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            },
          },
          React.createElement(
            "div",
            null,
            React.createElement(
              "p",
              { style: { color: "rgba(255,255,255,0.5)", fontSize: 13 } },
              "Selected Package",
            ),
            React.createElement(
              "p",
              { style: { color: "white", fontWeight: 700, fontSize: 18 } },
              selectedTicket ? selectedTicket.name : "None selected",
            ),
          ),
          React.createElement(
            "div",
            { style: { textAlign: "right" } },
            React.createElement(
              "p",
              { style: { color: "rgba(255,255,255,0.5)", fontSize: 13 } },
              "Total Amount",
            ),
            React.createElement(
              "p",
              {
                className: "gradient-text",
                style: {
                  fontWeight: 900,
                  fontSize: 32,
                  fontFamily: "Space Grotesk, sans-serif",
                },
              },
              selectedTicket ? formatCurrency(selectedTicket.price) : "—",
            ),
          ),
        ),
      ),

      React.createElement(
        "button",
        {
          type: "submit",
          disabled: loading,
          style: {
            width: "100%",
            padding: "16px 0",
            borderRadius: 14,
            background: loading
              ? "rgba(102,103,171,0.5)"
              : "linear-gradient(135deg, #F39F5A, #AE445A)",
            color: "white",
            fontSize: 17,
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            border: "none",
            fontFamily: "Inter, sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          },
        },
        loading ? React.createElement(LoadingSpinner) : null,
        loading ? "Processing..." : "🎟️ Continue to Payment →",
      ),
    ),
  );
}

// ─── Form Field Component ─────────────────────────────────────────────────────
function FormField({
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  icon,
  style = {},
}) {
  return React.createElement(
    "div",
    { style },
    React.createElement(
      "label",
      {
        style: {
          display: "block",
          color: "rgba(255,255,255,0.7)",
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 8,
        },
      },
      icon ? `${icon} ` : "",
      label,
    ),
    React.createElement("input", {
      type,
      className: "form-input",
      value,
      onChange: (e) => onChange(e.target.value),
      placeholder,
      style: error ? { borderColor: "#ef4444" } : {},
    }),
    error &&
      React.createElement(
        "p",
        { style: { color: "#ef4444", fontSize: 12, marginTop: 5 } },
        error,
      ),
  );
}

// ─── Payment Step ─────────────────────────────────────────────────────────────
function PaymentStep({ attendee, selectedTicket, loading, onPay, isDemoMode }) {
  if (!attendee) return null;

  return React.createElement(
    "div",
    { className: "max-w-xl mx-auto px-4 page-enter" },
    React.createElement(
      "div",
      { style: { textAlign: "center", marginBottom: 40 } },
      React.createElement(
        "div",
        {
          style: {
            width: 72,
            height: 72,
            margin: "0 auto 20px",
            background: "linear-gradient(135deg, #F39F5A, #AE445A)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
          },
        },
        "💳",
      ),
      React.createElement(
        "h2",
        {
          className: "gradient-text",
          style: {
            fontSize: 32,
            fontWeight: 800,
            marginBottom: 10,
            fontFamily: "Playfair Display, serif",
          },
        },
        "Complete Your Payment",
      ),
      React.createElement(
        "p",
        { style: { color: "rgba(255,255,255,0.5)", fontSize: 15 } },
        "Secure payment powered by " + (isDemoMode ? "Demo Mode" : "Paystack"),
      ),
    ),

    // Order summary card
    React.createElement(
      "div",
      {
        style: {
          background:
            "linear-gradient(135deg, rgba(102,103,171,0.15) 0%, rgba(33,6,53,0.9) 100%)",
          border: "1px solid rgba(123,51,126,0.2)",
          borderRadius: 20,
          padding: "28px 24px",
          marginBottom: 24,
        },
      },
      React.createElement(
        "h3",
        {
          style: {
            color: "white",
            fontWeight: 700,
            marginBottom: 20,
            fontSize: 16,
          },
        },
        "📋 Order Summary",
      ),

      [
        { label: "Attendee", value: attendee.full_name },
        { label: "Email", value: attendee.email },
        {
          label: "Ticket Type",
          value: selectedTicket
            ? selectedTicket.name
            : attendee.ticket_category,
        },
        { label: "Ticket Code", value: attendee.ticket_code },
        { label: "Seat Number", value: attendee.seat_number },
      ].map((item) =>
        React.createElement(
          "div",
          {
            key: item.label,
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 0",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              gap: 12,
              flexWrap: "wrap",
            },
          },
          React.createElement(
            "span",
            { style: { color: "rgba(255,255,255,0.5)", fontSize: 14 } },
            item.label,
          ),
          React.createElement(
            "span",
            {
              style: {
                color: "white",
                fontWeight: 600,
                fontSize: 14,
                textAlign: "right",
              },
            },
            item.value,
          ),
        ),
      ),

      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 20,
            paddingTop: 20,
            borderTop: "1px solid rgba(123,51,126,0.2)",
          },
        },
        React.createElement(
          "span",
          { style: { color: "white", fontWeight: 700, fontSize: 18 } },
          "Total",
        ),
        React.createElement(
          "span",
          {
            className: "gradient-text",
            style: {
              fontWeight: 900,
              fontSize: 32,
              fontFamily: "Space Grotesk, sans-serif",
            },
          },
          formatCurrency(selectedTicket ? selectedTicket.price : 0),
        ),
      ),
    ),

    // Demo mode notice
    isDemoMode &&
      React.createElement(
        "div",
        {
          style: {
            background: "rgba(245,213,224,0.1)",
            border: "1px solid rgba(245,213,224,0.3)",
            borderRadius: 12,
            padding: "14px 18px",
            marginBottom: 20,
            color: "#E8BCB9",
            fontSize: 13,
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
          },
        },
        React.createElement("span", null, "⚠️"),
        React.createElement(
          "div",
          null,
          React.createElement("strong", null, "Demo Mode Active. "),
          "Configure your Paystack public key in js/config.js to enable real payments. This demo simulates a successful payment.",
        ),
      ),

    // Payment button
    React.createElement(
      "button",
      {
        onClick: onPay,
        disabled: loading,
        style: {
          width: "100%",
          padding: "18px 0",
          borderRadius: 14,
          background: loading
            ? "rgba(102,103,171,0.5)"
            : "linear-gradient(135deg, #F39F5A, #AE445A)",
          color: "white",
          fontSize: 18,
          fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          border: "none",
          fontFamily: "Inter, sans-serif",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          boxShadow: "0 8px 32px rgba(102,103,171,0.4)",
        },
      },
      loading ? React.createElement(LoadingSpinner) : null,
      loading
        ? "Processing..."
        : isDemoMode
          ? "🧪 Simulate Payment"
          : `💳 Pay ${formatCurrency(selectedTicket ? selectedTicket.price : 0)}`,
    ),

    // Security badges
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "center",
          gap: 20,
          flexWrap: "wrap",
        },
      },
      ["🔒 SSL Secured", "✅ Payment Verified", "🏦 Bank-Grade Security"].map(
        (b) =>
          React.createElement(
            "span",
            {
              key: b,
              style: { color: "rgba(255,255,255,0.35)", fontSize: 12 },
            },
            b,
          ),
      ),
    ),
  );
}

// ─── Ticket Success Page ──────────────────────────────────────────────────────
function TicketSuccess({ attendee, qrDataUrl, pdfDataUri, setPage }) {
  const toast = useToast();
  const qrCanvasRef = React.useRef(null);
  const ticket = CONFIG.TICKETS.find((t) => t.id === attendee?.ticket_category);

  React.useEffect(() => {
    if (qrCanvasRef.current && attendee && !qrDataUrl) {
      QRGen.generateCanvas(attendee, qrCanvasRef.current);
    }
  }, [attendee, qrDataUrl]);

  if (!attendee) return null;

  const handleDownloadPDF = () => {
    if (pdfDataUri) {
      PDFTicket.download(attendee, pdfDataUri);
      toast.success("Ticket PDF downloaded!");
    } else {
      toast.error("PDF not ready yet. Please wait a moment and try again.");
    }
  };

  const handleShare = () => {
    shareOnWhatsApp(attendee);
  };

  return React.createElement(
    "div",
    { className: "max-w-2xl mx-auto px-4 page-enter" },
    // Success header
    React.createElement(
      "div",
      { style: { textAlign: "center", marginBottom: 40 } },
      React.createElement(
        "div",
        {
          style: {
            width: 96,
            height: 96,
            margin: "0 auto 24px",
            background: "linear-gradient(135deg, #F39F5A, #059669)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
            boxShadow: "0 0 40px rgba(102,103,171,0.4)",
            animation: "float 3s ease-in-out infinite",
          },
        },
        "🎉",
      ),
      React.createElement(
        "h2",
        {
          style: {
            color: "white",
            fontSize: 36,
            fontWeight: 800,
            marginBottom: 10,
            fontFamily: "Playfair Display, serif",
          },
        },
        "You're Registered!",
      ),
      React.createElement(
        "p",
        { style: { color: "rgba(255,255,255,0.6)", fontSize: 16 } },
        "Welcome to MC FABS Masterclass! Your ticket is ready.",
      ),
      React.createElement(
        "p",
        {
          style: { color: "rgba(255,255,255,0.4)", fontSize: 14, marginTop: 8 },
        },
        "A confirmation email has been sent to: ",
        React.createElement(
          "strong",
          { style: { color: "#AE445A" } },
          attendee.email,
        ),
      ),
    ),

    // Digital Ticket Card
    React.createElement(
      "div",
      {
        id: "ticket-print",
        style: {
          background:
            "linear-gradient(135deg, #1D1A39 0%, #1D1A39 50%, #1D1A39 100%)",
          border: "1px solid rgba(123,51,126,0.4)",
          borderRadius: 24,
          overflow: "hidden",
          marginBottom: 24,
          position: "relative",
        },
      },
      // Top section with gradient
      React.createElement(
        "div",
        {
          style: {
            background: "linear-gradient(135deg, #F39F5A 0%, #AE445A 100%)",
            padding: "28px 32px",
            position: "relative",
            overflow: "hidden",
          },
        },
        React.createElement("div", {
          style: {
            position: "absolute",
            top: -30,
            right: -30,
            width: 150,
            height: 150,
            background: "rgba(255,255,255,0.08)",
            borderRadius: "50%",
          },
        }),
        React.createElement(
          "div",
          { style: { position: "relative", zIndex: 1 } },
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 16,
              },
            },
            React.createElement(
              "div",
              null,
              React.createElement(
                "p",
                {
                  style: {
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 12,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    marginBottom: 4,
                  },
                },
                "MC FABS MASTERCLASS",
              ),
              React.createElement(
                "h3",
                {
                  style: {
                    color: "white",
                    fontSize: 28,
                    fontWeight: 900,
                    margin: "0 0 4px",
                    fontFamily: "Playfair Display, serif",
                  },
                },
                "EVENT TICKET",
              ),
              React.createElement(
                "p",
                { style: { color: "rgba(255,255,255,0.7)", fontSize: 14 } },
                CONFIG.EVENT.tagline,
              ),
            ),
            ticket &&
              React.createElement(
                "div",
                {
                  style: {
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: 12,
                    padding: "8px 20px",
                    backdropFilter: "blur(10px)",
                    textAlign: "center",
                  },
                },
                React.createElement(
                  "div",
                  { style: { color: "white", fontWeight: 800, fontSize: 18 } },
                  ticket.name.toUpperCase(),
                ),
                React.createElement(
                  "div",
                  { style: { color: "rgba(255,255,255,0.7)", fontSize: 11 } },
                  "TICKET CATEGORY",
                ),
              ),
          ),
        ),
      ),

      // Ticket body
      React.createElement(
        "div",
        { style: { padding: "28px 32px" } },
        React.createElement(
          "div",
          {
            style: {
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 24,
              marginBottom: 24,
            },
          },

          // Left: Details
          React.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 18 } },
            [
              { label: "ATTENDEE", value: attendee.full_name, large: true },
              { label: "TICKET CODE", value: attendee.ticket_code, mono: true },
              {
                label: "SEAT NUMBER",
                value: attendee.seat_number,
                highlight: true,
              },
              { label: "DATE", value: formatDate(CONFIG.EVENT.date) },
              { label: "TIME", value: CONFIG.EVENT.time },
              { label: "VENUE", value: CONFIG.EVENT.venue },
            ].map((item) =>
              React.createElement(
                "div",
                { key: item.label },
                React.createElement(
                  "p",
                  {
                    style: {
                      color: "rgba(123,51,126,0.8)",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.15em",
                      marginBottom: 3,
                    },
                  },
                  item.label,
                ),
                React.createElement(
                  "p",
                  {
                    style: {
                      color: item.highlight ? "#E8BCB9" : "white",
                      fontSize: item.large ? 20 : item.mono ? 15 : 14,
                      fontWeight: item.large || item.highlight ? 700 : 500,
                      fontFamily: item.mono ? "monospace" : "inherit",
                      margin: 0,
                    },
                  },
                  item.value,
                ),
              ),
            ),
          ),

          // Right: QR Code
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                background: "rgba(255,255,255,0.04)",
                borderRadius: 16,
                padding: "24px 20px",
                borderLeft: "1px dashed rgba(255,255,255,0.1)",
              },
            },
            React.createElement(
              "p",
              {
                style: {
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                },
              },
              "Scan to Verify",
            ),
            qrDataUrl
              ? React.createElement("img", {
                  src: qrDataUrl,
                  style: {
                    width: 160,
                    height: 160,
                    borderRadius: 12,
                    border: "3px solid rgba(123,51,126,0.3)",
                  },
                  alt: "Ticket QR Code",
                })
              : React.createElement("canvas", {
                  ref: qrCanvasRef,
                  style: {
                    borderRadius: 12,
                    border: "3px solid rgba(123,51,126,0.3)",
                  },
                }),
            React.createElement(
              "div",
              {
                style: {
                  background: "rgba(102,103,171,0.15)",
                  border: "1px solid rgba(102,103,171,0.3)",
                  borderRadius: 999,
                  padding: "4px 12px",
                },
              },
              React.createElement(
                "span",
                { style: { color: "#F39F5A", fontSize: 12, fontWeight: 600 } },
                "✓ PAYMENT CONFIRMED",
              ),
            ),
          ),
        ),

        // Ticket perforated bottom
        React.createElement(
          "div",
          {
            style: {
              borderTop: "1px dashed rgba(255,255,255,0.12)",
              paddingTop: 18,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            },
          },
          React.createElement(
            "span",
            { style: { color: "rgba(255,255,255,0.35)", fontSize: 12 } },
            "mcfabs.ng",
          ),
          React.createElement(
            "span",
            { style: { color: "rgba(255,255,255,0.35)", fontSize: 12 } },
            "Kano, Nigeria 2026",
          ),
          React.createElement(
            "span",
            { style: { color: "rgba(255,255,255,0.35)", fontSize: 12 } },
            `Amount: ${formatCurrency(ticket ? ticket.price : 0)}`,
          ),
        ),
      ),
    ),

    // Action buttons
    React.createElement(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 24,
        },
      },
      [
        {
          label: "📥 Download PDF",
          action: () => handleDownloadPDF(),
          primary: true,
        },
        { label: "💬 Share on WhatsApp", action: handleShare, primary: false },
        {
          label: "🏠 Back to Home",
          action: () => setPage("landing"),
          primary: false,
        },
        {
          label: "📧 View Ticket Page",
          action: () => {
            sessionStorage.setItem(
              "mcfabs_view_ticket_code",
              attendee.ticket_code,
            );
            setPage("ticket");
          },
          primary: false,
        },
      ].map((btn, i) =>
        React.createElement(
          "button",
          {
            key: i,
            onClick: btn.action,
            style: {
              padding: "13px 20px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              border: btn.primary ? "none" : "1px solid rgba(255,255,255,0.12)",
              background: btn.primary
                ? "linear-gradient(135deg, #F39F5A, #AE445A)"
                : "rgba(255,255,255,0.05)",
              color: "white",
              fontFamily: "Inter, sans-serif",
              transition: "all 0.2s ease",
            },
            onMouseEnter: (e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.transform = "translateY(0)";
            },
          },
          btn.label,
        ),
      ),
    ),

    // What's next
    React.createElement(
      "div",
      {
        style: {
          background: "rgba(102,103,171,0.08)",
          border: "1px solid rgba(102,103,171,0.2)",
          borderRadius: 16,
          padding: "20px 24px",
        },
      },
      React.createElement(
        "h4",
        {
          style: {
            color: "#F39F5A",
            fontWeight: 700,
            marginBottom: 12,
            fontSize: 15,
          },
        },
        "✅ What's Next?",
      ),
      React.createElement(
        "ul",
        {
          style: {
            color: "rgba(255,255,255,0.7)",
            fontSize: 14,
            lineHeight: 1.8,
            paddingLeft: 20,
            margin: 0,
          },
        },
        React.createElement(
          "li",
          null,
          "Save or screenshot your QR code for event day check-in",
        ),
        React.createElement(
          "li",
          null,
          `Mark your calendar: ${formatDate(CONFIG.EVENT.date)} at ${CONFIG.EVENT.time}`,
        ),
        React.createElement("li", null, `Venue: ${CONFIG.EVENT.venue}`),
        React.createElement(
          "li",
          null,
          "Check your email for the official confirmation and event details",
        ),
        React.createElement(
          "li",
          null,
          "Join our WhatsApp community for event updates",
        ),
      ),
    ),
  );
}

window.RegisterPage = RegisterPage;

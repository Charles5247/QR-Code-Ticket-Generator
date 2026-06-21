// ============================================================
// MC FABS MASTERCLASS — Ticket View Page
// ============================================================

function TicketPage({ setPage }) {
  const toast = useToast();
  const [searchCode, setSearchCode] = React.useState("");
  const [attendee, setAttendee] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [qrDataUrl, setQrDataUrl] = React.useState(null);
  const [pdfDataUri, setPdfDataUri] = React.useState(null);

  // Auto-load if code is in session storage
  React.useEffect(() => {
    const code = sessionStorage.getItem("mcfabs_view_ticket_code");
    if (code) {
      setSearchCode(code);
      loadTicket(code);
      sessionStorage.removeItem("mcfabs_view_ticket_code");
    }
  }, []);

  const loadTicket = async (code) => {
    if (!code) return;
    setLoading(true);
    try {
      const { data, error } = await DB.getByTicketCode(
        code.trim().toUpperCase(),
      );
      if (error || !data) {
        toast.error("Ticket not found. Please check the code and try again.");
        setAttendee(null);
        return;
      }

      setAttendee(data);

      // Generate QR
      const qrUrl = await QRGen.generate(data);
      setQrDataUrl(qrUrl);

      // Generate PDF
      if (data.payment_status === "paid") {
        const pdf = await PDFTicket.generate(data);
        setPdfDataUri(pdf);
      }

      toast.success("Ticket found!");
    } catch (err) {
      toast.error("Failed to load ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadTicket(searchCode);
  };

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
    React.createElement(
      "div",
      { className: "max-w-2xl mx-auto px-4" },

      // Header
      React.createElement(
        "div",
        { style: { marginBottom: 20 } },
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
              marginBottom: 24,
            },
          },
          "← Back to Event",
        ),
        React.createElement(
          "div",
          { style: { textAlign: "center", marginBottom: 32 } },
          React.createElement(
            "h2",
            {
              className: "gradient-text",
              style: {
                fontSize: 36,
                fontWeight: 800,
                fontFamily: "Playfair Display, serif",
                marginBottom: 8,
              },
            },
            "View Your Ticket",
          ),
          React.createElement(
            "p",
            { style: { color: "rgba(255,255,255,0.5)", fontSize: 15 } },
            "Enter your ticket code to retrieve your digital pass",
          ),
        ),
      ),

      // Search form
      React.createElement(
        "form",
        { onSubmit: handleSearch, style: { marginBottom: 32 } },
        React.createElement(
          "div",
          {
            style: {
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              padding: "20px 24px",
            },
          },
          React.createElement(
            "label",
            {
              style: {
                display: "block",
                color: "rgba(255,255,255,0.7)",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 10,
              },
            },
            "🎟️ Enter Ticket Code",
          ),
          React.createElement(
            "div",
            { style: { display: "flex", gap: 12 } },
            React.createElement("input", {
              className: "form-input",
              value: searchCode,
              onChange: (e) => setSearchCode(e.target.value.toUpperCase()),
              placeholder: "e.g. MCFABS-2026-GEN-0001",
              style: {
                flex: 1,
                fontFamily: "monospace",
                letterSpacing: "0.05em",
              },
            }),
            React.createElement(
              "button",
              {
                type: "submit",
                disabled: loading || !searchCode,
                style: {
                  background: "linear-gradient(135deg, #F39F5A, #AE445A)",
                  color: "white",
                  padding: "12px 20px",
                  borderRadius: 10,
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: "Inter, sans-serif",
                  flexShrink: 0,
                },
              },
              loading
                ? React.createElement(LoadingSpinner, { size: 18 })
                : "🔍",
              "Find Ticket",
            ),
          ),
        ),
      ),

      // Ticket display
      attendee &&
        React.createElement(
          "div",
          { className: "page-enter" },
          // Digital Ticket Card (same as success page)
          React.createElement(
            "div",
            {
              style: {
                background:
                  "linear-gradient(135deg, #1D1A39 0%, #1D1A39 50%, #1D1A39 100%)",
                border: "1px solid rgba(123,51,126,0.4)",
                borderRadius: 24,
                overflow: "hidden",
                marginBottom: 24,
              },
            },
            // Header
            React.createElement(
              "div",
              {
                style: {
                  background:
                    "linear-gradient(135deg, #F39F5A 0%, #AE445A 100%)",
                  padding: "24px 28px",
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
                    {
                      style: {
                        color: "rgba(255,255,255,0.7)",
                        fontSize: 11,
                        letterSpacing: "0.2em",
                      },
                    },
                    "MC FABS MASTERCLASS 2026",
                  ),
                  React.createElement(
                    "h3",
                    {
                      style: {
                        color: "white",
                        fontSize: 22,
                        fontWeight: 900,
                        margin: "4px 0 0",
                        fontFamily: "Playfair Display, serif",
                      },
                    },
                    "DIGITAL EVENT PASS",
                  ),
                ),
                React.createElement(StatusBadge, {
                  status: attendee.payment_status,
                }),
              ),
            ),

            // Body
            React.createElement(
              "div",
              { style: { padding: "24px 28px" } },
              React.createElement(
                "div",
                {
                  style: {
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 20,
                    marginBottom: 20,
                  },
                },

                // Info
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    },
                  },
                  [
                    { label: "ATTENDEE", value: attendee.full_name },
                    {
                      label: "TICKET CODE",
                      value: attendee.ticket_code,
                      mono: true,
                    },
                    {
                      label: "SEAT NUMBER",
                      value: attendee.seat_number,
                      highlight: true,
                    },
                    { label: "DATE", value: formatDate(CONFIG.EVENT.date) },
                    { label: "VENUE", value: CONFIG.EVENT.venue },
                    {
                      label: "STATUS",
                      value: attendee.checked_in
                        ? "✅ Checked In"
                        : "⏳ Not Yet Checked In",
                    },
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
                            marginBottom: 2,
                          },
                        },
                        item.label,
                      ),
                      React.createElement(
                        "p",
                        {
                          style: {
                            color: item.highlight ? "#E8BCB9" : "white",
                            fontSize: item.mono ? 13 : 14,
                            fontWeight: 600,
                            margin: 0,
                            fontFamily: item.mono ? "monospace" : "inherit",
                          },
                        },
                        item.value,
                      ),
                    ),
                  ),
                ),

                // QR
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 12,
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 16,
                      padding: "20px",
                    },
                  },
                  React.createElement(
                    "p",
                    {
                      style: {
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 10,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      },
                    },
                    "Show at entrance",
                  ),
                  attendee.payment_status === "paid" && qrDataUrl
                    ? React.createElement("img", {
                        src: qrDataUrl,
                        style: {
                          width: 150,
                          height: 150,
                          borderRadius: 10,
                          border: "2px solid rgba(123,51,126,0.3)",
                        },
                        alt: "QR Code",
                      })
                    : React.createElement(
                        "div",
                        {
                          style: {
                            width: 150,
                            height: 150,
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: 10,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "rgba(255,255,255,0.3)",
                            fontSize: 13,
                            textAlign: "center",
                            padding: 16,
                            border: "2px dashed rgba(255,255,255,0.1)",
                          },
                        },
                        "QR available after payment",
                      ),

                  attendee.payment_status === "paid"
                    ? React.createElement(
                        "span",
                        {
                          style: {
                            color: "#F39F5A",
                            fontSize: 12,
                            fontWeight: 600,
                          },
                        },
                        "✓ Valid Ticket",
                      )
                    : React.createElement(
                        "span",
                        {
                          style: {
                            color: "#E8BCB9",
                            fontSize: 12,
                            fontWeight: 600,
                          },
                        },
                        "⚠️ Payment Pending",
                      ),
                ),
              ),
            ),
          ),

          // Actions
          attendee.payment_status === "paid" &&
            React.createElement(
              "div",
              { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
              pdfDataUri &&
                React.createElement(
                  "button",
                  {
                    onClick: () => {
                      PDFTicket.download(attendee, pdfDataUri);
                      toast.success("PDF downloaded!");
                    },
                    style: {
                      flex: 1,
                      minWidth: 140,
                      padding: "13px 20px",
                      borderRadius: 12,
                      background: "linear-gradient(135deg, #F39F5A, #AE445A)",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 14,
                      fontFamily: "Inter, sans-serif",
                    },
                  },
                  "📥 Download PDF",
                ),
              React.createElement(
                "button",
                {
                  onClick: () => shareOnWhatsApp(attendee),
                  style: {
                    flex: 1,
                    minWidth: 140,
                    padding: "13px 20px",
                    borderRadius: 12,
                    background: "rgba(37,211,102,0.15)",
                    border: "1px solid rgba(37,211,102,0.3)",
                    color: "#F39F5A",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 14,
                    fontFamily: "Inter, sans-serif",
                  },
                },
                "💬 Share on WhatsApp",
              ),
            ),

          // Pending payment
          attendee.payment_status === "pending" &&
            React.createElement(
              "div",
              {
                style: {
                  background: "rgba(245,213,224,0.1)",
                  border: "1px solid rgba(245,213,224,0.3)",
                  borderRadius: 14,
                  padding: "20px 24px",
                  textAlign: "center",
                  marginTop: 16,
                },
              },
              React.createElement(
                "p",
                {
                  style: {
                    color: "#E8BCB9",
                    fontSize: 15,
                    fontWeight: 600,
                    marginBottom: 12,
                  },
                },
                "⚠️ Payment Not Yet Confirmed",
              ),
              React.createElement(
                "p",
                {
                  style: {
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 14,
                    marginBottom: 16,
                  },
                },
                "Complete your payment to receive your QR code and digital ticket.",
              ),
              React.createElement(
                "button",
                {
                  onClick: () => {
                    sessionStorage.setItem(
                      "mcfabs_selected_ticket",
                      attendee.ticket_category,
                    );
                    setPage("register");
                  },
                  style: {
                    background: "linear-gradient(135deg, #F39F5A, #E8BCB9)",
                    color: "black",
                    padding: "12px 32px",
                    borderRadius: 12,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 14,
                    fontFamily: "Inter, sans-serif",
                  },
                },
                "💳 Complete Payment",
              ),
            ),
        ),
    ),
  );
}

window.TicketPage = TicketPage;

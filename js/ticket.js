// ============================================================
// MC FABS EXCLUSIVE MASTERCLASS — Ticket View Page
// ============================================================

function TicketPage({ setPage }) {
  const toast = useToast();
  const [searchCode, setSearchCode] = React.useState("");
  const [attendee, setAttendee] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [verifying, setVerifying] = React.useState(false);
  const [qrDataUrl, setQrDataUrl] = React.useState(null);
  const [pdfDataUri, setPdfDataUri] = React.useState(null);

  // ── Zainpay callback handler ─────────────────────────────────────────────
  // After Zainpay redirects back to /#/ticket, the URL looks like:
  //   /#/ticket?txnRef=MCFABS-xxx&status=success
  // We verify server-side, confirm in Supabase, then load the ticket.
  React.useEffect(() => {
    console.log("🎫 TicketPage mounted, checking for callback...");
    console.log("Current URL:", window.location.href);
    console.log("Current hash:", window.location.hash);

    // Extract all query parameters from the hash, even if malformed (multiple ? marks)
    let txnRef = null;
    let status = null;

    if (window.location.hash.includes("?")) {
      // Hash contains query params. Extract everything after first ?
      const hashParts = window.location.hash.split("?");
      // Combine all parts after the first one (in case there are multiple ?)
      const allParams = hashParts.slice(1).join("&");

      console.log("📋 Raw params string:", allParams);

      // Parse parameters robustly
      const params = new URLSearchParams(allParams);
      txnRef = params.get("txnRef");
      status = params.get("status");

      console.log("🔍 Extracted txnRef:", txnRef);
      console.log("🔍 Extracted status:", status);
    }

    if (!txnRef) {
      console.log("ℹ️ No txnRef in URL - not a Zainpay callback");
      return; // not a Zainpay callback — normal page visit
    }

    // Clean the URL immediately so refresh doesn't re-trigger verification
    const cleanHash = window.location.hash.split("?")[0];
    window.history.replaceState(null, "", window.location.pathname + cleanHash);
    console.log("🧹 Cleaned URL to:", window.location.pathname + cleanHash);

    if (status && status !== "success") {
      console.error("❌ Payment status was not success:", status);
      toast.error("Payment was not completed. Please try again.");
      return;
    }

    console.log("✅ txnRef found, calling handleZainpayCallback");
    handleZainpayCallback(txnRef);
  }, []);

  const handleZainpayCallback = async (txnRef) => {
    setVerifying(true);
    toast.info("Verifying your payment...");
    console.log(
      "🔵 CALLBACK: Starting payment verification for txnRef:",
      txnRef,
    );

    try {
      // 1. Confirm with Zainpay server-side
      console.log("📞 CALLBACK: Calling /api/verify-payment");

      // FIX: Force absolute URL using window.location.origin
      const verifyRes = await fetch(
        `${window.location.origin}/api/verify-payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ txnRef }),
        },
      );

      const verifyData = await verifyRes.json();
      console.log("📞 CALLBACK: Verify response:", {
        ok: verifyRes.ok,
        verified: verifyData.verified,
        data: verifyData,
      });

      if (!verifyRes.ok || !verifyData.verified) {
        console.error("❌ CALLBACK: Payment verification failed");
        toast.error(
          "Payment could not be verified. If you were charged, please contact support.",
        );
        return;
      }
      console.log("✅ CALLBACK: Payment verified by server");

      // 2. Find the attendee by txnRef (payment_reference was set during initialization)
      //    Fall back to sessionStorage if the DB lookup fails (e.g. race condition)
      console.log("🔍 CALLBACK: Looking up attendee by txnRef");
      let foundAttendee = null;
      const { data: byRef } = await DB.getByTxnRef(txnRef);
      console.log("🔍 CALLBACK: Lookup result:", byRef ? "found" : "not found");

      if (byRef) {
        console.log("✅ CALLBACK: Found attendee via DB lookup:", byRef.id);
        foundAttendee = byRef;
      } else {
        // Fallback: pending txn stored in sessionStorage by ZainpayPay.initialize()
        const pending = sessionStorage.getItem("mcfabs_pending_txn");
        if (pending) {
          const {
            txnRef: storedRef,
            attendeeId,
            ticket: ticketCategory,
          } = JSON.parse(pending);
          // Check if txnRef matches (NOT === to error, but === to CONFIRM)
          if (storedRef === txnRef && attendeeId) {
            // We have a match AND attendee ID. Try to use this to confirm payment.
            console.log(
              "🔄 Fallback: Using stored attendeeId to confirm payment",
            );
            try {
              const { data: confirmed, error: confirmErr } =
                await DB.confirmPayment(attendeeId, {
                  reference: txnRef,
                  amount:
                    verifyData.amount ||
                    (CONFIG.TICKETS.find((t) => t.id === ticketCategory)
                      ?.price ??
                      0),
                });
              if (confirmErr) {
                console.error("❌ Fallback confirmation error:", confirmErr);
                throw confirmErr;
              }
              console.log("✅ Fallback: Payment confirmed");
              foundAttendee = confirmed || {
                id: attendeeId,
                payment_status: "paid",
                payment_reference: txnRef,
              };
              console.log("✅ Fallback: Ticket ready", foundAttendee);
              // Success via fallback - continue to generate ticket
            } catch (fallbackErr) {
              console.error(
                "❌ Fallback payment confirmation failed",
                fallbackErr,
              );
              toast.error(
                "Payment verified but ticket creation failed. Please contact support with reference: " +
                  txnRef,
              );
              return;
            }
          } else {
            toast.error(
              "Payment verified but registration record not found. Please contact support with reference: " +
                txnRef,
            );
            return;
          }
        } else {
          toast.error(
            "Registration record not found. Contact support with ref: " +
              txnRef,
          );
          return;
        }
      }

      // 3. If not already marked paid, confirm payment in Supabase
      if (foundAttendee.payment_status !== "paid") {
        console.log("💳 Confirming payment for attendee:", foundAttendee.id);
        const { data: confirmed, error: confirmErr } = await DB.confirmPayment(
          foundAttendee.id,
          {
            reference: txnRef,
            amount:
              verifyData.amount ||
              (CONFIG.TICKETS.find(
                (t) => t.id === foundAttendee.ticket_category,
              )?.price ??
                0),
          },
        );
        if (confirmErr) {
          console.error("❌ Payment confirmation error:", confirmErr);
          throw confirmErr;
        }
        console.log("✅ Payment confirmed, updating attendee data");
        foundAttendee = confirmed || {
          ...foundAttendee,
          payment_status: "paid",
          payment_reference: txnRef,
        };
        console.log("📊 Updated attendee:", foundAttendee);
      } else {
        console.log("ℹ️ Attendee already marked as paid");
      }

      // 4. Generate QR and PDF
      let qrUrl = null;
      try {
        qrUrl = await QRGen.generate(foundAttendee);
        setQrDataUrl(qrUrl);
        if (qrUrl) await DB.updateQRCode(foundAttendee.id, qrUrl);
      } catch (e) {
        console.error("QR generation failed", e);
      }

      try {
        const pdf = await PDFTicket.generate(foundAttendee);
        setPdfDataUri(pdf);
      } catch (e) {
        console.error("PDF generation failed", e);
      }

      try {
        await EmailService.sendTicketEmail(foundAttendee);
      } catch (e) {
        console.error("Email send failed", e);
      }

      // 5. Clean up sessionStorage
      sessionStorage.removeItem("mcfabs_pending_txn");

      setAttendee(foundAttendee);
      console.log("🎉 CALLBACK: SUCCESS! Ticket ready for:", {
        attendeeId: foundAttendee.id,
        name: foundAttendee.full_name,
        status: foundAttendee.payment_status,
        txnRef: foundAttendee.payment_reference,
      });
      toast.success("🎉 Payment confirmed! Your ticket is ready.");
    } catch (err) {
      console.error("❌ CALLBACK: Error during payment processing:", {
        error: err.message,
        stack: err.stack,
        txnRef,
      });
      toast.error(
        "Something went wrong verifying your payment. Please contact support.",
      );
    } finally {
      setVerifying(false);
    }
  };

  // ── Manual ticket lookup ─────────────────────────────────────────────────
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
                    "MC FABS EXCLUSIVE MASTERCLASS 2026",
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

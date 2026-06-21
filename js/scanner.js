// ============================================================
// MC FABS MASTERCLASS — QR Scanner / Check-in System
// ============================================================

function ScannerPage({ setPage }) {
  const toast = useToast();
  const [mode, setMode] = React.useState("scan"); // scan | manual
  const [scanResult, setScanResult] = React.useState(null);
  const [manualCode, setManualCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [scannerActive, setScannerActive] = React.useState(false);
  const [scannerStarted, setScannerStarted] = React.useState(false);
  const [attendee, setAttendee] = React.useState(null);
  const [checkInStatus, setCheckInStatus] = React.useState(null); // success|duplicate|invalid|unpaid
  const [stats, setStats] = React.useState({ checked: 0, total: 0 });
  const scannerRef = React.useRef(null);
  const html5QrCode = React.useRef(null);

  // Check admin auth
  React.useEffect(() => {
    if (!Auth.isAuthenticated()) {
      setPage("admin-login");
      return;
    }
    loadStats();
  }, []);

  // Cleanup scanner on unmount
  React.useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const loadStats = async () => {
    try {
      const data = await DB.getAnalytics();
      setStats({ checked: data.checkedIn || 0, total: data.paid || 0 });
    } catch (e) {}
  };

  const startScanner = async () => {
    if (typeof Html5Qrcode === "undefined") {
      toast.error("QR scanner library not loaded. Please refresh.");
      return;
    }

    try {
      if (html5QrCode.current) {
        try {
          await html5QrCode.current.stop();
        } catch (e) {}
      }

      html5QrCode.current = new Html5Qrcode("qr-reader");
      setScannerActive(true);
      setScannerStarted(true);

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        toast.error("No camera found on this device.");
        setScannerActive(false);
        setScannerStarted(false);
        return;
      }

      const cameraId =
        cameras.length > 1 ? cameras[cameras.length - 1].id : cameras[0].id;

      await html5QrCode.current.start(
        cameraId,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await handleQRScanned(decodedText);
        },
        () => {},
      );

      toast.success("Scanner ready! Point camera at a QR code.");
    } catch (err) {
      console.error("Scanner error:", err);
      toast.error(
        "Could not start camera. Please allow camera access and try again.",
      );
      setScannerActive(false);
      setScannerStarted(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCode.current && scannerStarted) {
      try {
        await html5QrCode.current.stop();
        html5QrCode.current = null;
      } catch (e) {}
    }
    setScannerActive(false);
    setScannerStarted(false);
  };

  const handleQRScanned = async (decodedText) => {
    if (loading) return;
    setLoading(true);

    // Pause scanner while processing
    if (html5QrCode.current && scannerStarted) {
      try {
        await html5QrCode.current.pause();
      } catch (e) {}
    }

    try {
      let data;
      try {
        data = JSON.parse(decodedText);
      } catch (e) {
        data = { ticket_code: decodedText.trim() };
      }

      const ticketCode = data.ticket_code;
      if (!ticketCode) {
        setCheckInStatus("invalid");
        setScanResult(null);
        toast.error("Invalid QR code format");
        return;
      }

      await processTicketCode(ticketCode);
    } catch (err) {
      setCheckInStatus("invalid");
      toast.error("Failed to process QR code");
    } finally {
      setLoading(false);
    }
  };

  const processTicketCode = async (code) => {
    setLoading(true);
    setScanResult(null);
    setAttendee(null);

    try {
      const { data, error } = await DB.getByTicketCode(
        code.trim().toUpperCase(),
      );

      if (error || !data) {
        setCheckInStatus("invalid");
        setScanResult({ code });
        toast.error(`❌ Invalid ticket code: ${code}`);
        return;
      }

      setAttendee(data);

      const safeLogAttempt = async (status) => {
        try {
          await DB.recordScanAttempt(data.id, data.scan_attempts, status);
        } catch (err) {
          console.warn("Scan audit update failed", err);
        }
      };

      // Check payment
      if (data.payment_status !== "paid") {
        await safeLogAttempt("unpaid");
        setCheckInStatus("unpaid");
        setScanResult(data);
        toast.warning(`⚠️ Unpaid ticket: ${data.full_name}`);
        return;
      }

      // Check if already scanned
      if (data.checked_in) {
        await safeLogAttempt("duplicate");
        setCheckInStatus("duplicate");
        setScanResult(data);
        toast.warning(`⚠️ Already checked in: ${data.full_name}`);
        return;
      }

      // Mark as checked in
      const { data: updated, error: checkErr } = await DB.checkIn(
        data.id,
        data.scan_attempts,
      );
      if (checkErr) throw checkErr;

      const finalAttendee = updated || {
        ...data,
        checked_in: true,
        checked_in_at: new Date().toISOString(),
      };
      setAttendee(finalAttendee);
      setCheckInStatus("success");
      setScanResult(finalAttendee);
      setStats((prev) => ({ ...prev, checked: prev.checked + 1 }));
      toast.success(`✅ Checked in: ${data.full_name} — ${data.seat_number}`);
    } catch (err) {
      setCheckInStatus("invalid");
      toast.error("Check-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      toast.error("Please enter a ticket code");
      return;
    }
    await processTicketCode(manualCode);
  };

  const resetScan = () => {
    setScanResult(null);
    setAttendee(null);
    setCheckInStatus(null);
    setManualCode("");
    // Resume scanner
    if (html5QrCode.current && scannerStarted) {
      try {
        html5QrCode.current.resume();
      } catch (e) {}
    }
  };

  const statusConfig = {
    success: {
      icon: "✅",
      title: "CHECK-IN SUCCESSFUL",
      color: "#F39F5A",
      bg: "rgba(102,103,171,0.12)",
      border: "rgba(102,103,171,0.35)",
      message: "Welcome to MC FABS Masterclass! Enjoy the event.",
    },
    duplicate: {
      icon: "⚠️",
      title: "ALREADY CHECKED IN",
      color: "#E8BCB9",
      bg: "rgba(245,213,224,0.12)",
      border: "rgba(245,213,224,0.35)",
      message: "This ticket has already been scanned. Do not allow re-entry.",
    },
    invalid: {
      icon: "❌",
      title: "INVALID TICKET",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.12)",
      border: "rgba(239,68,68,0.35)",
      message: "This QR code is not valid. Please contact the organizer.",
    },
    unpaid: {
      icon: "💳",
      title: "PAYMENT NOT CONFIRMED",
      color: "#E8BCB9",
      bg: "rgba(245,213,224,0.12)",
      border: "rgba(245,213,224,0.35)",
      message: "Payment has not been confirmed for this ticket.",
    },
  };

  return React.createElement(
    "div",
    {
      style: { minHeight: "100vh", background: "#1D1A39", paddingBottom: 40 },
    },
    // Header
    React.createElement(
      "header",
      {
        style: {
          background: "rgba(5,5,15,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "14px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        },
      },
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 16 } },
        React.createElement(
          "button",
          {
            onClick: () => {
              stopScanner();
              setPage("admin");
            },
            style: {
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.5)",
              cursor: "pointer",
              fontSize: 14,
              fontFamily: "Inter, sans-serif",
            },
          },
          "← Dashboard",
        ),
        React.createElement("div", {
          style: { width: 1, height: 20, background: "rgba(255,255,255,0.1)" },
        }),
        React.createElement(
          "h1",
          {
            style: { color: "white", fontWeight: 700, fontSize: 18, margin: 0 },
          },
          "📷 Event Check-in Scanner",
        ),
      ),

      // Quick stats
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            gap: 20,
            alignItems: "center",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            padding: "8px 16px",
          },
        },
        React.createElement(
          "div",
          { style: { textAlign: "center" } },
          React.createElement(
            "div",
            {
              style: {
                color: "#F39F5A",
                fontWeight: 800,
                fontSize: 20,
                fontFamily: "Space Grotesk, sans-serif",
              },
            },
            stats.checked,
          ),
          React.createElement(
            "div",
            {
              style: {
                color: "rgba(255,255,255,0.4)",
                fontSize: 10,
                letterSpacing: "0.05em",
              },
            },
            "CHECKED IN",
          ),
        ),
        React.createElement("div", {
          style: { width: 1, height: 30, background: "rgba(255,255,255,0.08)" },
        }),
        React.createElement(
          "div",
          { style: { textAlign: "center" } },
          React.createElement(
            "div",
            {
              style: {
                color: "#AE445A",
                fontWeight: 800,
                fontSize: 20,
                fontFamily: "Space Grotesk, sans-serif",
              },
            },
            stats.total,
          ),
          React.createElement(
            "div",
            {
              style: {
                color: "rgba(255,255,255,0.4)",
                fontSize: 10,
                letterSpacing: "0.05em",
              },
            },
            "PAID TOTAL",
          ),
        ),
      ),
    ),

    React.createElement(
      "div",
      { className: "max-w-2xl mx-auto px-4 pt-6" },

      // Mode tabs
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: 4,
            marginBottom: 24,
            gap: 4,
          },
        },
        [
          { id: "scan", label: "📷 QR Camera Scan" },
          { id: "manual", label: "⌨️ Manual Entry" },
        ].map((tab) =>
          React.createElement(
            "button",
            {
              key: tab.id,
              onClick: () => {
                setMode(tab.id);
                resetScan();
                if (tab.id !== "scan") stopScanner();
              },
              style: {
                flex: 1,
                padding: "10px 0",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                background:
                  mode === tab.id
                    ? "linear-gradient(135deg, #F39F5A, #AE445A)"
                    : "transparent",
                color: mode === tab.id ? "white" : "rgba(255,255,255,0.5)",
                fontWeight: 600,
                fontSize: 14,
                fontFamily: "Inter, sans-serif",
                transition: "all 0.2s ease",
              },
            },
            tab.label,
          ),
        ),
      ),

      // Result display (shown when scan result exists)
      checkInStatus &&
        scanResult &&
        React.createElement(
          "div",
          { className: "page-enter" },
          React.createElement(
            "div",
            {
              style: {
                background: statusConfig[checkInStatus].bg,
                border: `2px solid ${statusConfig[checkInStatus].border}`,
                borderRadius: 20,
                padding: "28px 24px",
                marginBottom: 24,
                textAlign: "center",
              },
            },
            React.createElement(
              "div",
              { style: { fontSize: 64, marginBottom: 16 } },
              statusConfig[checkInStatus].icon,
            ),
            React.createElement(
              "h2",
              {
                style: {
                  color: statusConfig[checkInStatus].color,
                  fontWeight: 900,
                  fontSize: 22,
                  marginBottom: 8,
                },
              },
              statusConfig[checkInStatus].title,
            ),
            React.createElement(
              "p",
              {
                style: {
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 14,
                  marginBottom: 24,
                },
              },
              statusConfig[checkInStatus].message,
            ),

            // Attendee details (if found)
            attendee &&
              React.createElement(
                "div",
                {
                  style: {
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 14,
                    padding: "18px 20px",
                    marginBottom: 20,
                    textAlign: "left",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 14,
                  },
                },
                [
                  { label: "Name", value: attendee.full_name },
                  { label: "Email", value: attendee.email },
                  {
                    label: "Ticket Code",
                    value: attendee.ticket_code,
                    mono: true,
                  },
                  {
                    label: "Seat Number",
                    value: attendee.seat_number,
                    highlight: true,
                  },
                  {
                    label: "Category",
                    value: (() => {
                      const t = CONFIG.TICKETS.find(
                        (x) => x.id === attendee.ticket_category,
                      );
                      return t ? t.name : attendee.ticket_category;
                    })(),
                  },
                  {
                    label: "Payment",
                    value:
                      attendee.payment_status === "paid"
                        ? "✅ Confirmed"
                        : "❌ Not Paid",
                  },
                  ...(attendee.checked_in_at
                    ? [
                        {
                          label: "Checked In At",
                          value: new Date(
                            attendee.checked_in_at,
                          ).toLocaleTimeString("en-NG", {
                            hour: "2-digit",
                            minute: "2-digit",
                          }),
                        },
                      ]
                    : []),
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
                          fontWeight: 600,
                          fontSize: 14,
                          margin: 0,
                          fontFamily: item.mono ? "monospace" : "inherit",
                        },
                      },
                      item.value,
                    ),
                  ),
                ),
              ),

            React.createElement(
              "button",
              {
                onClick: resetScan,
                style: {
                  background: "linear-gradient(135deg, #F39F5A, #AE445A)",
                  color: "white",
                  padding: "12px 32px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 15,
                  fontFamily: "Inter, sans-serif",
                },
              },
              "📷 Scan Next Ticket",
            ),
          ),
        ),

      // QR Camera Scanner
      mode === "scan" &&
        !checkInStatus &&
        React.createElement(
          "div",
          null,
          // Camera view
          React.createElement(
            "div",
            {
              style: {
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                overflow: "hidden",
                marginBottom: 20,
              },
            },
            React.createElement(
              "div",
              {
                id: "qr-reader",
                style: {
                  width: "100%",
                  minHeight: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                },
              },
              !scannerActive &&
                React.createElement(
                  "div",
                  { style: { textAlign: "center", padding: 40 } },
                  React.createElement(
                    "div",
                    { style: { fontSize: 64, marginBottom: 16 } },
                    "📷",
                  ),
                  React.createElement(
                    "p",
                    {
                      style: {
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 15,
                        marginBottom: 20,
                      },
                    },
                    "Camera is not active. Click below to start scanning.",
                  ),
                ),
            ),
            React.createElement(
              "div",
              {
                style: {
                  padding: "16px 20px",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  gap: 12,
                  justifyContent: "center",
                },
              },
              !scannerActive
                ? React.createElement(
                    "button",
                    {
                      onClick: startScanner,
                      style: {
                        background: "linear-gradient(135deg, #F39F5A, #AE445A)",
                        color: "white",
                        padding: "12px 32px",
                        borderRadius: 12,
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: 15,
                        fontFamily: "Inter, sans-serif",
                      },
                    },
                    "▶ Start Camera Scanner",
                  )
                : React.createElement(
                    "button",
                    {
                      onClick: stopScanner,
                      style: {
                        background: "rgba(239,68,68,0.2)",
                        border: "1px solid rgba(239,68,68,0.4)",
                        color: "#ef4444",
                        padding: "12px 32px",
                        borderRadius: 12,
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: 15,
                        fontFamily: "Inter, sans-serif",
                      },
                    },
                    "⏹ Stop Scanner",
                  ),
            ),
          ),

          // Status indicator
          scannerActive &&
            !loading &&
            React.createElement(
              "div",
              {
                style: {
                  background: "rgba(102,103,171,0.1)",
                  border: "1px solid rgba(102,103,171,0.2)",
                  borderRadius: 12,
                  padding: "12px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                },
              },
              React.createElement("div", {
                style: {
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#F39F5A",
                  boxShadow: "0 0 8px #F39F5A",
                  animation: "pulse 1.5s infinite",
                },
              }),
              React.createElement(
                "span",
                { style: { color: "#F39F5A", fontSize: 14, fontWeight: 600 } },
                "Scanner Active — Waiting for QR code...",
              ),
            ),

          loading &&
            React.createElement(
              "div",
              {
                style: {
                  background: "rgba(102,103,171,0.1)",
                  border: "1px solid rgba(102,103,171,0.2)",
                  borderRadius: 12,
                  padding: "12px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                },
              },
              React.createElement(LoadingSpinner, { size: 20 }),
              React.createElement(
                "span",
                { style: { color: "#AE445A", fontSize: 14 } },
                "Verifying ticket...",
              ),
            ),
        ),

      // Manual entry
      mode === "manual" &&
        !checkInStatus &&
        React.createElement(
          "div",
          null,
          React.createElement(
            "div",
            {
              style: {
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                padding: "28px 24px",
              },
            },
            React.createElement(
              "h3",
              {
                style: {
                  color: "white",
                  fontWeight: 700,
                  fontSize: 18,
                  marginBottom: 8,
                },
              },
              "⌨️ Manual Ticket Check-in",
            ),
            React.createElement(
              "p",
              {
                style: {
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 14,
                  marginBottom: 24,
                },
              },
              "Enter the attendee's ticket code manually to check them in.",
            ),

            React.createElement(
              "form",
              { onSubmit: handleManualSubmit },
              React.createElement(
                "div",
                { style: { marginBottom: 16 } },
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
                  "🎟️ Ticket Code",
                ),
                React.createElement("input", {
                  className: "form-input",
                  value: manualCode,
                  onChange: (e) => setManualCode(e.target.value.toUpperCase()),
                  placeholder: "e.g. MCFABS-2026-GEN-0001",
                  style: {
                    fontFamily: "monospace",
                    letterSpacing: "0.05em",
                    fontSize: 16,
                  },
                }),
              ),
              React.createElement(
                "button",
                {
                  type: "submit",
                  disabled: loading || !manualCode.trim(),
                  style: {
                    width: "100%",
                    padding: "14px 0",
                    borderRadius: 12,
                    background: loading
                      ? "rgba(102,103,171,0.5)"
                      : "linear-gradient(135deg, #F39F5A, #AE445A)",
                    color: "white",
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    border: "none",
                    fontFamily: "Inter, sans-serif",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                  },
                },
                loading ? React.createElement(LoadingSpinner) : null,
                loading ? "Verifying..." : "✅ Check In Attendee",
              ),
            ),

            // Quick demo codes
            React.createElement(
              "div",
              {
                style: {
                  marginTop: 24,
                  padding: "16px",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 12,
                },
              },
              React.createElement(
                "p",
                {
                  style: {
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 12,
                    marginBottom: 12,
                  },
                },
                "🧪 Demo — Click to try a sample ticket code:",
              ),
              React.createElement(
                "div",
                { style: { display: "flex", flexDirection: "column", gap: 8 } },
                [
                  "MCFABS-2026-GEN-0001",
                  "MCFABS-2026-GEN-0002",
                  "MCFABS-2026-GEN-0003",
                ].map((code) =>
                  React.createElement(
                    "button",
                    {
                      key: code,
                      onClick: () => setManualCode(code),
                      style: {
                        background: "rgba(123,51,126,0.1)",
                        border: "1px solid rgba(123,51,126,0.2)",
                        color: "#E8BCB9",
                        padding: "8px 16px",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontSize: 13,
                        fontFamily: "monospace",
                        textAlign: "left",
                        letterSpacing: "0.03em",
                      },
                    },
                    code,
                  ),
                ),
              ),
            ),
          ),
        ),

      // Instructions
      !checkInStatus &&
        React.createElement(
          "div",
          {
            style: {
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14,
              padding: "18px 20px",
              marginTop: 20,
            },
          },
          React.createElement(
            "h4",
            {
              style: {
                color: "rgba(255,255,255,0.6)",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 12,
              },
            },
            "📋 Check-in Instructions",
          ),
          React.createElement(
            "ul",
            {
              style: {
                color: "rgba(255,255,255,0.4)",
                fontSize: 13,
                lineHeight: 1.8,
                paddingLeft: 18,
                margin: 0,
              },
            },
            React.createElement(
              "li",
              null,
              "Ask attendee to show their QR code (on phone or printed)",
            ),
            React.createElement(
              "li",
              null,
              "Point the camera directly at the QR code to scan",
            ),
            React.createElement(
              "li",
              null,
              "Green = Valid entry | Yellow = Already scanned | Red = Invalid",
            ),
            React.createElement(
              "li",
              null,
              "If camera fails, use manual entry with their ticket code",
            ),
            React.createElement(
              "li",
              null,
              "Only PAID tickets can be checked in — contact organizer for issues",
            ),
          ),
        ),
    ),
  );
}

window.ScannerPage = ScannerPage;

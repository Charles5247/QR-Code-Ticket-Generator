// ============================================================
// MC FABS MASTERCLASS — Admin Dashboard
// ============================================================

function AdminLogin({ setPage }) {
  const toast = useToast();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);

    try {
      const { data, error } = await Auth.signIn(email, password);
      if (error || !data) {
        toast.error(
          "Invalid credentials. Please check your email and password.",
        );
      } else {
        toast.success("Welcome, Admin! 👋");
        setPage("admin");
      }
    } catch (err) {
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const useDemo = () => {
    setEmail(CONFIG.ADMIN_EMAIL);
    setPassword(CONFIG.ADMIN_PASSWORD);
  };

  return React.createElement(
    "div",
    {
      style: {
        minHeight: "100vh",
        background: "#1a0a2e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      },
    },
    React.createElement(
      "div",
      { style: { width: "100%", maxWidth: 420 } },

      // Logo
      React.createElement(
        "div",
        { style: { textAlign: "center", marginBottom: 40 } },
        React.createElement(
          "div",
          {
            style: {
              width: 72,
              height: 72,
              margin: "0 auto 16px",
              background: "linear-gradient(135deg, #e040fb, #c2185b)",
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 800,
              color: "white",
              fontFamily: "Space Grotesk, sans-serif",
            },
          },
          "🔐",
        ),
        React.createElement(
          "h2",
          {
            style: {
              color: "white",
              fontSize: 28,
              fontWeight: 800,
              margin: "0 0 8px",
              fontFamily: "Playfair Display, serif",
            },
          },
          "Admin Portal",
        ),
        React.createElement(
          "p",
          { style: { color: "rgba(255,255,255,0.4)", fontSize: 14 } },
          "MC FABS Masterclass Management",
        ),
      ),

      // Login form
      React.createElement(
        "div",
        {
          style: {
            background:
              "linear-gradient(135deg, rgba(194,24,91,0.12) 0%, rgba(106,5,114,0.95) 100%)",
            border: "1px solid rgba(194,24,91,0.2)",
            borderRadius: 20,
            padding: "32px 28px",
          },
        },
        React.createElement(
          "form",
          { onSubmit: handleLogin },
          React.createElement(
            "div",
            { style: { marginBottom: 20 } },
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
              "✉️ Admin Email",
            ),
            React.createElement("input", {
              type: "email",
              className: "form-input",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              placeholder: "admin@mcfabs.ng",
            }),
          ),
          React.createElement(
            "div",
            { style: { marginBottom: 24 } },
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
              "🔒 Password",
            ),
            React.createElement(
              "div",
              { style: { position: "relative" } },
              React.createElement("input", {
                type: showPassword ? "text" : "password",
                className: "form-input",
                value: password,
                onChange: (e) => setPassword(e.target.value),
                placeholder: "••••••••••••",
              }),
              React.createElement(
                "button",
                {
                  type: "button",
                  onClick: () => setShowPassword(!showPassword),
                  style: {
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.4)",
                    cursor: "pointer",
                    fontSize: 16,
                  },
                },
                showPassword ? "🙈" : "👁️",
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
                padding: "14px 0",
                borderRadius: 12,
                background: loading
                  ? "rgba(194,24,91,0.5)"
                  : "linear-gradient(135deg, #e040fb, #c2185b)",
                color: "white",
                fontSize: 16,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                border: "none",
                fontFamily: "Inter, sans-serif",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              },
            },
            loading ? React.createElement(LoadingSpinner) : null,
            loading ? "Signing in..." : "🔐 Sign In to Dashboard",
          ),
        ),

        // Demo hint
        React.createElement(
          "div",
          {
            style: {
              background: "rgba(243,229,245,0.08)",
              border: "1px solid rgba(243,229,245,0.2)",
              borderRadius: 10,
              padding: "12px 16px",
              marginTop: 8,
            },
          },
          React.createElement(
            "p",
            {
              style: {
                color: "rgba(255,255,255,0.5)",
                fontSize: 12,
                marginBottom: 8,
              },
            },
            "💡 Demo Mode — click to fill credentials:",
          ),
          React.createElement(
            "button",
            {
              onClick: useDemo,
              style: {
                background: "rgba(243,229,245,0.15)",
                border: "1px solid rgba(243,229,245,0.3)",
                color: "#f3e5f5",
                padding: "6px 14px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 12,
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
              },
            },
            "🧪 Use Demo Credentials",
          ),
        ),
      ),

      React.createElement(
        "div",
        { style: { textAlign: "center", marginTop: 24 } },
        React.createElement(
          "button",
          {
            onClick: () => setPage("landing"),
            style: {
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.4)",
              cursor: "pointer",
              fontSize: 14,
              fontFamily: "Inter, sans-serif",
            },
          },
          "← Back to Event Page",
        ),
      ),
    ),
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ setPage }) {
  const toast = useToast();
  const [activeTab, setActiveTab] = React.useState("overview");
  const [analytics, setAnalytics] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const chartRef = React.useRef(null);
  const categoryChartRef = React.useRef(null);

  React.useEffect(() => {
    if (!Auth.isAuthenticated()) {
      setPage("admin-login");
      return;
    }
    loadData();
  }, []);

  React.useEffect(() => {
    if (analytics && activeTab === "overview") {
      setTimeout(() => {
        renderCharts();
      }, 100);
    }
  }, [analytics, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await DB.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const renderCharts = () => {
    if (!analytics) return;

    if (window._mcfabs_chart1) {
      window._mcfabs_chart1.destroy();
    }
    if (window._mcfabs_chart2) {
      window._mcfabs_chart2.destroy();
    }

    // Daily registrations chart
    const canvas1 = document.getElementById("daily-chart");
    if (canvas1) {
      window._mcfabs_chart1 = new Chart(canvas1, {
        type: "line",
        data: {
          labels: analytics.dailyRegistrations.map((d) => d.label),
          datasets: [
            {
              label: "Registrations",
              data: analytics.dailyRegistrations.map((d) => d.count),
              borderColor: "#c2185b",
              backgroundColor: "rgba(194,24,91,0.1)",
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: "#e040fb",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
              pointRadius: 5,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              grid: { color: "rgba(255,255,255,0.04)" },
              ticks: { color: "rgba(255,255,255,0.5)", font: { size: 11 } },
            },
            y: {
              grid: { color: "rgba(255,255,255,0.04)" },
              ticks: {
                color: "rgba(255,255,255,0.5)",
                font: { size: 11 },
                stepSize: 1,
              },
            },
          },
        },
      });
    }

    // Category pie chart
    const canvas2 = document.getElementById("category-chart");
    if (canvas2) {
      const categories = CONFIG.TICKETS.map((t) => ({
        name: t.name,
        count: analytics.byCategory[t.id] || 0,
      }));
      window._mcfabs_chart2 = new Chart(canvas2, {
        type: "doughnut",
        data: {
          labels: categories.map((c) => c.name),
          datasets: [
            {
              data: categories.map((c) => c.count),
              backgroundColor: [
                "rgba(139,0,93,0.8)",
                "rgba(194,24,91,0.8)",
                "rgba(243,229,245,0.8)",
              ],
              borderColor: ["#1a0a2e", "#1a0a2e", "#1a0a2e"],
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: "rgba(255,255,255,0.6)",
                font: { size: 11 },
                padding: 12,
              },
            },
          },
        },
      });
    }
  };

  const handleLogout = async () => {
    await Auth.signOut();
    toast.info("Logged out successfully");
    setPage("landing");
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "attendees", label: "Attendees", icon: "👥" },
    { id: "analytics", label: "Analytics", icon: "📈" },
  ];

  if (loading && !analytics) {
    return React.createElement(
      "div",
      {
        style: {
          minHeight: "100vh",
          background: "#1a0a2e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
      React.createElement(
        "div",
        { style: { textAlign: "center" } },
        React.createElement(LoadingSpinner, { size: 48 }),
        React.createElement(
          "p",
          {
            style: {
              color: "rgba(255,255,255,0.5)",
              marginTop: 20,
              fontSize: 15,
            },
          },
          "Loading dashboard...",
        ),
      ),
    );
  }

  return React.createElement(
    "div",
    {
      style: {
        minHeight: "100vh",
        background: "#1a0a2e",
        display: "flex",
        flexDirection: "column",
      },
    },
    // Top bar
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
          position: "sticky",
          top: 0,
          zIndex: 50,
        },
      },
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 16 } },
        React.createElement(
          "div",
          {
            style: {
              width: 36,
              height: 36,
              background: "linear-gradient(135deg, #e040fb, #c2185b)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              color: "white",
              fontSize: 14,
            },
          },
          "MC",
        ),
        React.createElement(
          "div",
          null,
          React.createElement(
            "div",
            { style: { color: "white", fontWeight: 700, fontSize: 16 } },
            "Admin Dashboard",
          ),
          React.createElement(
            "div",
            { style: { color: "rgba(255,255,255,0.4)", fontSize: 12 } },
            "MC FABS Masterclass Platform",
          ),
        ),
      ),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 12, alignItems: "center" } },
        React.createElement(
          "button",
          {
            onClick: loadData,
            style: {
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "white",
              padding: "7px 14px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "Inter, sans-serif",
            },
          },
          "🔄 Refresh",
        ),
        React.createElement(
          "button",
          {
            onClick: () => setPage("scanner"),
            style: {
              background: "rgba(194,24,91,0.15)",
              border: "1px solid rgba(194,24,91,0.3)",
              color: "#e040fb",
              padding: "7px 14px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "Inter, sans-serif",
            },
          },
          "📷 Scanner",
        ),
        React.createElement(
          "button",
          {
            onClick: handleLogout,
            style: {
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#ef4444",
              padding: "7px 14px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "Inter, sans-serif",
            },
          },
          "🚪 Logout",
        ),
      ),
    ),

    // Tab navigation
    React.createElement(
      "div",
      {
        style: {
          background: "rgba(5,5,15,0.8)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0 20px",
          display: "flex",
          gap: 4,
        },
      },
      tabs.map((tab) =>
        React.createElement(
          "button",
          {
            key: tab.id,
            onClick: () => setActiveTab(tab.id),
            style: {
              padding: "14px 20px",
              background: "none",
              border: "none",
              color: activeTab === tab.id ? "#c2185b" : "rgba(255,255,255,0.4)",
              fontSize: 14,
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              borderBottom: `2px solid ${activeTab === tab.id ? "#e040fb" : "transparent"}`,
              transition: "all 0.2s ease",
            },
          },
          `${tab.icon} ${tab.label}`,
        ),
      ),
    ),

    // Content
    React.createElement(
      "main",
      {
        style: {
          flex: 1,
          padding: "24px 20px",
          maxWidth: 1400,
          margin: "0 auto",
          width: "100%",
        },
      },
      analytics &&
        React.createElement(
          React.Fragment,
          null,
          activeTab === "overview" &&
            React.createElement(AdminOverview, { analytics }),
          activeTab === "attendees" &&
            React.createElement(AdminAttendees, {
              analytics,
              onRefresh: loadData,
            }),
          activeTab === "analytics" &&
            React.createElement(AdminAnalytics, { analytics }),
        ),
    ),
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function AdminOverview({ analytics }) {
  const stats = [
    {
      label: "Total Registrations",
      value: analytics.total,
      icon: "👥",
      color: "#c2185b",
      bg: "rgba(194,24,91,0.1)",
      change: "+12% this week",
    },
    {
      label: "Paid Attendees",
      value: analytics.paid,
      icon: "✅",
      color: "#e040fb",
      bg: "rgba(224,64,251,0.1)",
      change: `${analytics.total ? Math.round((analytics.paid / analytics.total) * 100) : 0}% conversion`,
    },
    {
      label: "Pending Payment",
      value: analytics.pending,
      icon: "⏳",
      color: "#f3e5f5",
      bg: "rgba(243,229,245,0.1)",
      change: "Awaiting payment",
    },
    {
      label: "Checked In",
      value: analytics.checkedIn,
      icon: "🎯",
      color: "#e040fb",
      bg: "rgba(224,64,251,0.1)",
      change: `${analytics.paid ? Math.round((analytics.checkedIn / analytics.paid) * 100) : 0}% of paid`,
    },
    {
      label: "Duplicate Scan Attempts",
      value: analytics.duplicateScanAttempts || 0,
      icon: "⚠️",
      color: "#f3e5f5",
      bg: "rgba(243,229,245,0.1)",
      change: "Tickets scanned more than once",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(analytics.revenue),
      icon: "💰",
      color: "#f3e5f5",
      bg: "rgba(243,229,245,0.1)",
      change: "Gross revenue",
    },
    {
      label: "Avg Ticket Value",
      value: analytics.paid
        ? formatCurrency(Math.round(analytics.revenue / analytics.paid))
        : "₦0",
      icon: "📊",
      color: "#c2185b",
      bg: "rgba(194,24,91,0.1)",
      change: "Per paid seat",
    },
  ];

  return React.createElement(
    "div",
    { className: "page-enter" },
    // Stats grid
    React.createElement(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 28,
        },
      },
      stats.map((s, i) =>
        React.createElement(
          "div",
          {
            key: i,
            className: "stats-card",
            style: { borderRadius: 16, padding: "20px 22px" },
          },
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 12,
              },
            },
            React.createElement(
              "div",
              {
                style: {
                  width: 44,
                  height: 44,
                  background: s.bg,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                },
              },
              s.icon,
            ),
          ),
          React.createElement(
            "div",
            {
              style: {
                color: "white",
                fontSize: 28,
                fontWeight: 800,
                fontFamily: "Space Grotesk, sans-serif",
                marginBottom: 4,
              },
            },
            s.value,
          ),
          React.createElement(
            "div",
            {
              style: {
                color: "rgba(255,255,255,0.5)",
                fontSize: 13,
                marginBottom: 4,
              },
            },
            s.label,
          ),
          React.createElement(
            "div",
            { style: { color: s.color, fontSize: 11 } },
            s.change,
          ),
        ),
      ),
    ),

    // Charts row
    React.createElement(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 20,
          marginBottom: 28,
        },
      },

      // Daily registrations
      React.createElement(
        "div",
        {
          style: {
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16,
            padding: "22px 20px",
          },
        },
        React.createElement(
          "h3",
          {
            style: {
              color: "white",
              fontWeight: 700,
              fontSize: 16,
              marginBottom: 20,
            },
          },
          "📈 Daily Registrations (Last 7 Days)",
        ),
        React.createElement(
          "div",
          { style: { height: 200 } },
          React.createElement("canvas", { id: "daily-chart" }),
        ),
      ),

      // Category breakdown
      React.createElement(
        "div",
        {
          style: {
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16,
            padding: "22px 20px",
          },
        },
        React.createElement(
          "h3",
          {
            style: {
              color: "white",
              fontWeight: 700,
              fontSize: 16,
              marginBottom: 20,
            },
          },
          "🎟️ Tickets by Category",
        ),
        React.createElement(
          "div",
          { style: { height: 200 } },
          React.createElement("canvas", { id: "category-chart" }),
        ),
      ),
    ),

    // Category stats table
    React.createElement(
      "div",
      {
        style: {
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 16,
          padding: "22px 20px",
          marginBottom: 24,
        },
      },
      React.createElement(
        "h3",
        {
          style: {
            color: "white",
            fontWeight: 700,
            fontSize: 16,
            marginBottom: 20,
          },
        },
        "🎫 Ticket Category Breakdown",
      ),
      React.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
          },
        },
        CONFIG.TICKETS.map((ticket) => {
          const count = analytics.byCategory[ticket.id] || 0;
          const revenue = count * ticket.price;
          const pct = analytics.total
            ? Math.round((count / analytics.total) * 100)
            : 0;
          const isVip = ticket.id === "vip";
          const isPremium = ticket.id === "premium";
          return React.createElement(
            "div",
            {
              key: ticket.id,
              style: {
                background: isPremium
                  ? "rgba(243,229,245,0.08)"
                  : isVip
                    ? "rgba(224,64,251,0.1)"
                    : "rgba(255,255,255,0.04)",
                border: `1px solid ${isPremium ? "rgba(243,229,245,0.2)" : isVip ? "rgba(224,64,251,0.2)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 14,
                padding: "18px 20px",
              },
            },
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                },
              },
              React.createElement(
                "span",
                { style: { color: "white", fontWeight: 700, fontSize: 15 } },
                ticket.name,
              ),
              React.createElement(
                "span",
                {
                  style: {
                    background: isPremium
                      ? "rgba(243,229,245,0.2)"
                      : isVip
                        ? "rgba(224,64,251,0.2)"
                        : "rgba(255,255,255,0.08)",
                    color: isPremium
                      ? "#f3e5f5"
                      : isVip
                        ? "#c2185b"
                        : "rgba(255,255,255,0.5)",
                    borderRadius: 999,
                    padding: "2px 10px",
                    fontSize: 12,
                    fontWeight: 700,
                  },
                },
                `${count} sold`,
              ),
            ),
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  marginBottom: 12,
                },
              },
              React.createElement(
                "span",
                { style: { color: "rgba(255,255,255,0.5)" } },
                `${pct}% of total`,
              ),
              React.createElement(
                "span",
                { style: { color: "#e040fb", fontWeight: 600 } },
                formatCurrency(revenue),
              ),
            ),
            // Progress bar
            React.createElement(
              "div",
              {
                style: {
                  height: 4,
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 2,
                },
              },
              React.createElement("div", {
                style: {
                  height: "100%",
                  width: `${Math.min(pct, 100)}%`,
                  background: isPremium
                    ? "#f3e5f5"
                    : isVip
                      ? "#e040fb"
                      : "#6b7280",
                  borderRadius: 2,
                  transition: "width 0.5s ease",
                },
              }),
            ),
          );
        }),
      ),
    ),

    // Recent registrations
    React.createElement(
      "div",
      {
        style: {
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 16,
          padding: "22px 20px",
          overflow: "hidden",
        },
      },
      React.createElement(
        "h3",
        {
          style: {
            color: "white",
            fontWeight: 700,
            fontSize: 16,
            marginBottom: 20,
          },
        },
        "🕐 Recent Registrations",
      ),
      React.createElement(
        "div",
        { className: "table-responsive" },
        React.createElement(
          "table",
          {
            className: "data-table",
            style: { width: "100%", borderCollapse: "collapse" },
          },
          React.createElement(
            "thead",
            null,
            React.createElement(
              "tr",
              null,
              ["Name", "Ticket", "Status", "Amount", "Date"].map((h) =>
                React.createElement(
                  "th",
                  { key: h, style: { textAlign: "left" } },
                  h,
                ),
              ),
            ),
          ),
          React.createElement(
            "tbody",
            null,
            (analytics.attendees || []).slice(0, 5).map((a, i) => {
              const ticket = CONFIG.TICKETS.find(
                (t) => t.id === a.ticket_category,
              );
              return React.createElement(
                "tr",
                { key: a.id || i },
                React.createElement(
                  "td",
                  null,
                  React.createElement(
                    "div",
                    null,
                    React.createElement(
                      "div",
                      {
                        style: {
                          color: "white",
                          fontWeight: 600,
                          fontSize: 14,
                        },
                      },
                      a.full_name,
                    ),
                    React.createElement(
                      "div",
                      {
                        style: { color: "rgba(255,255,255,0.4)", fontSize: 12 },
                      },
                      a.email,
                    ),
                  ),
                ),
                React.createElement(
                  "td",
                  null,
                  React.createElement(
                    "span",
                    { style: { color: "rgba(255,255,255,0.7)", fontSize: 13 } },
                    ticket ? ticket.name : a.ticket_category,
                  ),
                ),
                React.createElement(
                  "td",
                  null,
                  React.createElement(StatusBadge, {
                    status: a.payment_status,
                  }),
                ),
                React.createElement(
                  "td",
                  null,
                  React.createElement(
                    "span",
                    {
                      style: {
                        color: "#e040fb",
                        fontWeight: 600,
                        fontSize: 13,
                      },
                    },
                    a.amount_paid ? formatCurrency(a.amount_paid) : "—",
                  ),
                ),
                React.createElement(
                  "td",
                  null,
                  React.createElement(
                    "span",
                    { style: { color: "rgba(255,255,255,0.5)", fontSize: 12 } },
                    a.created_at
                      ? new Date(a.created_at).toLocaleDateString("en-NG")
                      : "—",
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    ),
  );
}

window.AdminLogin = AdminLogin;
window.AdminDashboard = AdminDashboard;

// ─── Attendees Tab ────────────────────────────────────────────────────────────
function AdminAttendees({ analytics, onRefresh }) {
  const toast = useToast();
  const [search, setSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [filterCategory, setFilterCategory] = React.useState("all");
  const [sortField, setSortField] = React.useState("created_at");
  const [sortDir, setSortDir] = React.useState("desc");
  const [page, setLocalPage] = React.useState(1);
  const PER_PAGE = 20;

  const attendees = analytics.attendees || [];

  const filtered = attendees.filter((a) => {
    const matchSearch =
      !search ||
      [a.full_name, a.email, a.phone, a.ticket_code, a.seat_number].some(
        (f) => f && f.toLowerCase().includes(search.toLowerCase()),
      );
    const matchStatus =
      filterStatus === "all" || a.payment_status === filterStatus;
    const matchCat =
      filterCategory === "all" || a.ticket_category === filterCategory;
    return matchSearch && matchStatus && matchCat;
  });

  const sorted = [...filtered].sort((a, b) => {
    let av = a[sortField] || "";
    let bv = b[sortField] || "";
    if (typeof av === "number") return sortDir === "asc" ? av - bv : bv - av;
    return sortDir === "asc"
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const paginated = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortIcon = (field) =>
    sortField === field ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  const handleExport = () => {
    exportCSV(
      filtered,
      `mcfabs-attendees-${new Date().toISOString().split("T")[0]}.csv`,
    );
    toast.success("CSV exported successfully!");
  };

  return React.createElement(
    "div",
    { className: "page-enter" },
    // Filters bar
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 20,
          alignItems: "center",
        },
      },
      React.createElement(
        "div",
        { style: { flex: 1, minWidth: 200, position: "relative" } },
        React.createElement(
          "span",
          {
            style: {
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "rgba(255,255,255,0.3)",
            },
          },
          "🔍",
        ),
        React.createElement("input", {
          className: "form-input",
          value: search,
          onChange: (e) => {
            setSearch(e.target.value);
            setLocalPage(1);
          },
          placeholder: "Search by name, email, ticket code...",
          style: { paddingLeft: 36 },
        }),
      ),

      React.createElement(
        "select",
        {
          className: "form-input",
          value: filterStatus,
          onChange: (e) => {
            setFilterStatus(e.target.value);
            setLocalPage(1);
          },
          style: { width: "auto", minWidth: 140 },
        },
        React.createElement("option", { value: "all" }, "All Status"),
        React.createElement("option", { value: "paid" }, "✅ Paid"),
        React.createElement("option", { value: "pending" }, "⏳ Pending"),
      ),

      React.createElement(
        "select",
        {
          className: "form-input",
          value: filterCategory,
          onChange: (e) => {
            setFilterCategory(e.target.value);
            setLocalPage(1);
          },
          style: { width: "auto", minWidth: 150 },
        },
        React.createElement("option", { value: "all" }, "All Categories"),
        ...CONFIG.TICKETS.map((t) =>
          React.createElement("option", { key: t.id, value: t.id }, t.name),
        ),
      ),

      React.createElement(
        "button",
        {
          onClick: handleExport,
          style: {
            background: "rgba(194,24,91,0.15)",
            border: "1px solid rgba(194,24,91,0.3)",
            color: "#e040fb",
            padding: "10px 18px",
            borderRadius: 10,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "Inter, sans-serif",
            whiteSpace: "nowrap",
          },
        },
        "📤 Export CSV",
      ),
    ),

    React.createElement(
      "div",
      {
        style: {
          color: "rgba(255,255,255,0.4)",
          fontSize: 13,
          marginBottom: 16,
        },
      },
      `Showing ${paginated.length} of ${filtered.length} attendee${filtered.length !== 1 ? "s" : ""}`,
    ),

    // Table
    React.createElement(
      "div",
      {
        style: {
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 16,
          overflow: "hidden",
          marginBottom: 20,
        },
      },
      React.createElement(
        "div",
        { className: "table-responsive" },
        React.createElement(
          "table",
          {
            className: "data-table",
            style: { width: "100%", borderCollapse: "collapse", minWidth: 800 },
          },
          React.createElement(
            "thead",
            null,
            React.createElement(
              "tr",
              null,
              [
                { label: "Attendee", field: "full_name" },
                { label: "Ticket Code", field: "ticket_code" },
                { label: "Seat", field: "seat_number" },
                { label: "Category", field: "ticket_category" },
                { label: "Status", field: "payment_status" },
                { label: "Amount", field: "amount_paid" },
                { label: "Check-in", field: "checked_in" },
                { label: "Attempts", field: "scan_attempts" },
                { label: "Last Scan", field: "last_scan_status" },
                { label: "Date", field: "created_at" },
              ].map((col) =>
                React.createElement(
                  "th",
                  {
                    key: col.field,
                    style: {
                      cursor: "pointer",
                      userSelect: "none",
                      textAlign: "left",
                      whiteSpace: "nowrap",
                    },
                    onClick: () => toggleSort(col.field),
                  },
                  col.label + sortIcon(col.field),
                ),
              ),
            ),
          ),
          React.createElement(
            "tbody",
            null,
            paginated.length === 0
              ? React.createElement(
                  "tr",
                  null,
                  React.createElement(
                    "td",
                    {
                      colSpan: 10,
                      style: {
                        textAlign: "center",
                        padding: "40px 20px",
                        color: "rgba(255,255,255,0.3)",
                      },
                    },
                    "No attendees found",
                  ),
                )
              : paginated.map((a, i) => {
                  const ticket = CONFIG.TICKETS.find(
                    (t) => t.id === a.ticket_category,
                  );
                  return React.createElement(
                    "tr",
                    { key: a.id || i },
                    React.createElement(
                      "td",
                      null,
                      React.createElement(
                        "div",
                        null,
                        React.createElement(
                          "div",
                          {
                            style: {
                              color: "white",
                              fontWeight: 600,
                              fontSize: 14,
                            },
                          },
                          a.full_name,
                        ),
                        React.createElement(
                          "div",
                          {
                            style: {
                              color: "rgba(255,255,255,0.4)",
                              fontSize: 12,
                            },
                          },
                          a.email,
                        ),
                        a.phone &&
                          React.createElement(
                            "div",
                            {
                              style: {
                                color: "rgba(255,255,255,0.3)",
                                fontSize: 11,
                              },
                            },
                            a.phone,
                          ),
                      ),
                    ),
                    React.createElement(
                      "td",
                      null,
                      React.createElement(
                        "code",
                        {
                          style: {
                            color: "#f3e5f5",
                            fontSize: 12,
                            background: "rgba(194,24,91,0.1)",
                            padding: "2px 6px",
                            borderRadius: 4,
                          },
                        },
                        a.ticket_code,
                      ),
                    ),
                    React.createElement(
                      "td",
                      null,
                      React.createElement(
                        "span",
                        {
                          style: {
                            color: "#f3e5f5",
                            fontWeight: 600,
                            fontSize: 13,
                          },
                        },
                        a.seat_number,
                      ),
                    ),
                    React.createElement(
                      "td",
                      null,
                      React.createElement(
                        "span",
                        {
                          style: {
                            color: "rgba(255,255,255,0.7)",
                            fontSize: 13,
                          },
                        },
                        ticket ? ticket.name : a.ticket_category,
                      ),
                    ),
                    React.createElement(
                      "td",
                      null,
                      React.createElement(StatusBadge, {
                        status: a.payment_status,
                      }),
                    ),
                    React.createElement(
                      "td",
                      null,
                      React.createElement(
                        "span",
                        {
                          style: {
                            color:
                              a.amount_paid > 0
                                ? "#e040fb"
                                : "rgba(255,255,255,0.3)",
                            fontWeight: 600,
                            fontSize: 13,
                          },
                        },
                        a.amount_paid > 0 ? formatCurrency(a.amount_paid) : "—",
                      ),
                    ),
                    React.createElement(
                      "td",
                      null,
                      a.checked_in
                        ? React.createElement(
                            "div",
                            null,
                            React.createElement(
                              "span",
                              {
                                style: {
                                  color: "#e040fb",
                                  fontSize: 13,
                                  fontWeight: 600,
                                },
                              },
                              "✅ Yes",
                            ),
                            a.checked_in_at &&
                              React.createElement(
                                "div",
                                {
                                  style: {
                                    color: "rgba(255,255,255,0.3)",
                                    fontSize: 11,
                                  },
                                },
                                new Date(a.checked_in_at).toLocaleTimeString(
                                  "en-NG",
                                  { hour: "2-digit", minute: "2-digit" },
                                ),
                              ),
                          )
                        : React.createElement(
                            "span",
                            {
                              style: {
                                color: "rgba(255,255,255,0.3)",
                                fontSize: 13,
                              },
                            },
                            "—",
                          ),
                    ),
                    React.createElement(
                      "td",
                      null,
                      React.createElement(
                        "span",
                        {
                          style: {
                            color: "rgba(255,255,255,0.4)",
                            fontSize: 13,
                            fontWeight: 600,
                          },
                        },
                        a.scan_attempts || 0,
                      ),
                    ),
                    React.createElement(
                      "td",
                      null,
                      React.createElement(
                        "span",
                        {
                          style: {
                            color: a.last_scan_status
                              ? "#f3e5f5"
                              : "rgba(255,255,255,0.3)",
                            fontSize: 13,
                            fontWeight: 600,
                          },
                        },
                        a.last_scan_status
                          ? String(a.last_scan_status).replace(/_/g, " ")
                          : "—",
                      ),
                    ),
                    React.createElement(
                      "td",
                      null,
                      React.createElement(
                        "span",
                        {
                          style: {
                            color: "rgba(255,255,255,0.4)",
                            fontSize: 12,
                          },
                        },
                        a.created_at
                          ? new Date(a.created_at).toLocaleDateString("en-NG", {
                              month: "short",
                              day: "numeric",
                            })
                          : "—",
                      ),
                    ),
                  );
                }),
          ),
        ),
      ),
    ),

    // Pagination
    totalPages > 1 &&
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "center",
            gap: 8,
            alignItems: "center",
          },
        },
        React.createElement(
          "button",
          {
            onClick: () => setLocalPage((p) => Math.max(1, p - 1)),
            disabled: page <= 1,
            style: {
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: page <= 1 ? "rgba(255,255,255,0.2)" : "white",
              padding: "8px 16px",
              borderRadius: 8,
              cursor: page <= 1 ? "not-allowed" : "pointer",
              fontFamily: "Inter, sans-serif",
            },
          },
          "← Prev",
        ),
        React.createElement(
          "span",
          { style: { color: "rgba(255,255,255,0.5)", fontSize: 14 } },
          `Page ${page} of ${totalPages}`,
        ),
        React.createElement(
          "button",
          {
            onClick: () => setLocalPage((p) => Math.min(totalPages, p + 1)),
            disabled: page >= totalPages,
            style: {
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: page >= totalPages ? "rgba(255,255,255,0.2)" : "white",
              padding: "8px 16px",
              borderRadius: 8,
              cursor: page >= totalPages ? "not-allowed" : "pointer",
              fontFamily: "Inter, sans-serif",
            },
          },
          "Next →",
        ),
      ),
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
function AdminAnalytics({ analytics }) {
  const attendees = analytics.attendees || [];

  const revenueByCategory = CONFIG.TICKETS.map((t) => ({
    name: t.name,
    count: analytics.byCategory[t.id] || 0,
    revenue: (analytics.byCategory[t.id] || 0) * t.price,
    capacity: t.slots,
    fillRate: t.slots
      ? Math.round(((analytics.byCategory[t.id] || 0) / t.slots) * 100)
      : 0,
  }));

  const checkedInPct =
    analytics.paid > 0
      ? Math.round((analytics.checkedIn / analytics.paid) * 100)
      : 0;
  const conversionPct =
    analytics.total > 0
      ? Math.round((analytics.paid / analytics.total) * 100)
      : 0;

  return React.createElement(
    "div",
    { className: "page-enter" },
    // KPI row
    React.createElement(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 28,
        },
      },
      [
        {
          label: "Conversion Rate",
          value: `${conversionPct}%`,
          desc: "Registered → Paid",
          color: "#e040fb",
        },
        {
          label: "Check-in Rate",
          value: `${checkedInPct}%`,
          desc: "Paid → Checked In",
          color: "#e040fb",
        },
        {
          label: "Gross Revenue",
          value: formatCurrency(analytics.revenue),
          desc: "Total collected",
          color: "#f3e5f5",
        },
        {
          label: "Remaining Seats",
          value: 260 - analytics.total,
          desc: "Out of 260 total",
          color: "#c2185b",
        },
      ].map((k, i) =>
        React.createElement(
          "div",
          {
            key: i,
            style: {
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16,
              padding: "22px 24px",
            },
          },
          React.createElement(
            "div",
            {
              style: {
                color: k.color,
                fontSize: 36,
                fontWeight: 800,
                fontFamily: "Space Grotesk, sans-serif",
                marginBottom: 8,
              },
            },
            k.value,
          ),
          React.createElement(
            "div",
            {
              style: {
                color: "white",
                fontWeight: 600,
                fontSize: 14,
                marginBottom: 4,
              },
            },
            k.label,
          ),
          React.createElement(
            "div",
            { style: { color: "rgba(255,255,255,0.4)", fontSize: 12 } },
            k.desc,
          ),
        ),
      ),
    ),

    // Revenue by category
    React.createElement(
      "div",
      {
        style: {
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 16,
          padding: "24px",
          marginBottom: 24,
        },
      },
      React.createElement(
        "h3",
        {
          style: {
            color: "white",
            fontWeight: 700,
            fontSize: 16,
            marginBottom: 24,
          },
        },
        "💰 Revenue by Ticket Category",
      ),
      React.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 20 } },
        revenueByCategory.map((cat, i) =>
          React.createElement(
            "div",
            { key: i },
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                  flexWrap: "wrap",
                  gap: 8,
                },
              },
              React.createElement(
                "div",
                null,
                React.createElement(
                  "span",
                  { style: { color: "white", fontWeight: 600, fontSize: 15 } },
                  cat.name,
                ),
                React.createElement(
                  "span",
                  {
                    style: {
                      color: "rgba(255,255,255,0.4)",
                      fontSize: 13,
                      marginLeft: 12,
                    },
                  },
                  `${cat.count} sold / ${cat.capacity} capacity`,
                ),
              ),
              React.createElement(
                "div",
                { style: { display: "flex", gap: 20 } },
                React.createElement(
                  "span",
                  {
                    style: { color: "#e040fb", fontWeight: 700, fontSize: 15 },
                  },
                  formatCurrency(cat.revenue),
                ),
                React.createElement(
                  "span",
                  { style: { color: "rgba(255,255,255,0.5)", fontSize: 13 } },
                  `${cat.fillRate}% full`,
                ),
              ),
            ),
            React.createElement(
              "div",
              {
                style: {
                  height: 8,
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 4,
                },
              },
              React.createElement("div", {
                style: {
                  height: "100%",
                  width: `${Math.min(cat.fillRate, 100)}%`,
                  background:
                    i === 0
                      ? "#6b7280"
                      : i === 1
                        ? "linear-gradient(90deg, #e040fb, #c2185b)"
                        : "linear-gradient(90deg, #e040fb, #f3e5f5)",
                  borderRadius: 4,
                  transition: "width 0.8s ease",
                },
              }),
            ),
          ),
        ),
      ),
    ),

    // Attendee breakdown
    React.createElement(
      "div",
      {
        style: {
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 16,
          padding: "24px",
        },
      },
      React.createElement(
        "h3",
        {
          style: {
            color: "white",
            fontWeight: 700,
            fontSize: 16,
            marginBottom: 20,
          },
        },
        "📊 Attendee Breakdown",
      ),
      React.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
          },
        },
        [
          {
            label: "Male",
            count: attendees.filter((a) => a.gender === "Male").length,
            color: "#e040fb",
            icon: "👨",
          },
          {
            label: "Female",
            count: attendees.filter((a) => a.gender === "Female").length,
            color: "#ec4899",
            icon: "👩",
          },
          {
            label: "VIP/Premium",
            count: attendees.filter((a) =>
              ["vip", "premium"].includes(a.ticket_category),
            ).length,
            color: "#c2185b",
            icon: "⭐",
          },
          {
            label: "With Requests",
            count: attendees.filter((a) => a.special_requests).length,
            color: "#f3e5f5",
            icon: "📝",
          },
        ].map((s, i) =>
          React.createElement(
            "div",
            {
              key: i,
              style: {
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 14,
              },
            },
            React.createElement("span", { style: { fontSize: 28 } }, s.icon),
            React.createElement(
              "div",
              null,
              React.createElement(
                "div",
                {
                  style: {
                    color: s.color,
                    fontWeight: 800,
                    fontSize: 26,
                    fontFamily: "Space Grotesk, sans-serif",
                  },
                },
                s.count,
              ),
              React.createElement(
                "div",
                { style: { color: "rgba(255,255,255,0.5)", fontSize: 13 } },
                s.label,
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

// ============================================================
// MC FABS MASTERCLASS — Main App Router
// ============================================================

// Splash screen shown while scripts load
function SplashScreen() {
  return React.createElement(
    "div",
    {
      style: {
        minHeight: "100vh",
        background: "#1D1A39",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      },
    },
    React.createElement(
      "div",
      {
        style: {
          width: 80,
          height: 80,
          background: "linear-gradient(135deg, #e040fb, #c2185b)",
          borderRadius: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 40,
          fontWeight: 900,
          color: "white",
          boxShadow: "0 0 40px rgba(102,103,171,0.5)",
          animation: "float 2s ease-in-out infinite",
        },
      },
      "🎤",
    ),
    React.createElement(
      "div",
      { style: { textAlign: "center" } },
      React.createElement(
        "div",
        {
          style: {
            color: "white",
            fontWeight: 800,
            fontSize: 24,
            fontFamily: "Space Grotesk, sans-serif",
          },
        },
        "MC FABS Exclusive Masterclass 1.0",
      ),
      React.createElement(
        "div",
        {
          style: {
            color: "rgba(166, 105, 168, 0.88)",
            fontSize: 14,
            marginTop: 4,
          },
        },
        "Loading event...",
      ),
    ),
    React.createElement(
      "div",
      { style: { display: "flex", gap: 8 } },
      [0, 1, 2].map((i) =>
        React.createElement("div", {
          key: i,
          style: {
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#c2185b)",
            animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
          },
        }),
      ),
    ),
  );
}

function App() {
  const [page, setPage] = React.useState("landing");
  const [ready, setReady] = React.useState(false);

  // ── ALL hooks must be called unconditionally (Rules of Hooks) ──────────────
  React.useEffect(() => {
    const t = setTimeout(() => setReady(true), 600);
    return () => clearTimeout(t);
  }, []);

  React.useEffect(() => {
    if (!ready) return;
    const routes = {
      "": "landing",
      "/": "landing",
      "/register": "register",
      "/ticket": "ticket",
      "/admin": "admin",
      "/admin/login": "admin-login",
      "/scanner": "scanner",
    };
    const hash = window.location.hash.replace("#", "") || "/";
    const matched = routes[hash];
    if (matched) setPage(matched);
  }, [ready]);

  React.useEffect(() => {
    if (!ready) return;
    const hashMap = {
      landing: "/",
      register: "/register",
      ticket: "/ticket",
      "admin-login": "/admin/login",
      admin: "/admin",
      scanner: "/scanner",
    };
    window.location.hash = hashMap[page] || "/";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, ready]);

  if (!ready) return React.createElement(SplashScreen);

  const showNav = ["landing", "register", "ticket"].includes(page);

  return React.createElement(
    ToastProvider,
    null,
    React.createElement(
      "div",
      null,
      showNav && React.createElement(Navbar, { currentPage: page, setPage }),
      PageRenderer({ page, setPage }),
    ),
  );
}

function PageRenderer({ page, setPage }) {
  switch (page) {
    case "landing":
      return React.createElement(LandingPage, { setPage });
    case "register":
      return React.createElement(RegisterPage, { setPage });
    case "ticket":
      return React.createElement(TicketPage, { setPage });
    case "admin-login":
      return React.createElement(AdminLogin, { setPage });
    case "admin":
      return React.createElement(AdminDashboard, { setPage });
    case "scanner":
      return React.createElement(ScannerPage, { setPage });
    default:
      return React.createElement(LandingPage, { setPage });
  }
}

// Mount app
const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);
root.render(React.createElement(App));

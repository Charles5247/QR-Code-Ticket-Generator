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
          boxShadow: "0 0 40px rgba(194,24,91,0.5)",
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
            color: "rgba(194,24,91,0.88)",
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
            background: "#c2185b",
            animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
          },
        }),
      ),
    ),
  );
}

const ROUTES = {
  "": "landing",
  "/": "landing",
  "/register": "register",
  "/ticket": "ticket",
  "/admin": "admin-login",
  //"/admin/login": "admin-login",
  "/scanner": "scanner",
};

const HASH_MAP = {
  landing: "/",
  register: "/register",
  ticket: "/ticket",
  "admin-login": "/admin",
  admin: "/admin",
  scanner: "/scanner",
};

/*function getPageFromHash() {
  const hash = window.location.hash.replace("#", "") || "/";

  // Clean up duplicate query structures if they exist
  let path = hash;
  if (hash.includes("?")) {
    path = hash.split("?")[0];
  }

  const pageName = ROUTES[path] || "landing";
  console.log(
    `🔀 ROUTER: hash="${hash}" → path="${path}" → page="${pageName}"`,
  );
  return pageName;
}*/

function getPageFromHash() {
  const hash = window.location.hash.replace("#", "") || "/";
  const path = hash.split("?")[0]; // strip query params before route lookup
  const pageName = ROUTES[path] || "landing";
  console.log(
    `🔀 ROUTER: hash="${hash}" → path="${path}" → page="${pageName}"`,
  );
  return pageName;
}

function App() {
  // Initialize directly from the current hash so `page` is correct on the
  // very first render. Previously this was set later in a useEffect keyed
  // on `ready`, which raced with the URL-sync effect below: both effects
  // fire in the same batch when `ready` flips true, and the URL-sync effect
  // would run BEFORE React applied the setPage() from the hash-read effect,
  // so it saw the stale default "landing" and rewrote the hash to "/" —
  // stomping routes like "/ticket?status=success&txnRef=..." right after
  // a Zainpay redirect, before the ticket page ever got a chance to render.
  const [page, setPage] = React.useState(() => getPageFromHash());
  const [ready, setReady] = React.useState(false);

  console.log("🚀 App mounted. Initial URL:", window.location.href);
  console.log("🚀 Initial hash:", window.location.hash);

  // Splash delay
  React.useEffect(() => {
    const t = setTimeout(() => setReady(true), 600);
    return () => clearTimeout(t);
  }, []);

  // On ready: no longer need to re-read the hash here — `page` is already
  // correct from the lazy useState initializer above. (Kept the `ready`
  // gate itself for the splash-screen delay, handled by the effect below.)

  // Listen for back/forward browser navigation
  React.useEffect(() => {
    if (!ready) return;
    const onHashChange = () => {
      console.log("🔄 Hash changed:", window.location.hash);
      setPage(getPageFromHash());
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [ready]);

  // Update URL when page changes intentionally (setPage called by nav/buttons).
  // Only update the hash if the current path doesn't already match — this
  // preserves query params (e.g. ?txnRef=...) on the Zainpay callback URL.

  // Update URL when page changes intentionally (setPage called by nav/buttons).
  // Safely preserves and handles query params (e.g. ?txnRef=...) on the Zainpay callback URL.
  React.useEffect(() => {
    if (!ready) return;
    const expectedPath = HASH_MAP[page] || "/";
    const fullHash = window.location.hash.replace("#", "") || "/";
    const currentPath = fullHash.split("?")[0];

    if (currentPath !== expectedPath) {
      if (fullHash.includes("?")) {
        // Grab everything starting from the first question mark
        const queryContext = fullHash.substring(fullHash.indexOf("?"));
        // Deduplicate query structures if they were appended weirdly
        const cleanQuery = queryContext.replace(/\?/g, "&").replace("&", "?");

        console.log(
          `🔀 ROUTER: Preserving URL params during transition to #${expectedPath}`,
        );
        window.location.hash = "#" + expectedPath + cleanQuery;
      } else {
        console.log(
          `🔀 ROUTER: Updating hash from #${fullHash} to #${expectedPath}`,
        );
        window.location.hash = "#" + expectedPath;
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, ready]);

  /*React.useEffect(() => {
    if (!ready) return;
    const expectedPath = HASH_MAP[page] || "/";
    const fullHash = window.location.hash.replace("#", "") || "/";
    const currentPath = fullHash.split("?")[0];
    const hasQueryParams = fullHash.includes("?");

    // Don't update hash if it has query params (e.g. Zainpay callback)
    // and the initial read-hash effect hasn't caught up yet.
    // Wait for hash to match before doing any updates.
    if (currentPath !== expectedPath && !hasQueryParams) {
      console.log(
        `🔀 ROUTER: Updating hash from #${fullHash} to #${expectedPath}`,
      );
      window.location.hash = "#" + expectedPath;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, ready]);*/

  // Secret keyboard shortcut: Ctrl+Shift+A → admin login
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        setPage("admin-login");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

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

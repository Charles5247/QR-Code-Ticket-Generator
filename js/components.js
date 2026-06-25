// ============================================================
// MC FABS MASTERCLASS — Shared Components
// ============================================================

// ─── Navigation ───────────────────────────────────────────────────────────────
function Navbar({ currentPage, setPage }) {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "#hero" },
    { label: "About", href: "#about" },
    { label: "Schedule", href: "#schedule" },
    { label: "Tickets", href: "#tickets" },
    { label: "FAQ", href: "#faq" },
  ];

  const scrollTo = (href) => {
    if (currentPage !== "landing") {
      setPage("landing");
      setTimeout(() => scrollToAnchor(href), 100);
    } else scrollToAnchor(href);
    setMobileOpen(false);
  };

  const scrollToAnchor = (href) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return React.createElement(
    "nav",
    {
      style: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled ? "rgba(5,5,5,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        transition: "all 0.3s ease",
      },
    },
    React.createElement(
      "div",
      { className: "max-w-7xl mx-auto px-4 sm:px-6" },
      React.createElement(
        "div",
        { className: "flex items-center justify-between h-16 md:h-20" },

        // Logo
        React.createElement(
          "div",
          {
            className: "flex items-center gap-3 cursor-pointer",
            onClick: () => setPage("landing"),
          },
          React.createElement(
            "div",
            {
              style: {
                width: 40,
                height: 40,
                background: "linear-gradient(135deg, #e040fb, #c2185b)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 16,
                color: "white",
                fontFamily: "Space Grotesk, sans-serif",
              },
            },
            "MC",
          ),
          React.createElement(
            "div",
            null,
            React.createElement(
              "div",
              {
                style: {
                  fontWeight: 700,
                  fontSize: 16,
                  color: "white",
                  fontFamily: "Space Grotesk, sans-serif",
                  lineHeight: 1.2,
                },
              },
              "MC FABS",
            ),
            React.createElement(
              "div",
              {
                style: {
                  fontSize: 10,
                  color: "linear-gradient(135deg, #e040fb, #c2185b)",
                  letterSpacing: "0.1em",
                },
              },
              "EXCLUSIVE MASTERCLASS 1.0",
            ),
          ),
        ),

        // Desktop nav
        React.createElement(
          "div",
          { className: "hidden md:flex items-center gap-8" },
          navLinks.map((link) =>
            React.createElement(
              "button",
              {
                key: link.label,
                onClick: () => scrollTo(link.href),
                className: "text-sm font-medium transition-colors",
                style: {
                  color: "rgba(255,255,255,0.7)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                },
                onMouseEnter: (e) => (e.target.style.color = "#c2185b"),
                onMouseLeave: (e) =>
                  (e.target.style.color = "rgba(255,255,255,0.7)"),
              },
              link.label,
            ),
          ),
        ),

        // Desktop CTAs
        React.createElement(
          "div",
          { className: "hidden md:flex items-center gap-3" },
          /*React.createElement(
            "button",
            {
              onClick: () => setPage("admin-login"),
              style: {
                background: "none",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.7)",
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                transition: "all 0.2s ease",
              },
              onMouseEnter: (e) => {
                e.target.style.borderColor = "rgba(194,24,91,0.5)";
                e.target.style.color = "white";
              },
              onMouseLeave: (e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.15)";
                e.target.style.color = "rgba(255,255,255,0.7)";
              },
            },
            "🔐 Admin",
          ),*/
          React.createElement(
            "button",
            {
              onClick: () => scrollTo("#tickets"),
              className: "btn-primary",
              style: {
                background: "linear-gradient(135deg, #e040fb, #c2185b)",
                color: "white",
                padding: "9px 22px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
                fontFamily: "Inter, sans-serif",
              },
            },
            "🎟️ Get Tickets",
          ),
        ),

        // Mobile menu button
        React.createElement(
          "button",
          {
            className: "md:hidden",
            onClick: () => setMobileOpen(!mobileOpen),
            style: {
              background: "none",
              border: "none",
              color: "white",
              fontSize: 24,
              cursor: "pointer",
            },
          },
          mobileOpen ? "✕" : "☰",
        ),
      ),
    ),

    // Mobile menu
    mobileOpen &&
      React.createElement(
        "div",
        {
          className: "md:hidden mobile-menu",
          style: {
            position: "fixed",
            inset: 0,
            width: "100%",
            background:
              "linear-gradient(135deg, #c2185b 0%, #8b005d 50%, #6a0572 100%)",
            backdropFilter: "blur(20px)",
            zIndex: 50,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 15,
          },
        },
        React.createElement(
          "button",
          {
            onClick: () => setMobileOpen(false),
            style: {
              position: "absolute",
              top: 20,
              right: 20,
              background: "none",
              border: "none",
              color: "white",
              fontSize: 28,
              cursor: "pointer",
            },
          },
          "✕",
        ),
        navLinks.map((link) =>
          React.createElement(
            "button",
            {
              key: link.label,
              onClick: () => scrollTo(link.href),
              style: {
                background: "none",
                border: "none",
                color: "white",
                fontSize: 24,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              },
            },
            link.label,
          ),
        ),
        /*React.createElement(
          "button",
          {
            onClick: () => {
              setPage("admin-login");
              setMobileOpen(false);
            },
            style: {
              background: "none",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "white",
              padding: "12px 32px",
              borderRadius: 10,
              fontSize: 16,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
            },
          },
          "🔐 Admin Login",
        ),*/
        React.createElement(
          "button",
          {
            onClick: () => {
              scrollTo("#tickets");
              setMobileOpen(false);
            },
            style: {
              background: "linear-gradient(135deg, #e040fb, #c2185b)",
              color: "white",
              padding: "14px 40px",
              borderRadius: 12,
              fontSize: 18,
              fontWeight: 700,
              cursor: "pointer",
              border: "none",
              fontFamily: "Inter, sans-serif",
            },
          },
          "🎟️ Get Tickets",
        ),
      ),
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────
function Footer({ setPage }) {
  return React.createElement(
    "footer",
    {
      style: {
        background: "#1a0a2e",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "48px 24px 24px",
      },
    },
    React.createElement(
      "div",
      { className: "max-w-6xl mx-auto" },
      React.createElement(
        "div",
        { className: "grid grid-cols-1 md:grid-cols-3 gap-8 mb-12" },
        // Brand
        React.createElement(
          "div",
          null,
          React.createElement(
            "div",
            { className: "flex items-center gap-3 mb-4" },
            React.createElement(
              "div",
              {
                style: {
                  width: 44,
                  height: 44,
                  background: "linear-gradient(135deg, #e040fb, #c2185b)",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 16,
                  color: "white",
                },
              },
              "MC",
            ),
            React.createElement(
              "div",
              null,
              React.createElement(
                "div",
                { style: { fontWeight: 700, fontSize: 18, color: "white" } },
                "MC FABS",
              ),
              React.createElement(
                "div",
                {
                  style: {
                    fontSize: 11,
                    color: "linear-gradient(135deg, #e040fb, #c2185b)",
                    letterSpacing: "0.1em",
                  },
                },
                "EXCLUSIVE MASTERCLASS 1.0",
              ),
            ),
          ),
          React.createElement(
            "p",
            {
              style: {
                color: "rgba(255,255,255,0.4)",
                fontSize: 14,
                lineHeight: 1.7,
              },
            },
            "VOICE . STAGE . IMPACT. An elite masterclass by Faith Abah (MC FABS), Kano's premier event host.",
          ),
        ),

        // Quick Links
        React.createElement(
          "div",
          null,
          React.createElement(
            "h4",
            { style: { color: "white", fontWeight: 600, marginBottom: 16 } },
            "Quick Links",
          ),
          React.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 10 } },
            ["Home", "About", "Schedule", "Tickets", "FAQ"].map((link) =>
              React.createElement(
                "a",
                {
                  key: link,
                  href: `#${link.toLowerCase()}`,
                  style: {
                    color: "rgba(255,255,255,0.45)",
                    fontSize: 14,
                    textDecoration: "none",
                    transition: "color 0.2s",
                  },
                  onMouseEnter: (e) => (e.target.style.color = "#c2185b"),
                  onMouseLeave: (e) =>
                    (e.target.style.color = "rgba(255,255,255,0.45)"),
                },
                link,
              ),
            ),
          ),
        ),

        // Contact
        React.createElement(
          "div",
          null,
          React.createElement(
            "h4",
            { style: { color: "white", fontWeight: 600, marginBottom: 16 } },
            "Contact",
          ),
          React.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 10 } },
            [
              { icon: "📍", text: "Kano, Nigeria" },
              { icon: "✉️", text: CONFIG.EVENT.email },
              { icon: "📱", text: CONFIG.EVENT.city },
            ].map((item, idx) =>
              React.createElement(
                "div",
                {
                  key: `${item.text}-${idx}`,
                  style: { display: "flex", gap: 10, alignItems: "center" },
                },
                React.createElement("span", null, item.icon),
                React.createElement(
                  "span",
                  { style: { color: "rgba(255,255,255,0.45)", fontSize: 14 } },
                  item.text,
                ),
              ),
            ),
          ),
          React.createElement(
            "div",
            { style: { display: "flex", gap: 12, marginTop: 16 } },
            [
              { icon: "📸", label: "Instagram", url: CONFIG.EVENT.instagram },
              { icon: "💬", label: "WhatsApp", url: CONFIG.EVENT.whatsapp },
            ].map((s) =>
              React.createElement(
                "a",
                {
                  key: s.label,
                  href: s.url,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  style: {
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "white",
                    textDecoration: "none",
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  },
                },
                s.icon,
                " ",
                s.label,
              ),
            ),
          ),
        ),
      ),

      // Bottom bar
      React.createElement(
        "div",
        {
          style: {
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: 24,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          },
        },
        React.createElement(
          "p",
          { style: { color: "rgba(255,255,255,0.3)", fontSize: 13 } },
          `© 2026 MC FABS Masterclass. All rights reserved.`,
        ),
        React.createElement(
          "a",
          {
            href: "https://caxie-technologies.netlify.app/",
            target: "_blank",
            rel: "noopener noreferrer",
            style: {
              color: "rgba(255,255,255,0.3)",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              textDecoration: "none",
            },
          },
          "Developed by CAXiE Technologies Ltd",
        ),
      ),
    ),
  );
}

// ─── Loading Spinner ───────────────────────────────────────────────────────────
function LoadingSpinner({ size = 24, color = "#c2185b" }) {
  return React.createElement("div", {
    style: {
      width: size,
      height: size,
      border: `3px solid rgba(194,24,91,0.2)`,
      borderTopColor: color,
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
      display: "inline-block",
    },
  });
}

// ─── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ tag, title, subtitle, titleClass = "" }) {
  return React.createElement(
    "div",
    { style: { textAlign: "center", marginBottom: 48 } },
    tag &&
      React.createElement(
        "div",
        {
          style: {
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(194,24,91,0.15)",
            border: "1px solid rgba(194,24,91,0.3)",
            borderRadius: 999,
            padding: "6px 16px",
            marginBottom: 20,
            color: "#f3e5f5",
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "0.05em",
          },
        },
        React.createElement("span", null, "✦"),
        tag,
        React.createElement("span", null, "✦"),
      ),
    React.createElement(
      "h2",
      {
        className: titleClass || "gradient-text",
        style: {
          fontSize: "clamp(28px, 5vw, 48px)",
          fontWeight: 800,
          marginBottom: 16,
          fontFamily: "Playfair Display, serif",
          lineHeight: 1.2,
        },
      },
      title,
    ),
    subtitle &&
      React.createElement(
        "p",
        {
          style: {
            color: "rgba(255,255,255,0.5)",
            fontSize: 17,
            maxWidth: 560,
            margin: "0 auto",
            lineHeight: 1.7,
          },
        },
        subtitle,
      ),
  );
}

// ─── Countdown Widget ──────────────────────────────────────────────────────────
function CountdownWidget() {
  const [countdown, setCountdown] = React.useState(
    getCountdown(CONFIG.EVENT.eventDate),
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdown(CONFIG.EVENT.eventDate));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (countdown.expired) {
    return React.createElement(
      "div",
      {
        style: {
          textAlign: "center",
          color: "#c2185b",
          fontWeight: 700,
          fontSize: 20,
        },
      },
      "🎉 The Event is Live Now!",
    );
  }

  const units = [
    { label: "Days", value: countdown.days },
    { label: "Hours", value: countdown.hours },
    { label: "Mins", value: countdown.minutes },
    { label: "Secs", value: countdown.seconds },
  ];

  return React.createElement(
    "div",
    {
      style: {
        display: "flex",
        gap: 16,
        justifyContent: "center",
        flexWrap: "wrap",
      },
    },
    units.map((u) =>
      React.createElement(
        "div",
        {
          key: u.label,
          className: "countdown-box",
          style: { textAlign: "center" },
        },
        React.createElement(
          "div",
          {
            style: {
              fontSize: 32,
              fontWeight: 800,
              color: "white",
              fontFamily: "Space Grotesk, sans-serif",
              lineHeight: 1,
            },
          },
          String(u.value).padStart(2, "0"),
        ),
        React.createElement(
          "div",
          {
            style: {
              fontSize: 11,
              color: "rgb(243, 117, 167)",
              marginTop: 4,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            },
          },
          u.label,
        ),
      ),
    ),
  );
}

// ─── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const configs = {
    paid: {
      label: "Paid",
      bg: "rgba(194,24,91,0.15)",
      color: "#e040fb",
      border: "rgba(194,24,91,0.3)",
    },
    pending: {
      label: "Pending",
      bg: "rgba(243,229,245,0.15)",
      color: "#f3e5f5",
      border: "rgba(243,229,245,0.3)",
    },
    failed: {
      label: "Failed",
      bg: "rgba(239,68,68,0.15)",
      color: "#ef4444",
      border: "rgba(239,68,68,0.3)",
    },
  };
  const cfg = configs[status] || configs.pending;
  return React.createElement(
    "span",
    {
      style: {
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        borderRadius: 999,
        padding: "3px 10px",
        fontSize: 12,
        fontWeight: 600,
      },
    },
    cfg.label,
  );
}

// ─── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ isOpen, onClose, children, maxWidth = 600 }) {
  React.useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return React.createElement(
    "div",
    {
      className: "modal-overlay",
      onClick: (e) => {
        if (e.target === e.currentTarget) onClose();
      },
    },
    React.createElement(
      "div",
      {
        style: {
          background: "linear-gradient(135deg, #6a0572 0%, #6a0572 100%)",
          border: "1px solid rgba(194,24,91,0.2)",
          borderRadius: 20,
          padding: 32,
          width: "100%",
          maxWidth: maxWidth,
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          animation: "slideUp 0.3s ease",
        },
      },
      React.createElement(
        "button",
        {
          onClick: onClose,
          style: {
            position: "absolute",
            top: 16,
            right: 16,
            background: "rgba(255,255,255,0.08)",
            border: "none",
            color: "white",
            width: 32,
            height: 32,
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        },
        "✕",
      ),
      children,
    ),
  );
}

window.Navbar = Navbar;
window.Footer = Footer;
window.LoadingSpinner = LoadingSpinner;
window.SectionHeader = SectionHeader;
window.CountdownWidget = CountdownWidget;
window.StatusBadge = StatusBadge;
window.Modal = Modal;

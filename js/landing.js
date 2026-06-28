// ============================================================
// MC FABS MASTERCLASS — Landing Page
// ============================================================

// ─── Media URLs — update these when ready ────────────────────────────────────
const HERO_VIDEO_URL = "fab-talk.mp4"; // paste your .mp4 or hosted video URL here
const HERO_VIDEO_POSTER = "theme-poster.jpg"; // optional: thumbnail shown before video plays
// ─────────────────────────────────────────────────────────────────────────────

function LandingPage({ setPage }) {
  return React.createElement(
    "div",
    { className: "page-enter" },
    React.createElement(FlierPopup),
    React.createElement(HeroSection, { setPage }),
    React.createElement(StatsBar),
    React.createElement(AboutSection),
    React.createElement(SpeakerSection),
    React.createElement(ScheduleSection),
    React.createElement(BenefitsSection),
    React.createElement(TestimonialsSection),
    React.createElement(PricingSection, { setPage }),
    React.createElement(FAQSection),
    React.createElement(CTASection, { setPage }),
    React.createElement(Footer, { setPage }),
  );
}

// ─── Flier Popup (ad-poster.jpg, auto-shows after 5s then auto-closes) ───────
function FlierPopup() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    // Show after 1s delay, auto-close after 5s
    const showTimer = setTimeout(() => setVisible(true), 1000);
    const hideTimer = setTimeout(() => setVisible(false), 6000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return React.createElement(
    "div",
    {
      onClick: () => setVisible(false),
      style: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        animation: "fadeIn 0.4s ease",
      },
    },
    React.createElement(
      "div",
      {
        onClick: (e) => e.stopPropagation(),
        style: {
          position: "relative",
          maxWidth: 480,
          width: "100%",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(194,24,91,0.5)",
          border: "2px solid rgba(194,24,91,0.4)",
        },
      },
      // Close button
      React.createElement(
        "button",
        {
          onClick: () => setVisible(false),
          style: {
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 10,
            background: "rgba(0,0,0,0.7)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "white",
            width: 36,
            height: 36,
            borderRadius: "50%",
            fontSize: 16,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Inter, sans-serif",
          },
        },
        "✕",
      ),
      // Flier image
      React.createElement("img", {
        src: "ad-poster.jpg",
        alt: "MC FABS Masterclass Event Flier",
        style: { width: "100%", display: "block" },
      }),
      // Register CTA bar at bottom
      React.createElement(
        "div",
        {
          style: {
            background: "linear-gradient(135deg, #c2185b, #e040fb)",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          },
        },
        React.createElement(
          "span",
          {
            style: {
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "Inter, sans-serif",
            },
          },
          "🔥 Limited seats — September 12th, 2026",
        ),
        React.createElement(
          "button",
          {
            onClick: () => {
              setVisible(false);
              const el = document.getElementById("tickets");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            },
            style: {
              background: "white",
              color: "#c2185b",
              border: "none",
              borderRadius: 8,
              padding: "8px 18px",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              whiteSpace: "nowrap",
            },
          },
          "Get Ticket →",
        ),
      ),
    ),
  );
}

// ─── Hero Section ──────────────────────────────────────────────────────────────
function HeroSection({ setPage }) {
  const [videoPlaying, setVideoPlaying] = React.useState(false);
  const [videoMode, setVideoMode] = React.useState("inline"); // "inline" or "fullscreen"
  const videoRef = React.useRef(null);

  const scrollToTickets = () => {
    const el = document.getElementById("tickets");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const playVideo = (mode) => {
    setVideoMode(mode);
    setVideoPlaying(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play();
        if (mode === "fullscreen" && videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen();
        }
      }
    }, 100);
  };

  const stopVideo = () => {
    if (videoRef.current) videoRef.current.pause();
    setVideoPlaying(false);
  };

  return React.createElement(
    "section",
    {
      id: "hero",
      className: "bg-hero dots-bg",
      style: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        paddingTop: 80,
      },
    },

    // ── Background video (hidden behind gradient, paused until user plays) ──
    HERO_VIDEO_URL &&
      React.createElement("video", {
        ref: videoRef,
        src: HERO_VIDEO_URL,
        poster: HERO_VIDEO_POSTER || undefined,
        loop: true,
        muted: videoMode === "inline",
        playsInline: true,
        style: {
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          opacity: videoPlaying && videoMode === "inline" ? 0.35 : 0,
          transition: "opacity 0.6s ease",
          pointerEvents: "none",
        },
      }),

    // Gradient overlay (always on top of video)
    React.createElement("div", {
      style: {
        position: "absolute",

        inset: 0,
        background:
          "linear-gradient(135deg, rgba(26,10,46,0.92) 0%, rgba(106,5,114,0.85) 100%)",
        zIndex: 1,
        pointerEvents: "none",
      },
    }),

    // Animated blobs
    React.createElement("div", {
      style: {
        position: "absolute",
        top: "15%",
        right: "10%",
        width: 400,
        height: 400,
        background:
          "radial-gradient(circle, rgba(194,24,91,0.25) 0%, transparent 70%)",
        borderRadius: "50%",
        animation: "float 6s ease-in-out infinite",
        zIndex: 1,
      },
    }),
    React.createElement("div", {
      style: {
        position: "absolute",
        bottom: "20%",
        left: "5%",
        width: 300,
        height: 300,
        background:
          "radial-gradient(circle, rgba(243,229,245,0.15) 0%, transparent 70%)",
        borderRadius: "50%",
        animation: "float 8s ease-in-out infinite reverse",
        zIndex: 1,
      },
    }),

    // Fullscreen video modal
    videoPlaying &&
      videoMode === "fullscreen" &&
      React.createElement(
        "div",
        {
          onClick: stopVideo,
          style: {
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.95)",
            zIndex: 99998,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        },
        React.createElement(
          "div",
          {
            onClick: (e) => e.stopPropagation(),
            style: { position: "relative", width: "90vw", maxWidth: 960 },
          },
          React.createElement(
            "button",
            {
              onClick: stopVideo,
              style: {
                position: "absolute",
                top: -44,
                right: 0,
                background: "none",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "white",
                width: 36,
                height: 36,
                borderRadius: "50%",
                fontSize: 16,
                cursor: "pointer",
              },
            },
            "✕",
          ),
          React.createElement("video", {
            ref: videoRef,
            src: HERO_VIDEO_URL,
            poster: HERO_VIDEO_POSTER || undefined,
            controls: true,
            autoPlay: true,
            style: { width: "100%", borderRadius: 16 },
          }),
        ),
      ),

    React.createElement(
      "div",
      {
        className: "max-w-7xl mx-auto px-4 sm:px-6 py-20",
        style: { width: "100%", position: "relative", zIndex: 2 },
      },
      React.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 60,
            alignItems: "center",
          },
        },

        // Left content
        React.createElement(
          "div",
          null,
          // Event tag
          React.createElement(
            "div",
            {
              style: {
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(243,229,245,0.15)",
                border: "1px solid rgba(243,229,245,0.3)",
                borderRadius: 999,
                padding: "8px 20px",
                marginBottom: 28,
                color: "#fbbf24",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.05em",
              },
            },
            "🔥 LIMITED SEATS — KANO, NIGERIA 2026",
          ),

          React.createElement(
            "h1",
            {
              style: {
                fontSize: "clamp(25px, 3vw, 25px)",
                fontWeight: 900,
                lineHeight: 1.1,
                marginBottom: 12,
                fontFamily: "Playfair Display, serif",
                color: "white",
              },
            },
            "MC FABS",
          ),
          React.createElement(
            "h1",
            {
              className: "gradient-text",
              style: {
                fontSize: "clamp(30px, 3vw, 40px)",
                fontWeight: 900,
                lineHeight: 1.1,
                marginBottom: 15,
                fontFamily: "Playfair Display, serif",
              },
            },
            "Exclusive",
          ),
          React.createElement(
            "h2",
            {
              className: "hero-gradient",
              style: {
                fontSize: "clamp(30px, 3vw, 50px)",
                fontWeight: 900,
                lineHeight: 1.1,
                marginBottom: 24,
                fontFamily: "Playfair Display, serif",
              },
            },
            "Masterclass 1.0",
          ),
          React.createElement(
            "p",
            {
              style: {
                fontSize: "clamp(20px, 4vw, 36px)",
                color: "rgba(255,255,255,0.7)",
                marginBottom: 25,
                lineHeight: 1.6,
                fontStyle: "italic",
                fontFamily: "Playfair Display, serif",
              },
            },
            "VOICE . STAGE . IMPACT",
          ),

          // Event details chips
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 40,
              },
            },
            [
              { icon: "📅", text: "September 12th, 2026" },
              { icon: "⏰", text: "10:00 AM WAT" },
              { icon: "📍", text: "Kano, Nigeria" },
            ].map((item) =>
              React.createElement(
                "div",
                {
                  key: item.text,
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 999,
                    padding: "8px 16px",
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 14,
                  },
                },
                item.icon,
                " ",
                item.text,
              ),
            ),
          ),

          // CTAs
          React.createElement(
            "div",
            { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
            React.createElement(
              "button",
              {
                onClick: scrollToTickets,
                style: {
                  background:
                    "linear-gradient(135deg, #e040fb 0%, #c2185b 50%, #e040fb 100%)",
                  color: "white",
                  padding: "16px 36px",
                  borderRadius: 14,
                  fontSize: 17,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "none",
                  fontFamily: "Inter, sans-serif",
                  boxShadow: "0 8px 32px rgba(194,24,91,0.4)",
                  transition: "all 0.3s ease",
                },
                onMouseEnter: (e) => {
                  e.target.style.transform = "translateY(-3px)";
                  e.target.style.boxShadow = "0 16px 48px rgba(194,24,91,0.5)";
                },
                onMouseLeave: (e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 8px 32px rgba(194,24,91,0.4)";
                },
              },
              "🎟️ Reserve Your Seat",
            ),
            React.createElement(
              "button",
              {
                onClick: () => {
                  const el = document.getElementById("about");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                },
                style: {
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "white",
                  padding: "16px 32px",
                  borderRadius: 14,
                  fontSize: 17,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  transition: "all 0.2s ease",
                },
                onMouseEnter: (e) => {
                  e.target.style.background = "rgba(194,24,91,0.15)";
                },
                onMouseLeave: (e) => {
                  e.target.style.background = "rgba(255,255,255,0.06)";
                },
              },
              "Learn More ↓",
            ),

            // Video play button — only shown when video URL is set
            HERO_VIDEO_URL &&
              React.createElement(
                "div",
                { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
                React.createElement(
                  "button",
                  {
                    onClick: () => playVideo("inline"),
                    style: {
                      background: "rgba(224,64,251,0.15)",
                      border: "1px solid rgba(224,64,251,0.4)",
                      color: "#e040fb",
                      padding: "16px 22px",
                      borderRadius: 14,
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "Inter, sans-serif",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    },
                  },
                  "▶ Play Video",
                ),
                React.createElement(
                  "button",
                  {
                    onClick: () => playVideo("fullscreen"),
                    style: {
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "rgba(255,255,255,0.6)",
                      padding: "16px 18px",
                      borderRadius: 14,
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: "Inter, sans-serif",
                    },
                    title: "Watch fullscreen",
                  },
                  "⛶",
                ),
              ),

            // Stop button when inline video is playing
            videoPlaying &&
              videoMode === "inline" &&
              React.createElement(
                "button",
                {
                  onClick: stopVideo,
                  style: {
                    background: "rgba(194,24,91,0.2)",
                    border: "1px solid rgba(194,24,91,0.4)",
                    color: "#f3e5f5",
                    padding: "16px 22px",
                    borderRadius: 14,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                  },
                },
                "⏹ Stop",
              ),
          ),
        ),

        // Right — Feature card
        React.createElement(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: 20 } },
          // Main card
          React.createElement(
            "div",
            {
              style: {
                background:
                  "linear-gradient(135deg, rgba(194,24,91,0.2) 0%, rgba(106,5,114,0.8) 100%)",
                border: "1px solid rgba(194,24,91,0.3)",
                borderRadius: 24,
                padding: 32,
                backdropFilter: "blur(20px)",
                position: "relative",
                overflow: "hidden",
              },
            },
            React.createElement("div", {
              style: {
                position: "absolute",
                top: -40,
                right: -40,
                width: 200,
                height: 200,
                background:
                  "radial-gradient(circle, rgba(194,24,91,0.2) 0%, transparent 70%)",
                borderRadius: "50%",
              },
            }),

            // Host info
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 24,
                },
              },
              React.createElement("div", {
                style: {
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "url('fabulous.jpg') center",
                  backgroundSize: "cover",
                  flexShrink: 0,
                  boxShadow: "0 0 0 3px rgba(194,24,91,0.3)",
                },
              }),
              React.createElement(
                "div",
                null,
                React.createElement(
                  "h3",
                  {
                    style: {
                      color: "white",
                      fontWeight: 700,
                      fontSize: 20,
                      margin: 0,
                    },
                  },
                  "Faith Abah",
                ),
                React.createElement(
                  "p",
                  {
                    style: {
                      color: "#c2185b",
                      fontSize: 14,
                      margin: "4px 0 0",
                      fontStyle: "italic",
                    },
                  },
                  "MC FABS.ng",
                ),
                React.createElement(
                  "p",
                  {
                    style: {
                      color: "rgba(255,255,255,0.5)",
                      fontSize: 12,
                      margin: "2px 0 0",
                    },
                  },
                  "Event Host & Compere",
                ),
              ),
            ),

            // Stats
            React.createElement(
              "div",
              {
                style: {
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginBottom: 24,
                },
              },
              [
                { num: "5+", label: "Years Experience" },
                { num: "100+", label: "Events Hosted" },
                { num: "50K+", label: "Followers" },
                { num: "100%", label: "Satisfaction" },
              ].map((s) =>
                React.createElement(
                  "div",
                  {
                    key: s.label,
                    style: {
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: 12,
                      padding: "14px 16px",
                      textAlign: "center",
                    },
                  },
                  React.createElement(
                    "div",
                    {
                      style: {
                        color: "#f3e5f5",
                        fontWeight: 800,
                        fontSize: 22,
                        fontFamily: "Space Grotesk, sans-serif",
                      },
                    },
                    s.num,
                  ),
                  React.createElement(
                    "div",
                    {
                      style: {
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 11,
                        marginTop: 2,
                      },
                    },
                    s.label,
                  ),
                ),
              ),
            ),

            // Countdown
            React.createElement(
              "div",
              {
                style: {
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  paddingTop: 20,
                },
              },
              React.createElement(
                "p",
                {
                  style: {
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 12,
                    textAlign: "center",
                    marginBottom: 12,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  },
                },
                "⏳ Event starts in",
              ),
              React.createElement(CountdownWidget),
            ),
          ),

          // Quick info cards
          React.createElement(
            "div",
            {
              style: {
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              },
            },
            [
              { icon: "🏆", title: "Masterclass", desc: "World-class content" },
              {
                icon: "🎓",
                title: "Certificate",
                desc: "Issued on completion",
              },
              { icon: "🤝", title: "Network", desc: "Meet top professionals" },
              {
                icon: "🎁",
                title: "Gift Pack",
                desc: "Complimentary gift pack for attendees",
              },
            ].map((item) =>
              React.createElement(
                "div",
                {
                  key: item.title,
                  className: "card-hover",
                  style: {
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 14,
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  },
                },
                React.createElement(
                  "span",
                  { style: { fontSize: 22 } },
                  item.icon,
                ),
                React.createElement(
                  "div",
                  null,
                  React.createElement(
                    "div",
                    {
                      style: { color: "white", fontWeight: 600, fontSize: 13 },
                    },
                    item.title,
                  ),
                  React.createElement(
                    "div",
                    { style: { color: "rgba(255,255,255,0.4)", fontSize: 11 } },
                    item.desc,
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StatsBar() {
  const ticket = CONFIG.TICKETS[0] || { slots: 260, price: 50000 };
  const stats = [
    { num: String(ticket.slots), label: "Total Seats", suffix: "" },
    {
      num: `₦${Number(ticket.price).toLocaleString()}`,
      label: "Package Price",
      suffix: "",
    },
    { num: "1", label: "Ticket Package", suffix: "" },
    { num: "1", label: "Day Event", suffix: "" },
  ];

  return React.createElement(
    "div",
    {
      style: {
        background:
          "linear-gradient(135deg, rgba(194,24,91,0.15), rgba(243,229,245,0.1))",
        borderTop: "1px solid rgba(194,24,91,0.2)",
        borderBottom: "1px solid rgba(194,24,91,0.2)",
        padding: "20px 24px",
      },
    },
    React.createElement(
      "div",
      { className: "max-w-6xl mx-auto" },
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "space-around",
            flexWrap: "wrap",
            gap: 24,
          },
        },
        stats.map((s) =>
          React.createElement(
            "div",
            { key: s.label, style: { textAlign: "center" } },
            React.createElement(
              "div",
              {
                style: {
                  color: "#f3e5f5",
                  fontWeight: 800,
                  fontSize: 28,
                  fontFamily: "Space Grotesk, sans-serif",
                },
              },
              s.num + s.suffix,
            ),
            React.createElement(
              "div",
              { style: { color: "rgba(255,255,255,0.5)", fontSize: 12 } },
              s.label,
            ),
          ),
        ),
      ),
    ),
  );
}

// ─── About Section ────────────────────────────────────────────────────────────
function AboutSection() {
  return React.createElement(
    "section",
    {
      id: "about",
      className: "bg-section",
      style: { padding: "100px 24px" },
    },
    React.createElement(
      "div",
      { className: "max-w-6xl mx-auto" },
      React.createElement(SectionHeader, {
        tag: "About The Event",
        title: "The MC-BLUEPRINTS with MC Fabs",
        subtitle:
          "A transformative experience designed for those who want to own every stage they step onto.",
      }),

      React.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
            marginTop: 48,
          },
        },
        [
          {
            icon: "🎤",
            title: "Finding Your Voice and Speaking Style",
            desc: "Learn the vocal techniques, pacing, and energy control that separate amateurs from professionals in any room.",
          },
          {
            icon: "🎭",
            title: "Building Your Confidence and Stage Presence",
            desc: "Discover the body language secrets and confidence-building strategies used by top-tier event hosts worldwide.",
          },
          {
            icon: "📱",
            title: "Branding and Positioning yourself in the Industry",
            desc: "Build your personal brand as a host, speaker, or MC across traditional and digital media platforms.",
          },
          {
            icon: "🤝",
            title: "How to attract Opportunities as you grow your brand",
            desc: "Connect with fellow professionals, entrepreneurs, and creatives from across Northern Nigeria and beyond.",
          },
          {
            icon: "💡",
            title: "Business of Event Hosting",
            desc: "Turn your passion into profit — learn how to price your services, secure clients, and scale your MC career.",
          },
          {
            icon: "🏆",
            title: "Certification & Recognition",
            desc: "Receive an official certificate of attendance to add credibility to your professional profile.",
          },
        ].map((item) =>
          React.createElement(
            "div",
            {
              key: item.title,
              className: "card-hover glass",
              style: { borderRadius: 16, padding: "28px 24px" },
            },
            React.createElement(
              "div",
              {
                style: {
                  width: 52,
                  height: 52,
                  background: "rgba(194,24,91,0.2)",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  marginBottom: 16,
                },
              },
              item.icon,
            ),
            React.createElement(
              "h3",
              {
                style: {
                  color: "white",
                  fontWeight: 700,
                  fontSize: 18,
                  marginBottom: 10,
                },
              },
              item.title,
            ),
            React.createElement(
              "p",
              {
                style: {
                  color: "rgba(255,255,255,0.55)",
                  lineHeight: 1.7,
                  fontSize: 14,
                },
              },
              item.desc,
            ),
          ),
        ),
      ),
    ),
  );
}

// ─── Speaker Section ──────────────────────────────────────────────────────────
function SpeakerSection() {
  return React.createElement(
    "section",
    {
      style: {
        padding: "80px 24px",
        background:
          "linear-gradient(135deg, rgba(194,24,91,0.08) 0%, rgba(106,5,114,0.9) 100%)",
      },
    },
    React.createElement(
      "div",
      { className: "max-w-5xl mx-auto" },
      React.createElement(SectionHeader, {
        tag: "Your Host",
        title: "Meet MC FABS",
      }),
      React.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 48,
            alignItems: "center",
          },
        },
        React.createElement(
          "div",
          { style: { textAlign: "center" } },
          React.createElement("div", {
            style: {
              width: 350,
              height: 350,
              margin: "0 auto 24px",
              background: "url('fabs.jpg') center",
              backgroundSize: "cover",
              borderRadius: "50%",
              boxShadow:
                "0 0 60px rgba(194,24,91,0.4), 0 0 0 4px rgba(194,24,91,0.2)",
              position: "relative",
            },
          }),
          React.createElement(
            "h3",
            {
              style: {
                color: "white",
                fontSize: 30,
                fontWeight: 800,
                margin: "0 0 6px",
                fontFamily: "Playfair Display, serif",
              },
            },
            "Faith Abah",
          ),
          React.createElement(
            "p",
            {
              className: "gradient-text",
              style: { fontSize: 16, fontWeight: 600, margin: "0 0 20px" },
            },
            "MC FABS.ng",
          ),
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                justifyContent: "center",
                gap: 8,
                flexWrap: "wrap",
              },
            },
            [
              "Event Host",
              "Media Personality",
              "Brand Influencer",
              "Speaker",
            ].map((tag) =>
              React.createElement(
                "span",
                {
                  key: tag,
                  style: {
                    background: "rgba(194,24,91,0.15)",
                    border: "1px solid rgba(194,24,91,0.3)",
                    borderRadius: 999,
                    padding: "4px 12px",
                    color: "#f3e5f5",
                    fontSize: 12,
                  },
                },
                tag,
              ),
            ),
          ),
        ),

        React.createElement(
          "div",
          null,
          React.createElement(
            "div",
            {
              style: {
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                padding: 32,
              },
            },
            React.createElement(
              "p",
              {
                style: {
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 15,
                  lineHeight: 1.8,
                  marginBottom: 20,
                },
              },
              "Faith Abah, popularly known as MC FABS, is Kano's premier event host and media personality with over a decade of experience commanding stages across Northern Nigeria. From state ceremonies to corporate galas, from weddings to media broadcasts — her electrifying presence and unmatched professionalism have made her the most sought-after MC in the region.",
            ),
            React.createElement(
              "p",
              {
                style: {
                  color: "rgba(255,255,255,0.65)",
                  fontSize: 14,
                  lineHeight: 1.8,
                  marginBottom: 28,
                },
              },
              "This masterclass is her way of giving back — sharing every technique, strategy, and insider secret that took her years to master, compressed into one powerful day of learning and transformation.",
            ),
            React.createElement(
              "div",
              {
                style: {
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                },
              },
              [
                { icon: "🎤", text: "100+ Events Hosted" },
                { icon: "📺", text: "Event Compere" },
                { icon: "📍", text: "Based in Kano, Nigeria" },
                { icon: "🏆", text: "Award-Winning Host/Compere" },
              ].map((item) =>
                React.createElement(
                  "div",
                  {
                    key: item.text,
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 14,
                    },
                  },
                  item.icon,
                  " ",
                  item.text,
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

// ─── Schedule Section ─────────────────────────────────────────────────────────
function ScheduleSection() {
  const schedule = [
    {
      time: "9:00 AM",
      title: "Registration & Welcome",
      desc: "Check-in, networking, and morning refreshments",
      type: "break",
    },
    {
      time: "10:00 AM",
      title: "Opening Ceremony",
      desc: "Welcome address and introduction by MC FABS",
      type: "main",
    },
    {
      time: "10:30 AM",
      title: "Session 1: Finding Your Voice",
      desc: "Vocal techniques, tone modulation, and articulation mastery",
      type: "main",
    },
    {
      time: "12:00 PM",
      title: "Session 2: Stage Presence",
      desc: "Command attention, read your audience, and own the stage",
      type: "main",
    },
    {
      time: "1:30 PM",
      title: "Lunch Break & Networking",
      desc: "Curated networking lunch and lounge experience",
      type: "break",
    },
    {
      time: "2:30 PM",
      title: "Session 3: The Business of Hosting",
      desc: "Pricing, clients, contracts, and scaling your MC brand",
      type: "main",
    },
    {
      time: "3:30 PM",
      title: "Session 4: Media & Digital Presence",
      desc: "Building your brand online and attracting the right clients",
      type: "main",
    },
    {
      time: "4:30 PM",
      title: "Live Practice & Hot Seat Coaching",
      desc: "Practical exercises with real-time feedback from MC FABS",
      type: "special",
    },
    {
      time: "5:30 PM",
      title: "Certificate Presentation",
      desc: "Official certificates, group photographs, and closing remarks",
      type: "special",
    },
    {
      time: "6:00 PM",
      title: "Networking Reception",
      desc: "Informal networking and closing reception",
      type: "special",
    },
  ];

  const typeColors = {
    main: {
      bg: "rgba(194,24,91,0.15)",
      border: "rgba(194,24,91,0.3)",
      dot: "#e040fb",
    },
    break: {
      bg: "rgba(194,24,91,0.1)",
      border: "rgba(194,24,91,0.2)",
      dot: "#e040fb",
    },
    special: {
      bg: "rgba(243,229,245,0.12)",
      border: "rgba(243,229,245,0.25)",
      dot: "#f3e5f5",
    },
  };

  return React.createElement(
    "section",
    { id: "schedule", style: { padding: "100px 24px", background: "#1a0a2e" } },
    React.createElement(
      "div",
      { className: "max-w-4xl mx-auto" },
      React.createElement(SectionHeader, {
        tag: "Event Schedule",
        title: "A Full Day of Transformation",
      }),
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginTop: 48,
          },
        },
        schedule.map((item, i) => {
          const colors = typeColors[item.type];
          return React.createElement(
            "div",
            {
              key: i,
              className: "card-hover",
              style: {
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: 14,
                padding: "18px 22px",
              },
            },
            React.createElement("div", {
              style: {
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: colors.dot,
                flexShrink: 0,
                marginTop: 5,
                boxShadow: `0 0 8px ${colors.dot}`,
              },
            }),
            React.createElement(
              "div",
              { style: { flex: 1 } },
              React.createElement(
                "span",
                {
                  style: {
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 999,
                    padding: "2px 10px",
                    color: "#c2185b",
                    fontSize: 12,
                    fontWeight: 600,
                    display: "inline-block",
                    marginBottom: 6,
                  },
                },
                item.time,
              ),
              React.createElement(
                "h4",
                {
                  style: {
                    color: "white",
                    fontWeight: 700,
                    fontSize: 16,
                    margin: "0 0 6px",
                  },
                },
                item.title,
              ),
              React.createElement(
                "p",
                {
                  style: {
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 13,
                    margin: 0,
                    lineHeight: 1.5,
                  },
                },
                item.desc,
              ),
            ),
          );
        }),
      ),
    ),
  );
}

// ─── Benefits Section ─────────────────────────────────────────────────────────
function BenefitsSection() {
  const benefits = [
    "✅ Master professional MC & hosting techniques from scratch",
    "✅ Build unshakeable stage confidence and charisma",
    "✅ Learn how to command ANY audience in ANY room",
    "✅ Understand vocal dynamics, energy management & timing",
    "✅ Discover how to price and market your hosting services",
    "✅ Build a powerful personal brand that attracts higher-paying gigs",
    "✅ Network with fellow professionals and industry leaders",
    "✅ Receive an official Certificate of Attendance",
    "✅ Get access to exclusive masterclass materials and notes",
    "✅ Join an exclusive alumni community for ongoing support",
  ];

  return React.createElement(
    "section",
    {
      style: {
        padding: "100px 24px",
        background:
          "linear-gradient(135deg, rgba(194,24,91,0.06) 0%, #050510 100%)",
      },
    },
    React.createElement(
      "div",
      { className: "max-w-5xl mx-auto" },
      React.createElement(SectionHeader, {
        tag: "Benefits",
        title: "What You'll Walk Away With",
        subtitle:
          "This is not just an event. It's a career-changing investment.",
      }),
      React.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 12,
            marginTop: 48,
          },
        },
        benefits.map((b, i) =>
          React.createElement(
            "div",
            {
              key: i,
              style: {
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12,
                padding: "14px 20px",
                color: "rgba(255,255,255,0.8)",
                fontSize: 14,
                lineHeight: 1.5,
                transition: "all 0.2s ease",
              },
              onMouseEnter: (e) => {
                e.currentTarget.style.background = "rgba(194,24,91,0.12)";
                e.currentTarget.style.borderColor = "rgba(194,24,91,0.3)";
              },
              onMouseLeave: (e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
              },
            },
            b,
          ),
        ),
      ),
    ),
  );
}

// ─── Testimonials Section ─────────────────────────────────────────────────────
function TestimonialsSection() {
  const testimonials = [
    {
      name: "Hauwa Musa",
      role: "Event Coordinator, Kano",
      text: "MC FABS is in a league of her own. After attending one of her workshops, my hosting style completely transformed. I now command higher fees and confidence I never had before.",
      rating: 5,
    },
    {
      name: "Ibrahim Yakubu",
      role: "Corporate MC, Abuja",
      text: "Faith's energy is contagious and her knowledge is world-class. The practical techniques I learned have directly helped me land 3 major corporate events this year alone.",
      rating: 5,
    },
    {
      name: "Sadiya Abubakar",
      role: "TV Presenter, NTA Kano",
      text: "I've attended many masterclasses but MC FABS delivers differently. Real, practical, and applicable knowledge that works from day one. Absolutely worth every kobo.",
      rating: 5,
    },
    {
      name: "Aliyu Garba",
      role: "Wedding MC & Entrepreneur",
      text: "The business of hosting session alone was worth the ticket price. I finally understand how to value my work and attract the right clients. Game-changing experience.",
      rating: 5,
    },
    {
      name: "Zainab Bello",
      role: "Media Personality, Kaduna",
      text: "MC FABS doesn't just teach — she transforms. The confidence I gained from her guidance has opened doors I never imagined. Highly recommend to any aspiring host.",
      rating: 5,
    },
    {
      name: "Chidi Okonkwo",
      role: "Events MC, Lagos",
      text: "Traveled from Lagos specifically for this and it was worth every mile. MC FABS's masterclass is the best investment I've made in my career. Period.",
      rating: 5,
    },
  ];

  return React.createElement(
    "section",
    { style: { padding: "100px 24px", background: "#1a0a2e" } },
    React.createElement(
      "div",
      { className: "max-w-6xl mx-auto" },
      React.createElement(SectionHeader, {
        tag: "Testimonials",
        title: "What Alumni Say",
        subtitle:
          "Real words from real people whose lives and careers were transformed.",
      }),
      React.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            marginTop: 48,
          },
        },
        testimonials.map((t, i) =>
          React.createElement(
            "div",
            {
              key: i,
              className: "card-hover glass",
              style: { borderRadius: 16, padding: "24px 22px" },
            },
            React.createElement(
              "div",
              { style: { marginBottom: 16 } },
              Array(t.rating)
                .fill(0)
                .map((_, j) =>
                  React.createElement(
                    "span",
                    { key: j, style: { color: "#f3e5f5", fontSize: 14 } },
                    "★",
                  ),
                ),
            ),
            React.createElement(
              "p",
              {
                style: {
                  color: "rgba(255,255,255,0.75)",
                  fontSize: 14,
                  lineHeight: 1.7,
                  marginBottom: 20,
                  fontStyle: "italic",
                },
              },
              `"${t.text}"`,
            ),
            React.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 12 } },
              React.createElement(
                "div",
                {
                  style: {
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, hsl(${i * 60}, 70%, 50%), hsl(${i * 60 + 60}, 70%, 40%))`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 700,
                    fontSize: 16,
                  },
                },
                t.name[0],
              ),
              React.createElement(
                "div",
                null,
                React.createElement(
                  "div",
                  { style: { color: "white", fontWeight: 600, fontSize: 14 } },
                  t.name,
                ),
                React.createElement(
                  "div",
                  { style: { color: "rgba(255,255,255,0.45)", fontSize: 12 } },
                  t.role,
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

// ─── Pricing Section (split layout: left = ticket info, right = theme-poster) ─
function PricingSection({ setPage }) {
  return React.createElement(
    "section",
    {
      id: "tickets",
      style: {
        padding: "100px 24px",
        background:
          "linear-gradient(135deg, rgba(194,24,91,0.07) 0%, #050510 100%)",
      },
    },
    React.createElement(
      "div",
      { className: "max-w-6xl mx-auto" },
      React.createElement(SectionHeader, {
        tag: "Tickets & Pricing",
        title: "Early Bird",
        subtitle:
          "Note: the price will change for late registration — secure your seat now.",
      }),

      // Split layout wrapper
      React.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 40,
            marginTop: 48,
            alignItems: "start",
          },
        },

        // LEFT — Ticket cards
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: 24,
              height: "100vh",
            },
          },
          CONFIG.TICKETS.map((ticket, i) => {
            const isPopular = ticket.badge === "Most Popular";
            const isExclusive = ticket.badge === "Exclusive";

            return React.createElement(
              "div",
              {
                key: ticket.id,
                className: "card-hover",
                style: {
                  borderRadius: 20,
                  border: isPopular
                    ? "2px solid #c2185b"
                    : isExclusive
                      ? "2px solid #f3e5f5"
                      : "1px solid rgba(255,255,255,0.08)",
                  background: isPopular
                    ? "linear-gradient(135deg, rgba(194,24,91,0.25) 0%, rgba(106,5,114,0.9) 100%)"
                    : isExclusive
                      ? "linear-gradient(135deg, rgba(243,229,245,0.15) 0%, rgba(106,5,114,0.9) 100%)"
                      : "rgba(255,255,255,0.03)",
                  padding: 28,
                  position: "relative",
                  overflow: "hidden",
                },
              },

              // Glow
              isPopular &&
                React.createElement("div", {
                  style: {
                    position: "absolute",
                    top: -60,
                    right: -60,
                    width: 200,
                    height: 200,
                    background:
                      "radial-gradient(circle, rgba(194,24,91,0.2) 0%, transparent 70%)",
                    borderRadius: "50%",
                  },
                }),

              // Badge
              ticket.badge &&
                React.createElement(
                  "div",
                  {
                    style: {
                      position: "absolute",
                      top: 16,
                      right: 16,
                      background: isPopular
                        ? "linear-gradient(135deg, #e040fb, #c2185b)"
                        : "linear-gradient(135deg, #e040fb, #f3e5f5)",
                      color: "white",
                      borderRadius: 999,
                      padding: "4px 12px",
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    },
                  },
                  ticket.badge,
                ),

              // Ticket name
              React.createElement(
                "h3",
                {
                  style: {
                    color: "white",
                    fontWeight: 800,
                    fontSize: 22,
                    margin: "0 0 8px",
                    fontFamily: "Space Grotesk, sans-serif",
                  },
                },
                ticket.name,
              ),

              // Price
              React.createElement(
                "div",
                { style: { marginBottom: 20 } },
                React.createElement(
                  "div",
                  {
                    style: { display: "flex", alignItems: "baseline", gap: 4 },
                  },
                  React.createElement(
                    "span",
                    {
                      style: {
                        color:
                          isPopular || isExclusive
                            ? "#f3e5f5"
                            : "rgba(255,255,255,0.5)",
                        fontSize: 20,
                        fontWeight: 600,
                      },
                    },
                    "₦",
                  ),
                  React.createElement(
                    "span",
                    {
                      style: {
                        color: "white",
                        fontSize: 42,
                        fontWeight: 900,
                        fontFamily: "Space Grotesk, sans-serif",
                      },
                    },
                    Number(ticket.price).toLocaleString(),
                  ),
                ),
                React.createElement(
                  "p",
                  {
                    style: {
                      color: "rgba(255,255,255,0.4)",
                      fontSize: 12,
                      marginTop: 4,
                    },
                  },
                  "One-time payment • No hidden fees",
                ),
              ),

              // Features
              React.createElement(
                "ul",
                {
                  style: {
                    listStyle: "none",
                    padding: 0,
                    margin: "0 0 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  },
                },
                ticket.features.map((f, j) =>
                  React.createElement(
                    "li",
                    {
                      key: j,
                      style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        color: "rgba(255,255,255,0.75)",
                        fontSize: 14,
                        lineHeight: 1.5,
                      },
                    },
                    React.createElement(
                      "span",
                      {
                        style: {
                          color: isExclusive ? "#f3e5f5" : "#e040fb",
                          fontWeight: 700,
                        },
                      },
                      "✓",
                    ),
                    f,
                  ),
                ),
              ),

              // CTA
              React.createElement(
                "button",
                {
                  onClick: () => {
                    sessionStorage.setItem("mcfabs_selected_ticket", ticket.id);
                    setPage("register");
                  },
                  style: {
                    width: "100%",

                    padding: "14px 0",
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                    border: "none",
                    fontFamily: "Inter, sans-serif",
                    background: isPopular
                      ? "linear-gradient(135deg, #e040fb, #c2185b)"
                      : isExclusive
                        ? "linear-gradient(135deg, #e040fb, #f3e5f5)"
                        : "rgba(255,255,255,0.08)",
                    color: "white",
                    transition: "all 0.2s ease",
                  },
                  onMouseEnter: (e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 8px 24px rgba(194,24,91,0.3)";
                  },
                  onMouseLeave: (e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                  },
                },
                "Register Now",
              ),
            );
          }),

          // Availability note
          React.createElement(
            "p",
            {
              style: {
                color: "rgba(243,229,245,0.7)",
                fontSize: 14,
                marginTop: 8,
              },
            },
            "⚠️ Limited seats available. Register early to secure your spot — late registration incurs a higher cost.",
          ),
        ),

        // RIGHT — Theme poster
        React.createElement(
          "div",
          {
            style: {
              position: "sticky",
              top: 100,
              borderRadius: 20,
              overflow: "hidden",
              border: "2px solid rgba(194,24,91,0.3)",
              boxShadow: "0 24px 60px rgba(194,24,91,0.25)",
            },
          },
          React.createElement("img", {
            src: "theme-poster.jpg",
            alt: "MC FABS Masterclass Theme Poster",
            style: { width: "100%", height: "70vh", display: "block" },
          }),
          // Poster footer CTA
          React.createElement(
            "div",
            {
              style: {
                background:
                  "linear-gradient(135deg, rgba(194,24,91,0.9), rgba(106,5,114,0.95))",
                padding: "20px 24px",
                textAlign: "center",
              },
            },
            React.createElement(
              "p",
              {
                style: {
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 13,
                  marginBottom: 12,
                  fontFamily: "Inter, sans-serif",
                },
              },
              "📅 September 12th, 2026 • Kano, Nigeria",
            ),
            React.createElement(
              "button",
              {
                onClick: () => setPage("register"),
                style: {
                  background: "white",
                  color: "#c2185b",
                  border: "none",
                  borderRadius: 10,
                  padding: "12px 32px",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  width: "100%",
                },
              },
              "🎟️ Secure Your Seat Now",
            ),
          ),
        ),
      ),
    ),
  );
}

// ─── FAQ Section ──────────────────────────────────────────────────────────────
function FAQSection() {
  const [openIndex, setOpenIndex] = React.useState(null);

  const faqs = [
    {
      q: "Who is this masterclass for?",
      a: "This masterclass is designed for aspiring event hosts, MCs, media personalities, entrepreneurs, public speakers, content creators, and anyone who wants to improve their presence, confidence, and communication skills in professional settings.",
    },
    {
      q: "What is included in the ticket price?",
      a: "All tickets include full-day event access, masterclass materials, certificate of attendance and lunch.",
    },
    {
      q: "How do I receive my ticket after payment?",
      a: "Your digital ticket with QR code will be sent to your email immediately after payment is confirmed. You can also download it from the confirmation page. Please bring either the digital or printed version on event day.",
    },
    {
      q: "Is there a refund policy?",
      a: "Tickets are non-refundable. However, you may transfer your ticket to another person up to 48 hours before the event. Please contact us via email to process a transfer.",
    },
    {
      q: "Where exactly is the venue?",
      a: "The address and detailed directions to the venue will be sent to all registered attendees and revealed on your ticket once payment has been confirmed automatically.",
    },
    {
      q: "What should I bring on event day?",
      a: "Bring your digital or printed QR code ticket, a valid ID, a notebook and pen (or device for note-taking), and dress professionally. The dress code is Smart Casual to Business Formal.",
    },
    {
      q: "Will there be recordings available?",
      a: "Recordings will be made available for purchase after the event. Details will be shared with attendees.",
    },
    {
      q: "Can I pay in installments?",
      a: "Currently, full payment is required at the time of registration. We recommend registering early as seats are limited and filling up fast.",
    },
  ];

  return React.createElement(
    "section",
    { id: "faq", style: { padding: "100px 24px", background: "#1a0a2e" } },
    React.createElement(
      "div",
      { className: "max-w-3xl mx-auto" },
      React.createElement(SectionHeader, {
        tag: "FAQ",
        title: "Frequently Asked Questions",
        subtitle: "Have questions? We have answers.",
      }),
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginTop: 48,
          },
        },
        faqs.map((faq, i) =>
          React.createElement(
            "div",
            {
              key: i,
              style: {
                background:
                  openIndex === i
                    ? "rgba(194,24,91,0.1)"
                    : "rgba(255,255,255,0.03)",
                border: `1px solid ${openIndex === i ? "rgba(194,24,91,0.3)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 14,
                overflow: "hidden",
                transition: "all 0.2s ease",
              },
            },
            React.createElement(
              "button",
              {
                onClick: () => setOpenIndex(openIndex === i ? null : i),
                style: {
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "18px 22px",
                  background: "none",
                  border: "none",
                  color: "white",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  textAlign: "left",
                },
              },
              faq.q,
              React.createElement(
                "span",
                {
                  style: {
                    color: "#c2185b",
                    fontSize: 20,
                    flexShrink: 0,
                    marginLeft: 12,
                    transform: openIndex === i ? "rotate(45deg)" : "rotate(0)",
                    transition: "transform 0.2s ease",
                  },
                },
                "+",
              ),
            ),
            openIndex === i &&
              React.createElement(
                "div",
                {
                  style: {
                    padding: "0 22px 20px",
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 14,
                    lineHeight: 1.7,
                  },
                },
                faq.a,
              ),
          ),
        ),
      ),
    ),
  );
}

// ─── CTA Section ──────────────────────────────────────────────────────────────
function CTASection({ setPage }) {
  return React.createElement(
    "section",
    { style: { padding: "80px 24px" } },
    React.createElement(
      "div",
      { className: "max-w-4xl mx-auto" },
      React.createElement(
        "div",
        {
          style: {
            background:
              "linear-gradient(135deg, rgba(194,24,91,0.3) 0%, rgba(243,229,245,0.2) 100%)",
            border: "1px solid rgba(194,24,91,0.3)",
            borderRadius: 24,
            padding: "60px 40px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          },
        },
        React.createElement("div", {
          style: {
            position: "absolute",
            inset: 0,
            opacity: 0.05,
            backgroundImage:
              "radial-gradient(circle, #c2185b 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          },
        }),
        React.createElement(
          "div",
          { style: { position: "relative", zIndex: 1 } },
          React.createElement(
            "h2",
            {
              style: {
                fontSize: "clamp(28px, 5vw, 48px)",
                fontWeight: 900,
                color: "white",
                marginBottom: 16,
                fontFamily: "Playfair Display, serif",
              },
            },
            "Ready to Transform Your Public Speaking Career?",
          ),
          React.createElement(
            "p",
            {
              style: {
                color: "rgba(255,255,255,0.6)",
                fontSize: 17,
                margin: "0 auto 32px",
                maxWidth: 480,
                lineHeight: 1.7,
              },
            },
            "Join hundreds of professionals who are leveling up their craft with MC FABS EXCLUSIVE MASTERCLASS 1.0. Seats are filling fast — secure yours today.",
          ),
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                gap: 16,
                justifyContent: "center",
                flexWrap: "wrap",
              },
            },
            React.createElement(
              "button",
              {
                onClick: () => setPage("register"),
                style: {
                  background: "linear-gradient(135deg, #e040fb, #c2185b)",
                  color: "white",
                  padding: "16px 40px",
                  borderRadius: 14,
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "none",
                  fontFamily: "Inter, sans-serif",
                  boxShadow: "0 8px 32px rgba(194,24,91,0.4)",
                },
              },
              "🎟️ Register Now",
            ),
            React.createElement(
              "a",
              {
                href: CONFIG.EVENT.whatsapp,
                target: "_blank",
                rel: "noopener noreferrer",
                style: {
                  background: "rgba(37,211,102,0.2)",
                  border: "1px solid rgba(37,211,102,0.4)",
                  color: "#e040fb",
                  padding: "16px 32px",
                  borderRadius: 14,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "none",
                  display: "inline-block",
                  fontFamily: "Inter, sans-serif",
                },
              },
              "💬 WhatsApp Us",
            ),
          ),
        ),
      ),
    ),
  );
}

window.LandingPage = LandingPage;

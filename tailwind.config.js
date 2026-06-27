export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}", "./js/**/*.js"],
  theme: {
    extend: {
      colors: {
        moon: {
          bg: "#1a0a2e", // deep purple base background
          bgDeep: "#6a0572", // magenta-purple deep gradient stop
          slate: "#8b005d", // magenta secondary accent shade
          purple: "#c2185b", // magenta outline, focus ring, button mid
          blue: "#e040fb", // magenta primary gradient start
          rose: "#f3e5f5", // light lavender text/highlights
          card: "rgba(243, 229, 245, 0.08)",
          border: "rgba(243, 229, 245, 0.18)",
          text: "#f3e5f5",
          muted: "rgba(243, 229, 245, 0.6)",
          input: "rgba(255, 255, 255, 0.06)",
          glassDark: "rgba(26, 10, 46, 0.72)",
          overlay: "rgba(0, 0, 0, 0.8)",
          nav: "rgba(10, 0, 20, 0.88)",
          accentLight: "rgba(224, 64, 251, 0.18)",
          accentSoft: "rgba(224, 64, 251, 0.27)",
          accentStrong: "rgba(224, 64, 251, 0.4)",
          accentBorder: "rgba(194, 24, 91, 0.5)",
          accentFaint: "rgba(194, 24, 91, 0.22)",
          accentShadow: "rgba(194, 24, 91, 0.24)",
          lightBorder: "rgba(243, 229, 245, 0.12)",
          textSoft: "rgba(255, 255, 255, 0.3)",
          glowText: "rgba(243, 229, 245, 0.82)",
          badgeGoldLight: "rgba(243, 229, 245, 0.96)",
          badgeGoldDark: "rgba(194, 24, 91, 0.9)",
          ticketBorder: "rgba(243, 229, 245, 0.2)",
          adminSidebar: "rgba(26, 10, 46, 0.88)",
          sectionFade: "rgba(26, 10, 46, 0.95)",
        },
      },
      backgroundImage: {
        /*"hero-gradient":
          "radial-gradient(ellipse at 15% 35%, rgba(224, 64, 251, 0.27) 0%, transparent 45%), radial-gradient(ellipse at 80% 18%, rgba(243, 229, 245, 0.18) 0%, transparent 45%), radial-gradient(ellipse at 50% 100%, rgba(194, 24, 91, 0.22) 0%, transparent 50%), linear-gradient(180deg, #1a0a2e 0%, #6a0572 100%)",*/
        "section-gradient":
          "linear-gradient(180deg, rgba(26, 10, 46, 0.95) 0%, #6a0572 100%)",
        "gradient-text":
          "linear-gradient(135deg, #e040fb 0%, #c2185b 60%, #f3e5f5 100%)",
        "gradient-text-white":
          "linear-gradient(135deg, #ffffff 0%, rgba(243, 229, 245, 0.82) 100%)",
        "ticket-card":
          "linear-gradient(135deg, #1a0a2e 0%, #6a0572 50%, #1a0a2e 100%)",
        "badge-gold":
          "linear-gradient(135deg, rgba(243, 229, 245, 0.96), rgba(194, 24, 91, 0.9))",
        "badge-vip": "linear-gradient(135deg, #e040fb 0%, #c2185b 100%)",
        "section-divider":
          "linear-gradient(90deg, transparent, rgba(224, 64, 251, 0.45), rgba(243, 229, 245, 0.35), transparent)",
        "admin-sidebar":
          "linear-gradient(180deg, #6a0572 0%, rgba(26, 10, 46, 0.88) 100%)",
        /*"dots-bg":
          "radial-gradient(circle, rgba(224, 64, 251, 0.18) 1px, transparent 1px)",*/
      },
    },
  },
  plugins: [],
};

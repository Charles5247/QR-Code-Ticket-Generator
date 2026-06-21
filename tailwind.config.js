export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}", "./js/**/*.js"],
  theme: {
    extend: {
      colors: {
        moon: {
          bg: "#1d1a39", // page background base, hero/section gradient start, ticket card
          bgDeep: "#451952", // hero/section gradient deep stop, admin sidebar top
          slate: "#662549", // secondary accent shade
          purple: "#ae445a", // outline, focus ring, button gradient mid stop, badge vip
          blue: "#f39f5a", // primary gradient start, scrollbar thumb, countdown box, badge vip
          rose: "#e8bcb9", // text, gradient highlight, muted accents, badge gold
          card: "rgba(232, 188, 185, 0.08)", // glass card background
          border: "rgba(232, 188, 185, 0.18)", // glass border color, body radial accent
          text: "#e8bcb9", // body text color
          muted: "rgba(232, 188, 185, 0.6)", // placeholder/muted text color
          input: "rgba(255, 255, 255, 0.06)", // input background
          glassDark: "rgba(29, 26, 57, 0.72)", // dark glass background
          overlay: "rgba(0, 0, 0, 0.8)", // modal overlay background
          nav: "rgba(16, 5, 28, 0.88)", // navigation glass
          accentLight: "rgba(243, 159, 90, 0.18)", // hero dots, button hover, countdown bg
          accentSoft: "rgba(243, 159, 90, 0.27)", // hero glow radial
          accentStrong: "rgba(243, 159, 90, 0.4)", // button shadow, glow shadows
          accentBorder: "rgba(174, 68, 90, 0.5)", // outline hover, pricing card border
          accentFaint: "rgba(174, 68, 90, 0.22)", // hero glow radial
          accentShadow: "rgba(174, 68, 90, 0.24)", // card hover shadow
          lightBorder: "rgba(232, 188, 185, 0.12)", // input border, glass dark border
          textSoft: "rgba(255, 255, 255, 0.3)", // placeholder text
          glowText: "rgba(232, 188, 185, 0.82)", // gradient white text stop
          badgeGoldLight: "rgba(232, 188, 185, 0.96)", // badge gold top
          badgeGoldDark: "rgba(174, 68, 90, 0.9)", // badge gold bottom
          ticketBorder: "rgba(232, 188, 185, 0.2)", // ticket card border
          adminSidebar: "rgba(29, 26, 57, 0.88)", // admin sidebar gradient stop
          sectionFade: "rgba(29, 26, 57, 0.95)", // section background top
        },
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(ellipse at 15% 35%, rgba(243, 159, 90, 0.27) 0%, transparent 45%), radial-gradient(ellipse at 80% 18%, rgba(232, 188, 185, 0.18) 0%, transparent 45%), radial-gradient(ellipse at 50% 100%, rgba(174, 68, 90, 0.22) 0%, transparent 50%), linear-gradient(180deg, #1d1a39 0%, #451952 100%)",
        "section-gradient":
          "linear-gradient(180deg, rgba(29, 26, 57, 0.95) 0%, #451952 100%)",
        "gradient-text":
          "linear-gradient(135deg, #f39f5a 0%, #ae445a 60%, #e8bcb9 100%)",
        "gradient-text-white":
          "linear-gradient(135deg, #ffffff 0%, rgba(232, 188, 185, 0.82) 100%)",
        "ticket-card":
          "linear-gradient(135deg, #1d1a39 0%, #451952 50%, #1d1a39 100%)",
        "badge-gold":
          "linear-gradient(135deg, rgba(232, 188, 185, 0.96), rgba(174, 68, 90, 0.9))",
        "badge-vip": "linear-gradient(135deg, #f39f5a 0%, #ae445a 100%)",
        "section-divider":
          "linear-gradient(90deg, transparent, rgba(243, 159, 90, 0.45), rgba(232, 188, 185, 0.35), transparent)",
        "admin-sidebar":
          "linear-gradient(180deg, #451952 0%, rgba(29, 26, 57, 0.88) 100%)",
        "dots-bg":
          "radial-gradient(circle, rgba(243, 159, 90, 0.18) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

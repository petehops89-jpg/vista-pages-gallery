import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fn: {
          bg: "#0b1020",
          panel: "#131a2e",
          accent: "#00e5ff",
          accent2: "#ff3b6b",
          gold: "#ffd54a",
          text: "#e8eefc",
          muted: "#8ea0c4",
        },
      },
      fontFamily: {
        display: ["Rajdhani", "Segoe UI", "system-ui", "sans-serif"],
      },
      keyframes: {
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        floaty: "floaty 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

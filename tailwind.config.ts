import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // IM Brand Palette
        brand: {
          cyan:    "#0EA5E9",
          violet:  "#8B5CF6",
          pink:    "#EC4899",
        },
        // Surfaces
        bg: {
          base:  "#07070F",
          card:  "#0F0F1A",
          hover: "#151525",
          border:"rgba(255,255,255,0.07)",
        },
        // P&L Category Colors
        cat: {
          commissions: "#3B82F6",   // blue
          coaches:     "#10B981",   // emerald
          contractors: "#F59E0B",   // amber
          intl:        "#EC4899",   // pink
          salaries:    "#8B5CF6",   // violet
          marketing:   "#06B6D4",   // cyan
          operations:  "#F97316",   // orange
          other:       "#6B7280",   // gray
        },
        // Status
        positive: "#10B981",
        negative: "#F43F5E",
        neutral:  "#64748B",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #0EA5E9 0%, #8B5CF6 50%, #EC4899 100%)",
        "card-gradient":  "linear-gradient(135deg, rgba(14,165,233,0.06) 0%, rgba(139,92,246,0.04) 100%)",
      },
      boxShadow: {
        "brand":     "0 0 30px rgba(139,92,246,0.15)",
        "card":      "0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)",
        "glow-cyan": "0 0 20px rgba(14,165,233,0.3)",
        "glow-pink": "0 0 20px rgba(236,72,153,0.3)",
      },
      animation: {
        "fade-in":    "fadeIn 0.3s ease-out",
        "slide-in":   "slideIn 0.3s cubic-bezier(0.16,1,0.3,1)",
        "slide-up":   "slideUp 0.4s cubic-bezier(0.16,1,0.3,1)",
      },
      keyframes: {
        fadeIn:  { from: { opacity: "0" }, to: { opacity: "1" } },
        slideIn: { from: { transform: "translateX(100%)" }, to: { transform: "translateX(0)" } },
        slideUp: { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          crimson: "#8B1A2B",
          "crimson-dark": "#6B1220",
          "crimson-light": "#A82236",
          gold: "#C9A84C",
          "gold-dark": "#A88C3A",
          "gold-light": "#DFC070",
          cream: "#FAF8F3",
          "cream-dark": "#F0EDE4",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        sans: ["system-ui", "-apple-system", "sans-serif"],
      },
      minHeight: {
        touch: "44px",
      },
    },
  },
  plugins: [],
};
export default config;

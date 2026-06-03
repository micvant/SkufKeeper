import type { Config } from "tailwindcss";
import { LOCATION_COLOR_CLASSNAMES } from "./src/lib/colors";

const config: Config = {
  darkMode: ["selector", '[data-color-scheme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts}",
  ],
  safelist: LOCATION_COLOR_CLASSNAMES,
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "rgb(var(--sk-primary) / <alpha-value>)",
          hover: "rgb(var(--sk-primary-hover) / <alpha-value>)",
          light: "rgb(var(--sk-primary-light) / <alpha-value>)",
          muted: "rgb(var(--sk-primary-muted) / <alpha-value>)",
          foreground: "rgb(var(--sk-primary-text) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};

export default config;

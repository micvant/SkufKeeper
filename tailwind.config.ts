import type { Config } from "tailwindcss";
import { LOCATION_COLOR_CLASSNAMES } from "./src/lib/colors";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts}",
  ],
  safelist: LOCATION_COLOR_CLASSNAMES,
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;

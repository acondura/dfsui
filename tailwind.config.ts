import type { Config } from "tailwindcss";

const config: Config = {
  // This is the "Switch" that makes your manual 'dark' class work
  darkMode: "class", 
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./web/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./web/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./web/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: {
          background: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },

        text: "hsl(var(--text))",
        background: "hsl(var(--background))",
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        accent: "hsl(var(--accent))",
        dark: {
          text: "hsl(var(--text))",
          background: "hsl(var(--background))",
        },
      },
    },
  },
  plugins: [],
};

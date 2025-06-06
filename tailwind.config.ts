import type { Config } from "tailwindcss"
const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Dark mode specific colors
        "dark-bg": "hsl(224 71% 2%)",
        "dark-card": "hsl(224 71% 4%)",
        "dark-border": "hsl(215 27% 12%)",
        "dark-text": "hsl(0 0% 95%)",
        "dark-muted": "hsl(215 20% 70%)",

        // Custom beautiful color palette - NO GREEN!
        "primary-light": "hsl(270 95% 75%)", // Light purple
        "primary-dark": "hsl(262 69% 40%)", // Dark purple

        // Accent colors
        "accent-blue": "hsl(217 91% 60%)", // Beautiful blue
        "accent-pink": "hsl(330 81% 60%)", // Soft pink
        "accent-orange": "hsl(25 95% 53%)", // Warm orange
        "accent-coral": "hsl(16 100% 66%)", // Beautiful coral

        // Status colors - NO GREEN!
        success: "hsl(217 91% 60%)", // Blue for success instead of green
        warning: "hsl(38 92% 50%)", // Amber
        danger: "hsl(0 84% 60%)", // Red
        info: "hsl(217 91% 60%)", // Blue

        // Background variations
        "background-light": "hsl(220 14% 96%)", // Very light gray
        "background-secondary": "hsl(220 13% 91%)", // Light gray
        "background-tertiary": "hsl(215 20% 65%)", // Medium gray

        // Surface colors
        surface: "hsl(0 0% 100%)", // Pure white
        "surface-hover": "hsl(220 14% 96%)", // Subtle hover

        // Input colors
        "input-bg": "hsl(220 14% 96%)",
        "input-border": "hsl(220 13% 91%)",
        "input-focus": "hsl(262 83% 58%)", // Purple focus

        // Text colors
        "text-primary": "hsl(224 71% 4%)", // Very dark blue
        "text-secondary": "hsl(215 16% 47%)", // Medium gray
        "text-tertiary": "hsl(215 20% 65%)", // Light gray
        "text-disabled": "hsl(215 14% 75%)", // Very light gray

        // Border colors
        "border-light": "hsl(220 14% 96%)",
        "border-medium": "hsl(220 13% 91%)",
        "border-dark": "hsl(215 20% 65%)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "toast-in": {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "toast-out": {
          from: { transform: "translateX(0)", opacity: "1" },
          to: { transform: "translateX(100%)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "toast-in": "toast-in 0.3s ease-out",
        "toast-out": "toast-out 0.2s ease-in",
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        medium: "0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        large: "0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 25px -5px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config

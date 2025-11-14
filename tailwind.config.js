/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "6rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
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

        // CORES PRINCIPAIS DA PATRULHA AÉREA CIVIL
        navy: {
          DEFAULT: "#1A2873", // Azul marinho principal
          dark: "#1E2759", // Azul marinho escuro
          light: "#1B2C8C", // Azul marinho claro
        },
        alert: {
          DEFAULT: "#bd0003", // Vermelho para alertas
        },
        slate: {
          DEFAULT: "#1E293B", // Slate escuro
        },
        offwhite: {
          DEFAULT: "#FCFCFC", // Branco off
        },

        // CORES SEMÂNTICAS
        success: {
          DEFAULT: "#00A859", // Verde sucesso
          light: "#E6F7EF",
        },
        warning: {
          DEFAULT: "#FF6B00", // Laranja alerta
          light: "#FFF2E8",
        },
        error: {
          DEFAULT: "#bd0003", // Vermelho erro
          light: "#FFE6E6",
        },

        // CORES DE FUNDO PERSONALIZADAS
        bg: {
          primary: "#FCFCFC", // Offwhite
          secondary: "#F0F5FF",
          tertiary: "#E6EFFF",
          highlight: "#1A2873", // Navy
          dark: "#1E293B", // Slate
        },

        // BORDAS E DIVISORES
        divider: {
          light: "#E9ECEF",
          medium: "#DEE2E6",
          dark: "#1A2873", // Navy
        },

        // CORES INTERATIVAS
        interactive: {
          link: {
            normal: "#1A2873", // Navy
            visited: "#6633CC",
            hover: "#1B2C8C", // Navy light
          },
        },

        // ESCALA DE CINZAS
        white: "#FFFFFF",
        gray: {
          50: "#F8F9FA",
          100: "#F0F5FF",
          200: "#E9ECEF",
          300: "#DEE2E6",
          400: "#6C757D",
          500: "#495057",
          600: "#333333",
          700: "#212529",
          800: "#000000",
        },

        // STATUS
        status: {
          active: "#00A859", // Success
          inactive: "#FF0000", // Error
          warning: "#FF6B00", // Warning
          expired: "#6C757D", // Gray 400
        },

        // Mantendo cores existentes para compatibilidade com shadcn
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
        "fade-out": {
          from: { opacity: "1", transform: "translateY(0)" },
          to: { opacity: "0", transform: "translateY(10px)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-left": {
          from: { opacity: "0", transform: "translateX(30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-right": {
          from: { opacity: "0", transform: "translateX(-30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "pulse-gentle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
        },
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        typewriter: {
          from: { width: "0" },
          to: { width: "100%" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out",
        "fade-out": "fade-out 0.6s ease-out",
        "slide-up": "slide-up 0.7s ease-out",
        "slide-down": "slide-down 0.7s ease-out",
        "slide-left": "slide-left 0.7s ease-out",
        "slide-right": "slide-right 0.7s ease-out",
        "scale-in": "scale-in 0.5s ease-out",
        "pulse-gentle": "pulse-gentle 3s infinite",
        float: "float 3s ease-in-out infinite",
        shake: "shake 0.5s ease-in-out",
        "bounce-gentle": "bounce-gentle 2s infinite",
        "spin-slow": "spin-slow 3s linear infinite",
        typewriter: "typewriter 2s steps(40) forwards",
        blink: "blink 1s steps(2) infinite 2s",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        inter: ["var(--font-inter)", "system-ui", "sans-serif"],
        bebas: ["Bebas Neue", "system-ui", "sans-serif"],
        roboto: ["Roboto", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

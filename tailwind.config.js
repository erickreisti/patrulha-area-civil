/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from "tailwindcss-animate";

const config = {
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
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      screens: {
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      colors: {
        // Paleta Principal PAC (Navy)
        pac: {
          primary: {
            DEFAULT: "#1A2873", // Navy principal
            dark: "#131835", // Navy mais escuro
            light: "#1B2C8C", // Navy mais claro
            soft: "#2A3A99", // Navy suave para hover
            muted: "#5A8DEB", // Navy suavizado
            pale: "#D6E4FF", // Navy muito claro
            faint: "#F0F5FF", // Navy background
          },
          secondary: {
            DEFAULT: "#00A859", // Verde sucesso
            dark: "#006633", // Verde escuro
            light: "#6DCFA1", // Verde claro
            pale: "#E6F7EF", // Verde muito claro
          },
          alert: {
            DEFAULT: "#bd0003", // Vermelho alerta
            dark: "#660001", // Vermelho escuro
            light: "#FF6666", // Vermelho claro
            pale: "#FFE6E6", // Vermelho muito claro
          },
          warning: {
            DEFAULT: "#FF6B00", // Laranja warning
            dark: "#CC4D00", // Laranja escuro
            light: "#FFCC33", // Laranja claro
            pale: "#FFF8E6", // Laranja muito claro
          },
          accent: {
            DEFAULT: "#8B5CF6", // Roxo para destaques
            purple: "#8B5CF6",
            teal: "#14B8A6",
            amber: "#F59E0B",
          },
        },

        // Cores de estado
        status: {
          active: "#00A859", // Ativo (verde)
          inactive: "#BD0003", // Inativo (vermelho)
          warning: "#FF6B00", // Atenção (laranja)
          pending: "#F59E0B", // Pendente (âmbar)
          completed: "#00A859", // Concluído (verde)
          draft: "#6B7280", // Rascunho (cinza)
          published: "#10B981", // Publicado (verde claro)
          archived: "#8B5CF6", // Arquivado (roxo)
          expired: "#6B7280", // Expirado (cinza)
        },

        // Cores de fundo
        background: {
          primary: "#FCFCFC", // Branco principal
          secondary: "#F0F5FF", // Azul muito claro
          tertiary: "#E6EFFF", // Azul mais claro
          dark: {
            primary: "#0F172A", // Preto azulado escuro
            secondary: "#1E293B", // Preto azulado médio
            tertiary: "#334155", // Preto azulado claro
          },
          highlight: "#1A2873", // Destaque navy
        },

        // Cores de texto
        text: {
          primary: "#1E293B", // Cinza escuro principal
          secondary: "#475569", // Cinza médio
          tertiary: "#64748B", // Cinza claro
          muted: "#94A3B8", // Cinza muito claro
          inverted: "#F8FAFC", // Branco para fundos escuros
          dark: {
            primary: "#F8FAFC", // Branco principal dark
            secondary: "#E2E8F0", // Cinza muito claro dark
            tertiary: "#CBD5E1", // Cinza claro dark
          },
        },

        // Cores de borda
        border: {
          light: "#E2E8F0", // Borda clara
          DEFAULT: "#CBD5E1", // Borda padrão
          dark: "#94A3B8", // Borda escura
          accent: "#1A2873", // Borda navy
          success: "#00A859", // Borda sucesso
          error: "#BD0003", // Borda erro
          dark: {
            light: "#334155", // Borda clara dark
            DEFAULT: "#475569", // Borda padrão dark
            dark: "#64748B", // Borda escura dark
          },
        },

        // Cores funcionais (mantendo compatibilidade com shadcn)
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 16px)",
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
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        wave: {
          "0%": { transform: "rotate(0.0deg)" },
          "10%": { transform: "rotate(14.0deg)" },
          "20%": { transform: "rotate(-8.0deg)" },
          "30%": { transform: "rotate(14.0deg)" },
          "40%": { transform: "rotate(-4.0deg)" },
          "50%": { transform: "rotate(10.0deg)" },
          "60%": { transform: "rotate(0.0deg)" },
          "100%": { transform: "rotate(0.0deg)" },
        },
        "ping-slow": {
          "75%, 100%": {
            transform: "scale(2)",
            opacity: "0",
          },
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
        "gradient-shift": "gradient-shift 3s ease infinite",
        wave: "wave 2s linear infinite",
        "ping-slow": "ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        // Bebas removido, agora tudo usa Inter como padrão
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "pac-gradient": "linear-gradient(135deg, #1A2873 0%, #00A859 100%)",
        "pac-gradient-dark":
          "linear-gradient(135deg, #131835 0%, #006633 100%)",
        "navy-gradient":
          "linear-gradient(135deg, #1A2873 0%, #1B2C8C 50%, #1E2759 100%)",
        "success-gradient":
          "linear-gradient(135deg, #00A859 0%, #6DCFA1 50%, #008745 100%)",
        "alert-gradient":
          "linear-gradient(135deg, #bd0003 0%, #FF3333 50%, #990002 100%)",
        "hero-pattern": "url('/images/site/hero-bg.webp')",
      },
      boxShadow: {
        "pac-sm": "0 1px 2px 0 rgba(26, 40, 115, 0.05)",
        "pac-md":
          "0 4px 6px -1px rgba(26, 40, 115, 0.1), 0 2px 4px -1px rgba(26, 40, 115, 0.06)",
        "pac-lg":
          "0 10px 15px -3px rgba(26, 40, 115, 0.1), 0 4px 6px -2px rgba(26, 40, 115, 0.05)",
        "pac-xl":
          "0 20px 25px -5px rgba(26, 40, 115, 0.1), 0 10px 10px -5px rgba(26, 40, 115, 0.04)",
        "pac-glow": "0 0 20px rgba(26, 40, 115, 0.3)",
        "success-glow": "0 0 20px rgba(0, 168, 89, 0.3)",
        "alert-glow": "0 0 20px rgba(189, 0, 3, 0.3)",
        "warning-glow": "0 0 20px rgba(255, 107, 0, 0.3)",
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
        144: "36rem",
      },
      zIndex: {
        60: "60",
        70: "70",
        80: "80",
        90: "90",
        100: "100",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;


import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['var(--font-pt-sans)', 'Inter', 'sans-serif'],
        headline: ['var(--font-poppins)', 'Inter', 'sans-serif'],
        code: ['monospace'],
        mono: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        // Warm palette REMAPPED → Electric Blue × Black
        // (keeps existing landing component Tailwind classes working)
        cream: { DEFAULT: '#07090F', alt: '#0A0F1C', surface: '#0D1525' },
        sage:  { DEFAULT: '#3B82F6', pale: 'rgba(59,130,246,0.08)' },
        terra: { DEFAULT: '#2563EB', dark: '#1D4ED8' },
        'warm-brown': { DEFAULT: '#E2EAF8' },
        'warm-gray':  { DEFAULT: '#6B7FAD' },
        'warm-border':{ DEFAULT: '#101E36' },
        // Electric Blue × Black palette
        electric: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
        },
        neon: {
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
        },
        // Kept for backward compat on landing page
        violet: {
          400: '#a78bfa',
          500: '#8B5CF6',
          600: '#7c3aed',
        },
        cobalt: {
          400: '#60a5fa',
          500: '#3B82F6',
          600: '#2563eb',
        },
        space: '#06080F',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 40%, #0EA5E9 100%)',
        'gradient-text': 'linear-gradient(110deg, #2563EB 20%, #60A5FA 45%, #38BDF8 70%, #0EA5E9 90%)',
        'aurora-mesh': 'radial-gradient(at 40% 20%, hsla(217,91%,60%,0.12) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(199,89%,48%,0.10) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(217,91%,60%,0.07) 0px, transparent 50%)',
      },
      boxShadow: {
        'glow-primary': '0 0 40px -10px rgba(37,99,235,0.5), 0 0 20px -5px rgba(14,165,233,0.3)',
        'glow-hover':   '0 0 60px -10px rgba(37,99,235,0.65), 0 0 30px -8px rgba(14,165,233,0.4)',
        'inner-glass':  'inset 0 1px 0 0 rgba(255,255,255,0.04)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        'text-shimmer': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        'shimmer-border': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'pulse-halo': {
          '0%, 100%': { boxShadow: '0 0 30px -8px rgba(37,99,235,0.55), 0 0 15px -5px rgba(14,165,233,0.35)' },
          '50%': { boxShadow: '0 0 50px -5px rgba(37,99,235,0.7), 0 0 30px -5px rgba(14,165,233,0.5)' },
        },
        'ping-soft': {
          '75%, 100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        'ticker-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'scroll': 'scroll 20s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'text-shimmer': 'text-shimmer 4s linear infinite',
        'shimmer-border': 'shimmer-border 4s ease infinite',
        'pulse-halo': 'pulse-halo 3s infinite',
        'ping-soft': 'ping-soft 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'ticker-scroll': 'ticker-scroll 40s linear infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} satisfies Config;

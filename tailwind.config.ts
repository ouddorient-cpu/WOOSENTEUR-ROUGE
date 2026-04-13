
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
        // 2026 violet × blue palette
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
        space: '#060612',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #3B82F6 100%)',
        'gradient-text': 'linear-gradient(110deg, #8B5CF6 20%, #a78bfa 45%, #60a5fa 70%, #3B82F6 90%)',
        'aurora-mesh': 'radial-gradient(at 40% 20%, hsla(258,90%,66%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(217,90%,60%,0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(258,90%,66%,0.1) 0px, transparent 50%)',
      },
      boxShadow: {
        'glow-primary': '0 0 40px -10px rgba(139,92,246,0.4), 0 0 20px -5px rgba(59,130,246,0.25)',
        'glow-hover': '0 0 60px -10px rgba(139,92,246,0.55), 0 0 30px -8px rgba(59,130,246,0.35)',
        'inner-glass': 'inset 0 1px 0 0 rgba(255,255,255,0.06)',
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
          '0%, 100%': { boxShadow: '0 0 30px -8px rgba(139,92,246,0.5), 0 0 15px -5px rgba(59,130,246,0.3)' },
          '50%': { boxShadow: '0 0 50px -5px rgba(139,92,246,0.65), 0 0 30px -5px rgba(59,130,246,0.45)' },
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

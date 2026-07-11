/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['ABCDiatypeArabic', 'Rubik', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Neutral ramp
        ink: {
          50: '#f8f9fa',
          100: '#f1f3f5',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#868e96',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
          950: '#0d0f10',
        },
        // Primary — deep teal
        brand: {
          50: '#eefcf6',
          100: '#d4f7e8',
          200: '#abedd3',
          300: '#75ddb9',
          400: '#3fc39b',
          500: '#1ba882',
          600: '#0d8769',
          700: '#0a6c55',
          800: '#0a5645',
          900: '#094838',
          950: '#01271f',
        },
        // Accent — amber for highlights
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(0,0,0,0.04), 0 1px 3px 0 rgba(0,0,0,0.06)',
        cardHover: '0 4px 12px 0 rgba(0,0,0,0.08)',
        pop: '0 8px 24px -4px rgba(0,0,0,0.12), 0 4px 8px -2px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        xl: '10px',
        '2xl': '14px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.15s ease-out',
        'slide-up': 'slide-up 0.2s ease-out',
        'slide-in': 'slide-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
};

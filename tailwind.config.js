/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'media',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Define a consistent color palette
        primary: {
          DEFAULT: 'rgb(var(--color-primary))',
          foreground: 'rgb(var(--color-primary-foreground))',
        },
        secondary: {
          DEFAULT: 'rgb(var(--color-secondary))',
          foreground: 'rgb(var(--color-secondary-foreground))',
        },
        error: {
          DEFAULT: 'rgb(var(--color-error))',
          foreground: 'rgb(var(--color-error-foreground))',
        },
        success: {
          DEFAULT: 'rgb(var(--color-success))',
          foreground: 'rgb(var(--color-success-foreground))',
        },
        background: {
          DEFAULT: 'rgb(var(--color-background))',
        },
        text: {
          DEFAULT: 'rgb(var(--color-text))',
        },
        input: 'rgb(var(--color-input))',
        ring: 'rgb(var(--color-ring))',
        'muted-foreground': 'rgb(var(--color-muted-foreground))',
        accent: {
          DEFAULT: 'rgb(var(--color-accent))',
          foreground: 'rgb(var(--color-accent-foreground))',
        },
      },
    },
  },
  plugins: [],
};

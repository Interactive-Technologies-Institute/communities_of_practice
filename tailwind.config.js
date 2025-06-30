import plugin from '@tailwindcss/typography';
import { fontFamily } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
const config = {
	darkMode: ['class'],
	content: ['./src/**/*.{html,js,svelte,ts}'],
	safelist: ['dark'],
	plugins: [plugin],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
				border: 'hsl(var(--border) / <alpha-value>)',
				input: 'hsl(var(--input) / <alpha-value>)',
				ring: 'hsl(var(--ring) / <alpha-value>)',
				background: 'hsl(var(--background) / <alpha-value>)',
				foreground: 'hsl(var(--foreground) / <alpha-value>)',
				primary: {
					DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
					foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
					foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
					foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
				},
				success: {
					DEFAULT: 'hsl(var(--success) / <alpha-value>)',
					foreground: 'hsl(var(--success-foreground) / <alpha-value>)',
				},
				warning: {
					DEFAULT: 'hsl(var(--warning) / <alpha-value>)',
					foreground: 'hsl(var(--warning-foreground) / <alpha-value>)',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
					foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
					foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
					foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
				},
				card: {
					DEFAULT: 'hsl(var(--card) / <alpha-value>)',
					foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			fontFamily: {
				sans: ['InterVariable', ...fontFamily.sans],
			},
			typography: {
				DEFAULT: {
					css: {
						'--tw-prose-body': "theme('colors.foreground')",
						'--tw-prose-headings': "theme('colors.foreground')",
						'--tw-prose-lead': "theme('colors.foreground')",
						'--tw-prose-links': "theme('colors.foreground')",
						'--tw-prose-bold': "theme('colors.foreground')",
						'--tw-prose-counters': "theme('colors.muted.foreground')",
						'--tw-prose-bullets': "theme('colors.foreground')",
						'--tw-prose-hr': "theme('colors.foreground')",
						'--tw-prose-quotes': "theme('colors.foreground')",
						'--tw-prose-quote-borders': "theme('colors.foreground')",
						'--tw-prose-captions': "theme('colors.foreground')",
						'--tw-prose-code': "theme('colors.foreground')",
						'--tw-prose-pre-code': "theme('colors.foreground')",
						'--tw-prose-pre-bg': "theme('colors.foreground')",
						'--tw-prose-th-borders': "theme('colors.foreground')",
						'--tw-prose-td-borders': "theme('colors.foreground')",
						'--tw-prose-invert-body': "theme('colors.foreground')",
						'--tw-prose-invert-headings': "theme('colors.foreground')",
						'--tw-prose-invert-lead': "theme('colors.foreground')",
						'--tw-prose-invert-links': "theme('colors.foreground')",
						'--tw-prose-invert-bold': "theme('colors.foreground')",
						'--tw-prose-invert-counters': "theme('colors.foreground')",
						'--tw-prose-invert-bullets': "theme('colors.foreground')",
						'--tw-prose-invert-hr': "theme('colors.foreground')",
						'--tw-prose-invert-quotes': "theme('colors.foreground')",
						'--tw-prose-invert-quote-borders': "theme('colors.foreground')",
						'--tw-prose-invert-captions': "theme('colors.foreground')",
						'--tw-prose-invert-code': "theme('colors.foreground')",
						'--tw-prose-invert-pre-code': "theme('colors.foreground')",
						'--tw-prose-invert-pre-bg': "theme('colors.foreground')",
						'--tw-prose-invert-th-borders': "theme('colors.foreground')",
						'--tw-prose-invert-td-borders': "theme('colors.foreground')",
					},
				},
			},
		},
	},
};

export default config;

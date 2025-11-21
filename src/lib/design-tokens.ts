/**
 * JACXI Shipping Design System Tokens
 * Premium, enterprise-grade design tokens for luxury vehicle shipping
 */

// =============================================================================
// COLORS - JACXI BRAND PALETTE
// =============================================================================

export const colors = {
	brand: {
		accent: '#D4AF37',
		background: '#F9FAFB',
		panel: '#E4E9F0',
		textPrimary: '#1C1C1E',
		textSecondary: '#5F6368',
		border: '#E0E0E0',
	},
	semantic: {
		success: {
			50: '#F9FAFB',
			100: '#E4E9F0',
			200: '#E4E9F0',
			500: '#D4AF37',
			600: '#D4AF37',
			700: '#D4AF37',
			900: '#1C1C1E',
		},
		warning: {
			50: '#F9FAFB',
			100: '#E4E9F0',
			200: '#E4E9F0',
			500: '#D4AF37',
			600: '#D4AF37',
			700: '#D4AF37',
			900: '#1C1C1E',
		},
		error: {
			50: '#FEE2E2',
			100: '#FECACA',
			200: '#FCA5A5',
			500: '#EF4444',
			600: '#DC2626',
			700: '#B91C1C',
			900: '#7F1D1D',
		},
		info: {
			50: '#F9FAFB',
			100: '#E4E9F0',
			200: '#E0E0E0',
			500: '#5F6368',
			600: '#1C1C1E',
			700: '#1C1C1E',
			900: '#1C1C1E',
		},
	},
	shipping: {
		'quote-requested': { bg: '#F9FAFB', text: '#1C1C1E', border: '#E0E0E0' },
		'quote-approved': { bg: '#E4E9F0', text: '#1C1C1E', border: '#E0E0E0' },
		'pickup-scheduled': { bg: '#F9FAFB', text: '#5F6368', border: '#E0E0E0' },
		'picked-up': { bg: '#F9FAFB', text: '#1C1C1E', border: '#E0E0E0' },
		'in-transit': { bg: '#E4E9F0', text: '#1C1C1E', border: '#E0E0E0' },
		'at-port': { bg: '#F9FAFB', text: '#1C1C1E', border: '#E0E0E0' },
		'customs-clearance': { bg: '#E4E9F0', text: '#5F6368', border: '#E0E0E0' },
		'out-for-delivery': { bg: '#F9FAFB', text: '#1C1C1E', border: '#E0E0E0' },
		'delivered': { bg: '#E4E9F0', text: '#1C1C1E', border: '#E0E0E0' },
		'delayed': { bg: '#FEE2E2', text: '#B91C1C', border: '#EF4444' },
		'cancelled': { bg: '#F9FAFB', text: '#5F6368', border: '#E0E0E0' },
	},
	neutral: {
		50: '#F9FAFB',
		100: '#F2F4F6',
		200: '#E4E9F0',
		300: '#E0E0E0',
		400: '#C5C5C5',
		500: '#9E9E9E',
		600: '#7A7A7A',
		700: '#5F6368',
		800: '#3A3A3C',
		900: '#1C1C1E',
	},
	light: {
		background: {
			primary: '#F9FAFB',
			secondary: '#F9FAFB',
			tertiary: '#E4E9F0',
			card: '#FFFFFF',
			overlay: '#F9FAFB',
		},
		surface: {
			elevated: '#FFFFFF',
			card: '#FFFFFF',
			overlay: '#F9FAFB',
		},
		text: {
			primary: '#1C1C1E',
			secondary: '#5F6368',
			tertiary: '#5F6368',
			muted: '#5F6368',
		},
	},
	dark: {
		background: {
			primary: '#1C1C1E',
			secondary: '#1C1C1E',
			tertiary: '#1C1C1E',
			card: '#1C1C1E',
			overlay: '#1C1C1E',
		},
		surface: {
			elevated: '#1C1C1E',
			card: '#1C1C1E',
			overlay: '#1C1C1E',
		},
		text: {
			primary: '#F9FAFB',
			secondary: '#E4E9F0',
			tertiary: '#E4E9F0',
			muted: '#E4E9F0',
		},
	},
} as const;

// =============================================================================
// TYPOGRAPHY - JACXI BRAND HIERARCHY
// =============================================================================

export const typography = {
  fontFamily: {
    primary: ['Inter', 'system-ui', 'sans-serif'],
    heading: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
    // Future: Add custom JACXI font when available
  },

  fontSize: {
    // Display sizes - Hero and major headings
    'display-xs': ['2.5rem', { lineHeight: '3rem', fontWeight: '700', letterSpacing: '-0.025em' }],
    'display-sm': ['3rem', { lineHeight: '3.5rem', fontWeight: '700', letterSpacing: '-0.025em' }],
    'display-md': ['3.5rem', { lineHeight: '4rem', fontWeight: '700', letterSpacing: '-0.025em' }],
    'display-lg': ['4.5rem', { lineHeight: '5rem', fontWeight: '700', letterSpacing: '-0.025em' }],
    'display-xl': ['5.5rem', { lineHeight: '6rem', fontWeight: '700', letterSpacing: '-0.025em' }],
    'display-2xl': ['7rem', { lineHeight: '7.5rem', fontWeight: '700', letterSpacing: '-0.025em' }],

    // Heading sizes - Section and component headers
    'heading-xs': ['1.375rem', { lineHeight: '1.75rem', fontWeight: '600', letterSpacing: '-0.01em' }],
    'heading-sm': ['1.5rem', { lineHeight: '2rem', fontWeight: '600', letterSpacing: '-0.01em' }],
    'heading-md': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '600', letterSpacing: '-0.01em' }],
    'heading-lg': ['2.25rem', { lineHeight: '2.75rem', fontWeight: '600', letterSpacing: '-0.01em' }],
    'heading-xl': ['3rem', { lineHeight: '3.5rem', fontWeight: '600', letterSpacing: '-0.01em' }],
    'heading-2xl': ['3.75rem', { lineHeight: '4.5rem', fontWeight: '700', letterSpacing: '-0.01em' }],

    // Body sizes - Content and descriptions
    'body-xs': ['0.8125rem', { lineHeight: '1.125rem', fontWeight: '400', letterSpacing: '0.01em' }],
    'body-sm': ['0.9375rem', { lineHeight: '1.375rem', fontWeight: '400', letterSpacing: '0.01em' }],
    'body-md': ['1rem', { lineHeight: '1.5rem', fontWeight: '400', letterSpacing: '0.01em' }],
    'body-lg': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '400', letterSpacing: '0.01em' }],
    'body-xl': ['1.25rem', { lineHeight: '1.875rem', fontWeight: '400', letterSpacing: '0.01em' }],

    // UI sizes - Buttons, labels, inputs
    'ui-xs': ['0.75rem', { lineHeight: '1rem', fontWeight: '500', letterSpacing: '0.025em' }],
    'ui-sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500', letterSpacing: '0.025em' }],
    'ui-md': ['1rem', { lineHeight: '1.5rem', fontWeight: '500', letterSpacing: '0.025em' }],
    'ui-lg': ['1.125rem', { lineHeight: '1.5rem', fontWeight: '600', letterSpacing: '0.025em' }],
  },

  fontWeight: {
    thin: '100',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// =============================================================================
// SPACING - JACXI SYSTEMATIC SCALE
// =============================================================================

export const spacing = {
  // Base scale (4px increments) - Professional and clean
  0: '0',
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  32: '8rem',      // 128px

  // Section spacing - Generous for premium feel
  section: {
    xs: '2.5rem',  // 40px - Small sections
    sm: '4rem',    // 64px - Medium sections
    md: '6rem',    // 96px - Large sections
    lg: '8rem',    // 128px - Hero sections
    xl: '12rem',   // 192px - Major sections
  },

  // Container spacing - Balanced for content
  container: {
    xs: '1rem',    // Mobile
    sm: '1.5rem',  // Small screens
    md: '2rem',    // Medium screens
    lg: '2.5rem',  // Large screens
    xl: '3rem',    // Extra large screens
  },
} as const;

// =============================================================================
// BORDER RADIUS - JACXI REFINED CURVES
// =============================================================================

export const borderRadius = {
  none: '0',
  xs: '0.125rem',   // 2px - Sharp
  sm: '0.25rem',    // 4px - Subtle
  md: '0.375rem',   // 6px - Balanced
  lg: '0.5rem',     // 8px - Soft
  xl: '0.75rem',    // 12px - Rounded
  '2xl': '1rem',    // 16px - Very rounded
  '3xl': '1.5rem',  // 24px - Pill-like
  full: '9999px',   // Fully rounded - Premium feel
} as const;

// =============================================================================
// SHADOWS - JACXI DEPTH & ELEVATION
// =============================================================================

export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',

  // Brand-colored shadows - JACXI signature
  brand: {
    cyan: '0 4px 14px 0 rgb(0 191 255 / 0.25)',
    cyanSoft: '0 2px 8px 0 rgb(0 191 255 / 0.15)',
    gold: '0 4px 14px 0 rgb(212 175 55 / 0.25)',
    goldSoft: '0 2px 8px 0 rgb(212 175 55 / 0.15)',
    navy: '0 4px 14px 0 rgb(10 31 68 / 0.25)',
    navySoft: '0 2px 8px 0 rgb(10 31 68 / 0.15)',
  },

  // Inner shadows for depth
  inner: {
    sm: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    lg: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.1)',
  },

  // Glowing effects - Tech premium
  glow: {
    cyan: '0 0 20px rgb(0 191 255 / 0.3)',
    gold: '0 0 20px rgb(212 175 55 / 0.3)',
    navy: '0 0 20px rgb(10 31 68 / 0.3)',
  },
} as const;

// =============================================================================
// GLASS MORPHISM - JACXI MODERN EFFECTS
// =============================================================================

export const glass = {
  subtle: 'backdrop-blur-sm bg-white/5 border border-white/10',
  medium: 'backdrop-blur-md bg-white/10 border border-white/20',
  strong: 'backdrop-blur-lg bg-white/20 border border-white/30',
  premium: 'backdrop-blur-xl bg-white/30 border border-white/40',

  // Dark variants - JACXI dark mode
  'dark-subtle': 'backdrop-blur-sm bg-black/5 border border-white/5',
  'dark-medium': 'backdrop-blur-md bg-black/10 border border-white/10',
  'dark-strong': 'backdrop-blur-lg bg-black/20 border border-white/20',
  'dark-premium': 'backdrop-blur-xl bg-black/30 border border-white/30',

  // Brand-colored glass
  'brand-cyan': 'backdrop-blur-md bg-brand-cyan/5 border border-brand-cyan/20',
  'brand-gold': 'backdrop-blur-md bg-brand-gold/5 border border-brand-gold/20',
  'brand-navy': 'backdrop-blur-md bg-brand-navy/5 border border-brand-navy/20',
} as const;

// =============================================================================
// ANIMATIONS - JACXI SMOOTH MOTIONS
// =============================================================================

export const animations = {
  duration: {
    instant: '0ms',
    fastest: '75ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
    slowest: '1000ms',
  },

  easing: {
    linear: 'linear',
    in: 'ease-in',
    out: 'ease-out',
    inOut: 'ease-in-out',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    premium: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    luxury: 'cubic-bezier(0.23, 1, 0.32, 1)',
  },

  keyframes: {
    'fade-in-up': {
      '0%': { opacity: '0', transform: 'translateY(1rem)' },
      '100%': { opacity: '1', transform: 'translateY(0)' },
    },
    'fade-in-down': {
      '0%': { opacity: '0', transform: 'translateY(-1rem)' },
      '100%': { opacity: '1', transform: 'translateY(0)' },
    },
    'fade-in-left': {
      '0%': { opacity: '0', transform: 'translateX(-1rem)' },
      '100%': { opacity: '1', transform: 'translateX(0)' },
    },
    'fade-in-right': {
      '0%': { opacity: '0', transform: 'translateX(1rem)' },
      '100%': { opacity: '1', transform: 'translateX(0)' },
    },
    'scale-in': {
      '0%': { opacity: '0', transform: 'scale(0.95)' },
      '100%': { opacity: '1', transform: 'scale(1)' },
    },
    'slide-in-up': {
      '0%': { opacity: '0', transform: 'translateY(2rem)' },
      '100%': { opacity: '1', transform: 'translateY(0)' },
    },
    shimmer: {
      '0%': { transform: 'translateX(-100%)' },
      '100%': { transform: 'translateX(100%)' },
    },
    pulse: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' },
    },
    'float': {
      '0%, 100%': { transform: 'translateY(0px)' },
      '50%': { transform: 'translateY(-4px)' },
    },
  },
} as const;

// =============================================================================
// BREAKPOINTS - JACXI RESPONSIVE DESIGN
// =============================================================================

export const breakpoints = {
  xs: '475px',   // Extra small devices
  sm: '640px',   // Small tablets and large phones
  md: '768px',   // Medium tablets
  lg: '1024px',  // Small laptops and desktops
  xl: '1280px',  // Large laptops and desktops
  '2xl': '1536px', // Extra large screens
} as const;

// =============================================================================
// Z-INDEX SCALE - JACXI LAYER MANAGEMENT
// =============================================================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070,
  overlay: 1080,
  highest: 9999,
} as const;

// =============================================================================
// COMPONENT SIZES - JACXI CONSISTENT DIMENSIONS
// =============================================================================

export const componentSizes = {
  button: {
    xs: 'h-7 px-2 text-ui-xs',
    sm: 'h-8 px-3 text-ui-sm',
    md: 'h-10 px-4 text-ui-md',
    lg: 'h-12 px-6 text-ui-lg',
    xl: 'h-14 px-8 text-body-lg',
    icon: 'h-10 w-10',
    'icon-sm': 'h-8 w-8',
    'icon-lg': 'h-12 w-12',
  },

  input: {
    xs: 'h-7 px-2 text-ui-xs',
    sm: 'h-8 px-3 text-ui-sm',
    md: 'h-10 px-4 text-ui-md',
    lg: 'h-12 px-4 text-body-md',
    xl: 'h-14 px-4 text-body-lg',
  },

  card: {
    padding: {
      xs: 'p-3',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
    },
  },

  // JACXI-specific component sizes
  shipmentCard: {
    height: 'h-auto min-h-[200px]',
    borderRadius: 'rounded-xl',
  },

  navBar: {
    height: 'h-16',
    mobileHeight: 'h-14',
  },

  hero: {
    minHeight: 'min-h-[90vh] lg:min-h-screen',
  },
} as const;

// =============================================================================
// STATUS COLORS - JACXI SHIPMENT STATUS SYSTEM
// =============================================================================

export const statusColors = {
  shipment: {
    'quote-requested': { bg: colors.shipping['quote-requested'].bg, text: colors.shipping['quote-requested'].text, border: colors.shipping['quote-requested'].border },
    'quote-approved': { bg: colors.shipping['quote-approved'].bg, text: colors.shipping['quote-approved'].text, border: colors.shipping['quote-approved'].border },
    'pickup-scheduled': { bg: colors.shipping['pickup-scheduled'].bg, text: colors.shipping['pickup-scheduled'].text, border: colors.shipping['pickup-scheduled'].border },
    'picked-up': { bg: colors.shipping['picked-up'].bg, text: colors.shipping['picked-up'].text, border: colors.shipping['picked-up'].border },
    'in-transit': { bg: colors.shipping['in-transit'].bg, text: colors.shipping['in-transit'].text, border: colors.shipping['in-transit'].border },
    'at-port': { bg: colors.shipping['at-port'].bg, text: colors.shipping['at-port'].text, border: colors.shipping['at-port'].border },
    'customs-clearance': { bg: colors.shipping['customs-clearance'].bg, text: colors.shipping['customs-clearance'].text, border: colors.shipping['customs-clearance'].border },
    'out-for-delivery': { bg: colors.shipping['out-for-delivery'].bg, text: colors.shipping['out-for-delivery'].text, border: colors.shipping['out-for-delivery'].border },
    'delivered': { bg: colors.shipping['delivered'].bg, text: colors.shipping['delivered'].text, border: colors.shipping['delivered'].border },
    'delayed': { bg: colors.shipping['delayed'].bg, text: colors.shipping['delayed'].text, border: colors.shipping['delayed'].border },
    'cancelled': { bg: colors.shipping['cancelled'].bg, text: colors.shipping['cancelled'].text, border: colors.shipping['cancelled'].border },
  },
} as const;

// =============================================================================
// BRAND-SPECIFIC UTILITIES
// =============================================================================

export const brandUtils = {
  // Gradient backgrounds
  gradients: {
    primary: 'bg-gradient-to-br from-brand-navy to-brand-navy-light',
    secondary: 'bg-gradient-to-br from-brand-cyan to-brand-cyan-dark',
    accent: 'bg-gradient-to-br from-brand-gold to-brand-gold-dark',
    premium: 'bg-gradient-to-br from-brand-navy via-brand-cyan to-brand-gold',
  },

  // Brand-specific effects
  effects: {
    glow: 'shadow-lg shadow-brand-cyan/25',
    premiumGlow: 'shadow-xl shadow-brand-gold/20',
    techGlow: 'shadow-lg shadow-brand-navy/30',
  },

  // Premium spacing for luxury feel
  spacing: {
    premium: 'space-y-8 lg:space-y-12',
    luxury: 'space-y-12 lg:space-y-16',
  },

  // JACXI-specific animations
  animations: {
    entrance: 'animate-fade-in-up',
    luxuryEntrance: 'animate-slide-in-up',
    interactive: 'transition-all duration-300 ease-premium',
  },
} as const;

// =============================================================================
// EXPORT ALL TOKENS
// =============================================================================

export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  glass,
  animations,
  breakpoints,
  zIndex,
  componentSizes,
  statusColors,
  brandUtils,
} as const;

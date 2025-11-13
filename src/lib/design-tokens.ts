/**
 * JACXI Shipping Design System Tokens
 * Premium, enterprise-grade design tokens for luxury vehicle shipping
 */

// =============================================================================
// COLORS - JACXI BRAND PALETTE
// =============================================================================

export const colors = {
  // JACXI Brand Colors - Luxury Corporate Theme
  brand: {
    // Primary Navy - Trust, Stability, Professionalism
    navy: '#0A1F44',      // Royal Navy - Primary brand color
    'navy-light': '#1E3A5F', // Lighter navy for hover states
    'navy-lighter': '#2E4A6F', // Even lighter for backgrounds
    'navy-dark': '#07152F',  // Darker navy for accents
    'navy-darker': '#050F1F', // Darkest navy for deep backgrounds

    // Secondary Cyan - Technology, Speed, Reliability
    cyan: '#00BFFF',       // Electric Cyan - Tech accent
    'cyan-light': '#4DD0E1', // Light cyan for highlights
    'cyan-lighter': '#87E4F0', // Very light cyan for backgrounds
    'cyan-dark': '#0099CC',  // Dark cyan for hover states
    'cyan-darker': '#007399', // Very dark cyan for text

    // Tertiary Gold - Premium, Luxury, Success
    gold: '#D4AF37',       // Antique Gold - Premium accent
    'gold-light': '#E5C158', // Light gold for highlights
    'gold-lighter': '#F0D890', // Very light gold for backgrounds
    'gold-dark': '#B8942A',  // Dark gold for hover states
    'gold-darker': '#9C7A1F', // Very dark gold for text

    // Neutral Charcoal - Sophistication, Balance
    charcoal: '#2B2E34',   // Charcoal Gray - Secondary dark
    'charcoal-light': '#404040', // Light charcoal
    'charcoal-lighter': '#5A5A5A', // Very light charcoal

    // Clean White - Purity, Trust
    white: '#F8F9FA',      // Platinum White
    'white-off': '#E9ECEF', // Off-white for backgrounds
    'white-pure': '#FFFFFF', // Pure white for accents
  },

  // Semantic Colors - Status & States (Shipping-Specific)
  semantic: {
    success: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      500: '#10B981',
      600: '#059669',
      700: '#047857',
      900: '#064E3B',
    },
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      900: '#78350F',
    },
    error: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
      900: '#7F1D1D',
    },
    info: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      900: '#1E3A8A',
    },
  },

  // Shipping Status Colors - Custom for JACXI
  shipping: {
    'quote-requested': { bg: '#EFF6FF', text: '#1E40AF', border: '#3B82F6' },
    'quote-approved': { bg: '#ECFDF5', text: '#065F46', border: '#10B981' },
    'pickup-scheduled': { bg: '#F3F4F6', text: '#374151', border: '#6B7280' },
    'picked-up': { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' },
    'in-transit': { bg: '#EFF6FF', text: '#1E40AF', border: '#3B82F6' },
    'at-port': { bg: '#F3E8FF', text: '#7C2D92', border: '#C084FC' },
    'customs-clearance': { bg: '#FFF7ED', text: '#9A3412', border: '#FB923C' },
    'out-for-delivery': { bg: '#ECFDF5', text: '#065F46', border: '#10B981' },
    'delivered': { bg: '#D1FAE5', text: '#047857', border: '#059669' },
    'delayed': { bg: '#FEF2F2', text: '#991B1B', border: '#EF4444' },
    'cancelled': { bg: '#F9FAFB', text: '#6B7280', border: '#9CA3AF' },
  },

  // Neutral Grays - Professional Scale
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Light Theme Specific - JACXI Light Mode
  light: {
    background: {
      primary: '#FFFFFF',
      secondary: '#F8F9FA',
      tertiary: '#E9ECEF',
      card: '#FFFFFF',
      overlay: '#F8F9FA',
    },
    surface: {
      elevated: '#FFFFFF',
      card: '#FFFFFF',
      overlay: '#F8F9FA',
    },
    text: {
      primary: '#0A1F44',
      secondary: '#2B2E34',
      tertiary: '#404040',
      muted: '#6B7280',
    },
  },

  // Dark Theme Specific - JACXI Dark Mode
  dark: {
    background: {
      primary: '#0A0A0A',
      secondary: '#1A1A1A',
      tertiary: '#2A2A2A',
      card: '#1F1F1F',
      overlay: '#333333',
    },
    surface: {
      elevated: '#262626',
      card: '#2A2A2A',
      overlay: '#404040',
    },
    text: {
      primary: '#F8F9FA',
      secondary: '#E9ECEF',
      tertiary: '#CED4DA',
      muted: '#6C757D',
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

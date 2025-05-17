/**
 * Game Design System
 * 
 * This file contains the foundational design elements for the Game application.
 * - Color palette
 * - Typography
 * - Spacing
 * - Shadow styles
 * - Animation effects
 * - Button styles
 */

// Color Palette
export const colors = {
  // Primary color - Used for primary actions, navigation, featured elements
  primary: {
    50: '#f0f7ff',
    100: '#e0efff',
    200: '#c7e0ff',
    300: '#a0c7fe',
    400: '#75a6fc',
    500: '#4b83f7',
    600: '#2e61ea',
    700: '#254bd4',
    800: '#2440ac',
    900: '#233a87',
    950: '#172252',
  },
  
  // Secondary color - Used for secondary actions, less emphasized elements
  secondary: {
    50: '#f5f3ff',
    100: '#ebe7ff',
    200: '#d9d2fe',
    300: '#bcb1fd',
    400: '#9c87fa',
    500: '#7c5ff5',
    600: '#6e42ea',
    700: '#5d31cd',
    800: '#4d29a8',
    900: '#402587',
    950: '#271656',
  },
  
  // Accent color - Used for highlights, notifications, special features
  accent: {
    50: '#fff2f0',
    100: '#ffe1dc',
    200: '#ffc7bc',
    300: '#ffa28e',
    400: '#ff7459',
    500: '#ff472a',
    600: '#fc2b0c',
    700: '#d91e05',
    800: '#b21c0a',
    900: '#931d0d',
    950: '#500c05',
  },
  
  // Success color - Used for successful actions, validation
  success: {
    50: '#eefbf2',
    100: '#d6f5e1',
    200: '#b0eccc',
    300: '#7cdeac',
    400: '#49c886',
    500: '#25ad6b',
    600: '#188c56',
    700: '#147047',
    800: '#12593a',
    900: '#104a32',
    950: '#052919',
  },
  
  // Danger color - Used for errors, dangerous actions
  danger: {
    50: '#fff1f2',
    100: '#ffe1e3',
    200: '#ffc8cc',
    300: '#ffa0a8',
    400: '#ff6b78',
    500: '#f73a4e',
    600: '#e11a31',
    700: '#bd0f26',
    800: '#9c1124',
    900: '#821425',
    950: '#47040e',
  },
  
  // Warning color - Used for warnings, cautionary actions
  warning: {
    50: '#fffaeb',
    100: '#fef0c7',
    200: '#fee289',
    300: '#fdd14a',
    400: '#fbba15',
    500: '#f29e05',
    600: '#d47a02',
    700: '#ab5605',
    800: '#8b430c',
    900: '#723a10',
    950: '#411c06',
  },
  
  // Neutral color - Used for text, backgrounds, borders
  neutral: {
    50: '#f8f9fa',
    100: '#eef1f3',
    200: '#dde3e8',
    300: '#c6cdd5',
    400: '#a3afbd',
    500: '#8696a7',
    600: '#6c7c8e',
    700: '#5a6674',
    800: '#404650',
    900: '#2d3238',
    950: '#1a1d21',
  },
  
  // Rich dark colors for background gradients
  dark: {
    blue: '#0a1128',
    purple: '#2d004c',
    teal: '#004440',
    charcoal: '#1c1c1c',
  },
  
  // Special patterns/gradients
  gradient: {
    bluePurple: 'linear-gradient(to right, #4b83f7, #7c5ff5)',
    purplePink: 'linear-gradient(to right, #7c5ff5, #db49ab)',
    orangeRed: 'linear-gradient(to right, #f29e05, #ff472a)',
    greenTeal: 'linear-gradient(to right, #25ad6b, #10b8cc)',
    darkBlue: 'linear-gradient(135deg, #172252, #0a1128)',
    darkPurple: 'linear-gradient(135deg, #271656, #2d004c)',
  }
};

// Typography
export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    display: 'Poppins, system-ui, -apple-system, sans-serif',
    mono: 'Roboto Mono, monospace',
  },
  fontSize: {
    '2xs': '0.625rem',     // 10px
    xs: '0.75rem',         // 12px
    sm: '0.875rem',        // 14px
    base: '1rem',          // 16px
    md: '1.125rem',        // 18px
    lg: '1.25rem',         // 20px
    xl: '1.5rem',          // 24px
    '2xl': '1.875rem',     // 30px
    '3xl': '2.25rem',      // 36px
    '4xl': '3rem',         // 48px
    '5xl': '3.75rem',      // 60px
  },
  fontWeight: {
    thin: '100',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
};

// Spacing system (in px values, used with rem in the actual CSS)
export const spacing = {
  '0': '0',
  '0.5': '0.125rem',      // 2px
  '1': '0.25rem',         // 4px
  '2': '0.5rem',          // 8px
  '3': '0.75rem',         // 12px
  '4': '1rem',            // 16px
  '5': '1.25rem',         // 20px
  '6': '1.5rem',          // 24px
  '8': '2rem',            // 32px
  '10': '2.5rem',         // 40px
  '12': '3rem',           // 48px
  '16': '4rem',           // 64px
  '20': '5rem',           // 80px
  '24': '6rem',           // 96px
  '32': '8rem',           // 128px
  '40': '10rem',          // 160px
  '48': '12rem',          // 192px
  '56': '14rem',          // 224px
  '64': '16rem',          // 256px
};

// Shadow styles
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  outline: '0 0 0 3px rgba(66, 153, 225, 0.5)',
  raised: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  floating: '0 8px 30px rgba(0, 0, 0, 0.12)',
  // Special game-themed shadows
  glow: {
    primary: '0 0 15px rgba(75, 131, 247, 0.5)',
    secondary: '0 0 15px rgba(124, 95, 245, 0.5)',
    accent: '0 0 15px rgba(255, 71, 42, 0.5)',
    success: '0 0 15px rgba(37, 173, 107, 0.5)',
  },
};

// Border radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',      // 2px
  md: '0.375rem',      // 6px
  lg: '0.5rem',        // 8px
  xl: '0.75rem',       // 12px
  '2xl': '1rem',       // 16px
  '3xl': '1.5rem',     // 24px
  full: '9999px',
};

// Z-index scale
export const zIndex = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  auto: 'auto',
  // Application specific layers
  header: '100',
  modal: '200',
  tooltip: '300',
  notification: '400',
};

// Animation durations
export const animation = {
  duration: {
    fastest: '75ms',
    faster: '100ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '400ms',
    slowest: '500ms',
  },
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  keyframes: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    fadeOut: {
      from: { opacity: 1 },
      to: { opacity: 0 },
    },
    scaleIn: {
      from: { transform: 'scale(0.95)' },
      to: { transform: 'scale(1)' },
    },
    slideInUp: {
      from: { transform: 'translateY(10px)' },
      to: { transform: 'translateY(0)' },
    },
    pulse: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },
  },
};

// Common button styles
export const buttons = {
  base: {
    borderRadius: borderRadius['lg'],
    fontWeight: typography.fontWeight.medium,
    transition: 'all 150ms ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    bg: colors.primary[600],
    color: 'white',
    hoverBg: colors.primary[700],
    activeBg: colors.primary[800],
    focusRing: `0 0 0 3px ${colors.primary[200]}`,
  },
  secondary: {
    bg: colors.secondary[600],
    color: 'white',
    hoverBg: colors.secondary[700],
    activeBg: colors.secondary[800],
    focusRing: `0 0 0 3px ${colors.secondary[200]}`,
  },
  accent: {
    bg: colors.accent[600],
    color: 'white',
    hoverBg: colors.accent[700],
    activeBg: colors.accent[800],
    focusRing: `0 0 0 3px ${colors.accent[200]}`,
  },
  success: {
    bg: colors.success[600],
    color: 'white',
    hoverBg: colors.success[700],
    activeBg: colors.success[800],
    focusRing: `0 0 0 3px ${colors.success[200]}`,
  },
  danger: {
    bg: colors.danger[600],
    color: 'white',
    hoverBg: colors.danger[700],
    activeBg: colors.danger[800],
    focusRing: `0 0 0 3px ${colors.danger[200]}`,
  },
  warning: {
    bg: colors.warning[600],
    color: 'white',
    hoverBg: colors.warning[700],
    activeBg: colors.warning[800],
    focusRing: `0 0 0 3px ${colors.warning[200]}`,
  },
  outline: {
    bg: 'transparent',
    color: colors.neutral[800],
    border: `1px solid ${colors.neutral[300]}`,
    hoverBg: colors.neutral[50],
    activeBg: colors.neutral[100],
    focusRing: `0 0 0 3px ${colors.neutral[200]}`,
  },
  ghost: {
    bg: 'transparent',
    color: colors.neutral[700],
    hoverBg: colors.neutral[100],
    activeBg: colors.neutral[200],
    focusRing: `0 0 0 3px ${colors.neutral[200]}`,
  },
  sizes: {
    xs: {
      fontSize: typography.fontSize.xs,
      padding: `${spacing['1']} ${spacing['2']}`,
      height: spacing['6'],
    },
    sm: {
      fontSize: typography.fontSize.sm,
      padding: `${spacing['1.5']} ${spacing['3']}`,
      height: spacing['8'],
    },
    md: {
      fontSize: typography.fontSize.base,
      padding: `${spacing['2']} ${spacing['4']}`,
      height: spacing['10'],
    },
    lg: {
      fontSize: typography.fontSize.lg,
      padding: `${spacing['2.5']} ${spacing['6']}`,
      height: spacing['12'],
    },
    xl: {
      fontSize: typography.fontSize.xl,
      padding: `${spacing['3']} ${spacing['8']}`,
      height: spacing['16'],
    },
  },
};

// Game-specific styles
export const gameStyles = {
  roles: {
    King: {
      color: colors.warning[600],
      bgLight: colors.warning[50],
      bg: colors.warning[600],
      gradient: 'linear-gradient(to right, #f29e05, #fbba15)',
      icon: '👑',
    },
    Queen: {
      color: colors.secondary[600],
      bgLight: colors.secondary[50],
      bg: colors.secondary[600],
      gradient: 'linear-gradient(to right, #6e42ea, #9c87fa)',
      icon: '👸',
    },
    Police: {
      color: colors.primary[600],
      bgLight: colors.primary[50],
      bg: colors.primary[600],
      gradient: 'linear-gradient(to right, #2e61ea, #4b83f7)',
      icon: '🕵️',
    },
    Thief: {
      color: colors.danger[600],
      bgLight: colors.danger[50],
      bg: colors.danger[600],
      gradient: 'linear-gradient(to right, #e11a31, #ff6b78)',
      icon: '🦹',
    },
    Minister: {
      color: colors.success[600],
      bgLight: colors.success[50],
      bg: colors.success[600],
      gradient: 'linear-gradient(to right, #188c56, #49c886)',
      icon: '🧙',
    },
  },
  cards: {
    base: {
      bg: 'white',
      border: `1px solid ${colors.neutral[200]}`,
      borderRadius: borderRadius['2xl'],
      shadow: shadows.md,
      padding: spacing['6'],
    },
    hover: {
      shadow: shadows.lg,
      transform: 'translateY(-4px)',
    },
    glassmorphism: {
      bg: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(8px)',
      border: `1px solid rgba(255, 255, 255, 0.3)`,
    },
    dark: {
      bg: colors.neutral[900],
      color: colors.neutral[100],
      border: `1px solid ${colors.neutral[800]}`,
    },
  },
  backgrounds: {
    primary: `linear-gradient(135deg, ${colors.dark.blue}, ${colors.primary[900]})`,
    secondary: `linear-gradient(135deg, ${colors.dark.purple}, ${colors.secondary[900]})`,
    accent: `linear-gradient(135deg, ${colors.dark.charcoal}, ${colors.accent[900]})`,
    success: `linear-gradient(135deg, ${colors.dark.teal}, ${colors.success[900]})`,
    pattern: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/svg%3E")',
  },
};

// Export the design system
const designSystem = {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  zIndex,
  animation,
  buttons,
  gameStyles,
};

export default designSystem;
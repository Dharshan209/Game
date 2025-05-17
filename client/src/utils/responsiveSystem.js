/**
 * Responsive System for GameVerse
 * 
 * This file contains utility functions and constants for implementing
 * responsive layouts across the application.
 */

// Breakpoints (in pixels)
export const breakpoints = {
  xs: 320,   // Extra small devices (phones)
  sm: 640,   // Small devices (large phones, small tablets)
  md: 768,   // Medium devices (tablets)
  lg: 1024,  // Large devices (laptops/desktops)
  xl: 1280,  // Extra large devices (large desktops)
  '2xl': 1536, // Ultra wide screens
};

// Media query strings for use in styled-components or inline styles
export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs}px)`,
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
  xl: `@media (min-width: ${breakpoints.xl}px)`,
  '2xl': `@media (min-width: ${breakpoints['2xl']}px)`,
  
  // Max-width queries
  maxXs: `@media (max-width: ${breakpoints.xs - 1}px)`,
  maxSm: `@media (max-width: ${breakpoints.sm - 1}px)`,
  maxMd: `@media (max-width: ${breakpoints.md - 1}px)`,
  maxLg: `@media (max-width: ${breakpoints.lg - 1}px)`,
  maxXl: `@media (max-width: ${breakpoints.xl - 1}px)`,
  max2xl: `@media (max-width: ${breakpoints['2xl'] - 1}px)`,
  
  // Between breakpoint ranges
  smToMd: `@media (min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.md - 1}px)`,
  mdToLg: `@media (min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`,
  lgToXl: `@media (min-width: ${breakpoints.lg}px) and (max-width: ${breakpoints.xl - 1}px)`,
  
  // Orientation
  portrait: '@media (orientation: portrait)',
  landscape: '@media (orientation: landscape)',
  
  // Device features
  touchDevice: '@media (hover: none) and (pointer: coarse)',
  mouseDevice: '@media (hover: hover) and (pointer: fine)',
  
  // Dark mode
  prefersDark: '@media (prefers-color-scheme: dark)',
  prefersLight: '@media (prefers-color-scheme: light)',
  
  // Reduced motion
  prefersReducedMotion: '@media (prefers-reduced-motion: reduce)',
};

// Common responsive layout patterns
export const responsiveLayouts = {
  // Container with responsive width constraints
  container: {
    width: '100%',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    marginLeft: 'auto',
    marginRight: 'auto',
    [mediaQueries.sm]: {
      maxWidth: '640px',
    },
    [mediaQueries.md]: {
      maxWidth: '768px',
    },
    [mediaQueries.lg]: {
      maxWidth: '1024px',
    },
    [mediaQueries.xl]: {
      maxWidth: '1280px',
    },
    [mediaQueries['2xl']]: {
      maxWidth: '1536px',
    },
  },
  
  // Flex grid system
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    margin: '-0.5rem',
  },
  
  // Grid columns with responsive widths
  columns: {
    col1: { width: '100%' },
    col2: { width: '50%' },
    col3: { width: '33.333333%' },
    col4: { width: '25%' },
    col5: { width: '20%' },
    col6: { width: '16.666667%' },
    
    // Responsive variants - e.g., small screens 1 column, medium 2 columns, large 3+ columns
    responsive: {
      default: { width: '100%' },
      sm: { [mediaQueries.sm]: { width: '50%' } },
      md: { [mediaQueries.md]: { width: '33.333333%' } },
      lg: { [mediaQueries.lg]: { width: '25%' } },
      xl: { [mediaQueries.xl]: { width: '20%' } },
    }
  },
  
  // Common spacing adjustments for different screens
  spacing: {
    default: {
      padding: '1rem',
    },
    compact: {
      [mediaQueries.maxSm]: {
        padding: '0.5rem',
      }
    },
    expanded: {
      [mediaQueries.lg]: {
        padding: '1.5rem',
      },
      [mediaQueries.xl]: {
        padding: '2rem',
      }
    }
  },
  
  // Responsive typography
  typography: {
    responsive: {
      heading1: {
        fontSize: '1.875rem', // 30px
        lineHeight: '2.25rem', // 36px
        [mediaQueries.md]: {
          fontSize: '2.25rem', // 36px
          lineHeight: '2.5rem', // 40px
        },
        [mediaQueries.lg]: {
          fontSize: '3rem', // 48px
          lineHeight: '1',
        }
      },
      heading2: {
        fontSize: '1.5rem', // 24px
        lineHeight: '2rem', // 32px
        [mediaQueries.md]: {
          fontSize: '1.875rem', // 30px
          lineHeight: '2.25rem', // 36px
        },
        [mediaQueries.lg]: {
          fontSize: '2.25rem', // 36px
          lineHeight: '2.5rem', // 40px
        }
      },
      heading3: {
        fontSize: '1.25rem', // 20px
        lineHeight: '1.75rem', // 28px
        [mediaQueries.md]: {
          fontSize: '1.5rem', // 24px
          lineHeight: '2rem', // 32px
        }
      },
      body: {
        fontSize: '1rem', // 16px
        lineHeight: '1.5rem', // 24px
      },
      small: {
        fontSize: '0.875rem', // 14px
        lineHeight: '1.25rem', // 20px
      }
    }
  },
  
  // Common layout patterns
  patterns: {
    // Stack elements vertically on small screens, horizontally on larger screens
    stackToRow: {
      display: 'flex',
      flexDirection: 'column',
      [mediaQueries.md]: {
        flexDirection: 'row',
      }
    },
    
    // Show/hide based on screen size
    visibilityHelpers: {
      hideOnMobile: {
        [mediaQueries.maxSm]: {
          display: 'none',
        }
      },
      hideOnDesktop: {
        [mediaQueries.lg]: {
          display: 'none',
        }
      },
      showOnlyOnMobile: {
        display: 'block',
        [mediaQueries.md]: {
          display: 'none',
        }
      },
      showOnlyOnDesktop: {
        display: 'none',
        [mediaQueries.lg]: {
          display: 'block',
        }
      }
    },
    
    // Game-specific layouts
    gameplay: {
      // Default for mobile: grid layout of players and controls
      default: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '0.5rem',
      },
      
      // Tablet: 2-column layout
      tablet: {
        [mediaQueries.md]: {
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
        }
      },
      
      // Desktop: multiple configurations
      desktop: {
        [mediaQueries.lg]: {
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
        }
      },
      
      // Large desktop: optimized for many players
      large: {
        [mediaQueries.xl]: {
          gridTemplateColumns: 'repeat(4, 1fr)',
        }
      }
    }
  }
};

// Helper functions for responsiveness

/**
 * Generates CSS for responsive values based on breakpoints
 * @param {Object} values - Object with breakpoint keys and their corresponding values
 * @returns {Object} CSS style object
 */
export function responsive(values) {
  const baseStyles = {};
  
  if (values.base) {
    baseStyles.base = values.base;
  }
  
  Object.keys(values).forEach(breakpoint => {
    if (breakpoint !== 'base' && mediaQueries[breakpoint]) {
      baseStyles[mediaQueries[breakpoint]] = values[breakpoint];
    }
  });
  
  return baseStyles;
}

/**
 * Generates CSS for showing/hiding elements at different breakpoints
 * @param {string} mode - 'show' or 'hide'
 * @param {string|Array} breakpoints - Breakpoint name or array of breakpoint names
 * @returns {Object} CSS style object
 */
export function visibility(mode, breakpoints) {
  const styles = {};
  const value = mode === 'show' ? 'block' : 'none';
  const breakpointList = Array.isArray(breakpoints) ? breakpoints : [breakpoints];
  
  breakpointList.forEach(bp => {
    if (mediaQueries[bp]) {
      styles[mediaQueries[bp]] = { display: value };
    }
  });
  
  return styles;
}

export default {
  breakpoints,
  mediaQueries,
  responsiveLayouts,
  responsive,
  visibility
};
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Responsive utilities collection for handling different aspects of responsive design
 */

/**
 * Breakpoint - Shows content only at specified breakpoints
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.show - Breakpoint(s) to show content at (comma-separated)
 * @param {string} props.hide - Breakpoint(s) to hide content at (comma-separated)
 * @returns {JSX.Element|null} - Conditionally rendered content
 */
export const Breakpoint = ({ children, show, hide }) => {
  // Generate visibility classes based on show/hide props
  let classes = [];
  
  if (show) {
    const breakpoints = show.split(',').map(b => b.trim());
    
    // Handle individual breakpoints
    breakpoints.forEach(bp => {
      switch (bp) {
        case 'xs':
          classes.push('hidden xs:block sm:hidden md:hidden lg:hidden xl:hidden 2xl:hidden');
          break;
        case 'sm':
          classes.push('hidden sm:block md:hidden lg:hidden xl:hidden 2xl:hidden');
          break;
        case 'md':
          classes.push('hidden sm:hidden md:block lg:hidden xl:hidden 2xl:hidden');
          break;
        case 'lg':
          classes.push('hidden sm:hidden md:hidden lg:block xl:hidden 2xl:hidden');
          break;
        case 'xl':
          classes.push('hidden sm:hidden md:hidden lg:hidden xl:block 2xl:hidden');
          break;
        case '2xl':
          classes.push('hidden sm:hidden md:hidden lg:hidden xl:hidden 2xl:block');
          break;
        // Special ranges
        case 'sm-up':
          classes.push('hidden sm:block');
          break;
        case 'md-up':
          classes.push('hidden md:block');
          break;
        case 'lg-up':
          classes.push('hidden lg:block');
          break;
        case 'sm-down':
          classes.push('block sm:hidden');
          break;
        case 'md-down':
          classes.push('block md:hidden');
          break;
        case 'lg-down':
          classes.push('block lg:hidden');
          break;
        default:
          break;
      }
    });
  }
  
  if (hide) {
    const breakpoints = hide.split(',').map(b => b.trim());
    
    // Handle individual breakpoints for hiding
    breakpoints.forEach(bp => {
      switch (bp) {
        case 'xs':
          classes.push('xs:hidden');
          break;
        case 'sm':
          classes.push('sm:hidden');
          break;
        case 'md':
          classes.push('md:hidden');
          break;
        case 'lg':
          classes.push('lg:hidden');
          break;
        case 'xl':
          classes.push('xl:hidden');
          break;
        case '2xl':
          classes.push('2xl:hidden');
          break;
        // Special ranges
        case 'sm-up':
          classes.push('block sm:hidden');
          break;
        case 'md-up':
          classes.push('block md:hidden');
          break;
        case 'lg-up':
          classes.push('block lg:hidden');
          break;
        case 'sm-down':
          classes.push('hidden sm:block');
          break;
        case 'md-down':
          classes.push('hidden md:block');
          break;
        case 'lg-down':
          classes.push('hidden lg:block');
          break;
        default:
          break;
      }
    });
  }
  
  // Join classes
  const classNames = classes.join(' ');
  
  return <div className={classNames}>{children}</div>;
};

Breakpoint.propTypes = {
  children: PropTypes.node.isRequired,
  show: PropTypes.string,
  hide: PropTypes.string,
};

/**
 * ScreenSize - Shows its children with different props based on screen size
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode|Function} props.children - Child component or render function
 * @param {Object} props.xs - Props to apply at xs breakpoint
 * @param {Object} props.sm - Props to apply at sm breakpoint
 * @param {Object} props.md - Props to apply at md breakpoint
 * @param {Object} props.lg - Props to apply at lg breakpoint
 * @param {Object} props.xl - Props to apply at xl breakpoint
 * @param {Object} props.xxl - Props to apply at 2xl breakpoint
 * @returns {JSX.Element} - Responsive content with breakpoint-specific props
 */
export const ScreenSize = ({ children, xs, sm, md, lg, xl, xxl }) => {
  // Generate classes for different screen sizes
  const getBreakpointClasses = () => {
    return {
      xs: 'xs:block sm:hidden md:hidden lg:hidden xl:hidden 2xl:hidden',
      sm: 'hidden sm:block md:hidden lg:hidden xl:hidden 2xl:hidden',
      md: 'hidden sm:hidden md:block lg:hidden xl:hidden 2xl:hidden',
      lg: 'hidden sm:hidden md:hidden lg:block xl:hidden 2xl:hidden',
      xl: 'hidden sm:hidden md:hidden lg:hidden xl:block 2xl:hidden',
      xxl: 'hidden sm:hidden md:hidden lg:hidden xl:hidden 2xl:block',
    };
  };
  
  const breakpointClasses = getBreakpointClasses();
  
  // If children is a function, we're using render props pattern
  if (typeof children === 'function') {
    return (
      <>
        {xs && (
          <div className={breakpointClasses.xs}>{children(xs)}</div>
        )}
        {sm && (
          <div className={breakpointClasses.sm}>{children(sm)}</div>
        )}
        {md && (
          <div className={breakpointClasses.md}>{children(md)}</div>
        )}
        {lg && (
          <div className={breakpointClasses.lg}>{children(lg)}</div>
        )}
        {xl && (
          <div className={breakpointClasses.xl}>{children(xl)}</div>
        )}
        {xxl && (
          <div className={breakpointClasses.xxl}>{children(xxl)}</div>
        )}
      </>
    );
  }
  
  // If children is a component, we're cloning with different props
  return (
    <>
      {xs && (
        <div className={breakpointClasses.xs}>
          {React.cloneElement(children, xs)}
        </div>
      )}
      {sm && (
        <div className={breakpointClasses.sm}>
          {React.cloneElement(children, sm)}
        </div>
      )}
      {md && (
        <div className={breakpointClasses.md}>
          {React.cloneElement(children, md)}
        </div>
      )}
      {lg && (
        <div className={breakpointClasses.lg}>
          {React.cloneElement(children, lg)}
        </div>
      )}
      {xl && (
        <div className={breakpointClasses.xl}>
          {React.cloneElement(children, xl)}
        </div>
      )}
      {xxl && (
        <div className={breakpointClasses.xxl}>
          {React.cloneElement(children, xxl)}
        </div>
      )}
    </>
  );
};

ScreenSize.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  xs: PropTypes.object,
  sm: PropTypes.object,
  md: PropTypes.object,
  lg: PropTypes.object,
  xl: PropTypes.object,
  xxl: PropTypes.object,
};

/**
 * Stack - Arranges children in a column on mobile, and in a row on larger screens
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.gap - Gap between items
 * @param {string} props.align - Items alignment
 * @param {string} props.justify - Content justification
 * @param {string} props.breakpoint - Breakpoint to switch from column to row (default: 'md')
 * @returns {JSX.Element} - Responsive container component
 */
export const Stack = ({
  children,
  className = '',
  gap = '4',
  align = 'stretch',
  justify = 'start',
  breakpoint = 'md',
  ...rest
}) => {
  // Generate alignment classes
  const alignClass = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  }[align];
  
  // Generate justify classes
  const justifyClass = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  }[justify];
  
  // Gap classes
  const gapClass = `gap-${gap}`;
  
  // Direction classes based on breakpoint
  const directionClass = `flex-col ${breakpoint}:flex-row`;
  
  // Combine all classes
  const classes = `flex ${directionClass} ${alignClass} ${justifyClass} ${gapClass} ${className}`;
  
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
};

Stack.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  gap: PropTypes.string,
  align: PropTypes.oneOf(['start', 'center', 'end', 'stretch', 'baseline']),
  justify: PropTypes.oneOf(['start', 'center', 'end', 'between', 'around', 'evenly']),
  breakpoint: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', '2xl']),
};

/**
 * Responsive - A component that applies different className props based on screen size
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.as - HTML element to render as
 * @param {string} props.base - Base classes applied at all screen sizes
 * @param {string} props.xs - Classes to apply at xs breakpoint
 * @param {string} props.sm - Classes to apply at sm breakpoint
 * @param {string} props.md - Classes to apply at md breakpoint
 * @param {string} props.lg - Classes to apply at lg breakpoint
 * @param {string} props.xl - Classes to apply at xl breakpoint
 * @param {string} props.xxl - Classes to apply at 2xl breakpoint
 * @returns {JSX.Element} - Element with responsive classes
 */
export const Responsive = ({
  children,
  as: Component = 'div',
  base = '',
  xs = '',
  sm = '',
  md = '',
  lg = '',
  xl = '',
  xxl = '',
  ...rest
}) => {
  // Combine all responsive classes
  const responsiveClasses = [
    base,
    xs && `xs:${xs}`,
    sm && `sm:${sm}`,
    md && `md:${md}`,
    lg && `lg:${lg}`,
    xl && `xl:${xl}`,
    xxl && `2xl:${xxl}`,
  ].filter(Boolean).join(' ');
  
  return (
    <Component className={responsiveClasses} {...rest}>
      {children}
    </Component>
  );
};

Responsive.propTypes = {
  children: PropTypes.node,
  as: PropTypes.string,
  base: PropTypes.string,
  xs: PropTypes.string,
  sm: PropTypes.string,
  md: PropTypes.string,
  lg: PropTypes.string,
  xl: PropTypes.string,
  xxl: PropTypes.string,
};

/**
 * Hide - Utility component that hides content at specified breakpoints
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.breakpoint - Breakpoint to hide at (e.g. 'sm', 'md', 'sm-down', 'md-up')
 * @returns {JSX.Element} - Component with appropriate visibility classes
 */
export const Hide = ({ children, breakpoint }) => {
  let className;
  
  switch (breakpoint) {
    case 'xs':
      className = 'xs:hidden';
      break;
    case 'sm':
      className = 'sm:hidden';
      break;
    case 'md':
      className = 'md:hidden';
      break;
    case 'lg':
      className = 'lg:hidden';
      break;
    case 'xl':
      className = 'xl:hidden';
      break;
    case '2xl':
      className = '2xl:hidden';
      break;
    case 'sm-down':
      className = 'hidden sm:block';
      break;
    case 'md-down':
      className = 'hidden md:block';
      break;
    case 'lg-down':
      className = 'hidden lg:block';
      break;
    case 'sm-up':
      className = 'block sm:hidden';
      break;
    case 'md-up':
      className = 'block md:hidden';
      break;
    case 'lg-up':
      className = 'block lg:hidden';
      break;
    default:
      className = '';
  }
  
  return <div className={className}>{children}</div>;
};

Hide.propTypes = {
  children: PropTypes.node.isRequired,
  breakpoint: PropTypes.string.isRequired,
};

/**
 * Show - Utility component that shows content only at specified breakpoints
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.breakpoint - Breakpoint to show at (e.g. 'sm', 'md', 'sm-down', 'md-up')
 * @returns {JSX.Element} - Component with appropriate visibility classes
 */
export const Show = ({ children, breakpoint }) => {
  let className;
  
  switch (breakpoint) {
    case 'xs':
      className = 'hidden xs:block sm:hidden md:hidden lg:hidden xl:hidden 2xl:hidden';
      break;
    case 'sm':
      className = 'hidden sm:block md:hidden lg:hidden xl:hidden 2xl:hidden';
      break;
    case 'md':
      className = 'hidden sm:hidden md:block lg:hidden xl:hidden 2xl:hidden';
      break;
    case 'lg':
      className = 'hidden sm:hidden md:hidden lg:block xl:hidden 2xl:hidden';
      break;
    case 'xl':
      className = 'hidden sm:hidden md:hidden lg:hidden xl:block 2xl:hidden';
      break;
    case '2xl':
      className = 'hidden sm:hidden md:hidden lg:hidden xl:hidden 2xl:block';
      break;
    case 'sm-up':
      className = 'hidden sm:block';
      break;
    case 'md-up':
      className = 'hidden md:block';
      break;
    case 'lg-up':
      className = 'hidden lg:block';
      break;
    case 'sm-down':
      className = 'block sm:hidden';
      break;
    case 'md-down':
      className = 'block md:hidden';
      break;
    case 'lg-down':
      className = 'block lg:hidden';
      break;
    default:
      className = '';
  }
  
  return <div className={className}>{children}</div>;
};

Show.propTypes = {
  children: PropTypes.node.isRequired,
  breakpoint: PropTypes.string.isRequired,
};

// Export all components
export default {
  Breakpoint,
  ScreenSize,
  Stack,
  Responsive,
  Hide,
  Show,
};
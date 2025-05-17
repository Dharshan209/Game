import React from 'react';
import PropTypes from 'prop-types';

/**
 * ResponsiveGrid component for creating flexible, responsive grid layouts
 * with configurable columns at different breakpoints.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.id - Element ID
 * @param {Object} props.style - Additional inline styles
 * @param {number|string} props.cols - Default number of columns
 * @param {number|string} props.colsSm - Number of columns at sm breakpoint
 * @param {number|string} props.colsMd - Number of columns at md breakpoint
 * @param {number|string} props.colsLg - Number of columns at lg breakpoint
 * @param {number|string} props.colsXl - Number of columns at xl breakpoint
 * @param {string} props.gap - Gap between grid items (e.g., '4', '6', '8')
 * @returns {JSX.Element} - Responsive grid component
 */
const ResponsiveGrid = ({
  children,
  className = '',
  id,
  style = {},
  cols = 1,
  colsSm,
  colsMd,
  colsLg,
  colsXl,
  gap = '4',
  ...rest
}) => {
  // Helper function to generate column class based on count
  const getColClass = (breakpoint, count) => {
    if (!count) return '';
    
    // If count is a fraction like "1/2" or "1/3"
    if (typeof count === 'string' && count.includes('/')) {
      return breakpoint ? `${breakpoint}:grid-cols-[repeat(auto-fill,minmax(${count},1fr))]` : `grid-cols-[repeat(auto-fill,minmax(${count},1fr))]`;
    }
    
    // Fixed column numbers
    return breakpoint ? `${breakpoint}:grid-cols-${count}` : `grid-cols-${count}`;
  };

  // Generate column classes for each breakpoint
  const colClasses = [
    getColClass('', cols),
    colsSm ? getColClass('sm', colsSm) : '',
    colsMd ? getColClass('md', colsMd) : '',
    colsLg ? getColClass('lg', colsLg) : '',
    colsXl ? getColClass('xl', colsXl) : '',
  ].filter(Boolean).join(' ');

  // Gap classes
  const gapClass = `gap-${gap}`;

  // Combine all classes
  const classes = `grid ${colClasses} ${gapClass} ${className}`;

  return (
    <div id={id} className={classes} style={style} {...rest}>
      {children}
    </div>
  );
};

ResponsiveGrid.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  id: PropTypes.string,
  style: PropTypes.object,
  cols: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  colsSm: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  colsMd: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  colsLg: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  colsXl: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  gap: PropTypes.string,
};

/**
 * GridItem component for use within ResponsiveGrid
 * Provides responsive column span capabilities
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.id - Element ID
 * @param {Object} props.style - Additional inline styles
 * @param {number} props.span - Default column span
 * @param {number} props.spanSm - Column span at sm breakpoint
 * @param {number} props.spanMd - Column span at md breakpoint
 * @param {number} props.spanLg - Column span at lg breakpoint
 * @param {number} props.spanXl - Column span at xl breakpoint
 * @returns {JSX.Element} - Grid item component
 */
export const GridItem = ({
  children,
  className = '',
  id,
  style = {},
  span,
  spanSm,
  spanMd,
  spanLg,
  spanXl,
  ...rest
}) => {
  // Generate span classes for each breakpoint
  const spanClasses = [
    span ? `col-span-${span}` : '',
    spanSm ? `sm:col-span-${spanSm}` : '',
    spanMd ? `md:col-span-${spanMd}` : '',
    spanLg ? `lg:col-span-${spanLg}` : '',
    spanXl ? `xl:col-span-${spanXl}` : '',
  ].filter(Boolean).join(' ');

  // Combine all classes
  const classes = `${spanClasses} ${className}`;

  return (
    <div id={id} className={classes} style={style} {...rest}>
      {children}
    </div>
  );
};

GridItem.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  id: PropTypes.string,
  style: PropTypes.object,
  span: PropTypes.number,
  spanSm: PropTypes.number,
  spanMd: PropTypes.number,
  spanLg: PropTypes.number,
  spanXl: PropTypes.number,
};

export default ResponsiveGrid;
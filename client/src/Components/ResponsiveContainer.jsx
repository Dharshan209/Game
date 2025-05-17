import React from 'react';
import PropTypes from 'prop-types';

/**
 * ResponsiveContainer component that provides consistent responsive layouts
 * across the application with configurable breakpoint-specific behaviors.
 * 
 * @param {Object} props - Component props
 * @param {string} props.as - HTML element to render as (default: 'div')
 * @param {string} props.type - Container type (fluid, fixed, content, game)
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.id - Element ID
 * @param {Object} props.style - Additional inline styles
 * @returns {JSX.Element} - Responsive container component
 */
const ResponsiveContainer = ({
  as: Component = 'div',
  type = 'fixed',
  children,
  className = '',
  id,
  style = {},
  ...rest
}) => {
  // Base container classes that apply to all container types
  const baseClasses = 'transition-all duration-300';
  
  // Container-specific class mapping
  const containerClasses = {
    // Full width container with padding
    fluid: 'w-full px-4 sm:px-6 lg:px-8',
    
    // Fixed-width container with responsive max-widths
    fixed: 'w-full mx-auto px-4 sm:px-6 lg:px-8 sm:max-w-[640px] md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1280px] 2xl:max-w-[1400px]',
    
    // Content container for text/articles
    content: 'w-full mx-auto px-4 sm:px-6 lg:px-8 sm:max-w-[640px] md:max-w-[728px] lg:max-w-[800px] xl:max-w-[900px]',
    
    // Game-specific layout container
    game: 'w-full mx-auto px-2 sm:px-4 lg:px-6 grid gap-3 sm:gap-4 md:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-game-medium lg:grid-cols-game-large xl:grid-cols-game-xlarge',
    
    // Sidebar layout with responsive columns
    sidebar: 'w-full mx-auto grid grid-cols-1 lg:grid-cols-layout gap-4 px-4 sm:px-6 lg:px-8',
    
    // Flex container for rows/columns
    flex: 'flex flex-col sm:flex-row w-full',
    
    // Grid container
    grid: 'grid gap-4 w-full',
    
    // Card container with responsive padding and margins
    card: 'rounded-xl bg-white dark:bg-gray-800 shadow-md p-4 sm:p-6 lg:p-8 m-2 sm:m-3 lg:m-4',

    // Hero section container
    hero: 'w-full px-4 py-12 sm:py-16 lg:py-20 flex flex-col items-center justify-center text-center',
  };

  // Combine all classes
  const classes = `${baseClasses} ${containerClasses[type] || containerClasses.fixed} ${className}`;

  return (
    <Component id={id} className={classes} style={style} {...rest}>
      {children}
    </Component>
  );
};

ResponsiveContainer.propTypes = {
  as: PropTypes.string,
  type: PropTypes.oneOf(['fluid', 'fixed', 'content', 'game', 'sidebar', 'flex', 'grid', 'card', 'hero']),
  children: PropTypes.node,
  className: PropTypes.string,
  id: PropTypes.string,
  style: PropTypes.object,
};

export default ResponsiveContainer;
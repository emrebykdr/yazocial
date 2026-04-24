import React from 'react';

export default function Button({ children, className = '', variant = 'primary', ...props }) {
  const variants = {
    primary: 'bg-primary hover:bg-primaryHover text-white',
    secondary: 'bg-surface2 hover:bg-border text-textPrimary',
    outline: 'bg-transparent border border-border hover:bg-surface2 text-textSecondary hover:text-textPrimary',
    danger: 'bg-danger/20 hover:bg-danger text-danger hover:text-white',
  };

  return (
    <button 
      className={`px-4 py-2 rounded-md font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

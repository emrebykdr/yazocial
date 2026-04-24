import React from 'react';

export default function Card({ children, className = '', ...props }) {
  return (
    <div 
      className={`bg-surface border border-border rounded-lg p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

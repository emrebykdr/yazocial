import React from 'react';

export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-xs font-black uppercase tracking-wider text-textSecondary ml-1">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-surface2 border border-border rounded-md px-4 py-2.5 text-sm text-textPrimary focus:outline-none focus:border-primary transition-colors placeholder:text-textSecondary/50 ${className} ${error ? 'border-danger' : ''}`}
        {...props}
      />
      {error && <p className="text-[10px] font-bold text-danger ml-1">{error}</p>}
    </div>
  );
}

// frontend/src/components/ui/Badge.jsx
import React from "react";

/**
 * Badge component for status chips
 * @param {string} variant - 'default' | 'success' | 'error' | 'warning' | 'info'
 */
export default function Badge({
  children,
  variant = "default",
  className = "",
  ...props
}) {
  const variants = {
    default: "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100",
    success: "bg-accent-100 dark:bg-accent-900 text-accent-800 dark:text-accent-200",
    error: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    warning: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
    info: "bg-brand-100 dark:bg-brand-900 text-brand-800 dark:text-brand-200",
  };
  
  const variantClasses = variants[variant] || variants.default;

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5
        rounded-full text-xs font-medium
        ${variantClasses}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}


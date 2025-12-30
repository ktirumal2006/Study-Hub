// frontend/src/components/ui/Select.jsx
import React, { forwardRef } from "react";

/**
 * Select component with label and error text
 */
const Select = forwardRef(function Select(
  {
    label,
    error,
    helperText,
    className = "",
    id,
    children,
    ...props
  },
  ref
) {
  const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
        >
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`
          w-full px-4 py-2.5
          bg-white dark:bg-slate-900
          border border-slate-300 dark:border-slate-700
          rounded-2xl
          text-slate-900 dark:text-slate-100
          focus:ring-2 focus:ring-brand-500 focus:border-brand-500
          transition-colors
          ${error ? "border-red-500 focus:ring-red-500" : ""}
          ${className}
        `}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={`${selectId}-error`} className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${selectId}-helper`} className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Select;


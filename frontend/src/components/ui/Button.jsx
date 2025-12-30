// frontend/src/components/ui/Button.jsx
import React from "react";
import { motion } from "framer-motion";
import LoadingSpinner from "../LoadingSpinner";

/**
 * Button component with variants, sizes, and loading state
 * @param {string} variant - 'primary' | 'secondary' | 'ghost'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} loading - Shows spinner when true
 * @param {boolean} fullWidth - Makes button full width
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className = "",
  disabled = false,
  as: Component = "button",
  ...props
}) {
  const variants = {
    primary: "bg-brand-600 hover:bg-brand-700 text-white",
    secondary: "bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100",
    ghost: "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const motionProps = Component === "button" ? {
    whileHover: !disabled && !loading ? { scale: 1.02 } : {},
    whileTap: !disabled && !loading ? { scale: 0.98 } : {},
  } : {};

  return (
    <motion.div {...motionProps}>
      <Component
        disabled={disabled || loading}
        className={`
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? "w-full" : ""}
          ${disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          rounded-2xl font-medium transition-colors
          focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
          ${className}
          ${Component !== "button" ? "inline-flex items-center justify-center" : ""}
        `}
        aria-busy={loading}
        {...props}
      >
        <span className="flex items-center justify-center gap-2">
          {loading && <LoadingSpinner size="sm" />}
          {children}
        </span>
      </Component>
    </motion.div>
  );
}


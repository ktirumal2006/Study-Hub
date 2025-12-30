// frontend/src/components/ui/Skeleton.jsx
import React from "react";

/**
 * Skeleton loader component for loading states
 */
export default function Skeleton({
  className = "",
  variant = "rectangular",
  ...props
}) {
  const variants = {
    rectangular: "rounded-2xl",
    circular: "rounded-full",
    text: "rounded",
  };

  return (
    <div
      className={`
        animate-pulse
        bg-slate-200 dark:bg-slate-800
        ${variants[variant]}
        ${className}
      `}
      aria-hidden="true"
      {...props}
    />
  );
}


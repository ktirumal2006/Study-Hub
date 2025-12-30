// frontend/src/components/LoadingButton.jsx
import React from "react";
import LoadingSpinner from "./LoadingSpinner";

export default function LoadingButton({ 
  children, 
  loading = false, 
  disabled = false, 
  className = "", 
  ...props 
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`${className} ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </button>
  );
}

// frontend/src/components/ui/Card.jsx
import React from "react";
import { motion } from "framer-motion";

export function Card({ children, className = "", hover = false, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : {}}
      className={`
        bg-white dark:bg-slate-900
        rounded-2xl shadow-card
        ${hover ? "hover:shadow-card-hover transition-shadow" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className = "", ...props }) {
  return (
    <div className={`p-6 pb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...props }) {
  return (
    <h3 className={`text-xl font-semibold text-slate-900 dark:text-slate-100 ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = "", ...props }) {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "", ...props }) {
  return (
    <div className={`p-6 pt-4 border-t border-slate-200 dark:border-slate-800 ${className}`} {...props}>
      {children}
    </div>
  );
}


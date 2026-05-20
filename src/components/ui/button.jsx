import React from "react";

/**
 * DenseButton: High-density custom button matching compact-ui B2B specifications.
 * h-6 (24px) for primary actions, h-5 (20px) for micro-actions.
 */
export default function DenseButton({ 
  children, 
  variant = "primary", 
  size = "normal", 
  className = "", 
  ...props 
}) {
  const baseStyle = "inline-flex items-center justify-center font-sans select-none rounded-sm border transition-colors outline-none cursor-pointer text-xs font-medium";
  
  const sizeStyles = {
    normal: "h-6 px-2 text-xs",
    micro: "h-5 px-1.5 text-[10px] uppercase tracking-wide"
  };

  const variantStyles = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-700/50 shadow-sm",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300/60",
    outline: "bg-transparent hover:bg-slate-50 text-slate-600 border-slate-300",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-500 border-transparent"
  };

  return (
    <button
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

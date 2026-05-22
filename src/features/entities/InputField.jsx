import React from "react";

const spanClass = "text-[8px] uppercase tracking-wide text-slate-500 font-semibold block leading-tight";

export default function InputField({ label, colSpan = "col-span-1", ...props }) {
  return (
    <div className={colSpan}>
      <div className="flex flex-col gap-0.5">
        <span className={spanClass}>
          {label}
        </span>
        <input
          {...props}
          className={`w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium text-slate-800 ${props.className || ""}`}
        />
      </div>
    </div>
  );
}

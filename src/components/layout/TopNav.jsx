import React from "react";

export default function TopNav({ activeModule }) {
  return (
    <header className="h-8 bg-slate-900 text-slate-100 border-b border-slate-800 flex items-center justify-between px-3 select-none shrink-0" id="top-nav">
      {/* Left side brand and title */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs font-bold tracking-wider text-indigo-400">FABRITO</span>
        <span className="text-slate-600">|</span>
        <span className="text-[10px] uppercase tracking-wider text-slate-300 font-medium">
          {activeModule}
        </span>
      </div>

      {/* Right side user info */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-slate-400">narainmayank@gmail.com</span>
      </div>
    </header>
  );
}

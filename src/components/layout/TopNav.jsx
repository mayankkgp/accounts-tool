import React from "react";

export default function TopNav({ activeModule, userRole, setUserRole }) {
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

      {/* Center/Right role toggler */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-slate-950 p-[2px] rounded-sm border border-slate-800 h-5" id="role-selector-pill">
          <button
            id="toggle-role-sm"
            type="button"
            onClick={() => setUserRole && setUserRole("SM")}
            className={`px-2 h-full rounded-[1px] text-[8px] font-mono uppercase tracking-wider transition-all cursor-pointer border-none flex items-center justify-center leading-none ${
              userRole === "SM"
                ? "bg-indigo-600 text-white font-bold"
                : "text-slate-400 hover:text-slate-200 bg-transparent"
            }`}
          >
            SM Mode
          </button>
          <button
            id="toggle-role-finance"
            type="button"
            onClick={() => setUserRole && setUserRole("Finance")}
            className={`px-2 h-full rounded-[1px] text-[8px] font-mono uppercase tracking-wider transition-all cursor-pointer border-none flex items-center justify-center leading-none ${
              userRole === "Finance"
                ? "bg-indigo-600 text-white font-bold"
                : "text-slate-400 hover:text-slate-200 bg-transparent"
            }`}
          >
            Finance
          </button>
        </div>

        <span className="text-[10px] font-mono text-slate-400">narainmayank@gmail.com</span>
      </div>
    </header>
  );
}

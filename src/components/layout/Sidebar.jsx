import React from "react";
import { Users, ShoppingBag, DollarSign, Package, BookOpen } from "lucide-react";

export default function Sidebar({ activeModule, setActiveModule }) {
  const modules = [
    { name: "Entities", icon: Users },
    { name: "Purchases", icon: ShoppingBag },
    { name: "Sales", icon: DollarSign },
    { name: "Inventory", icon: Package },
    { name: "Ledger", icon: BookOpen }
  ];

  return (
    <aside className="w-8 bg-slate-950 border-r border-slate-900 flex flex-col items-center py-2 gap-1 select-none shrink-0" id="app-sidebar">
      {modules.map((m) => {
        const Icon = m.icon;
        const isActive = activeModule === m.name;
        return (
          <button
            key={m.name}
            title={m.name}
            onClick={() => setActiveModule(m.name)}
            className={`w-6 h-6 rounded-sm flex items-center justify-center transition-colors ${
              isActive
                ? "bg-slate-800 text-indigo-400 border border-slate-700/50"
                : "text-slate-500 hover:text-slate-200 hover:bg-slate-900"
            }`}
            id={`sidebar-btn-${m.name.toLowerCase()}`}
          >
            <Icon size={13} className="shrink-0" />
          </button>
        );
      })}
    </aside>
  );
}

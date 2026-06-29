import React, { useState, useRef, useEffect } from "react";

/**
 * EditableTaxCell
 * Spreadsheet-style Focus-to-Edit cell for inline tax percentage entry.
 * Displays percentage and calculated value in read-mode, and a clean
 * full-height input field in edit-mode.
 */
export default function EditableTaxCell({
  value = 0,
  rowBasic = 0,
  onChange,
  disabled = false,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(String(value));
  const inputRef = useRef(null);

  // Keep tempValue synchronized with incoming prop value when not editing
  useEffect(() => {
    if (!isEditing) {
      setTempValue(String(value));
    }
  }, [value, isEditing]);

  const handleStartEdit = () => {
    if (disabled) return;
    setIsEditing(true);
  };

  const handleSave = () => {
    const parsed = parseFloat(tempValue);
    const finalVal = isNaN(parsed) ? 0 : parsed;
    onChange(finalVal);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setTempValue(String(value));
      setIsEditing(false);
    }
  };

  const calculatedValue = rowBasic * (value / 100);

  if (isEditing) {
    return (
      <div className="w-full h-7 relative flex items-center justify-stretch p-0" id="tax-cell-edit-container">
        <input
          ref={inputRef}
          type="number"
          step="any"
          min="0"
          max="100"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-full h-full text-center font-mono text-[11px] font-bold text-indigo-700 bg-white border border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 pl-3 pr-4 leading-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
          autoFocus
          id="tax-cell-input-field"
        />
        <span className="absolute right-1 text-[10px] font-mono font-bold text-slate-400 select-none pointer-events-none">%</span>
      </div>
    );
  }

  return (
    <div
      onClick={handleStartEdit}
      className={`w-full h-7 flex flex-col items-center justify-center font-mono text-[10px] text-slate-700 cursor-pointer select-none transition-colors ${
        disabled ? "bg-slate-50 text-slate-500 cursor-not-allowed" : "hover:bg-slate-100/80 active:bg-slate-200/50"
      }`}
      id="tax-cell-read-container"
      title={disabled ? "Locked" : "Click to edit tax percentage"}
    >
      <span className="font-semibold leading-tight">{value}%</span>
      <span className="text-[9px] text-slate-400 font-normal leading-tight">
        (₹{calculatedValue.toFixed(1)})
      </span>
    </div>
  );
}

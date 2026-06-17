import React, { useState, useEffect, useRef } from "react";

/**
 * A reusable, searchable autocomplete dropdown component.
 * Filters a list of option strings based on the user's keystroke inputs
 * and triggers onChange with the final selected option.
 * 
 * @param {object} props
 * @param {string} props.value - Currently selected value.
 * @param {function} props.onChange - Handler called when an option is selected or text is typed.
 * @param {Array<string>} props.options - List of autocomplete string choices.
 * @param {string} [props.placeholder] - Optional input placeholder.
 * @param {boolean} [props.required] - If true, the browser forces a value.
 * @param {string} [props.id] - Optional element identifier.
 */
export default function Combobox({ value, onChange, options = [], placeholder, required, id }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown menu automatically if the user clicks any area outside the component
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredOptions = options.filter((option) =>
    (option || "").toLowerCase().includes((value || "").toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative w-full text-xs font-sans" id={id}>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        required={required}
        className="w-full h-6 bg-white border border-slate-300 rounded-sm px-2 text-xs font-medium focus:border-indigo-500 outline-none"
      />
      {isOpen && (
        <ul className="absolute left-0 top-[calc(100%+2px)] w-full max-h-40 overflow-y-auto bg-white border border-slate-200 shadow-md rounded-sm z-50 text-xs py-1 list-none m-0 p-0">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, idx) => (
              <li
                key={idx}
                onMouseDown={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className="px-2 py-1 hover:bg-slate-100 cursor-pointer text-slate-700"
              >
                {option}
              </li>
            ))
          ) : (
            <li className="px-2 py-1 text-slate-400 italic">No matches found</li>
          )}
        </ul>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";

/**
 * useDebounce custom hook
 * Debounces any value with a specified delay (defaults to 300ms).
 * Useful for limiting performance-heavy operations like fetch calls on search inputs.
 * 
 * @param {*} value - The input value to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {*} The debounced value.
 */
export default function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

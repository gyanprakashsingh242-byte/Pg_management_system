import React, { useState, useEffect, useRef } from 'react';
import { useDebounce } from '../hooks/useDebounce';

export default function MeterInput({ initialValue, onDebouncedSave }) {
  const [localVal, setLocalVal] = useState(initialValue ?? 0);
  const debouncedVal = useDebounce(localVal, 600); // 600ms debounce window
  const isFirstRender = useRef(true);

  // Sync state if initialValue changes externally (e.g., floor filter switch)
  useEffect(() => {
    setLocalVal(initialValue ?? 0);
  }, [initialValue]);

  // Trigger backend save only when the debounced value actually changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (debouncedVal !== initialValue) {
      onDebouncedSave(Number(debouncedVal));
    }
  }, [debouncedVal]);

  return (
    <input
      type="number"
      value={localVal}
      onChange={(e) => setLocalVal(Number(e.target.value))}
      className="w-full bg-stone-900 border border-emerald-500/30 p-1 rounded text-center text-white text-xs focus:outline-none focus:border-emerald-400"
    />
  );
}
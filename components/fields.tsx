"use client";

import { useEffect, useRef, useState } from "react";

// Yazarken akıcı kalan, dışarıdaki değişikliklerle (cloud sync) senkronlanan alanlar.
// onChange çağrısı her tuşta gelir; store zaten kaydı debounce eder.

function useSyncedValue(value: string) {
  const [local, setLocal] = useState(value);
  const focused = useRef(false);
  useEffect(() => {
    if (!focused.current) setLocal(value);
  }, [value]);
  return { local, setLocal, focused };
}

export function AutoField({
  value,
  onChange,
  placeholder,
  className = "",
  type = "text",
  inputMode,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  type?: string;
  inputMode?: "text" | "numeric" | "decimal";
}) {
  const { local, setLocal, focused } = useSyncedValue(value);
  return (
    <input
      type={type}
      inputMode={inputMode}
      className={`field ${className}`}
      placeholder={placeholder}
      value={local}
      onFocus={() => (focused.current = true)}
      onBlur={() => (focused.current = false)}
      onChange={(e) => {
        setLocal(e.target.value);
        onChange(e.target.value);
      }}
    />
  );
}

export function AutoArea({
  value,
  onChange,
  placeholder,
  rows = 2,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  const { local, setLocal, focused } = useSyncedValue(value);
  return (
    <textarea
      rows={rows}
      className={`field resize-none leading-relaxed ${className}`}
      placeholder={placeholder}
      value={local}
      onFocus={() => (focused.current = true)}
      onBlur={() => (focused.current = false)}
      onChange={(e) => {
        setLocal(e.target.value);
        onChange(e.target.value);
      }}
    />
  );
}

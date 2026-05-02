import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

type Option = {
  label: string;
  value: string;
};

type SearchableSelectInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  emptyText?: string;

  // 🔥 Styling control (important)
  className?: string;
  inputClassName?: string;
  dropdownClassName?: string;
};

export default function SearchableSelectInput({
  id,
  value,
  onChange,
  options,
  placeholder = "Search...",
  emptyText = "No results found",
  className = "",
  inputClassName = "",
  dropdownClassName = "",
}: SearchableSelectInputProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.value === value) || null;
  }, [value, options]);

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options.slice(0, 100);

    return options
      .filter((opt) =>
        opt.label.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 100);
  }, [query, options]);

  // Sync input text with selected value
  useEffect(() => {
    if (!open) {
      setQuery(selectedOption?.label || "");
    }
  }, [open, selectedOption]);

  // Close on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, []);

  // Reset highlight when open/query changes
  useEffect(() => {
    if (open) setHighlightedIndex(0);
  }, [query, open]);

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setQuery(option.label);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      {/* INPUT */}
      <div className="relative flex items-center">
        <input
          id={id}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (value) onChange("");
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlightedIndex((i) =>
                Math.min(i + 1, filteredOptions.length - 1)
              );
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlightedIndex((i) => Math.max(i - 1, 0));
            }
            if (e.key === "Enter") {
              e.preventDefault();
              const selected = filteredOptions[highlightedIndex];
              if (selected) handleSelect(selected);
            }
            if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder={placeholder}
          autoComplete="off"
          className={inputClassName}
        />

        {/* Chevron */}
        <ChevronDown
          className={`absolute right-3 h-5 w-5 transition 
          text-slate-400 dark:text-slate-500
          ${open ? "rotate-180 text-amber-500" : ""}`}
        />
      </div>

      {/* DROPDOWN */}
      <div
        className={`absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-xl border 
        bg-white dark:bg-slate-900
        border-slate-200 dark:border-slate-700
        shadow-xl overflow-hidden
        transition-all duration-200
        ${
          open
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }
        ${dropdownClassName}`}
      >
        <ul className="max-h-[220px] overflow-auto py-1">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, index) => {
              const active = opt.value === value;
              const highlighted = index === highlightedIndex;

              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full flex justify-between items-center px-4 py-2 text-sm transition
                    ${
                      active
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                        : highlighted
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {active && <Check className="h-4 w-4" />}
                  </button>
                </li>
              );
            })
          ) : (
            <li className="px-4 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
              {emptyText}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
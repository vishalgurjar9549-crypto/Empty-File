import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Home,
  Wallet,
  ChevronDown,
  Check,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
// import { loadCities } from "../store/slices/metadata.slice";
import { SEARCH_ROOM_TYPE_OPTIONS, SEARCH_BUDGET_OPTIONS } from "../constants/filterOptions";

const normalizeCityValue = (cityName: string) => cityName.trim().toLowerCase();

type Option = {
  label: string;
  value: string;
};

type SearchDropdownProps = {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder: string;
};

function SearchDropdown({
  id,
  label,
  icon,
  value,
  onChange,
  options,
  placeholder,
}: SearchDropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const selectedLabel = useMemo(() => {
    return options.find((option) => option.value === value)?.label || placeholder;
  }, [options, value, placeholder]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>

      <button
        id={id}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`group relative flex h-[60px] sm:h-[64px] w-full items-center rounded-2xl border px-4 sm:px-5 text-left transition-all duration-200 outline-none
          ${
            open
              ? "border-amber-400/60 ring-4 ring-amber-400/15 shadow-lg"
              : "border-slate-200/80 dark:border-white/10 hover:border-amber-300/40"
          }
          bg-white/95 dark:bg-slate-900/75 backdrop-blur-xl shadow-sm hover:shadow-md`}
      >
        <div className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 group-hover:text-amber-500 transition-colors">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
            {label}
          </p>
          <p
            className={`mt-0.5 truncate text-sm sm:text-base font-semibold ${
              value
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {selectedLabel}
          </p>
        </div>

        <ChevronDown
          className={`ml-3 h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180 text-amber-500" : ""
          }`}
        />
      </button>

      <div
        className={`absolute left-0 right-0 top-[calc(100%+10px)] z-50 origin-top rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-200
          ${
            open
              ? "pointer-events-auto opacity-100 scale-100 translate-y-0"
              : "pointer-events-none opacity-0 scale-95 -translate-y-1"
          }`}
      >
        <ul
          role="listbox"
          aria-label={label}
          className="max-h-72 overflow-auto py-2"
        >
          <li>
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm sm:text-[15px] transition-colors
                ${
                  value === ""
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
            >
              <span>{placeholder}</span>
              {value === "" && <Check className="h-4 w-4" />}
            </button>
          </li>

          {options.map((option) => {
            const active = option.value === value;

            return (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm sm:text-[15px] transition-colors
                    ${
                      active
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                >
                  <span>{option.label}</span>
                  {active && <Check className="h-4 w-4" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

type SearchableCitySelectProps = {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder: string;
};

function SearchableCitySelect({
  id,
  label,
  icon,
  value,
  onChange,
  options,
  placeholder,
}: SearchableCitySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const selectedOption = useMemo(() => {
    return options.find((option) => option.value === value) || null;
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options.slice(0, 100);

    return options
      .filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 100);
  }, [options, query]);

  useEffect(() => {
    if (selectedOption && !open) {
      setQuery(selectedOption.label);
    }
    if (!selectedOption && !open) {
      setQuery("");
    }
  }, [selectedOption, open]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
        if (selectedOption) {
          setQuery(selectedOption.label);
        } else {
          setQuery("");
        }
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        if (selectedOption) {
          setQuery(selectedOption.label);
        } else {
          setQuery("");
        }
      }
    }

    document.addEventListener("pointerdown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [selectedOption]);

  useEffect(() => {
    if (open) setHighlightedIndex(0);
  }, [query, open]);

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setQuery(option.label);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>

      <div
        className={`group relative flex h-[60px] sm:h-[64px] w-full items-center rounded-2xl border px-4 sm:px-5 transition-all duration-200
          ${
            open
              ? "border-amber-400/60 ring-4 ring-amber-400/15 shadow-lg"
              : "border-slate-200/80 dark:border-white/10 hover:border-amber-300/40"
          }
          bg-white/95 dark:bg-slate-900/75 backdrop-blur-xl shadow-sm hover:shadow-md`}
      >
        <div className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 group-hover:text-amber-500 transition-colors">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
            {label}
          </p>

          <input
            ref={inputRef}
            id={id}
            type="text"
            value={query}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              if (value) onChange("");
            }}
            onKeyDown={(e) => {
              if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
                setOpen(true);
                return;
              }

              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlightedIndex((prev) =>
                  Math.min(prev + 1, filteredOptions.length - 1)
                );
              }

              if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlightedIndex((prev) => Math.max(prev - 1, 0));
              }

              if (e.key === "Enter") {
                e.preventDefault();
                const selected = filteredOptions[highlightedIndex];
                if (selected) handleSelect(selected);
              }
            }}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            className="mt-0.5 w-full border-0 bg-transparent text-sm sm:text-base font-semibold text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 outline-none ring-0 focus:outline-none focus:ring-0 focus:border-0 shadow-none appearance-none"
          />
        </div>

        <ChevronDown
          className={`ml-3 h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180 text-amber-500" : ""
          }`}
        />
      </div>

      <div
        className={`absolute left-0 right-0 top-[calc(100%+10px)] z-50 origin-top rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-200
          ${
            open
              ? "pointer-events-auto opacity-100 scale-100 translate-y-0"
              : "pointer-events-none opacity-0 scale-95 -translate-y-1"
          }`}
      >
        <div className="border-b border-slate-200/70 dark:border-slate-800 px-4 py-3">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Search your city
          </p>
        </div>

        <ul
          role="listbox"
          aria-label={label}
          className="max-h-80 overflow-auto py-2"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => {
              const active = option.value === value;
              const highlighted = index === highlightedIndex;

              return (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm sm:text-[15px] transition-colors
                      ${
                        active
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                          : highlighted
                          ? "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white"
                          : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 opacity-70" />
                      <span>{option.label}</span>
                    </div>
                    {active && <Check className="h-4 w-4" />}
                  </button>
                </li>
              );
            })
          ) : (
            <li className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
              No city found
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export function SearchBar() {
  const gold = "rgba(212,175,55,0.9)";
  const dark = "#0d0b06";
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const cities = useAppSelector((state) => state.metadata?.cities ?? []);

  const [city, setCity] = useState("");
  const [roomType, setRoomType] = useState("");
  const [budget, setBudget] = useState("");

  // ✅ REMOVED: Cities are loaded at App level via useInitializeAppData
  // No need to fetch again here - just consume from Redux state

  const cityOptions: Option[] = useMemo(() => {
    return cities
      .map((cityItem) => ({
        label: cityItem.name,
        value: normalizeCityValue(cityItem.name),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [cities]);

  // ✅ CENTRALIZED: Use shared filter constants instead of hardcoded values
  // This ensures consistency across all components (SearchBar, FilterSidebar, Modals)
  const propertyOptions = SEARCH_ROOM_TYPE_OPTIONS;
  const budgetOptions = SEARCH_BUDGET_OPTIONS;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (city) params.append("city", city);
    if (roomType) params.append("roomType", roomType);
    if (budget) {
      const [minPrice, maxPrice] = budget.split("-");
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
    }

    navigate(`/rooms?${params.toString()}`);
  };

  return (
   <form
  onSubmit={handleSearch}
  className="w-full rounded-[2rem] p-[6px] sm:p-2
  bg-white/60 dark:bg-slate-900/60
  backdrop-blur-xl
  border border-slate-200/70 dark:border-white
  shadow-lg hover:shadow-xl
  transition-all duration-300
  hover:border-amber-300/40
  focus-within:border-amber-400/60
  focus-within:ring-4 focus-within:ring-amber-400/10"
>
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 sm:gap-4 items-stretch">
        <SearchableCitySelect
          id="search-city"
          label="City"
          icon={<MapPin className="w-5 h-5" />}
          value={city}
          onChange={setCity}
          options={cityOptions}
          placeholder="Search city..."
        />

        <SearchDropdown
          id="search-type"
          label="Property Type"
          icon={<Home className="w-5 h-5" />}
          value={roomType}
          onChange={setRoomType}
          options={propertyOptions}
          placeholder="Choose Type"
        />

        <SearchDropdown
          id="search-budget"
          label="Budget"
          icon={<Wallet className="w-5 h-5" />}
          value={budget}
          onChange={setBudget}
          options={budgetOptions}
          placeholder="Budget Range"
        />

        <button
          type="submit"
          aria-label="Search for rooms"
          className="group h-[60px] sm:h-[64px] w-full md:w-auto md:min-w-[140px] rounded-2xl bg-gradient-to-r text-slate-950 font-bold shadow-lg hover:shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base focus:outline-none focus:ring-4 focus:ring-amber-400/20"
          style={{ background: gold, color: dark }}
        >
          <Search className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
          <span className="tracking-wide uppercase">Search</span>
        </button>
      </div>
    </form>
  );
}

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useId,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import {
  X,
  ChevronDown,
  Check,
  MapPin,
  Home,
  IndianRupee,
  Sparkles,
  Users,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { createRoom } from "../store/slices/rooms.slice";
import { getCurrentUser } from "../store/slices/auth.slice";
import { fetchOwnerRooms } from "../store/slices/owner.slice";
import { loadAllCities } from "../store/slices/metadata.slice";
import ImageUpload from "./ImageUpload";
import MapLocationPicker from "./MapLocationPicker";
import AmenitiesForm from "./AmenitiesForm";
import FullscreenLoader from "./ui/Loader";
import { FormGrid } from "./ui/FormGrid";
import { RoomType, IdealFor, GenderPreference } from "../types/api.types";
import {
  ROOM_TYPES,
  IDEAL_FOR,
  GENDER_PREFERENCE_OPTIONS,
  GENDER_PREFERENCE_LABELS,
} from "../constants/filterOptions";

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailVerificationRequired?: (retry: () => void) => void;
}

const inputClass =
  "w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-transparent focus:ring-4 focus:ring-amber-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-400 dark:focus:ring-amber-500/20";

const textareaClass =
  "w-full min-h-[140px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-transparent focus:ring-4 focus:ring-amber-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-400 dark:focus:ring-amber-500/20";

const labelClass =
  "mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200";

function SectionCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/70 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        {icon && (
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            {icon}
          </div>
        )}
        <div>
          <h4 className="text-base font-semibold text-slate-900 dark:text-white">
            {title}
          </h4>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function ErrorText({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <p
      id={id}
      className="mt-2 text-xs font-medium text-red-600 dark:text-red-400"
    >
      {children}
    </p>
  );
}

export function AddPropertyModal({
  isOpen,
  onClose,
  onEmailVerificationRequired,
}: AddPropertyModalProps) {
  const dispatch = useAppDispatch();
  const isCreating = useAppSelector((state) => state.rooms.loading.create);
  const { allCities, amenities } = useAppSelector((state) => state.metadata);

  const modalTitleId = useId();
  const modalDescriptionId = useId();

  const modalRef = useRef<HTMLDivElement | null>(null);
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);
  const cityWrapperRef = useRef<HTMLDivElement | null>(null);
  // ✅ NEW: Separate ref for the city input element (used to measure position for portal)
  const cityInputRef = useRef<HTMLInputElement | null>(null);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  const [activeCityIndex, setActiveCityIndex] = useState<number>(-1);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  // ✅ NEW: Track dropdown position for portal rendering
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    city: "",
    location: "",
    landmark: "",
    latitude: null as number | null,
    longitude: null as number | null,
    pricePerMonth: "",
    roomType: "" as RoomType | "",
    idealFor: [] as IdealFor[],
    description: "",
    amenities: [] as string[],
    images: [] as string[],
    genderPreference: "ANY" as GenderPreference,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (allCities.length === 0) dispatch(loadAllCities());
  }, [dispatch, allCities.length]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow || "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isCreating) {
        handleSafeClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isCreating]);

  // ✅ UPDATED: Outside click now closes dropdown via the portal; checks both wrapper and portal
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;

      // Check if click is inside the city input wrapper
      const insideWrapper =
        cityWrapperRef.current && cityWrapperRef.current.contains(target);

      // Check if click is inside the portal dropdown (rendered in body)
      const portalDropdown = document.getElementById("city-dropdown-portal");
      const insidePortal = portalDropdown && portalDropdown.contains(target);

      if (!insideWrapper && !insidePortal) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll<
        | HTMLButtonElement
        | HTMLInputElement
        | HTMLSelectElement
        | HTMLTextAreaElement
        | HTMLAnchorElement
      >(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );

      if (!focusableElements.length) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          (last as HTMLElement).focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          (first as HTMLElement).focus();
        }
      }
    };

    document.addEventListener("keydown", handleFocusTrap);
    return () => document.removeEventListener("keydown", handleFocusTrap);
  }, [isOpen]);

  // ✅ NEW: Measure city input position whenever dropdown should show, and on scroll/resize
  const updateDropdownPosition = useCallback(() => {
    if (!cityInputRef.current) return;
    const rect = cityInputRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 8, // 8px gap below input
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (showDropdown) {
      updateDropdownPosition();
    }
  }, [showDropdown, search, updateDropdownPosition]);

  // ✅ NEW: Re-measure on scroll or resize so the portal dropdown stays aligned
  useEffect(() => {
    if (!showDropdown) return;

    const scrollEl = modalRef.current?.querySelector(".flex-1.overflow-y-auto");

    const handleUpdate = () => updateDropdownPosition();
    window.addEventListener("resize", handleUpdate);
    scrollEl?.addEventListener("scroll", handleUpdate);

    return () => {
      window.removeEventListener("resize", handleUpdate);
      scrollEl?.removeEventListener("scroll", handleUpdate);
    };
  }, [showDropdown, updateDropdownPosition]);

  const filteredCities = useMemo(() => {
    return allCities.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [allCities, search]);

  if (!isOpen) return null;

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      city: "",
      location: "",
      landmark: "",
      latitude: null,
      longitude: null,
      pricePerMonth: "",
      roomType: "" as RoomType | "",
      idealFor: [],
      description: "",
      amenities: [],
      images: [],
      genderPreference: "ANY",
    });
    setErrors({});
    setSearch("");
    setShowDropdown(false);
    setActiveCityIndex(-1);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (formData.title.trim().length < 5) {
      newErrors.title = "Title must be at least 5 characters.";
    }

    if (!formData.city) {
      newErrors.city = "Please select a city.";
    }

    if (formData.location.trim().length < 3) {
      newErrors.location = "Location is required.";
    }

    if (
      formData.latitude === null ||
      formData.longitude === null ||
      !Number.isFinite(formData.latitude) ||
      !Number.isFinite(formData.longitude)
    ) {
      newErrors.mapLocation = "Please pin the property on the map.";
    }

    if (
      !formData.pricePerMonth ||
      Number(formData.pricePerMonth) <= 0 ||
      !Number.isFinite(Number(formData.pricePerMonth))
    ) {
      newErrors.pricePerMonth = "Enter a valid monthly rent.";
    }

    if (formData.description.trim().length < 20) {
      const remaining = 20 - formData.description.trim().length;
      newErrors.description = `${remaining} more character${
        remaining !== 1 ? "s" : ""
      } required.`;
    }

    if (!formData.roomType) {
      newErrors.roomType = "Please select a room type.";
    }

    if (formData.idealFor.length === 0) {
      newErrors.idealFor = "Select at least one tenant type.";
    }

    if (formData.images.length < 3) {
      newErrors.images = "Upload at least 3 property images.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstErrorKey = Object.keys(newErrors)[0];
      const el = fieldRefs.current[firstErrorKey];

      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        (el as HTMLElement).focus?.();
      } else {
        errorSummaryRef.current?.focus();
      }

      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) return;
    if (!validate()) return;

    const apiData = {
      ...formData,
      pricePerMonth: Number(formData.pricePerMonth),
      latitude: formData.latitude ?? undefined,
      longitude: formData.longitude ?? undefined,
    };

    const action = await dispatch(createRoom(apiData));

    if (createRoom.fulfilled.match(action)) {
      dispatch(getCurrentUser());
      await dispatch(fetchOwnerRooms());
      resetForm();
      onClose();
      return;
    }

    if (createRoom.rejected.match(action)) {
      const payload = action.payload as any;
      if (
        payload?.code === "EMAIL_VERIFICATION_REQUIRED" &&
        onEmailVerificationRequired
      ) {
        onEmailVerificationRequired(() => {
          dispatch(createRoom(apiData));
        });
      }
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const toggleIdealFor = (option: IdealFor) => {
    setFormData((prev) => {
      const updated = prev.idealFor.includes(option)
        ? prev.idealFor.filter((o) => o !== option)
        : [...prev.idealFor, option];

      if (updated.length > 0) clearError("idealFor");

      return {
        ...prev,
        idealFor: updated,
      };
    });
  };

  const handleSafeClose = () => {
    if (isCreating) return;
    resetForm();
    onClose();
  };

  const handleCityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown && ["ArrowDown", "Enter"].includes(e.key)) {
      setShowDropdown(true);
      setActiveCityIndex(0);
      return;
    }

    if (!filteredCities.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveCityIndex((prev) =>
        prev < filteredCities.length - 1 ? prev + 1 : 0,
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveCityIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCities.length - 1,
      );
    }

    if (e.key === "Enter" && activeCityIndex >= 0) {
      e.preventDefault();
      const selectedCity = filteredCities[activeCityIndex];
      setFormData((prev) => ({ ...prev, city: selectedCity.id }));
      setSearch(selectedCity.name);
      setShowDropdown(false);
      setActiveCityIndex(-1);
      clearError("city");
    }

    if (e.key === "Escape") {
      setShowDropdown(false);
      setActiveCityIndex(-1);
    }
  };

  // ✅ NEW: Portal dropdown — rendered into document.body so it escapes all stacking contexts
  const cityDropdownPortal =
    showDropdown && search.trim().length > 0 && dropdownPos
      ? createPortal(
          <div
            id="city-dropdown-portal"
            style={{
              position: "fixed",
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
              zIndex: 99999,
            }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800"
          >
            {filteredCities.length > 0 ? (
              <ul
                id="city-listbox"
                role="listbox"
                className="max-h-60 overflow-y-auto p-2"
              >
                {filteredCities.map((c, index) => {
                  const selected = formData.city === c.id;
                  const active = activeCityIndex === index;

                  return (
                    <li
                      key={c.id}
                      id={`city-option-${index}`}
                      role="option"
                      aria-selected={selected}
                      onMouseDown={(e) => {
                        // Use onMouseDown + preventDefault to prevent input blur before click registers
                        e.preventDefault();
                        setFormData((prev) => ({ ...prev, city: c.id }));
                        setSearch(c.name);
                        setShowDropdown(false);
                        setActiveCityIndex(index);
                        clearError("city");
                      }}
                      className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-3 text-sm transition ${
                        active
                          ? "bg-slate-100 dark:bg-slate-700"
                          : "hover:bg-slate-50 dark:hover:bg-slate-700/60"
                      } ${
                        selected
                          ? "font-medium text-amber-700 dark:text-amber-300"
                          : "text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      <span>{c.name}</span>
                      {selected && <Check className="h-4 w-4" />}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                No cities found.
              </div>
            )}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      {isCreating && (
        <FullscreenLoader message="Submitting your property listing..." />
      )}

      {/* ✅ Portal dropdown rendered here, outside all modal stacking contexts */}
      {cityDropdownPortal}

      <div className="fixed inset-0 z-[60] p-0 sm:p-4">
        <div
          className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          onClick={handleSafeClose}
          aria-hidden="true"
        />

        <div className="relative flex h-full items-end justify-center sm:items-center">
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalTitleId}
            aria-describedby={modalDescriptionId}
            className="relative z-10 flex h-[100dvh] w-full flex-col overflow-visible rounded-t-3xl bg-slate-50 shadow-2xl dark:bg-slate-900 sm:h-auto sm:max-h-[94vh] sm:max-w-5xl sm:rounded-3xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    New Listing
                  </div>
                  <h2
                    id={modalTitleId}
                    className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl"
                  >
                    Add New Property
                  </h2>
                  <p
                    id={modalDescriptionId}
                    className="mt-1 text-sm text-slate-500 dark:text-slate-400"
                  >
                    Create a clean, complete listing that renters can trust.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSafeClose}
                  disabled={isCreating}
                  aria-label="Close add property modal"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-amber-200 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:focus:ring-amber-500/20"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto overflow-x-visible px-4 py-4 sm:px-6 sm:py-6"
              noValidate
            >
              <div className="mx-auto max-w-4xl space-y-5">
                {Object.keys(errors).length > 0 && (
                  <div
                    ref={errorSummaryRef}
                    tabIndex={-1}
                    role="alert"
                    aria-live="assertive"
                    className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20"
                  >
                    <p className="font-semibold text-red-700 dark:text-red-400">
                      Please fix the following:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-red-600 dark:text-red-300">
                      {Object.entries(errors).map(([key, message]) => (
                        <li key={key}>
                          <button
                            type="button"
                            onClick={() => fieldRefs.current[key]?.focus?.()}
                            className="text-left underline underline-offset-2"
                          >
                            {message}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div ref={(el) => (fieldRefs.current.images = el)}>
                  <SectionCard
                    title="Photos"
                    subtitle="Add at least 3 clear images to improve trust and visibility."
                    icon={<Home className="h-5 w-5" />}
                  >
                    <ImageUpload
                      images={formData.images}
                      onImagesChange={(images) => {
                        setFormData((prev) => ({ ...prev, images }));
                        if (images.length >= 3) clearError("images");
                      }}
                    />
                    {errors.images && (
                      <ErrorText id="images-error">{errors.images}</ErrorText>
                    )}
                  </SectionCard>
                </div>

                <SectionCard
                  title="Basic Details"
                  subtitle="Give your listing a clear title and accurate location details."
                  icon={<MapPin className="h-5 w-5" />}
                >
                  <FormGrid columns={{ md: 2 }} gap="default">
                    <div>
                      <label htmlFor="title" className={labelClass}>
                        Property Title *
                      </label>
                      <input
                        ref={(el) => {
                          fieldRefs.current.title = el;
                        }}
                        id="title"
                        value={formData.title}
                        maxLength={80}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData((prev) => ({ ...prev, title: value }));
                          if (value.trim().length >= 5) clearError("title");
                        }}
                        aria-invalid={!!errors.title}
                        aria-describedby={
                          errors.title ? "title-error" : undefined
                        }
                        className={`${inputClass} ${
                          errors.title
                            ? "border-red-400 focus:ring-red-200 dark:border-red-700 dark:focus:ring-red-500/20"
                            : ""
                        }`}
                        placeholder="e.g. Fully Furnished PG near College"
                      />
                      {errors.title && (
                        <ErrorText id="title-error">{errors.title}</ErrorText>
                      )}
                    </div>

                    {/* ✅ UPDATED: City field — no longer needs z-[100] or relative positioning tricks */}
                    <div ref={cityWrapperRef}>
                      <label htmlFor="city-search" className={labelClass}>
                        City *
                      </label>

                      <div className="relative">
                        <input
                          id="city-search"
                          role="combobox"
                          aria-expanded={showDropdown}
                          aria-controls="city-listbox"
                          aria-autocomplete="list"
                          aria-activedescendant={
                            activeCityIndex >= 0
                              ? `city-option-${activeCityIndex}`
                              : undefined
                          }
                          ref={(el) => {
                            cityInputRef.current = el;
                            fieldRefs.current.city = el;
                          }}
                          type="text"
                          value={search}
                          placeholder="Search city..."
                          onChange={(e) => {
                            const value = e.target.value;
                            setSearch(value);
                            setShowDropdown(value.trim().length > 0);
                            setActiveCityIndex(0);
                            setFormData((prev) => ({ ...prev, city: "" }));
                          }}
                          onFocus={() => {
                            if (search.trim().length > 0) setShowDropdown(true);
                          }}
                          onKeyDown={handleCityKeyDown}
                          aria-invalid={!!errors.city}
                          aria-describedby={
                            errors.city ? "city-error" : undefined
                          }
                          className={`${inputClass} pr-11 ${
                            errors.city
                              ? "border-red-400 focus:ring-red-200 dark:border-red-700 dark:focus:ring-red-500/20"
                              : ""
                          }`}
                        />
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      </div>

                      {errors.city && (
                        <ErrorText id="city-error">{errors.city}</ErrorText>
                      )}
                    </div>

                    <div>
                      <label htmlFor="location" className={labelClass}>
                        Location *
                      </label>
                      <input
                        ref={(el) => (fieldRefs.current.location = el)}
                        id="location"
                        value={formData.location}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData((prev) => ({ ...prev, location: value }));
                          if (value.trim().length >= 3) clearError("location");
                        }}
                        aria-invalid={!!errors.location}
                        aria-describedby={
                          errors.location ? "location-error" : undefined
                        }
                        className={`${inputClass} ${
                          errors.location
                            ? "border-red-400 focus:ring-red-200 dark:border-red-700 dark:focus:ring-red-500/20"
                            : ""
                        }`}
                        placeholder="e.g. Talwandi, Kota"
                      />
                      {errors.location && (
                        <ErrorText id="location-error">
                          {errors.location}
                        </ErrorText>
                      )}
                    </div>

                    <div>
                      <label htmlFor="landmark" className={labelClass}>
                        Landmark
                      </label>
                      <input
                        id="landmark"
                        value={formData.landmark}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            landmark: e.target.value,
                          }))
                        }
                        className={inputClass}
                        placeholder="e.g. Near Allen Samyak"
                      />
                    </div>
                  </FormGrid>
                </SectionCard>

                <div ref={(el) => (fieldRefs.current.mapLocation = el)}>
                  <SectionCard
                    title="Map Location"
                    subtitle="Pin the exact location so renters can find it easily."
                    icon={<MapPin className="h-5 w-5" />}
                  >
                    <MapLocationPicker
                      latitude={formData.latitude}
                      longitude={formData.longitude}
                      onChange={(lat, lng) => {
                        setFormData((prev) => ({
                          ...prev,
                          latitude: lat,
                          longitude: lng,
                        }));

                        if (
                          lat !== null &&
                          lng !== null &&
                          Number.isFinite(lat) &&
                          Number.isFinite(lng)
                        ) {
                          clearError("mapLocation");
                        }
                      }}
                      defaultCity={formData.city || "bangalore"}
                      showLabel={true}
                    />
                    {errors.mapLocation && (
                      <ErrorText id="map-error">{errors.mapLocation}</ErrorText>
                    )}
                  </SectionCard>
                </div>

                <SectionCard
                  title="Pricing & Property Type"
                  subtitle="Set the rent and choose the room configuration."
                  icon={<IndianRupee className="h-5 w-5" />}
                >
                  <FormGrid columns={{ md: 2 }} gap="default">
                    <div>
                      <label htmlFor="price" className={labelClass}>
                        Monthly Rent (₹) *
                      </label>
                      <input
                        ref={(el) => (fieldRefs.current.pricePerMonth = el)}
                        id="price"
                        type="number"
                        min="1"
                        inputMode="numeric"
                        value={formData.pricePerMonth}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            pricePerMonth: value,
                          }));

                          if (
                            value.trim() !== "" &&
                            Number(value) > 0 &&
                            Number.isFinite(Number(value))
                          ) {
                            clearError("pricePerMonth");
                          }
                        }}
                        aria-invalid={!!errors.pricePerMonth}
                        aria-describedby={
                          errors.pricePerMonth ? "price-error" : undefined
                        }
                        className={`${inputClass} ${
                          errors.pricePerMonth
                            ? "border-red-400 focus:ring-red-200 dark:border-red-700 dark:focus:ring-red-500/20"
                            : ""
                        }`}
                        placeholder="e.g. 8500"
                      />
                      {errors.pricePerMonth && (
                        <ErrorText id="price-error">
                          {errors.pricePerMonth}
                        </ErrorText>
                      )}
                    </div>

                    <div>
                      <label htmlFor="roomType" className={labelClass}>
                        Room Type *
                      </label>
                      <select
                        ref={(el) => (fieldRefs.current.roomType = el)}
                        id="roomType"
                        value={formData.roomType}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            roomType: value as RoomType | "",
                          }));
                          if (value) clearError("roomType");
                        }}
                        aria-invalid={!!errors.roomType}
                        aria-describedby={
                          errors.roomType ? "roomType-error" : undefined
                        }
                        className={`${inputClass} ${
                          errors.roomType
                            ? "border-red-400 focus:ring-red-200 dark:border-red-700 dark:focus:ring-red-500/20"
                            : ""
                        }`}
                      >
                        <option value="">Select Room Type</option>
                        {ROOM_TYPES.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {errors.roomType && (
                        <ErrorText id="roomType-error">
                          {errors.roomType}
                        </ErrorText>
                      )}
                    </div>
                  </FormGrid>
                </SectionCard>

  <SectionCard
                  title="Ideal For"
                  subtitle="Help renters understand who this property suits best."
                  icon={<Home className="h-5 w-5" />}
                >
                  <fieldset
                    ref={(el) => (fieldRefs.current.idealFor = el)}
                    aria-invalid={!!errors.idealFor}
                    aria-describedby={
                      errors.idealFor ? "idealFor-error" : undefined
                    }
                  >
                    <legend className="sr-only">Ideal For</legend>

                    <FormGrid columns={{ sm: 2, md: 3 }} gap="compact">
                      {IDEAL_FOR.map((option) => {
                        const selected = formData.idealFor.includes(option);

                        return (
                          <label
                            key={option}
                            className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${
                              selected
                                ? "border-amber-400 bg-amber-50 ring-2 ring-amber-200 dark:border-amber-500 dark:bg-amber-500/10 dark:ring-amber-500/20"
                                : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/60"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleIdealFor(option)}
                              className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                            />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                              {option}
                            </span>
                          </label>
                        );
                      })}
                    </FormGrid>

                    {errors.idealFor && (
                      <ErrorText id="idealFor-error">
                        {errors.idealFor}
                      </ErrorText>
                    )}
                  </fieldset>
                </SectionCard>

                <SectionCard
                  title="Who can rent?"
                  subtitle="Specify if this property is available for anyone, boys only, or girls only."
                  icon={<Users className="h-5 w-5" />}
                >
                  <fieldset
                    ref={(el) => (fieldRefs.current.genderPreference = el)}
                  >
                    <legend className="sr-only">Gender Preference</legend>
                    <FormGrid columns={{ sm: 2, md: 3 }} gap="compact">
                      {GENDER_PREFERENCE_OPTIONS.map((option) => (
                        <label
                          key={option}
                          className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${
                            formData.genderPreference === option
                              ? "border-amber-400 bg-amber-50 ring-2 ring-amber-200 dark:border-amber-500 dark:bg-amber-500/10 dark:ring-amber-500/20"
                              : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/60"
                          }`}
                        >
                          <input
                            type="radio"
                            name="genderPreference"
                            value={option}
                            checked={formData.genderPreference === option}
                            onChange={() =>
                              setFormData((prev) => ({
                                ...prev,
                                genderPreference: option,
                              }))
                            }
                            className="h-4 w-4 border-slate-300 text-amber-600 focus:ring-amber-500"
                          />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            {GENDER_PREFERENCE_LABELS[option]}
                          </span>
                        </label>
                      ))}
                    </FormGrid>
                  </fieldset>
                </SectionCard>

                <SectionCard
                  title="Description"
                  subtitle="Write a short but useful summary of the room and nearby highlights."
                  icon={<Sparkles className="h-5 w-5" />}
                >
                  <div>
                    <label htmlFor="description" className="sr-only">
                      Description
                    </label>
                    <textarea
                      ref={(el) => (fieldRefs.current.description = el)}
                      id="description"
                      rows={5}
                      maxLength={500}
                      value={formData.description}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          description: value,
                        }));
                        if (value.trim().length >= 20)
                          clearError("description");
                      }}
                      aria-invalid={!!errors.description}
                      aria-describedby={
                        errors.description
                          ? "description-error"
                          : "description-help"
                      }
                      className={`${textareaClass} ${
                        errors.description
                          ? "border-red-400 focus:ring-red-200 dark:border-red-700 dark:focus:ring-red-500/20"
                          : ""
                      }`}
                      placeholder="Describe furnishing, ventilation, nearby colleges/offices, food options, transport, and any house rules..."
                    />

                    <div className="mt-2 flex items-center justify-between">
                      {errors.description ? (
                        <ErrorText id="description-error">
                          {errors.description}
                        </ErrorText>
                      ) : (
                        <p
                          id="description-help"
                          className="text-xs text-slate-500 dark:text-slate-400"
                        >
                          Minimum 20 characters
                        </p>
                      )}

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formData.description.length}/500
                      </p>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  title="Amenities"
                  subtitle="Optional, but useful for improving listing quality."
                  icon={<Check className="h-5 w-5" />}
                >
                  <AmenitiesForm
                    selectedAmenities={formData.amenities}
                    onAmenitiesChange={(amenityIds) => {
                      setFormData((prev) => ({
                        ...prev,
                        amenities: amenityIds,
                      }));
                      clearError('amenities');
                    }}
                    error={errors.amenities}
                    ariaDescribedBy={errors.amenities ? 'amenities-error' : undefined}
                  />
                </SectionCard>
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 mt-6 border-t border-slate-200/80 bg-white/90 px-0 py-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
                <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleSafeClose}
                    disabled={isCreating}
                    className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:focus:ring-slate-700 sm:flex-1"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isCreating}
                    aria-busy={isCreating}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[rgba(212,175,55,0.9)] px-4 text-sm font-semibold text-white transition hover:bg-[rgba(189,158,56,0.9)] focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:opacity-50 dark:bg-[rgba(212,175,55,0.9)] dark:text-slate-900 dark:hover:bg-[rgba(189,158,56,0.9)] dark:focus:ring-slate-700 sm:flex-1"
                  >
                    {isCreating ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-slate-400 dark:border-t-slate-900" />
                        Adding Property...
                      </>
                    ) : (
                      "Add Property"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

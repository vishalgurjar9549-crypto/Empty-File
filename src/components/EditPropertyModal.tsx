import React, { useEffect, useMemo, useRef, useState, useId } from "react";
import {
  X,
  ChevronDown,
  Check,
  MapPin,
  Home,
  IndianRupee,
  Sparkles,
  ShieldCheck,
  PencilLine,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { updateRoom } from "../store/slices/rooms.slice";
import {
  loadAllCities,
  loadAmenities,
} from "../store/slices/metadata.slice";
import { showToast } from "../store/slices/ui.slice";
import ImageUpload from "./ImageUpload";
import MapLocationPicker from "./MapLocationPicker";
import FullscreenLoader from "./ui/Loader";
import { Room, IdealFor, RoomType } from "../types/api.types";

interface EditPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  isAdmin?: boolean;
  onEditComplete?: () => void;
}

type FormDataType = {
  title: string;
  city: string;
  location: string;
  landmark: string;
  latitude: number | null;
  longitude: number | null;
  pricePerMonth: string;
  roomType: RoomType;
  idealFor: IdealFor[];
  description: string;
  amenities: string[];
  images: string[];
};

const roomTypeOptions: RoomType[] = ["Single", "Shared", "PG", "1BHK", "2BHK"];
const idealForOptions: IdealFor[] = [
  "Students",
  "Working Professionals",
  "Family",
];

const getRoomFormData = (room: Room): FormDataType => ({
  title: room.title ?? "",
  city: room.city ?? "",
  location: room.location ?? "",
  landmark: room.landmark ?? "",
  latitude: room.latitude ?? null,
  longitude: room.longitude ?? null,
  pricePerMonth: room.pricePerMonth?.toString() ?? "",
  roomType: (room.roomType as RoomType) ?? "Single",
  idealFor: Array.isArray(room.idealFor) ? room.idealFor : [],
  description: room.description ?? "",
  amenities: Array.isArray(room.amenities) ? room.amenities : [],
  images: Array.isArray(room.images) ? room.images : [],
});

const inputClass =
  "w-full h-12 rounded-2xl border border-[rgba(212,175,55,0.16)] bg-white/95 px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-[rgba(212,175,55,0.4)] focus:ring-4 focus:ring-[rgba(212,175,55,0.12)] dark:border-[rgba(212,175,55,0.18)] dark:bg-[#15110b] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[rgba(212,175,55,0.45)] dark:focus:ring-[rgba(212,175,55,0.12)]";

const textareaClass =
  "w-full min-h-[140px] rounded-2xl border border-[rgba(212,175,55,0.16)] bg-white/95 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-[rgba(212,175,55,0.4)] focus:ring-4 focus:ring-[rgba(212,175,55,0.12)] dark:border-[rgba(212,175,55,0.18)] dark:bg-[#15110b] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[rgba(212,175,55,0.45)] dark:focus:ring-[rgba(212,175,55,0.12)]";

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
    <section className="rounded-3xl border border-[rgba(212,175,55,0.16)] bg-white/80 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.05)] backdrop-blur-xl dark:border-[rgba(212,175,55,0.14)] dark:bg-[#120f0a]/80 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        {icon && (
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(212,175,55,0.12)] text-[rgba(212,175,55,0.95)] dark:bg-[rgba(212,175,55,0.1)] dark:text-[rgba(212,175,55,0.9)]">
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

export function EditPropertyModal({
  isOpen,
  onClose,
  room,
  isAdmin = false,
  onEditComplete,
}: EditPropertyModalProps) {
  const dispatch = useAppDispatch();
  const { allCities, amenities } = useAppSelector((state) => state.metadata);
  const isUpdating = useAppSelector((state) => state.rooms.loading.update);

  const modalTitleId = useId();
  const modalDescriptionId = useId();

  const modalRef = useRef<HTMLDivElement | null>(null);
  const firstFocusableRef = useRef<HTMLInputElement | null>(null);
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);
  const cityWrapperRef = useRef<HTMLDivElement | null>(null);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  const [activeCityIndex, setActiveCityIndex] = useState<number>(-1);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [formData, setFormData] = useState<FormDataType>(getRoomFormData(room));
  const [initialData, setInitialData] = useState<FormDataType>(getRoomFormData(room));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (allCities.length === 0) dispatch(loadAllCities());
    if (amenities.length === 0) dispatch(loadAmenities());
  }, [dispatch, allCities.length, amenities.length]);

  useEffect(() => {
    if (!isOpen) return;

    const data = getRoomFormData(room);
    setFormData(data);
    setInitialData(data);

    const selectedCity = allCities.find((c) => c.id === data.city);
    setSearch(selectedCity?.name ?? "");
    setErrors({});
    setShowDropdown(false);
    setActiveCityIndex(-1);
  }, [isOpen, room, allCities]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timeout = setTimeout(() => {
      firstFocusableRef.current?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = originalOverflow || "auto";
      clearTimeout(timeout);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isUpdating) {
        handleSafeClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isUpdating]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        cityWrapperRef.current &&
        !cityWrapperRef.current.contains(e.target as Node)
      ) {
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
        HTMLButtonElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLAnchorElement
      >(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
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

  const filteredCities = useMemo(() => {
    return allCities.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
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

  const getChangedFields = () => {
    const changed: Partial<FormDataType> = {};

    (Object.keys(formData) as (keyof FormDataType)[]).forEach((key) => {
      const current = formData[key];
      const initial = initialData[key];

      if (JSON.stringify(current) !== JSON.stringify(initial)) {
        changed[key] = key === "pricePerMonth" ? String(current) : current;
      }
    });

    return changed;
  };

  const validateChangedFields = (data: Partial<FormDataType>) => {
    const newErrors: Record<string, string> = {};

    if ("title" in data && data.title !== undefined && data.title.trim().length < 5) {
      newErrors.title = "Title must be at least 5 characters.";
    }

    if ("city" in data && !data.city) {
      newErrors.city = "Please select a city.";
    }

    if ("location" in data && data.location !== undefined && data.location.trim().length < 3) {
      newErrors.location = "Location is required.";
    }

    const mapChanged = "latitude" in data || "longitude" in data;

    if (
      mapChanged &&
      (
        formData.latitude === null ||
        formData.longitude === null ||
        !Number.isFinite(formData.latitude) ||
        !Number.isFinite(formData.longitude)
      )
    ) {
      newErrors.mapLocation = "Please pin the property on the map.";
    }

    if (
      "pricePerMonth" in data &&
      (!data.pricePerMonth ||
        Number(data.pricePerMonth) <= 0 ||
        !Number.isFinite(Number(data.pricePerMonth)))
    ) {
      newErrors.pricePerMonth = "Enter a valid monthly rent.";
    }

    if (
      "description" in data &&
      data.description !== undefined &&
      data.description.trim().length < 20
    ) {
      const remaining = 20 - data.description.trim().length;
      newErrors.description = `${remaining} more character${
        remaining !== 1 ? "s" : ""
      } required.`;
    }

    if ("idealFor" in data && data.idealFor && data.idealFor.length === 0) {
      newErrors.idealFor = "Select at least one tenant type.";
    }

    if ("images" in data && data.images && data.images.length < 3) {
      newErrors.images = "Upload at least 3 property images.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstKey = Object.keys(newErrors)[0];
      const el = fieldRefs.current[firstKey];

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

  const handleSafeClose = () => {
    if (isUpdating) return;
    const data = getRoomFormData(room);
    setFormData(data);
    setInitialData(data);
    setErrors({});
    const selectedCity = allCities.find((c) => c.id === data.city);
    setSearch(selectedCity?.name ?? "");
    setShowDropdown(false);
    setActiveCityIndex(-1);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUpdating) return;

    const changedData = getChangedFields();

    if (Object.keys(changedData).length === 0) {
      dispatch(
        showToast({
          message: "No changes made",
          type: "info",
        })
      );
      return;
    }

    if (!validateChangedFields(changedData)) return;

    const payload = {
      ...changedData,
      ...(changedData.pricePerMonth !== undefined && {
        pricePerMonth: Number(changedData.pricePerMonth),
      }),
    };

    const action = await dispatch(
      updateRoom({
        id: room.id,
        data: payload,
      })
    );

    if (updateRoom.fulfilled.match(action)) {
      handleSafeClose();
      onEditComplete?.();
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
        prev < filteredCities.length - 1 ? prev + 1 : 0
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveCityIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCities.length - 1
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

  const changedFieldsCount = Object.keys(getChangedFields()).length;

  return (
    <>
      {isUpdating && (
        <FullscreenLoader message="Saving your property changes..." />
      )}

      <div className="fixed inset-0 z-[60] p-0 sm:p-4">
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
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
            className="relative z-10 flex h-[100dvh] w-full flex-col overflow-hidden rounded-t-[2rem] border border-[rgba(212,175,55,0.14)] bg-[#f8f6f1] shadow-2xl dark:bg-[#0d0b06] sm:h-auto sm:max-h-[94vh] sm:max-w-5xl sm:rounded-[2rem]"
          >
            {/* Header */}
            <div className="sticky top-0 z-20 border-b border-[rgba(212,175,55,0.12)] bg-white/80 px-4 py-4 backdrop-blur-xl dark:bg-[#0d0b06]/90 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,55,0.18)] bg-[rgba(212,175,55,0.10)] px-3 py-1 text-xs font-medium text-[rgba(212,175,55,0.95)]">
                      <PencilLine className="h-3.5 w-3.5" />
                      Edit Listing
                    </div>

                    {isAdmin && (
                      <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        ADMIN
                      </div>
                    )}
                  </div>

                  <h2
                    id={modalTitleId}
                    className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl"
                  >
                    Edit Property
                  </h2>
                  <p
                    id={modalDescriptionId}
                    className="mt-1 text-sm text-slate-500 dark:text-slate-400"
                  >
                    {isAdmin
                      ? "Update this listing with full admin control."
                      : "Update your listing details and keep it renter-ready."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSafeClose}
                  disabled={isUpdating}
                  aria-label="Close edit property modal"
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(212,175,55,0.12)] bg-white/70 text-slate-600 transition hover:bg-white dark:bg-[#15110b] dark:text-slate-300 dark:hover:bg-[#1c1710] disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6"
            >
              <div className="mx-auto w-full max-w-4xl space-y-6">
                {Object.keys(errors).length > 0 && (
                  <div
                    ref={errorSummaryRef}
                    tabIndex={-1}
                    role="alert"
                    aria-live="assertive"
                    className="rounded-2xl border border-red-300 bg-red-50/90 p-4 dark:border-red-900/50 dark:bg-red-950/20"
                  >
                    <p className="font-semibold text-red-700 dark:text-red-400">
                      Please fix the following issues:
                    </p>
                    <ul className="mt-2 list-disc pl-5 text-sm text-red-600 dark:text-red-300">
                      {Object.values(errors).map((msg, i) => (
                        <li key={i}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Images */}
                <SectionCard
                  title="Property Media"
                  subtitle="Update listing photos for better trust and visibility."
                  icon={<Sparkles className="h-5 w-5" />}
                >
                  <div ref={(el) => (fieldRefs.current.images = el)}>
                    <ImageUpload
                      images={formData.images}
                      onImagesChange={(images) => {
                        setFormData((prev) => ({
                          ...prev,
                          images,
                        }));

                        if (images.length >= 3) {
                          clearError("images");
                        }
                      }}
                    />
                    {errors.images && (
                      <ErrorText id="images-error">{errors.images}</ErrorText>
                    )}
                  </div>
                </SectionCard>

                {/* Basic Info */}
                <SectionCard
                  title="Basic Details"
                  subtitle="Edit the title, city and address details."
                  icon={<Home className="h-5 w-5" />}
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor="title" className={labelClass}>
                        Property Title *
                      </label>
                      <input
                        ref={(el) => {
                          fieldRefs.current.title = el;
                          firstFocusableRef.current = el;
                        }}
                        id="title"
                        value={formData.title}
                        maxLength={80}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            title: value,
                          }));

                          if (value.trim().length >= 5) clearError("title");
                        }}
                        aria-invalid={!!errors.title}
                        aria-describedby={errors.title ? "title-error" : undefined}
                        className={`${inputClass} ${
                          errors.title
                            ? "!border-red-400 !ring-4 !ring-red-100 dark:!border-red-500/70 dark:!ring-red-500/10"
                            : ""
                        }`}
                        placeholder="e.g. Premium PG near city center"
                      />
                      {errors.title && (
                        <ErrorText id="title-error">{errors.title}</ErrorText>
                      )}
                    </div>

                    <div className="relative" ref={cityWrapperRef}>
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
                          ref={(el) => (fieldRefs.current.city = el)}
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
                          aria-describedby={errors.city ? "city-error" : undefined}
                          className={`${inputClass} pr-11 ${
                            errors.city
                              ? "!border-red-400 !ring-4 !ring-red-100 dark:!border-red-500/70 dark:!ring-red-500/10"
                              : ""
                          }`}
                        />

                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      </div>

                      {showDropdown &&
                        search.trim().length > 0 &&
                        filteredCities.length > 0 && (
                          <ul
                            id="city-listbox"
                            role="listbox"
                            className="absolute left-0 top-full z-[9999] mt-2 max-h-[40vh] w-full overflow-y-auto rounded-2xl border border-[rgba(212,175,55,0.16)] bg-white/95 p-1 shadow-2xl backdrop-blur-xl dark:bg-[#15110b]/95"
                          >
                            {filteredCities.map((c, index) => (
                              <li
                                key={c.id}
                                id={`city-option-${index}`}
                                role="option"
                                aria-selected={formData.city === c.id}
                                onClick={() => {
                                  setFormData((prev) => ({ ...prev, city: c.id }));
                                  setSearch(c.name);
                                  setShowDropdown(false);
                                  setActiveCityIndex(index);
                                  clearError("city");
                                }}
                                className={`flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 text-sm transition-all ${
                                  activeCityIndex === index
                                    ? "bg-[rgba(212,175,55,0.08)] dark:bg-[rgba(212,175,55,0.10)]"
                                    : ""
                                } ${
                                  formData.city === c.id
                                    ? "text-[rgba(212,175,55,0.95)] font-medium"
                                    : "text-slate-700 dark:text-slate-200"
                                } hover:bg-[rgba(212,175,55,0.08)] dark:hover:bg-[rgba(212,175,55,0.10)]`}
                              >
                                <span>{c.name}</span>
                                {formData.city === c.id && (
                                  <Check className="h-4 w-4" />
                                )}
                              </li>
                            ))}
                          </ul>
                        )}

                      {showDropdown &&
                        search.trim().length > 0 &&
                        filteredCities.length === 0 && (
                          <div className="absolute left-0 top-full z-[9999] mt-2 w-full rounded-2xl border border-[rgba(212,175,55,0.16)] bg-white/95 px-4 py-3 text-sm text-slate-500 shadow-xl dark:bg-[#15110b]/95 dark:text-slate-400">
                            No cities found
                          </div>
                        )}

                      {errors.city && (
                        <ErrorText id="city-error">{errors.city}</ErrorText>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
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
                          setFormData((prev) => ({
                            ...prev,
                            location: value,
                          }));

                          if (value.trim().length >= 3) clearError("location");
                        }}
                        aria-invalid={!!errors.location}
                        aria-describedby={errors.location ? "location-error" : undefined}
                        className={`${inputClass} ${
                          errors.location
                            ? "!border-red-400 !ring-4 !ring-red-100 dark:!border-red-500/70 dark:!ring-red-500/10"
                            : ""
                        }`}
                        placeholder="e.g. Near Railway Station"
                      />
                      {errors.location && (
                        <ErrorText id="location-error">{errors.location}</ErrorText>
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
                        placeholder="Nearby college, mall, metro..."
                      />
                    </div>
                  </div>
                </SectionCard>

                {/* Map */}
                <SectionCard
                  title="Map Location"
                  subtitle="Pin the exact property location for better discovery."
                  icon={<MapPin className="h-5 w-5" />}
                >
                  <div ref={(el) => (fieldRefs.current.mapLocation = el)}>
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
                  </div>
                </SectionCard>

                {/* Pricing & Type */}
                <SectionCard
                  title="Pricing & Room Type"
                  subtitle="Keep your listing clear and easy to compare."
                  icon={<IndianRupee className="h-5 w-5" />}
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                        aria-describedby={errors.pricePerMonth ? "price-error" : undefined}
                        className={`${inputClass} ${
                          errors.pricePerMonth
                            ? "!border-red-400 !ring-4 !ring-red-100 dark:!border-red-500/70 dark:!ring-red-500/10"
                            : ""
                        }`}
                        placeholder="e.g. 8500"
                      />
                      {errors.pricePerMonth && (
                        <ErrorText id="price-error">{errors.pricePerMonth}</ErrorText>
                      )}
                    </div>

                    <div>
                      <label htmlFor="roomType" className={labelClass}>
                        Room Type
                      </label>
                      <select
                        id="roomType"
                        value={formData.roomType}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            roomType: e.target.value as RoomType,
                          }))
                        }
                        className={inputClass}
                      >
                        {roomTypeOptions.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </SectionCard>

                {/* Ideal For */}
                <SectionCard
                  title="Ideal For"
                  subtitle="Choose who this property suits best."
                  icon={<Check className="h-5 w-5" />}
                >
                  <fieldset
                    ref={(el) => (fieldRefs.current.idealFor = el)}
                    aria-invalid={!!errors.idealFor}
                    aria-describedby={errors.idealFor ? "idealFor-error" : undefined}
                  >
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                      {idealForOptions.map((option) => {
                        const active = formData.idealFor.includes(option);

                        return (
                          <label
                            key={option}
                            className={`group flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-all ${
                              active
                                ? "border-[rgba(212,175,55,0.35)] bg-[rgba(212,175,55,0.10)] text-slate-900 dark:bg-[rgba(212,175,55,0.08)] dark:text-white"
                                : "border-[rgba(212,175,55,0.14)] bg-white/70 hover:bg-[rgba(212,175,55,0.05)] dark:bg-[#15110b]"
                            }`}
                          >
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${
                                active
                                  ? "border-[rgba(212,175,55,0.9)] bg-[rgba(212,175,55,0.9)] text-black"
                                  : "border-slate-300 dark:border-slate-600"
                              }`}
                            >
                              {active && <Check className="h-3.5 w-3.5" />}
                            </div>
                            <input
                              type="checkbox"
                              checked={active}
                              onChange={() => toggleIdealFor(option)}
                              className="sr-only"
                            />
                            <span>{option}</span>
                          </label>
                        );
                      })}
                    </div>

                    {errors.idealFor && (
                      <ErrorText id="idealFor-error">{errors.idealFor}</ErrorText>
                    )}
                  </fieldset>
                </SectionCard>

                {/* Description */}
                <SectionCard
                  title="Description"
                  subtitle="Tell renters what makes this property worth choosing."
                  icon={<Sparkles className="h-5 w-5" />}
                >
                  <div>
                    <label htmlFor="description" className={labelClass}>
                      Property Description *
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

                        if (value.trim().length >= 20) {
                          clearError("description");
                        }
                      }}
                      aria-invalid={!!errors.description}
                      aria-describedby={
                        errors.description ? "description-error" : "description-help"
                      }
                      className={`${textareaClass} ${
                        errors.description
                          ? "!border-red-400 !ring-4 !ring-red-100 dark:!border-red-500/70 dark:!ring-red-500/10"
                          : ""
                      }`}
                      placeholder="Describe the room, furnishing, nearby places, rules, and what makes it stand out..."
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

                {/* Amenities */}
                <SectionCard
                  title="Amenities"
                  subtitle="Highlight the facilities available at this property."
                  icon={<Home className="h-5 w-5" />}
                >
                  <fieldset
                    ref={(el) => (fieldRefs.current.amenities = el)}
                    className="space-y-3"
                  >
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                      {amenities.map((amenity) => {
                        const active = formData.amenities.includes(amenity);

                        return (
                          <label
                            key={amenity}
                            className={`group flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-all ${
                              active
                                ? "border-[rgba(212,175,55,0.35)] bg-[rgba(212,175,55,0.10)] text-slate-900 dark:bg-[rgba(212,175,55,0.08)] dark:text-white"
                                : "border-[rgba(212,175,55,0.14)] bg-white/70 hover:bg-[rgba(212,175,55,0.05)] dark:bg-[#15110b]"
                            }`}
                          >
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${
                                active
                                  ? "border-[rgba(212,175,55,0.9)] bg-[rgba(212,175,55,0.9)] text-black"
                                  : "border-slate-300 dark:border-slate-600"
                              }`}
                            >
                              {active && <Check className="h-3.5 w-3.5" />}
                            </div>
                            <input
                              type="checkbox"
                              checked={active}
                              onChange={() => toggleAmenity(amenity)}
                              className="sr-only"
                            />
                            <span>{amenity}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                </SectionCard>

                {/* Footer Actions */}
                <div className="sticky bottom-0 z-20 -mx-4 border-t border-[rgba(212,175,55,0.12)] bg-white/85 px-4 py-4 backdrop-blur-xl dark:bg-[#0d0b06]/90 sm:-mx-6 sm:px-6">
                  <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {changedFieldsCount > 0 ? (
                        <span>
                          <span className="font-semibold text-slate-800 dark:text-white">
                            {changedFieldsCount}
                          </span>{" "}
                          field{changedFieldsCount > 1 ? "s" : ""} changed
                        </span>
                      ) : (
                        "No unsaved changes yet"
                      )}
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                      <button
                        type="button"
                        onClick={handleSafeClose}
                        disabled={isUpdating}
                        className="w-full rounded-2xl border border-[rgba(212,175,55,0.18)] bg-white/70 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-white dark:bg-[#15110b] dark:text-slate-300 dark:hover:bg-[#1c1710] sm:w-auto"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={isUpdating}
                        aria-busy={isUpdating}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[rgba(212,175,55,0.92)] px-5 py-3 text-sm font-semibold text-[#0d0b06] shadow-[0_10px_30px_rgba(212,175,55,0.22)] transition hover:scale-[1.01] hover:bg-[rgba(212,175,55,1)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                      >
                        {isUpdating ? (
                          <>
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
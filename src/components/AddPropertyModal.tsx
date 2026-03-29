import React, { useEffect, useState, useRef, useId } from "react";
import { X, ChevronDown } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { createRoom } from "../store/slices/rooms.slice";
import { getCurrentUser } from "../store/slices/auth.slice";
import {
  loadAllCities,
  loadAmenities,
} from "../store/slices/metadata.slice";
import ImageUpload from "./ImageUpload";
import MapLocationPicker from "./MapLocationPicker";
import FullscreenLoader from "./ui/Loader";
import { RoomType, IdealFor } from "../types/api.types";

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailVerificationRequired?: (retry: () => void) => void;
}

export function AddPropertyModal({
  isOpen,
  onClose,
  onEmailVerificationRequired
}: AddPropertyModalProps) {
  const dispatch = useAppDispatch();
  const isCreating = useAppSelector((state) => state.rooms.loading.create);
  const { allCities, amenities } = useAppSelector((state) => state.metadata);

  const modalTitleId = useId();
  const modalDescriptionId = useId();

  const modalRef = useRef<HTMLDivElement | null>(null);
  const firstFocusableRef = useRef<HTMLInputElement | null>(null);
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);
  const cityWrapperRef = useRef<HTMLDivElement | null>(null);

  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeCityIndex, setActiveCityIndex] = useState<number>(-1);

  const [formData, setFormData] = useState({
    title: "",
    city: "",
    location: "",
    landmark: "",
    latitude: null as number | null,
    longitude: null as number | null,
    pricePerMonth: "",
    roomType: "Single" as RoomType,
    idealFor: ["Students"] as IdealFor[],
    description: "",
    amenities: [] as string[],
    images: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const idealForOptions: IdealFor[] = [
    "Students",
    "Working Professionals",
    "Family",
  ];

  useEffect(() => {
    if (allCities.length === 0) dispatch(loadAllCities());
    if (amenities.length === 0) dispatch(loadAmenities());
  }, [dispatch, allCities.length, amenities.length]);

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
      if (e.key === "Escape" && !isCreating) {
        handleSafeClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isCreating]);

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

  if (!isOpen) return null;

  const filteredCities = allCities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
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
      roomType: "Single",
      idealFor: ["Students"],
      description: "",
      amenities: [],
      images: [],
    });
    setErrors({});
    setSearch("");
    setShowDropdown(false);
    setActiveCityIndex(-1);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (formData.title.trim().length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }

    if (!formData.city) {
      newErrors.city = "City is required";
    }

    if (formData.location.trim().length < 3) {
      newErrors.location = "Location is required";
    }

    if (
      formData.latitude === null ||
      formData.longitude === null ||
      !Number.isFinite(formData.latitude) ||
      !Number.isFinite(formData.longitude)
    ) {
      newErrors.mapLocation = "Please select a location on the map";
    }

    if (
      !formData.pricePerMonth ||
      Number(formData.pricePerMonth) <= 0 ||
      !Number.isFinite(Number(formData.pricePerMonth))
    ) {
      newErrors.pricePerMonth = "Enter a valid monthly rent";
    }

    if (formData.description.trim().length < 20) {
      const remaining = 20 - formData.description.trim().length;
      newErrors.description = `${remaining} more character${
        remaining !== 1 ? "s" : ""
      } required`;
    }

    if (formData.idealFor.length === 0) {
      newErrors.idealFor = "Please select at least one tenant type";
    }

    if (formData.images.length < 3) {
      newErrors.images = "At least three images are required";
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
    dispatch(createRoom(apiData)).then((action) => {
      if (createRoom.fulfilled.match(action)) {
        // Refetch current user so role upgrade (TENANT → OWNER) is reflected in Redux state
        dispatch(getCurrentUser());
        onClose();
        setFormData({
          title: '',
          city: '',
          location: '',
          landmark: '',
          latitude: null,
          longitude: null,
          pricePerMonth: '',
          roomType: 'Single',
          idealFor: ['Students'],
          description: '',
          amenities: [],
          images: []
        });
        setErrors({});
        return;
      }

      if (createRoom.rejected.match(action)) {
        const payload = action.payload as any;
        if (payload?.code === 'EMAIL_VERIFICATION_REQUIRED' && onEmailVerificationRequired) {
          onEmailVerificationRequired(() => {
            dispatch(createRoom(apiData));
          });
        }
      }
    });

    const action = await dispatch(createRoom(apiData));

    if (createRoom.fulfilled.match(action)) {
      dispatch(getCurrentUser());
      resetForm();
      onClose();
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
      const updatedIdealFor = prev.idealFor.includes(option)
        ? prev.idealFor.filter((o) => o !== option)
        : [...prev.idealFor, option];

      if (updatedIdealFor.length > 0) {
        clearError("idealFor");
      }

      return {
        ...prev,
        idealFor: updatedIdealFor,
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

  return (
    <>
      {isCreating && (
        <FullscreenLoader message="Submitting your property listing..." />
      )}

      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4"
        aria-hidden={false}
      >
        <button
          type="button"
          aria-label="Close modal overlay"
          onClick={handleSafeClose}
          disabled={isCreating}
          className="absolute inset-0 bg-navy/60 backdrop-blur-sm cursor-default"
        />

        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={modalTitleId}
          aria-describedby={modalDescriptionId}
          className="relative z-10 w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-h-[92vh] overflow-hidden"
        >
          <div className="sticky top-0 z-20 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-4 sm:px-6 py-4 flex items-center justify-between">
            <div>
              <h3
                id={modalTitleId}
                className="text-xl sm:text-2xl font-bold text-navy dark:text-white"
              >
                Add New Property
              </h3>
              <p
                id={modalDescriptionId}
                className="mt-1 text-sm text-slate-500 dark:text-slate-400"
              >
                Fill in the property details and submit your listing.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSafeClose}
              disabled={isCreating}
              aria-label="Close add property modal"
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(92vh-88px)]"
            noValidate
          >
            {Object.keys(errors).length > 0 && (
              <div
                ref={errorSummaryRef}
                tabIndex={-1}
                role="alert"
                aria-live="assertive"
                className="rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4"
              >
                <p className="font-semibold text-red-700 dark:text-red-400">
                  Please fix the following errors:
                </p>
                <ul className="list-disc pl-5 mt-2 text-sm text-red-600 dark:text-red-300">
                  {Object.entries(errors).map(([key, message]) => (
                    <li key={key}>{message}</li>
                  ))}
                </ul>
              </div>
            )}

            <div ref={(el) => (fieldRefs.current.images = el)}>
              <ImageUpload
                images={formData.images}
                onImagesChange={(images) => {
                  setFormData((prev) => ({ ...prev, images }));

                  if (images.length >= 3) {
                    clearError("images");
                  }
                }}
              />
              {errors.images && (
                <p id="images-error" className="text-red-500 text-xs mt-2">
                  {errors.images}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium mb-1 dark:text-slate-300"
                >
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

                    if (value.trim().length >= 5) {
                      clearError("title");
                    }
                  }}
                  aria-invalid={!!errors.title}
                  aria-describedby={errors.title ? "title-error" : undefined}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-white ${
                    errors.title
                      ? "border-red-400 dark:border-red-700 focus:ring-red-300"
                      : "border-slate-200 dark:border-slate-600 focus:ring-gold"
                  }`}
                />
                {errors.title && (
                  <p id="title-error" className="text-red-500 text-xs mt-1">
                    {errors.title}
                  </p>
                )}
              </div>

              <div className="relative" ref={cityWrapperRef}>
                <label
                  htmlFor="city-search"
                  className="block text-sm font-medium mb-1 dark:text-slate-300"
                >
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

                      if (value.trim().length === 0) return;
                    }}
                    onFocus={() => {
                      if (search.trim().length > 0) setShowDropdown(true);
                    }}
                    onKeyDown={handleCityKeyDown}
                    aria-invalid={!!errors.city}
                    aria-describedby={errors.city ? "city-error" : undefined}
                    className={`w-full px-4 py-3 pr-11 border rounded-lg focus:outline-none focus:ring-2 transition-all dark:bg-slate-700 dark:text-white placeholder:text-slate-400 ${
                      errors.city
                        ? "border-red-400 dark:border-red-700 focus:ring-red-300"
                        : "border-slate-200 dark:border-slate-600 focus:ring-gold"
                    }`}
                  />

                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                </div>

                {showDropdown &&
                  search.trim().length > 0 &&
                  filteredCities.length > 0 && (
                    <ul
                      id="city-listbox"
                      role="listbox"
                      className="absolute left-0 top-full mt-2 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl max-h-[40vh] overflow-y-auto shadow-xl z-[9999]"
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
                          className={`px-4 py-3 cursor-pointer text-sm transition-colors ${
                            activeCityIndex === index
                              ? "bg-slate-100 dark:bg-slate-700"
                              : ""
                          } ${
                            formData.city === c.id
                              ? "text-gold font-medium"
                              : "text-slate-700 dark:text-slate-200"
                          } hover:bg-slate-100 dark:hover:bg-slate-700`}
                        >
                          {c.name}
                        </li>
                      ))}
                    </ul>
                  )}

                {showDropdown &&
                  search.trim().length > 0 &&
                  filteredCities.length === 0 && (
                    <div className="absolute left-0 top-full mt-2 w-full px-4 py-3 text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-lg z-[9999]">
                      No cities found
                    </div>
                  )}

                {errors.city && (
                  <p id="city-error" className="text-red-500 text-xs mt-1">
                    {errors.city}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium mb-1 dark:text-slate-300"
                >
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

                    if (value.trim().length >= 3) {
                      clearError("location");
                    }
                  }}
                  aria-invalid={!!errors.location}
                  aria-describedby={errors.location ? "location-error" : undefined}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-white ${
                    errors.location
                      ? "border-red-400 dark:border-red-700 focus:ring-red-300"
                      : "border-slate-200 dark:border-slate-600 focus:ring-gold"
                  }`}
                />
                {errors.location && (
                  <p id="location-error" className="text-red-500 text-xs mt-1">
                    {errors.location}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="landmark"
                  className="block text-sm font-medium mb-1 dark:text-slate-300"
                >
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
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>

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
                <p className="text-red-500 text-xs mt-2">
                  {errors.mapLocation}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium mb-1 dark:text-slate-300"
                >
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
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-white ${
                    errors.pricePerMonth
                      ? "border-red-400 dark:border-red-700 focus:ring-red-300"
                      : "border-slate-200 dark:border-slate-600 focus:ring-gold"
                  }`}
                />
                {errors.pricePerMonth && (
                  <p id="price-error" className="text-red-500 text-xs mt-1">
                    {errors.pricePerMonth}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="roomType"
                  className="block text-sm font-medium mb-1 dark:text-slate-300"
                >
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
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold dark:bg-slate-700 dark:text-white"
                >
                  <option value="Single">Single</option>
                  <option value="Shared">Shared</option>
                  <option value="PG">PG</option>
                  <option value="1BHK">1BHK</option>
                  <option value="2BHK">2BHK</option>
                </select>
              </div>
            </div>

            <fieldset
              ref={(el) => (fieldRefs.current.idealFor = el)}
              aria-invalid={!!errors.idealFor}
              aria-describedby={errors.idealFor ? "idealFor-error" : undefined}
            >
              <legend className="block text-sm font-medium mb-3 dark:text-slate-300">
                Ideal For *
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {idealForOptions.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-2 p-3 border dark:border-slate-600 rounded-lg dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={formData.idealFor.includes(option)}
                      onChange={() => toggleIdealFor(option)}
                      className="h-4 w-4"
                    />
                    {option}
                  </label>
                ))}
              </div>
              {errors.idealFor && (
                <p id="idealFor-error" className="text-red-500 text-xs mt-2">
                  {errors.idealFor}
                </p>
              )}
            </fieldset>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-1 dark:text-slate-300"
              >
                Description *
              </label>
              <textarea
                ref={(el) => (fieldRefs.current.description = el)}
                id="description"
                rows={4}
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
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-white ${
                  errors.description
                    ? "border-red-400 dark:border-red-700 focus:ring-red-300"
                    : "border-slate-200 dark:border-slate-600 focus:ring-gold"
                }`}
              />
              <div className="mt-1 flex items-center justify-between">
                {errors.description ? (
                  <p id="description-error" className="text-red-500 text-xs">
                    {errors.description}
                  </p>
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

            <fieldset
              ref={(el) => (fieldRefs.current.amenities = el)}
              aria-describedby={errors.amenities ? "amenities-error" : undefined}
              className="mt-2"
            >
              <legend className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Amenities
                <span className="text-slate-500 dark:text-slate-400 text-xs ml-1">
                  (Optional)
                </span>
              </legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {amenities.map((amenity) => (
                  <label
                    key={amenity}
                    className="flex items-center gap-2 cursor-pointer p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-600 focus-within:ring-2 focus-within:ring-gold"
                  >
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-500 text-gold focus:ring-gold dark:bg-slate-700"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {amenity}
                    </span>
                  </label>
                ))}
              </div>

              {errors.amenities && (
                <p
                  id="amenities-error"
                  className="text-red-500 text-xs mt-2"
                  role="alert"
                >
                  {errors.amenities}
                </p>
              )}
            </fieldset>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t dark:border-slate-700">
              <button
                type="button"
                onClick={handleSafeClose}
                disabled={isCreating}
                className="w-full sm:flex-1 border dark:border-slate-600 py-3 px-4 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isCreating}
                aria-busy={isCreating}
                className="w-full sm:flex-1 py-3 px-4 bg-navy dark:bg-slate-200 text-white dark:text-navy rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-navy/90 dark:hover:bg-white transition flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <span className="h-5 w-5 rounded-full border-2 border-white/30 dark:border-slate-500 border-t-white dark:border-t-slate-900 animate-spin" />
                    Adding Property...
                  </>
                ) : (
                  "Add Property"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
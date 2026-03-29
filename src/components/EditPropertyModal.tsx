

// import React, { useEffect, useState, useRef, useId } from "react";
// import { X } from "lucide-react";
// import { useAppDispatch, useAppSelector } from "../store/hooks";
// import { updateRoom } from "../store/slices/rooms.slice";
// import {
//   loadAllCities,
//   loadAmenities,
// } from "../store/slices/metadata.slice";
// import { showToast } from "../store/slices/ui.slice";
// import ImageUpload from "./ImageUpload";
// import MapLocationPicker from "./MapLocationPicker";
// import FullscreenLoader from "./ui/Loader";
// import { Room, IdealFor, RoomType } from "../types/api.types";

// interface EditPropertyModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   room: Room;
// }

// type FormDataType = {
//   title: string;
//   city: string;
//   location: string;
//   landmark: string;
//   latitude: number | null;
//   longitude: number | null;
//   pricePerMonth: string;
//   roomType: RoomType;
//   idealFor: IdealFor[];
//   description: string;
//   amenities: string[];
//   images: string[];
// };

// const getRoomFormData = (room: Room): FormDataType => ({
//   title: room.title ?? "",
//   city: room.city ?? "",
//   location: room.location ?? "",
//   landmark: room.landmark ?? "",
//   latitude: room.latitude ?? null,
//   longitude: room.longitude ?? null,
//   pricePerMonth: room.pricePerMonth?.toString() ?? "",
//   roomType: room.roomType as RoomType,
//   idealFor: Array.isArray(room.idealFor) ? room.idealFor : [],
//   description: room.description ?? "",
//   amenities: Array.isArray(room.amenities) ? room.amenities : [],
//   images: Array.isArray(room.images) ? room.images : [],
// });

// export function EditPropertyModal({
//   isOpen,
//   onClose,
//   room,
// }: EditPropertyModalProps) {
//   const dispatch = useAppDispatch();

//   const { allCities, amenities } = useAppSelector((state) => state.metadata);
//   const isUpdating = useAppSelector((state) => state.rooms.loading.update);

//   const modalTitleId = useId();
//   const modalDescriptionId = useId();

//   const modalRef = useRef<HTMLDivElement | null>(null);
//   const firstFocusableRef = useRef<HTMLInputElement | null>(null);
//   const errorSummaryRef = useRef<HTMLDivElement | null>(null);
//   const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

//   const [formData, setFormData] = useState<FormDataType>(getRoomFormData(room));
//   const [initialData, setInitialData] = useState<FormDataType>(getRoomFormData(room));
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   const idealForOptions: IdealFor[] = [
//     "Students",
//     "Working Professionals",
//     "Family",
//   ];

//   useEffect(() => {
//     if (allCities.length === 0) dispatch(loadAllCities());
//     if (amenities.length === 0) dispatch(loadAmenities());
//   }, [dispatch, allCities.length, amenities.length]);

//   useEffect(() => {
//     if (!isOpen) return;

//     const data = getRoomFormData(room);
//     setFormData(data);
//     setInitialData(data);
//     setErrors({});
//   }, [isOpen, room]);

//   useEffect(() => {
//     if (!isOpen) return;

//     const originalOverflow = document.body.style.overflow;
//     document.body.style.overflow = "hidden";

//     const timeout = setTimeout(() => {
//       firstFocusableRef.current?.focus();
//     }, 50);

//     return () => {
//       document.body.style.overflow = originalOverflow || "auto";
//       clearTimeout(timeout);
//     };
//   }, [isOpen]);

//   useEffect(() => {
//     if (!isOpen) return;

//     const handleEscape = (e: KeyboardEvent) => {
//       if (e.key === "Escape" && !isUpdating) {
//         onClose();
//       }
//     };

//     document.addEventListener("keydown", handleEscape);
//     return () => document.removeEventListener("keydown", handleEscape);
//   }, [isOpen, isUpdating, onClose]);

//   useEffect(() => {
//     if (!isOpen) return;

//     const handleFocusTrap = (e: KeyboardEvent) => {
//       if (e.key !== "Tab" || !modalRef.current) return;

//       const focusableElements = modalRef.current.querySelectorAll<
//         HTMLButtonElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLAnchorElement
//       >(
//         'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
//       );

//       if (!focusableElements.length) return;

//       const first = focusableElements[0];
//       const last = focusableElements[focusableElements.length - 1];

//       if (e.shiftKey) {
//         if (document.activeElement === first) {
//           e.preventDefault();
//           (last as HTMLElement).focus();
//         }
//       } else {
//         if (document.activeElement === last) {
//           e.preventDefault();
//           (first as HTMLElement).focus();
//         }
//       }
//     };

//     document.addEventListener("keydown", handleFocusTrap);
//     return () => document.removeEventListener("keydown", handleFocusTrap);
//   }, [isOpen]);

//   if (!isOpen) return null;

//   const getChangedFields = () => {
//     const changed: Partial<FormDataType> = {};

//     (Object.keys(formData) as (keyof FormDataType)[]).forEach((key) => {
//       const current = formData[key];
//       const initial = initialData[key];

//       if (JSON.stringify(current) !== JSON.stringify(initial)) {
//         changed[key] =
//           key === "pricePerMonth" ? String(current) : current;
//       }
//     });

//     return changed;
//   };

//   const validateChangedFields = (data: Partial<FormDataType>) => {
//     const newErrors: Record<string, string> = {};

//     if ("title" in data && data.title !== undefined && data.title.trim().length < 5) {
//       newErrors.title = "Title must be at least 5 characters";
//     }

//     if ("city" in data && !data.city) {
//       newErrors.city = "City is required";
//     }

//     if ("location" in data && data.location !== undefined && data.location.trim().length < 3) {
//       newErrors.location = "Location is required";
//     }

//     if (
//       "pricePerMonth" in data &&
//       (!data.pricePerMonth ||
//         Number(data.pricePerMonth) <= 0 ||
//         !Number.isFinite(Number(data.pricePerMonth)))
//     ) {
//       newErrors.pricePerMonth = "Enter a valid monthly rent";
//     }

//     if (
//       "description" in data &&
//       data.description !== undefined &&
//       data.description.trim().length < 20
//     ) {
//       const remaining = 20 - data.description.trim().length;
//       newErrors.description = `${remaining} more character${
//         remaining !== 1 ? "s" : ""
//       } required`;
//     }

//     if ("idealFor" in data && data.idealFor && data.idealFor.length === 0) {
//       newErrors.idealFor = "Select at least one tenant type";
//     }

//     if ("images" in data && data.images && data.images.length < 3) {
//       newErrors.images = "At least three images are required";
//     }

//     setErrors(newErrors);

//     if (Object.keys(newErrors).length > 0) {
//       const firstKey = Object.keys(newErrors)[0];
//       const el = fieldRefs.current[firstKey];

//       if (el) {
//         el.scrollIntoView({ behavior: "smooth", block: "center" });
//         (el as HTMLElement).focus?.();
//       } else {
//         errorSummaryRef.current?.focus();
//       }

//       return false;
//     }

//     return true;
//   };

//   const handleSafeClose = () => {
//     if (isUpdating) return;
//     setErrors({});
//     setFormData(getRoomFormData(room));
//     setInitialData(getRoomFormData(room));
//     onClose();
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (isUpdating) return;

//     const changedData = getChangedFields();

//     if (Object.keys(changedData).length === 0) {
//       dispatch(
//         showToast({
//           message: "No changes made",
//           type: "info",
//         })
//       );
//       return;
//     }

//     if (!validateChangedFields(changedData)) return;

//     const payload = {
//       ...changedData,
//       ...(changedData.pricePerMonth !== undefined && {
//         pricePerMonth: Number(changedData.pricePerMonth),
//       }),
//     };

//     const action = await dispatch(
//       updateRoom({
//         id: room.id,
//         data: payload,
//       })
//     );

//     if (updateRoom.fulfilled.match(action)) {
//       handleSafeClose();
//     }
//   };

//   const toggleAmenity = (amenity: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       amenities: prev.amenities.includes(amenity)
//         ? prev.amenities.filter((a) => a !== amenity)
//         : [...prev.amenities, amenity],
//     }));
//   };

//   const toggleIdealFor = (option: IdealFor) => {
//     setFormData((prev) => ({
//       ...prev,
//       idealFor: prev.idealFor.includes(option)
//         ? prev.idealFor.filter((o) => o !== option)
//         : [...prev.idealFor, option],
//     }));
//   };

//   return (
//     <>
//       {isUpdating && (
//         <FullscreenLoader message="Saving your property changes..." />
//       )}

//       <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4">
//         <button
//           type="button"
//           aria-label="Close modal overlay"
//           onClick={handleSafeClose}
//           disabled={isUpdating}
//           className="absolute inset-0 bg-navy/60 backdrop-blur-sm cursor-default"
//         />

//         <div
//           ref={modalRef}
//           role="dialog"
//           aria-modal="true"
//           aria-labelledby={modalTitleId}
//           aria-describedby={modalDescriptionId}
//           className="relative z-10 w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-h-[92vh] overflow-hidden"
//         >
//           <div className="sticky top-0 z-20 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-4 sm:px-6 py-4 flex items-center justify-between">
//             <div>
//               <h3
//                 id={modalTitleId}
//                 className="text-xl sm:text-2xl font-bold text-navy dark:text-white"
//               >
//                 Edit Property
//               </h3>
//               <p
//                 id={modalDescriptionId}
//                 className="mt-1 text-sm text-slate-500 dark:text-slate-400"
//               >
//                 Update your property details and save the changes.
//               </p>
//             </div>

//             <button
//               type="button"
//               onClick={handleSafeClose}
//               disabled={isUpdating}
//               aria-label="Close edit property modal"
//               className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
//             </button>
//           </div>

//           <form
//             onSubmit={handleSubmit}
//             noValidate
//             className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(92vh-88px)]"
//           >
//             {Object.keys(errors).length > 0 && (
//               <div
//                 ref={errorSummaryRef}
//                 tabIndex={-1}
//                 role="alert"
//                 aria-live="assertive"
//                 className="rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4"
//               >
//                 <p className="font-semibold text-red-700 dark:text-red-400">
//                   Please fix the following errors:
//                 </p>
//                 <ul className="list-disc pl-5 mt-2 text-sm text-red-600 dark:text-red-300">
//                   {Object.values(errors).map((msg, i) => (
//                     <li key={i}>{msg}</li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             <div ref={(el) => (fieldRefs.current.images = el)}>
//               <ImageUpload
//                 images={formData.images}
//                 onImagesChange={(images) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     images,
//                   }))
//                 }
//               />
//               {errors.images && (
//                 <p id="images-error" className="text-red-500 text-xs mt-2">
//                   {errors.images}
//                 </p>
//               )}
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label
//                   htmlFor="title"
//                   className="block text-sm font-medium mb-1 dark:text-slate-300"
//                 >
//                   Property Title
//                 </label>
//                 <input
//                   ref={(el) => {
//                     fieldRefs.current.title = el;
//                     firstFocusableRef.current = el;
//                   }}
//                   id="title"
//                   value={formData.title}
//                   maxLength={80}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       title: e.target.value,
//                     })
//                   }
//                   aria-invalid={!!errors.title}
//                   aria-describedby={errors.title ? "title-error" : undefined}
//                   className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-white ${
//                     errors.title
//                       ? "border-red-400 dark:border-red-700 focus:ring-red-300"
//                       : "border-slate-200 dark:border-slate-600 focus:ring-gold"
//                   }`}
//                 />
//                 {errors.title && (
//                   <p id="title-error" className="text-red-500 text-xs mt-1">
//                     {errors.title}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label
//                   htmlFor="city"
//                   className="block text-sm font-medium mb-1 dark:text-slate-300"
//                 >
//                   City
//                 </label>
//                 <select
//                   ref={(el) => (fieldRefs.current.city = el)}
//                   id="city"
//                   value={formData.city}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       city: e.target.value,
//                     })
//                   }
//                   aria-invalid={!!errors.city}
//                   aria-describedby={errors.city ? "city-error" : undefined}
//                   className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-white ${
//                     errors.city
//                       ? "border-red-400 dark:border-red-700 focus:ring-red-300"
//                       : "border-slate-200 dark:border-slate-600 focus:ring-gold"
//                   }`}
//                 >
//                   {allCities.map((c) => (
//                     <option key={c.id} value={c.id}>
//                       {c.name}
//                     </option>
//                   ))}
//                 </select>
//                 {errors.city && (
//                   <p id="city-error" className="text-red-500 text-xs mt-1">
//                     {errors.city}
//                   </p>
//                 )}
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label
//                   htmlFor="location"
//                   className="block text-sm font-medium mb-1 dark:text-slate-300"
//                 >
//                   Location
//                 </label>
//                 <input
//                   ref={(el) => (fieldRefs.current.location = el)}
//                   id="location"
//                   value={formData.location}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       location: e.target.value,
//                     })
//                   }
//                   aria-invalid={!!errors.location}
//                   aria-describedby={errors.location ? "location-error" : undefined}
//                   className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-white ${
//                     errors.location
//                       ? "border-red-400 dark:border-red-700 focus:ring-red-300"
//                       : "border-slate-200 dark:border-slate-600 focus:ring-gold"
//                   }`}
//                 />
//                 {errors.location && (
//                   <p id="location-error" className="text-red-500 text-xs mt-1">
//                     {errors.location}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label
//                   htmlFor="landmark"
//                   className="block text-sm font-medium mb-1 dark:text-slate-300"
//                 >
//                   Landmark
//                 </label>
//                 <input
//                   id="landmark"
//                   value={formData.landmark}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       landmark: e.target.value,
//                     })
//                   }
//                   className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold dark:bg-slate-700 dark:text-white"
//                 />
//               </div>
//             </div>

//             <MapLocationPicker
//               latitude={formData.latitude}
//               longitude={formData.longitude}
//               onChange={(lat, lng) =>
//                 setFormData({
//                   ...formData,
//                   latitude: lat,
//                   longitude: lng,
//                 })
//               }
//               defaultCity={formData.city || "bangalore"}
//               showLabel={true}
//             />

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label
//                   htmlFor="price"
//                   className="block text-sm font-medium mb-1 dark:text-slate-300"
//                 >
//                   Monthly Rent (₹)
//                 </label>
//                 <input
//                   ref={(el) => (fieldRefs.current.pricePerMonth = el)}
//                   id="price"
//                   type="number"
//                   min="1"
//                   inputMode="numeric"
//                   value={formData.pricePerMonth}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       pricePerMonth: e.target.value,
//                     })
//                   }
//                   aria-invalid={!!errors.pricePerMonth}
//                   aria-describedby={errors.pricePerMonth ? "price-error" : undefined}
//                   className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-white ${
//                     errors.pricePerMonth
//                       ? "border-red-400 dark:border-red-700 focus:ring-red-300"
//                       : "border-slate-200 dark:border-slate-600 focus:ring-gold"
//                   }`}
//                 />
//                 {errors.pricePerMonth && (
//                   <p id="price-error" className="text-red-500 text-xs mt-1">
//                     {errors.pricePerMonth}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label
//                   htmlFor="roomType"
//                   className="block text-sm font-medium mb-1 dark:text-slate-300"
//                 >
//                   Room Type
//                 </label>
//                 <select
//                   id="roomType"
//                   value={formData.roomType}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       roomType: e.target.value as RoomType,
//                     })
//                   }
//                   className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold dark:bg-slate-700 dark:text-white"
//                 >
//                   <option value="Single">Single</option>
//                   <option value="Shared">Shared</option>
//                   <option value="PG">PG</option>
//                   <option value="1BHK">1BHK</option>
//                   <option value="2BHK">2BHK</option>
//                 </select>
//               </div>
//             </div>

//             <fieldset
//               ref={(el) => (fieldRefs.current.idealFor = el)}
//               aria-invalid={!!errors.idealFor}
//               aria-describedby={errors.idealFor ? "idealFor-error" : undefined}
//               className="space-y-2"
//             >
//               <legend className="block text-sm font-medium dark:text-slate-300">
//                 Ideal For
//               </legend>
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
//                 {idealForOptions.map((option) => (
//                   <label
//                     key={option}
//                     className="flex items-center gap-2 p-3 border dark:border-slate-600 rounded-lg dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
//                   >
//                     <input
//                       type="checkbox"
//                       checked={formData.idealFor.includes(option)}
//                       onChange={() => toggleIdealFor(option)}
//                       className="h-4 w-4"
//                     />
//                     {option}
//                   </label>
//                 ))}
//               </div>
//               {errors.idealFor && (
//                 <p id="idealFor-error" className="text-red-500 text-xs">
//                   {errors.idealFor}
//                 </p>
//               )}
//             </fieldset>

//             <div>
//               <label
//                 htmlFor="description"
//                 className="block text-sm font-medium mb-1 dark:text-slate-300"
//               >
//                 Description
//               </label>
//               <textarea
//                 ref={(el) => (fieldRefs.current.description = el)}
//                 id="description"
//                 rows={4}
//                 maxLength={500}
//                 value={formData.description}
//                 onChange={(e) =>
//                   setFormData({
//                     ...formData,
//                     description: e.target.value,
//                   })
//                 }
//                 aria-invalid={!!errors.description}
//                 aria-describedby={
//                   errors.description ? "description-error" : "description-help"
//                 }
//                 className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-white ${
//                   errors.description
//                     ? "border-red-400 dark:border-red-700 focus:ring-red-300"
//                     : "border-slate-200 dark:border-slate-600 focus:ring-gold"
//                 }`}
//               />
//               <div className="mt-1 flex items-center justify-between">
//                 {errors.description ? (
//                   <p id="description-error" className="text-red-500 text-xs">
//                     {errors.description}
//                   </p>
//                 ) : (
//                   <p
//                     id="description-help"
//                     className="text-xs text-slate-500 dark:text-slate-400"
//                   >
//                     Minimum 20 characters
//                   </p>
//                 )}
//                 <p className="text-xs text-slate-500 dark:text-slate-400">
//                   {formData.description.length}/500
//                 </p>
//               </div>
//             </div>

//             <fieldset
//               ref={(el) => (fieldRefs.current.amenities = el)}
//               className="space-y-2"
//             >
//               <legend className="block text-sm font-medium dark:text-slate-300">
//                 Amenities
//               </legend>
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
//                 {amenities.map((amenity) => (
//                   <label
//                     key={amenity}
//                     className="flex items-center gap-2 p-3 border dark:border-slate-600 rounded-lg dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
//                   >
//                     <input
//                       type="checkbox"
//                       checked={formData.amenities.includes(amenity)}
//                       onChange={() => toggleAmenity(amenity)}
//                       className="h-4 w-4"
//                     />
//                     {amenity}
//                   </label>
//                 ))}
//               </div>
//             </fieldset>

//             <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t dark:border-slate-700">
//               <button
//                 type="button"
//                 onClick={handleSafeClose}
//                 disabled={isUpdating}
//                 className="w-full sm:flex-1 py-3 border dark:border-slate-600 rounded-lg dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="submit"
//                 disabled={isUpdating}
//                 aria-busy={isUpdating}
//                 className="w-full sm:flex-1 py-3 bg-navy dark:bg-slate-200 text-white dark:text-navy rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-navy/90 dark:hover:bg-white transition flex items-center justify-center gap-2"
//               >
//                 {isUpdating ? (
//                   <>
//                     <span className="h-5 w-5 rounded-full border-2 border-white/30 dark:border-slate-500 border-t-white dark:border-t-slate-900 animate-spin" />
//                     Saving Changes...
//                   </>
//                 ) : (
//                   "Save Changes"
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </>
//   );
// }


import React, { useEffect, useState, useRef, useId } from "react";
import { X } from "lucide-react";
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

const getRoomFormData = (room: Room): FormDataType => ({
  title: room.title ?? "",
  city: room.city ?? "",
  location: room.location ?? "",
  landmark: room.landmark ?? "",
  latitude: room.latitude ?? null,
  longitude: room.longitude ?? null,
  pricePerMonth: room.pricePerMonth?.toString() ?? "",
  roomType: room.roomType as RoomType,
  idealFor: Array.isArray(room.idealFor) ? room.idealFor : [],
  description: room.description ?? "",
  amenities: Array.isArray(room.amenities) ? room.amenities : [],
  images: Array.isArray(room.images) ? room.images : [],
});

export function EditPropertyModal({
  isOpen,
  onClose,
  room,
}: EditPropertyModalProps) {
  const dispatch = useAppDispatch();

  const { allCities, amenities } = useAppSelector((state) => state.metadata);
  const isUpdating = useAppSelector((state) => state.rooms.loading.update);

  const modalTitleId = useId();
  const modalDescriptionId = useId();

  const modalRef = useRef<HTMLDivElement | null>(null);
  const firstFocusableRef = useRef<HTMLInputElement | null>(null);
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  const [formData, setFormData] = useState<FormDataType>(getRoomFormData(room));
  const [initialData, setInitialData] = useState<FormDataType>(getRoomFormData(room));
  const [errors, setErrors] = useState<Record<string, string>>({});

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

    const data = getRoomFormData(room);
    setFormData(data);
    setInitialData(data);
    setErrors({});
  }, [isOpen, room]);

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

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
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
      newErrors.title = "Title must be at least 5 characters";
    }

    if ("city" in data && !data.city) {
      newErrors.city = "City is required";
    }

    if ("location" in data && data.location !== undefined && data.location.trim().length < 3) {
      newErrors.location = "Location is required";
    }

    const mapChanged =
      "latitude" in data || "longitude" in data;

    if (
      mapChanged &&
      (
        formData.latitude === null ||
        formData.longitude === null ||
        !Number.isFinite(formData.latitude) ||
        !Number.isFinite(formData.longitude)
      )
    ) {
      newErrors.mapLocation = "Please select a valid location on the map";
    }

    if (
      "pricePerMonth" in data &&
      (!data.pricePerMonth ||
        Number(data.pricePerMonth) <= 0 ||
        !Number.isFinite(Number(data.pricePerMonth)))
    ) {
      newErrors.pricePerMonth = "Enter a valid monthly rent";
    }

    if (
      "description" in data &&
      data.description !== undefined &&
      data.description.trim().length < 20
    ) {
      const remaining = 20 - data.description.trim().length;
      newErrors.description = `${remaining} more character${
        remaining !== 1 ? "s" : ""
      } required`;
    }

    if ("idealFor" in data && data.idealFor && data.idealFor.length === 0) {
      newErrors.idealFor = "Select at least one tenant type";
    }

    if ("images" in data && data.images && data.images.length < 3) {
      newErrors.images = "At least three images are required";
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
    setErrors({});
    setFormData(getRoomFormData(room));
    setInitialData(getRoomFormData(room));
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

  return (
    <>
      {isUpdating && (
        <FullscreenLoader message="Saving your property changes..." />
      )}

      <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4">
        <button
          type="button"
          aria-label="Close modal overlay"
          onClick={handleSafeClose}
          disabled={isUpdating}
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
                Edit Property
              </h3>
              <p
                id={modalDescriptionId}
                className="mt-1 text-sm text-slate-500 dark:text-slate-400"
              >
                Update your property details and save the changes.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSafeClose}
              disabled={isUpdating}
              aria-label="Close edit property modal"
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(92vh-88px)]"
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
                  {Object.values(errors).map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}

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
                  Property Title
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

              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium mb-1 dark:text-slate-300"
                >
                  City
                </label>
                <select
                  ref={(el) => (fieldRefs.current.city = el)}
                  id="city"
                  value={formData.city}
                  onChange={(e) => {
                    const value = e.target.value;

                    setFormData((prev) => ({
                      ...prev,
                      city: value,
                    }));

                    if (value) {
                      clearError("city");
                    }
                  }}
                  aria-invalid={!!errors.city}
                  aria-describedby={errors.city ? "city-error" : undefined}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-white ${
                    errors.city
                      ? "border-red-400 dark:border-red-700 focus:ring-red-300"
                      : "border-slate-200 dark:border-slate-600 focus:ring-gold"
                  }`}
                >
                  {allCities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
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
                  Location
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
                  Monthly Rent (₹)
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
              className="space-y-2"
            >
              <legend className="block text-sm font-medium dark:text-slate-300">
                Ideal For
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
                <p id="idealFor-error" className="text-red-500 text-xs">
                  {errors.idealFor}
                </p>
              )}
            </fieldset>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-1 dark:text-slate-300"
              >
                Description
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
              className="space-y-2"
            >
              <legend className="block text-sm font-medium dark:text-slate-300">
                Amenities
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {amenities.map((amenity) => (
                  <label
                    key={amenity}
                    className="flex items-center gap-2 p-3 border dark:border-slate-600 rounded-lg dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="h-4 w-4"
                    />
                    {amenity}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t dark:border-slate-700">
              <button
                type="button"
                onClick={handleSafeClose}
                disabled={isUpdating}
                className="w-full sm:flex-1 py-3 border dark:border-slate-600 rounded-lg dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isUpdating}
                aria-busy={isUpdating}
                className="w-full sm:flex-1 py-3 bg-navy dark:bg-slate-200 text-white dark:text-navy rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-navy/90 dark:hover:bg-white transition flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <span className="h-5 w-5 rounded-full border-2 border-white/30 dark:border-slate-500 border-t-white dark:border-t-slate-900 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
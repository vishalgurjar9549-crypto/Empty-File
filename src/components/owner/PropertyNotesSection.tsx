// import React, { useEffect, useState } from 'react';
// import { ChevronDown, ChevronUp, FileText, User, Shield, Clock, AlertCircle, RefreshCw } from 'lucide-react';
// import { useAppDispatch, useAppSelector } from '../../store/hooks';
// import { fetchPropertyNotes } from '../../store/slices/owner.slice';
// import { PropertyNote } from '../../types/api.types';
// interface PropertyNotesSectionProps {
//   propertyId: string;
//   propertyTitle: string;
// }
// export function PropertyNotesSection({
//   propertyId,
//   propertyTitle
// }: PropertyNotesSectionProps) {
//   const dispatch = useAppDispatch();
//   const {
//     propertyNotes,
//     notesLoading,
//     notesError
//   } = useAppSelector((state) => state.owner);
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [hasFetched, setHasFetched] = useState(false);
//   const notes = propertyNotes[propertyId] || [];
//   const isLoading = notesLoading[propertyId] || false;
//   const error = notesError[propertyId] || null;
//   // Fetch notes when section is first expanded
//   useEffect(() => {
//     if (isExpanded && !hasFetched) {
//       dispatch(fetchPropertyNotes(propertyId));
//       setHasFetched(true);
//     }
//   }, [isExpanded, hasFetched, propertyId, dispatch]);
//   const handleRetry = () => {
//     dispatch(fetchPropertyNotes(propertyId));
//   };
//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };
//   const formatTime = (dateString: string) => {
//     return new Date(dateString).toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };
//   const getRoleBadge = (role: string) => {
//     const normalizedRole = role.toUpperCase();
//     if (normalizedRole === 'ADMIN') {
//       return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium">
//           <Shield className="w-3 h-3" />
//           Admin
//         </span>;
//     }
//     if (normalizedRole === 'AGENT') {
//       return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium">
//           <User className="w-3 h-3" />
//           Agent
//         </span>;
//     }
//     return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">
//         {role}
//       </span>;
//   };
//   return <div className="border-t border-slate-100 dark:border-slate-700">
//       {/* Collapsible Header */}
//       <button onClick={() => setIsExpanded(!isExpanded)} className="w-full px-6 py-3 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">

//         <div className="flex items-center gap-2">
//           <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500" />
//           <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
//             Property Notes
//           </span>
//           {hasFetched && notes.length > 0 && <span className="px-2 py-0.5 bg-navy/10 dark:bg-white/10 text-navy dark:text-white text-xs font-medium rounded-full">
//               {notes.length}
//             </span>}
//         </div>
//         {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
//       </button>

//       {/* Expanded Content */}
//       {isExpanded && <div className="px-6 pb-4">
//           {/* Loading State */}
//           {isLoading && <div className="space-y-3">
//               {[1, 2].map((i) => <div key={i} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 animate-pulse">

//                   <div className="flex items-center gap-2 mb-2">
//                     <div className="w-16 h-4 bg-slate-200 dark:bg-slate-600 rounded" />
//                     <div className="w-24 h-4 bg-slate-200 dark:bg-slate-600 rounded" />
//                   </div>
//                   <div className="w-full h-12 bg-slate-200 dark:bg-slate-600 rounded" />
//                 </div>)}
//             </div>}

//           {/* Error State */}
//           {!isLoading && error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
//               <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
//               <div className="flex-1">
//                 <p className="text-sm text-red-700 dark:text-red-300 mb-2">
//                   {error}
//                 </p>
//                 <button onClick={handleRetry} className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1">

//                   <RefreshCw className="w-3 h-3" />
//                   Try again
//                 </button>
//               </div>
//             </div>}

//           {/* Empty State */}
//           {!isLoading && !error && notes.length === 0 && <div className="text-center py-8">
//               <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
//                 <FileText className="w-6 h-6 text-slate-400 dark:text-slate-500" />
//               </div>
//               <p className="text-sm text-slate-500 dark:text-slate-400">
//                 No notes yet
//               </p>
//               <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
//                 Notes from admins and agents will appear here
//               </p>
//             </div>}

//           {/* Notes List */}
//           {!isLoading && !error && notes.length > 0 && <div className="space-y-3">
//               {notes.map((note) => <div key={note.id} className="bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 rounded-lg p-4">

//                   {/* Note Header */}
//                   <div className="flex items-center justify-between mb-2">
//                     <div className="flex items-center gap-2">
//                       {getRoleBadge(note.author.role)}
//                       <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
//                         {note.author.name}
//                       </span>
//                     </div>
//                     <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
//                       <Clock className="w-3 h-3" />
//                       <span>
//                         {formatDate(note.createdAt)} at{' '}
//                         {formatTime(note.createdAt)}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Note Content */}
//                   <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
//                     {note.content}
//                   </p>

//                   {/* Updated indicator */}
//                   {note.updatedAt !== note.createdAt && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 italic">
//                       Edited on {formatDate(note.updatedAt)}
//                     </p>}
//                 </div>)}
//             </div>}

//           {/* Info Banner */}
//           {!isLoading && !error && <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3 flex items-start gap-2">
//               <AlertCircle className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
//               <p className="text-xs text-blue-700 dark:text-blue-300">
//                 These notes are added by our admin team and assigned agents to
//                 help you manage your property. You cannot edit or delete these
//                 notes.
//               </p>
//             </div>}
//         </div>}
//     </div>;
// }

import React from "react";
import {
  FileText,
  User,
  Shield,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchPropertyNotes } from "../../store/slices/owner.slice";

interface PropertyNotesSectionProps {
  propertyId: string;
  propertyTitle: string;
  embedded?: boolean;
  autoFetch?: boolean;
}

export function PropertyNotesSection({
  propertyId,
  propertyTitle,
  embedded = false,
  autoFetch = true,
}: PropertyNotesSectionProps) {
  const dispatch = useAppDispatch();
  const { propertyNotes, notesLoading, notesError } = useAppSelector(
    (state) => state.owner,
  );

  const notes = propertyNotes[propertyId] || [];
  const isLoading = notesLoading[propertyId] || false;
  const error = notesError[propertyId] || null;
  const sectionPadding = embedded ? "10px 12px 12px" : "20px 18px 18px";
  const headerMargin = embedded ? 8 : 16;
  const notePadding = embedded ? 10 : 16;
  const noteRadius = embedded ? 12 : 18;
  const noteGap = embedded ? 7 : 12;

  // ✅ REMOVED: useEffect for autoFetch
  // Notes are now ONLY fetched via explicit click handler in OwnerPropertyCard
  // No render-triggered fetching - all API calls are user-action driven

  const handleRetry = () => {
    dispatch(fetchPropertyNotes(propertyId));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleBadge = (role: string) => {
    const normalizedRole = role.toUpperCase();

    if (normalizedRole === "ADMIN") {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 10px",
            borderRadius: 999,
            background: "rgba(168,85,247,0.12)",
            color: "#c084fc",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          <Shield style={{ width: 12, height: 12 }} />
          Admin
        </span>
      );
    }

    if (normalizedRole === "AGENT") {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 10px",
            borderRadius: 999,
            background: "rgba(59,130,246,0.12)",
            color: "#60a5fa",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          <User style={{ width: 12, height: 12 }} />
          Agent
        </span>
      );
    }

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 10px",
          borderRadius: 999,
          background: "rgba(148,163,184,0.12)",
          color: "var(--text-secondary)",
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        {role}
      </span>
    );
  };

  return (
    <div style={{ padding: sectionPadding }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: headerMargin,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              marginBottom: embedded ? 3 : 6,
            }}
          >
            <FileText
              style={{
                width: embedded ? 15 : 18,
                height: embedded ? 15 : 18,
                color: "var(--gold)",
              }}
            />
            <h4
              style={{
                margin: 0,
                fontSize: embedded ? 13 : 16,
                fontWeight: 800,
                color: "var(--text-primary)",
              }}
            >
              Property Notes
            </h4>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: embedded ? 11 : 13,
              color: "var(--text-secondary)",
            }}
          >
            Internal updates and review notes for{" "}
            <strong>{propertyTitle}</strong>
          </p>
        </div>

        {notes.length > 0 && (
          <div
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid var(--gold-border)",
              background: "rgba(255,255,255,0.03)",
              fontSize: embedded ? 11 : 12,
              fontWeight: 700,
            }}
          >
            {notes.length} note{notes.length > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {isLoading && (
        <div style={{ display: "grid", gap: noteGap }}>
          {[1, 2].map((i) => (
            <div
              key={i}
              style={{
                borderRadius: noteRadius,
                padding: notePadding,
                border: "1px solid var(--gold-border)",
                background: "rgba(255,255,255,0.03)",
                minHeight: embedded ? 54 : 92,
                opacity: 0.7,
              }}
            />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.18)",
            borderRadius: noteRadius,
            padding: notePadding,
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <AlertCircle
            style={{ width: 18, height: 18, color: "#ef4444", marginTop: 2 }}
          />
          <div style={{ flex: 1 }}>
            <p
              style={{
                margin: 0,
                fontSize: embedded ? 12 : 14,
                color: "#fca5a5",
              }}
            >
              {error}
            </p>
            <button
              onClick={handleRetry}
              style={{
                marginTop: 10,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                border: "none",
                background: "transparent",
                color: "#f87171",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              <RefreshCw style={{ width: 14, height: 14 }} />
              Try again
            </button>
          </div>
        </div>
      )}

      {!isLoading && !error && notes.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: embedded ? "12px 10px" : "28px 16px",
            borderRadius: noteRadius,
            border: "1px dashed var(--gold-border)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <div
            style={{
              width: embedded ? 34 : 52,
              height: embedded ? 34 : 52,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: embedded ? "0 auto 6px" : "0 auto 12px",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <FileText
              style={{
                width: embedded ? 16 : 22,
                height: embedded ? 16 : 22,
                color: "var(--gold)",
              }}
            />
          </div>
          <p
            style={{ margin: 0, fontSize: embedded ? 12 : 14, fontWeight: 700 }}
          >
            No notes yet
          </p>
          <p
            style={{
              margin: embedded ? "3px 0 0" : "6px 0 0",
              fontSize: embedded ? 11 : 13,
              color: "var(--text-secondary)",
            }}
          >
            Notes from admins and assigned agents will appear here.
          </p>
        </div>
      )}

      {!isLoading && !error && notes.length > 0 && (
        <div style={{ display: "grid", gap: noteGap }}>
          {notes.map((note) => (
            <div
              key={note.id}
              style={{
                borderRadius: noteRadius,
                padding: notePadding,
                border: "1px solid var(--gold-border)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: embedded ? 6 : 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  {getRoleBadge(note.author.role)}
                  <span
                    style={{ fontSize: embedded ? 12 : 14, fontWeight: 700 }}
                  >
                    {note.author.name}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: embedded ? 11 : 12,
                    color: "var(--text-secondary)",
                  }}
                >
                  <Clock style={{ width: 14, height: 14 }} />
                  {formatDate(note.createdAt)} at {formatTime(note.createdAt)}
                </div>
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: embedded ? 12 : 14,
                  lineHeight: embedded ? 1.45 : 1.75,
                  color: "var(--text-primary)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {note.content}
              </p>

              {note.updatedAt !== note.createdAt && (
                <p
                  style={{
                    margin: embedded ? "6px 0 0" : "10px 0 0",
                    fontSize: embedded ? 11 : 12,
                    color: "var(--text-secondary)",
                    fontStyle: "italic",
                  }}
                >
                  Edited on {formatDate(note.updatedAt)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {!isLoading && !error && (
        <div
          style={{
            marginTop: embedded ? 8 : 16,
            padding: embedded ? "9px 10px" : "14px 16px",
            borderRadius: embedded ? 12 : 16,
            border: "1px solid rgba(59,130,246,0.16)",
            background: "rgba(59,130,246,0.08)",
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
          }}
        >
          <AlertCircle
            style={{ width: 16, height: 16, color: "#60a5fa", marginTop: 2 }}
          />
          <p
            style={{
              margin: 0,
              fontSize: embedded ? 11 : 12.5,
              lineHeight: embedded ? 1.45 : 1.7,
            }}
          >
            These notes are added by admins and assigned agents to help you
            manage your listing. They are visible for reference only.
          </p>
        </div>
      )}
    </div>
  );
}

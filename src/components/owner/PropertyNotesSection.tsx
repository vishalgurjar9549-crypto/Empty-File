import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, FileText, User, Shield, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchPropertyNotes } from '../../store/slices/owner.slice';
import { PropertyNote } from '../../types/api.types';
interface PropertyNotesSectionProps {
  propertyId: string;
  propertyTitle: string;
}
export function PropertyNotesSection({
  propertyId,
  propertyTitle
}: PropertyNotesSectionProps) {
  const dispatch = useAppDispatch();
  const {
    propertyNotes,
    notesLoading,
    notesError
  } = useAppSelector((state) => state.owner);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const notes = propertyNotes[propertyId] || [];
  const isLoading = notesLoading[propertyId] || false;
  const error = notesError[propertyId] || null;
  // Fetch notes when section is first expanded
  useEffect(() => {
    if (isExpanded && !hasFetched) {
      dispatch(fetchPropertyNotes(propertyId));
      setHasFetched(true);
    }
  }, [isExpanded, hasFetched, propertyId, dispatch]);
  const handleRetry = () => {
    dispatch(fetchPropertyNotes(propertyId));
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const getRoleBadge = (role: string) => {
    const normalizedRole = role.toUpperCase();
    if (normalizedRole === 'ADMIN') {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium">
          <Shield className="w-3 h-3" />
          Admin
        </span>;
    }
    if (normalizedRole === 'AGENT') {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium">
          <User className="w-3 h-3" />
          Agent
        </span>;
    }
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">
        {role}
      </span>;
  };
  return <div className="border-t border-slate-100 dark:border-slate-700">
      {/* Collapsible Header */}
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full px-6 py-3 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">

        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Property Notes
          </span>
          {hasFetched && notes.length > 0 && <span className="px-2 py-0.5 bg-navy/10 dark:bg-white/10 text-navy dark:text-white text-xs font-medium rounded-full">
              {notes.length}
            </span>}
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {/* Expanded Content */}
      {isExpanded && <div className="px-6 pb-4">
          {/* Loading State */}
          {isLoading && <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 animate-pulse">

                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-16 h-4 bg-slate-200 dark:bg-slate-600 rounded" />
                    <div className="w-24 h-4 bg-slate-200 dark:bg-slate-600 rounded" />
                  </div>
                  <div className="w-full h-12 bg-slate-200 dark:bg-slate-600 rounded" />
                </div>)}
            </div>}

          {/* Error State */}
          {!isLoading && error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                  {error}
                </p>
                <button onClick={handleRetry} className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1">

                  <RefreshCw className="w-3 h-3" />
                  Try again
                </button>
              </div>
            </div>}

          {/* Empty State */}
          {!isLoading && !error && notes.length === 0 && <div className="text-center py-8">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No notes yet
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Notes from admins and agents will appear here
              </p>
            </div>}

          {/* Notes List */}
          {!isLoading && !error && notes.length > 0 && <div className="space-y-3">
              {notes.map((note) => <div key={note.id} className="bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 rounded-lg p-4">

                  {/* Note Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getRoleBadge(note.author.role)}
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {note.author.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>
                        {formatDate(note.createdAt)} at{' '}
                        {formatTime(note.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Note Content */}
                  <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </p>

                  {/* Updated indicator */}
                  {note.updatedAt !== note.createdAt && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 italic">
                      Edited on {formatDate(note.updatedAt)}
                    </p>}
                </div>)}
            </div>}

          {/* Info Banner */}
          {!isLoading && !error && <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                These notes are added by our admin team and assigned agents to
                help you manage your property. You cannot edit or delete these
                notes.
              </p>
            </div>}
        </div>}
    </div>;
}
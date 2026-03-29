import React, { useEffect, useState } from 'react';
import { X, FileText, Loader2 } from 'lucide-react';
import { AgentNote } from '../../types/agent.types';
interface PropertyNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string) => Promise<void>;
  propertyTitle: string;
  existingNote?: AgentNote | null;
  isSubmitting?: boolean;
}
export function PropertyNoteModal({
  isOpen,
  onClose,
  onSave,
  propertyTitle,
  existingNote = null,
  isSubmitting = false
}: PropertyNoteModalProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const isEditing = !!existingNote;
  useEffect(() => {
    if (isOpen) {
      setContent(existingNote?.content || '');
      setError('');
    }
  }, [isOpen, existingNote]);
  if (!isOpen) return null;
  const handleSubmit = async () => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError('Note content is required');
      return;
    }
    if (trimmedContent.length < 3) {
      setError('Note must be at least 3 characters');
      return;
    }
    if (trimmedContent.length > 2000) {
      setError('Note must be less than 2000 characters');
      return;
    }
    setError('');
    await onSave(trimmedContent);
  };
  return <div className="fixed inset-0 bg-navy/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-navy dark:text-white font-playfair">
                {isEditing ? 'Edit Note' : 'Add Note'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[280px]">
                {propertyTitle}
              </p>
            </div>
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors disabled:opacity-50">

            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Note Content
          </label>
          <textarea value={content} onChange={(e) => {
          setContent(e.target.value);
          if (error) setError('');
        }} placeholder="Add your note about this property..." className={`w-full p-4 border rounded-lg focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none resize-none h-40 dark:bg-slate-700 dark:text-white ${error ? 'border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-600'}`} disabled={isSubmitting} />


          <div className="flex justify-between items-center mt-2">
            {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : <p className="text-xs text-slate-400 dark:text-slate-500">
                {content.length}/2000 characters
              </p>}
          </div>

          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              <strong>Note:</strong> This note will be visible to the property
              owner and assigned tenants. Only you can edit or delete it.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
          <button onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50">

            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting || !content.trim()} className="px-6 py-2 bg-navy dark:bg-slate-200 text-white dark:text-navy font-medium rounded-lg hover:bg-navy/90 dark:hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">

            {isSubmitting ? <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isEditing ? 'Saving...' : 'Creating...'}
              </> : isEditing ? 'Save Changes' : 'Create Note'}
          </button>
        </div>
      </div>
    </div>;
}
import React from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
interface DeleteNoteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  propertyTitle: string;
  isSubmitting?: boolean;
}
export function DeleteNoteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  propertyTitle,
  isSubmitting = false
}: DeleteNoteConfirmModalProps) {
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-navy/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-navy dark:text-white font-playfair">
            Delete Note
          </h3>
          <button onClick={onClose} disabled={isSubmitting} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors disabled:opacity-50">

            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h4 className="text-lg font-bold text-navy dark:text-white mb-2">
            Are you sure you want to delete this note?
          </h4>

          <p className="text-slate-500 dark:text-slate-400 mb-2">
            This note for{' '}
            <strong className="text-navy dark:text-white">
              {propertyTitle}
            </strong>{' '}
            will be removed.
          </p>

          <p className="text-sm text-slate-400 dark:text-slate-500">
            The owner and tenants will no longer see this note.
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-center gap-3">
          <button onClick={onClose} disabled={isSubmitting} className="px-6 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50">

            Cancel
          </button>
          <button onClick={onConfirm} disabled={isSubmitting} className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">

            {isSubmitting ? <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </> : 'Delete Note'}
          </button>
        </div>
      </div>
    </div>;
}
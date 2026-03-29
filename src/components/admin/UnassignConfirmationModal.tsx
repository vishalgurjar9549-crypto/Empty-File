import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
interface UnassignConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName: string;
  isSubmitting?: boolean;
}
export function UnassignConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isSubmitting = false
}: UnassignConfirmationModalProps) {
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-navy/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-navy dark:text-white font-playfair">
            {title}
          </h3>
          <button onClick={onClose} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">

            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h4 className="text-lg font-bold text-navy dark:text-white mb-2">
            Unassign {itemName}?
          </h4>

          <p className="text-slate-500 dark:text-slate-400 mb-6">{message}</p>

          <div className="flex gap-3 justify-center">
            <button onClick={onClose} className="px-6 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors" disabled={isSubmitting}>

              Cancel
            </button>
            <button onClick={onConfirm} disabled={isSubmitting} className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">

              {isSubmitting ? <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Unassigning...
                </> : 'Confirm Unassign'}
            </button>
          </div>
        </div>
      </div>
    </div>;
}
import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle, Ban } from 'lucide-react';
import { PropertyStatus } from '../../types/admin.types';
interface PropertyStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (status: PropertyStatus, reason?: string) => void;
  currentStatus: PropertyStatus;
  propertyTitle: string;
}
export function PropertyStatusModal({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
  propertyTitle
}: PropertyStatusModalProps) {
  const [reason, setReason] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<PropertyStatus | null>(null);
  if (!isOpen) return null;
  const getActionColor = (status: PropertyStatus) => {
    switch (status) {
      case 'approved':
        return 'bg-green-600 hover:bg-green-700';
      case 'rejected':
        return 'bg-red-600 hover:bg-red-700';
      case 'suspended':
        return 'bg-slate-600 hover:bg-slate-700';
      default:
        return 'bg-navy hover:bg-navy/90';
    }
  };
  const handleSubmit = () => {
    if (selectedStatus) {
      onConfirm(selectedStatus, reason);
      onClose();
    }
  };
  return <div
    className="fixed inset-0 bg-navy/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="property-status-title"
  >
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h3 id="property-status-title" className="text-xl font-bold text-navy dark:text-white font-playfair">
            Update Status
          </h3>
          <button
            onClick={onClose}
            aria-label="Close property status modal"
            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >

            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <p className="text-slate-600 dark:text-slate-300 mb-2">Property:</p>
            <p className="font-bold text-navy dark:text-white text-lg">
              {propertyTitle}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Select Action
            </p>

            <div className="grid grid-cols-1 gap-3">
              {currentStatus !== 'approved' && <button onClick={() => setSelectedStatus('approved')} className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${selectedStatus === 'approved' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'border-slate-100 dark:border-slate-700 hover:border-green-200 dark:hover:border-green-800 hover:bg-green-50/50 dark:hover:bg-green-900/10 text-slate-700 dark:text-slate-300'}`}>

                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Approve Property</span>
                </button>}

              {currentStatus !== 'rejected' && <button onClick={() => setSelectedStatus('rejected')} className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${selectedStatus === 'rejected' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'border-slate-100 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800 hover:bg-red-50/50 dark:hover:bg-red-900/10 text-slate-700 dark:text-slate-300'}`}>

                  <X className="w-5 h-5" />
                  <span className="font-medium">Reject Property</span>
                </button>}

              {currentStatus !== 'suspended' && <button onClick={() => setSelectedStatus('suspended')} className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${selectedStatus === 'suspended' ? 'border-slate-500 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300' : 'border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>

                  <Ban className="w-5 h-5" />
                  <span className="font-medium">Suspend Property</span>
                </button>}
            </div>
          </div>

          {(selectedStatus === 'rejected' || selectedStatus === 'suspended') && <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Reason (Optional)
              </label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none min-h-[100px] dark:bg-slate-700 dark:text-white" placeholder="Add a note about this action..." />

            </div>}
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >

            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedStatus}
            className={`px-6 py-2 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${selectedStatus ? getActionColor(selectedStatus) : 'bg-slate-300 dark:bg-slate-600'}`}
          >>

            Confirm Update
          </button>
        </div>
      </div>
    </div>;
}
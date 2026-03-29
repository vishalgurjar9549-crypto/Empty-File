import React, { useState } from 'react';
import { X, UserCheck, UserX } from 'lucide-react';
import { UserStatus } from '../../types/admin.types';
interface UserStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (status: UserStatus) => void;
  currentStatus: UserStatus;
  userName: string;
}
export function UserStatusModal({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
  userName
}: UserStatusModalProps) {
  if (!isOpen) return null;
  const isActivating = currentStatus === 'disabled';
  const newStatus = isActivating ? 'active' : 'disabled';
  return <div className="fixed inset-0 bg-navy/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-navy dark:text-white font-playfair">
            {isActivating ? 'Enable User Account' : 'Disable User Account'}
          </h3>
          <button onClick={onClose} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">

            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <div className="p-6 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isActivating ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>

            {isActivating ? <UserCheck className="w-8 h-8" /> : <UserX className="w-8 h-8" />}
          </div>

          <h4 className="text-lg font-bold text-navy dark:text-white mb-2">
            Are you sure you want to {isActivating ? 'enable' : 'disable'}{' '}
            {userName}?
          </h4>

          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {isActivating ? 'This user will regain access to their account immediately.' : 'This user will lose access to their account and all associated data.'}
          </p>

          <div className="flex gap-3 justify-center">
            <button onClick={onClose} className="px-6 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors">

              Cancel
            </button>
            <button onClick={() => {
            onConfirm(newStatus);
            onClose();
          }} className={`px-6 py-2 text-white font-medium rounded-lg transition-colors ${isActivating ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>

              Confirm {isActivating ? 'Enable' : 'Disable'}
            </button>
          </div>
        </div>
      </div>
    </div>;
}
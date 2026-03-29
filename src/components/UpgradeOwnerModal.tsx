import React, { useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { updateUser } from '../store/slices/auth.slice';
import { Button } from './ui/Button';
interface UpgradeOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export const UpgradeOwnerModal = ({
  isOpen,
  onClose
}: UpgradeOwnerModalProps) => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!isOpen) return null;
  const handleUpgrade = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Retrieve JWT token from storage (matches existing auth pattern)
      const token = localStorage.getItem('kangaroo_token');
      const response = await fetch('/api/users/upgrade-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ?
          {
            Authorization: `Bearer ${token}`
          } :
          {})
        },
        credentials: 'include',
        body: JSON.stringify({
          role: 'OWNER'
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data?.message ?? 'Failed to upgrade account. Please try again.'
        );
      }
      // Update Redux auth store with the returned updated user
      const updatedUser = data?.data?.user ?? data?.user ?? data;
      if (updatedUser && updatedUser.id) {
        dispatch(updateUser(updatedUser));
      }
      onClose();
      // Hard redirect so the Owner Dashboard loads with fresh role state
      window.location.href = '/owner/dashboard';
    } catch (err: any) {
      setError(err?.message ?? 'Failed to upgrade account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 relative">
        {/* Icon */}
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 mx-auto mb-5">
          <svg
            className="w-7 h-7 text-blue-600 dark:text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}>

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15.75a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z" />

          </svg>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
          Start listing your property
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6 leading-relaxed">
          You need an{' '}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Owner account
          </span>{' '}
          to list properties. Upgrading is free and takes just a second.
        </p>

        {/* Benefits list */}
        <ul className="space-y-2 mb-6">
          {[
          'List unlimited properties',
          'Manage bookings & tenants',
          'Access Owner Dashboard'].
          map((item) =>
          <li
            key={item}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">

              <svg
              className="w-4 h-4 text-green-500 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}>

                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7" />

              </svg>
              {item}
            </li>
          )}
        </ul>

        {/* Error message */}
        {error &&
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        }

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full justify-center">

            {isLoading ?
            <span className="flex items-center gap-2">
                <svg
                className="animate-spin w-4 h-4"
                fill="none"
                viewBox="0 0 24 24">

                  <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4" />

                  <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z" />

                </svg>
                Upgrading…
              </span> :

            'Upgrade to Owner'
            }
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isLoading}
            className="w-full justify-center">

            Cancel
          </Button>
        </div>
      </div>
    </div>);

};
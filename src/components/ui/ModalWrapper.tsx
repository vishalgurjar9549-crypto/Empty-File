import React, { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Z_INDEX, MODAL_SIZES, MODAL_COMMON } from '@/constants/designSystem';

export type ModalSize = keyof typeof MODAL_SIZES;

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  children: ReactNode;
  footer?: ReactNode;
  closeButton?: boolean;
  className?: string;
  contentClassName?: string;
}

/**
 * ModalWrapper Component
 * 
 * Standardizes ALL modals across the application
 * Replaces 16 different modal implementations with inconsistent sizing, z-index, spacing
 * 
 * Ensures:
 * - Consistent z-index (z-50 for modals, z-40 for backdrops)
 * - Responsive sizing (w-full on mobile, constrained on desktop)
 * - Consistent backdrop styling
 * - Responsive padding and overflow handling
 * 
 * Usage:
 * <ModalWrapper
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Confirm Action"
 *   size="md"
 *   closeButton
 * >
 *   <p>Are you sure?</p>
 *   <div className="flex gap-4 mt-6">
 *     <button>Cancel</button>
 *     <button>Confirm</button>
 *   </div>
 * </ModalWrapper>
 * 
 * Replaces patterns like:
 * - BookingModal (custom styling)
 * - PhoneModal (max-w-[440px] arbitrary ❌)
 * - AddPropertyModal (z-10 too low ❌)
 * - EditPropertyModal (mixed height patterns ❌)
 * - 12 other modals with inconsistent patterns
 */
export function ModalWrapper({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  closeButton = true,
  className = '',
  contentClassName = '',
}: ModalWrapperProps) {
  if (!isOpen) return null;

  const sizeConfig = MODAL_SIZES[size];

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[${Z_INDEX.modalBackdrop}] ${MODAL_COMMON.backdrop}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      <div
        className={`fixed inset-0 z-[${Z_INDEX.modal}] ${MODAL_COMMON.overlay}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`
            ${sizeConfig.width}
            ${sizeConfig.height}
            overflow-y-auto
            ${MODAL_COMMON.container}
            ${className}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with title and close button */}
          {(title || closeButton) && (
            <div className="flex-shrink-0 flex items-start justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4">
              {title && (
                <div>
                  <h2
                    id="modal-title"
                    className="text-lg font-bold text-slate-900 dark:text-white"
                  >
                    {title}
                  </h2>
                  {description && (
                    <p
                      id="modal-description"
                      className="text-sm text-slate-600 dark:text-slate-400 mt-1"
                    >
                      {description}
                    </p>
                  )}
                </div>
              )}
              {closeButton && (
                <button
                  onClick={onClose}
                  className={MODAL_COMMON.closeButton}
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className={`flex-1 ${sizeConfig.padding} ${contentClassName}`}>
            {children}
          </div>

          {/* Footer with actions */}
          {footer && (
            <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 px-6 py-4 bg-slate-50 dark:bg-slate-900/30">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

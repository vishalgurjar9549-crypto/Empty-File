import React, { useState } from 'react';
import { useAuth } from './useAuth';
import { EmailVerificationModal } from '../components/auth/EmailVerificationModal';

/**
 * ═════════════════════════════════════════════════════════════════════
 * API CALL WRAPPER WITH EMAIL VERIFICATION HANDLING
 * ═════════════════════════════════════════════════════════════════════
 *
 * This is a helper hook for making API calls that may require email verification.
 *
 * When an API call returns:
 * {
 *   code: "EMAIL_VERIFICATION_REQUIRED",
 *   message: "Please verify your email before proceeding"
 * }
 *
 * This wrapper will:
 * 1. Show the email verification modal
 * 2. After successful verification, retry the original request
 * 3. Return the successful response
 *
 * Usage Example:
 *
 * const { user, token } = useAuth();
 * const { makeRequest, requiresVerification, setRequiresVerification } = useApiWithEmailVerification();
 *
 * const createProperty = async (propertyData) => {
 *   const response = await makeRequest('/api/properties', {
 *     method: 'POST',
 *     body: JSON.stringify(propertyData)
 *   });
 *
 *   if (response) {
 *     // Success - user verified email
 *     showSuccessToast('Property created!');
 *     refreshProperties();
 *   }
 * };
 *
 * // In component:
 * {requiresVerification && (
 *   <EmailVerificationModal
 *     isOpen={true}
 *     email={user?.email}
 *     onSuccess={() => {
 *       setRequiresVerification(false);
 *       // Retry will happen automatically
 *     }}
 *     onClose={() => setRequiresVerification(false)}
 *   />
 * )}
 */

export const useApiWithEmailVerification = () => {
  const { user, token } = useAuth();
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<{
    url: string;
    options: RequestInit;
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
  } | null>(null);

  const makeRequest = async (url: string, options: RequestInit = {}) => {
    return new Promise((resolve, reject) => {
      performRequest(url, options)
        .then(response => {
          if (
            response.status === 403 &&
            response.data?.code === 'EMAIL_VERIFICATION_REQUIRED'
          ) {
            // Require verification - save request for retry
            setRequiresVerification(true);
            setPendingRequest({
              url,
              options,
              resolve,
              reject
            });
          } else if (response.ok) {
            resolve(response.data);
          } else {
            reject(new Error(response.data?.message || 'API call failed'));
          }
        })
        .catch(reject);
    });
  };

  const performRequest = async (url: string, options: RequestInit) => {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      },
      ...options
    });

    const data = await response.json();

    return {
      ok: response.ok,
      status: response.status,
      data
    };
  };

  const retryPendingRequest = async () => {
    if (!pendingRequest) return;

    const { url, options, resolve, reject } = pendingRequest;

    try {
      const response = await performRequest(url, options);
      if (response.ok) {
        resolve(response.data);
      } else {
        reject(new Error(response.data?.message || 'API call failed'));
      }
    } catch (error) {
      reject(error);
    } finally {
      setPendingRequest(null);
      setRequiresVerification(false);
    }
  };

  return {
    makeRequest,
    requiresVerification,
    setRequiresVerification,
    retryPendingRequest,
    pendingRequest
  };
};

/**
 * ═════════════════════════════════════════════════════════════════════
 * EXAMPLE USAGE IN A COMPONENT
 * ═════════════════════════════════════════════════════════════════════
 *
 * function CreatePropertyModal() {
 *   const { user } = useAuth();
 *   const {
 *     makeRequest,
 *     requiresVerification,
 *     setRequiresVerification,
 *     retryPendingRequest
 *   } = useApiWithEmailVerification();
 *
 *   const handleCreateProperty = async (formData) => {
 *     try {
 *       const result = await makeRequest('/api/properties', {
 *         method: 'POST',
 *         body: JSON.stringify(formData)
 *       });
 *       // Success!
 *       showSuccessToast('Property created');
 *     } catch (error) {
 *       showErrorToast(error.message);
 *     }
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={() => handleCreateProperty(data)}>
 *         Create Property
 *       </button>
 *
 *       {requiresVerification && (
 *         <EmailVerificationModal
 *           isOpen={true}
 *           email={user?.email}
 *           onSuccess={() => {
 *             retryPendingRequest(); // Auto-retry!
 *           }}
 *           onClose={() => setRequiresVerification(false)}
 *         />
 *       )}
 *     </>
 *   );
 * }
 */

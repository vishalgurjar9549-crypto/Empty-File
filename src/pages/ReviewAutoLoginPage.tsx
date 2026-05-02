import React, { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { authApi } from "../api/auth.api";
import { useAppDispatch } from "../store/hooks";
import { setCredentials } from "../store/slices/auth.slice";

export function ReviewAutoLoginPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const loginByProperty = async () => {
      if (!propertyId) {
        navigate("/auth/login", { replace: true });
        return;
      }

      try {
        const { user, token } = await authApi.autoLoginByProperty(propertyId);
        dispatch(setCredentials({ user, token }));
        navigate("/owner/dashboard", { replace: true });
      } catch {
        navigate("/auth/login", { replace: true });
      }
    };

    loginByProperty();
  }, [dispatch, navigate, propertyId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-slate-950 transition-colors duration-300">
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
        Logging you in...
      </p>
    </div>
  );
}

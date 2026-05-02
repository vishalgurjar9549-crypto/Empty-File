import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

/**
 * ═════════════════════════════════════════════════════════════════════
 * BECOME AGENT ACTION HOOK
 * ═════════════════════════════════════════════════════════════════════
 *
 * Handles role-based navigation for "Become an Agent" button.
 *
 * Logic:
 * 1. Not logged in → /agent/register
 * 2. Logged in + role = TENANT → /agent/register
 * 3. Logged in + role = AGENT → /agent/dashboard
 * 4. Other roles → show error toast (cannot apply)
 *
 * Usage:
 * const { handleBecomeAgentClick } = useBecomeAgentAction();
 * <button onClick={handleBecomeAgentClick}>Become an Agent</button>
 */
export function useBecomeAgentAction() {
  const navigate = useNavigate();
  const { user, authStatus } = useAppSelector((state) => state.auth);

  const handleBecomeAgentClick = () => {
    // STEP 1: Not logged in → go to agent registration
    if (authStatus === 'UNAUTHENTICATED' || !user) {
      navigate('/agent/register');
      return;
    }

    const userRole = user.role?.toUpperCase();

    // STEP 2: Already agent → go to agent dashboard
    if (userRole === 'AGENT') {
      navigate('/agent/dashboard');
      return;
    }

    // STEP 3: Tenant → show registration form
    if (userRole === 'TENANT') {
      navigate('/agent/register');
      return;
    }

    // STEP 4: Owner or other role → cannot apply
    // In this case, just navigate to register and let backend handle validation
    // Alternatively, you could dispatch a toast error here
    navigate('/agent/register');
  };

  return { handleBecomeAgentClick };
}

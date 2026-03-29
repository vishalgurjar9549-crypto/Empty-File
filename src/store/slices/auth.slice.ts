import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../api/auth.api';
import { User, RegisterInput, LoginInput } from '../../types/api.types';
import { showToast } from './ui.slice';

// ─── Auth State Machine ─────────────────────────────────────────────
// INITIALIZING  → Token exists, validating with server
// AUTHENTICATED → Server confirmed identity
// UNAUTHENTICATED → No token or server rejected (401/403 only)
export type AuthStatus = 'INITIALIZING' | 'AUTHENTICATED' | 'UNAUTHENTICATED';
interface AuthState {
  user: User | null;
  token: string | null;
  authStatus: AuthStatus;
  loading: boolean;
  error: string | null;
}

// ─── STEP 1: Smart Initial State ────────────────────────────────────
// If a token exists in localStorage, we start in INITIALIZING — NOT UNAUTHENTICATED.
// This prevents the race condition where protected routes redirect before
// getCurrentUser() has a chance to validate the token.
const token = localStorage.getItem('kangaroo_token');

// Hydrate cached user from localStorage to prevent null user during INITIALIZING.
// This avoids Navbar flash and provides user data if getCurrentUser fails transiently.
const cachedUser: User | null = (() => {
  try {
    const raw = localStorage.getItem('kangaroo_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();
const initialState: AuthState = {
  user: token ? cachedUser : null,
  token,
  authStatus: token ? 'INITIALIZING' : 'UNAUTHENTICATED',
  loading: false,
  error: null
};

// ─── Async Thunks ───────────────────────────────────────────────────

export const register = createAsyncThunk('auth/register', async (data: RegisterInput, {
  dispatch,
  rejectWithValue
}) => {
  try {
    const response = await authApi.register(data);
    localStorage.setItem('kangaroo_token', response.token);
    localStorage.setItem('kangaroo_user', JSON.stringify(response.user));
    dispatch(showToast({
      message: `Account created successfully! Welcome, ${response.user.name}!`,
      type: 'success'
    }));
    return response;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Registration failed';
    dispatch(showToast({
      message,
      type: 'error'
    }));
    return rejectWithValue(message);
  }
});
export const login = createAsyncThunk('auth/login', async (data: LoginInput, {
  dispatch,
  rejectWithValue
}) => {
  try {
    const response = await authApi.login(data);
    localStorage.setItem('kangaroo_token', response.token);
    localStorage.setItem('kangaroo_user', JSON.stringify(response.user));
    dispatch(showToast({
      message: `Welcome back, ${response.user.name}!`,
      type: 'success'
    }));
    return response;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Invalid email or password';
    dispatch(showToast({
      message,
      type: 'error'
    }));
    return rejectWithValue(message);
  }
});

// ─── STEP 2: getCurrentUser with retry on transient failures ────────
// First attempt calls /auth/me. If it fails with a non-auth error
// (network, 500, timeout), we retry ONCE after a short delay.
// 401/403 = definitive auth rejection → no retry, fail immediately.
// If retry also fails, rejectWithValue so the reducer can apply optimistic trust.
export const getCurrentUser = createAsyncThunk('auth/getCurrentUser', async (_, {
  rejectWithValue
}) => {
  const attempt = async () => {
    const user = await authApi.getCurrentUser();
    localStorage.setItem('kangaroo_user', JSON.stringify(user));
    return user;
  };
  try {
    // ── First attempt ──
    return await attempt();
  } catch (error: any) {
    const status = error.response?.status;

    // 401/403 = token is definitively invalid. Do NOT retry.
    if (status === 401 || status === 403) {
      const message = error.response?.data?.message || 'Authentication failed';
      return rejectWithValue({
        message,
        status
      });
    }

    // ── Transient failure (network, 500, timeout) → retry once after 400ms ──
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return await attempt();
    } catch (retryError: any) {
      const retryStatus = retryError.response?.status;

      // If retry got a 401/403, respect it
      if (retryStatus === 401 || retryStatus === 403) {
        const message = retryError.response?.data?.message || 'Authentication failed';
        return rejectWithValue({
          message,
          status: retryStatus
        });
      }

      // Both attempts failed with transient errors.
      // Pass to reducer — it will apply optimistic trust if token exists.
      const message = retryError.response?.data?.message || 'Failed to fetch user';
      return rejectWithValue({
        message,
        status: retryStatus
      });
    }
  }
});
export const logout = createAsyncThunk('auth/logout', async (_, {
  dispatch
}) => {
  localStorage.removeItem('kangaroo_token');
  localStorage.removeItem('kangaroo_user');
  dispatch(showToast({
    message: 'Logged out successfully',
    type: 'success'
  }));
});

// ─── Slice ───────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.authStatus = 'AUTHENTICATED';
      state.error = null;
      localStorage.setItem('kangaroo_token', action.payload.token);
      localStorage.setItem('kangaroo_user', JSON.stringify(action.payload.user));
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload
        };
        localStorage.setItem('kangaroo_user', JSON.stringify(state.user));
      }
    },
    // Manual force-logout (used by axios interceptor via store.dispatch)
    forceLogout: (state) => {
      state.user = null;
      state.token = null;
      state.authStatus = 'UNAUTHENTICATED';
      state.error = null;
      localStorage.removeItem('kangaroo_token');
      localStorage.removeItem('kangaroo_user');
    }
  },
  extraReducers: (builder) => {
    // ── Register ──
    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    }).addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.authStatus = 'AUTHENTICATED';
    }).addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // ── Login ──
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    }).addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.authStatus = 'AUTHENTICATED';
    }).addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // ── Get Current User (STEP 2: Smart rejection) ──
    builder.addCase(getCurrentUser.pending, (state) => {
      state.loading = true;
      // Keep INITIALIZING — do NOT flip to UNAUTHENTICATED during fetch
      if (state.authStatus !== 'AUTHENTICATED') {
        state.authStatus = 'INITIALIZING';
      }
    }).addCase(getCurrentUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.authStatus = 'AUTHENTICATED';
    }).addCase(getCurrentUser.rejected, (state, action) => {
      state.loading = false;
      const payload = action.payload as {
        message: string;
        status?: number;
      } | undefined;
      const status = payload?.status;

      // CRITICAL: Only mark UNAUTHENTICATED on definitive auth failures.
      // 401 = token expired/invalid, 403 = forbidden
      // Network errors, 500s, timeouts → do NOT destroy the session.
      if (status === 401 || status === 403) {
        state.authStatus = 'UNAUTHENTICATED';
        state.user = null;
        state.token = null;
        localStorage.removeItem('kangaroo_token');
        localStorage.removeItem('kangaroo_user');
      } else {
        // Transient error (network, 500, timeout).
        // OPTIMISTIC TRUST: If we have a token, assume it's still valid.
        // The server couldn't be reached to confirm, but we don't punish the user.
        // INITIALIZING must NEVER persist — always resolve to a terminal state.
        if (state.token) {
          state.authStatus = 'AUTHENTICATED';
          // Hydrate user from localStorage cache if not already present
          if (!state.user) {
            try {
              const raw = localStorage.getItem('kangaroo_user');
              if (raw) {
                state.user = JSON.parse(raw);
              }
            } catch {




              // Cache corrupted — user stays null, but authStatus is still AUTHENTICATED.
              // Protected routes that require user will redirect, which is correct
              // since we have no user data to render.
            }}} else {// No token at all — definitively unauthenticated
          state.authStatus = 'UNAUTHENTICATED';
        }
      }
    });

    // ── Logout ──
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.authStatus = 'UNAUTHENTICATED';
      state.error = null;
    });
  }
});
export const {
  clearError,
  setCredentials,
  updateUser,
  forceLogout
} = authSlice.actions;
export default authSlice.reducer;
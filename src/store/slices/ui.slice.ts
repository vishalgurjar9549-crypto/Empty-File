import { createSlice, PayloadAction } from '@reduxjs/toolkit';
interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}
interface UiState {
  toast: ToastState | null;
}
const initialState: UiState = {
  toast: null
};
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<ToastState>) => {
      state.toast = action.payload;
    },
    hideToast: (state) => {
      state.toast = null;
    }
  }
});
export const {
  showToast,
  hideToast
} = uiSlice.actions;
export default uiSlice.reducer;
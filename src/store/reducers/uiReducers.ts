// src/store/reducers/uiReducers.ts
import type { UIState, ToastProps } from '../../types';
import { createSlice} from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

const uiInitialState: UIState = {
	isSidebarOpen: false,
	theme: 'dark',
	notifications: [],
	modals: {}
};

const uiSlice = createSlice({
	name: 'ui',
	initialState: uiInitialState,
	reducers: {
		toggleSidebar: (state) => {
			state.isSidebarOpen = !state.isSidebarOpen;
		},
		setSidebarOpen: (state, action: PayloadAction<boolean>) => {
			state.isSidebarOpen = action.payload;
		},
		setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
			state.theme = action.payload;
		},
		addNotification: (state, action: PayloadAction<Omit<ToastProps, 'id' | 'onClose'>>) => {
			const notification = {
				...action.payload,
				id: Date.now().toString(),
				onClose: () => {}
			};
			state.notifications.push(notification);
		},
		removeNotification: (state, action: PayloadAction<string>) => {
			state.notifications = state.notifications.filter(
				notification => notification.id !== action.payload
			);
		},
		clearNotifications: (state) => {
			state.notifications = [];
		},
		openModal: (state, action: PayloadAction<string>) => {
			state.modals[action.payload] = true;
		},
		closeModal: (state, action: PayloadAction<string>) => {
			state.modals[action.payload] = false;
		},
		closeAllModals: (state) => {
			Object.keys(state.modals).forEach(key => {
				state.modals[key] = false;
			});
		}
	}
});

export const uiActions = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
// src/store/reducers/adminReducers.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AdminStats, AdminState } from '../../types';

const adminInitialState: AdminState = {
	stats: null,
	isLoading: false,
	error: null
};

const adminSlice = createSlice({
	name: 'admin',
	initialState: adminInitialState,
	reducers: {
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},
		setStats: (state, action: PayloadAction<AdminStats>) => {
			state.stats = action.payload;
		},
		updateStats: (state, action: PayloadAction<Partial<AdminStats>>) => {
			if (state.stats) {
				state.stats = { ...state.stats, ...action.payload };
			}
		},
		clearStats: (state) => {
			state.stats = null;
		}
	}
});

export const adminActions = adminSlice.actions;
export const adminReducer = adminSlice.reducer;


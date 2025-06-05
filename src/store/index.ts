// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { userReducer } from './reducers/userReducers';
import { contentReducer } from './reducers/contentReducers';
import { adminReducer } from './reducers/adminReducers';
import { uiReducer } from './reducers/uiReducers';

const userInfoFromStorage = localStorage.getItem('account')
	? JSON.parse(localStorage.getItem('account') as string)
	: null;

const initialState = {
	user: { userInfo: userInfoFromStorage, isAuthenticated: !!userInfoFromStorage, isLoading: false, error: null },
	content: {
		items: [],
		featuredContent: [],
		trendingContent: [],
		currentContent: null,
		isLoading: false,
		error: null,
		filters: {
			query: '',
			type: '',
			tags: [],
			sortBy: 'newest' as const
		},
		pagination: {
			currentPage: 1,
			totalPages: 1,
			totalItems: 0
		}
	},
	admin: {
		stats: null,
		isLoading: false,
		error: null
	},
	ui: {
		isSidebarOpen: false,
		theme: 'dark' as const,
		notifications: [],
		modals: {}
	}
};

const store = configureStore({
	reducer: {
		user: userReducer,
		content: contentReducer,
		admin: adminReducer,
		ui: uiReducer,
	},
	preloadedState: initialState,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: ['ui/addNotification'],
				ignoredPaths: ['ui.notifications'],
			},
		}),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
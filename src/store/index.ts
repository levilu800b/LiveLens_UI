// src/store/index.ts - WITH DATA MIGRATION
import { configureStore } from '@reduxjs/toolkit';
import { userReducer } from './reducers/userReducers';
import { contentReducer } from './reducers/contentReducers';
import { adminReducer } from './reducers/adminReducers';
import { uiReducer } from './reducers/uiReducers';
import unifiedAuth from '../utils/unifiedAuth';
import { useDispatch } from 'react-redux';


export const useAppDispatch = () => useDispatch<AppDispatch>();



const migrateUserData = () => {
  try {    
	const localStorageUser = localStorage.getItem('account');
	
const user = unifiedAuth.user.getUser();
    
    if (localStorageUser && !user) {
      const userData = JSON.parse(localStorageUser);
      secureUserStorage.setUser(userData);
      localStorage.removeItem('account');
      return userData;
    }
    
    return user;
  } catch (error) {
    console.error('Migration failed:', error);
    return null;
  }
};


// Use migrated data
const userInfoFromStorage = migrateUserData();

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
import { configureStore } from '@reduxjs/toolkit';

import { userReducer } from './reducers/userReducers';

const userInfoFromStorage = localStorage.getItem('account')
	? JSON.parse(localStorage.getItem('account') as string)
	: null;

const initialState = {
	user: { userInfo: userInfoFromStorage },
};

const store = configureStore({
	reducer: {
		user: userReducer,
	},
	preloadedState: initialState,
});

export default store;
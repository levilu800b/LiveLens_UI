import { userActions } from '../reducers/userReducers';

import { Dispatch } from 'redux';

export const logout = () => (dispatch: Dispatch) => {
	dispatch(userActions.resetUserInfo());
	localStorage.removeItem('account');
};
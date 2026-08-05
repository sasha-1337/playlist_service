import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser, selectUserToken, selectIsAuthenticated } from './selectors/authSelectors';

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

export const useCurrentUser = () => useAppSelector(selectCurrentUser);
export const useUserToken = () => useAppSelector(selectUserToken);
export const useIsAuthenticated = () => useAppSelector(selectIsAuthenticated);


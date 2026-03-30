import AsyncStorage from '@react-native-async-storage/async-storage';

export const SESSION_MODE_KEY = 'session_mode';

export const SESSION_MODES = {
    LOGGED_OUT: 'logged_out',
    GUEST: 'guest',
    AUTHENTICATED: 'authenticated',
};

export const getSessionMode = async () => {
    const sessionMode = await AsyncStorage.getItem(SESSION_MODE_KEY);
    return sessionMode || SESSION_MODES.LOGGED_OUT;
};

export const setSessionMode = async (sessionMode) => {
    await AsyncStorage.setItem(SESSION_MODE_KEY, sessionMode);
};

export const startGuestSession = async () => {
    await AsyncStorage.removeItem('jwt_token');
    await AsyncStorage.removeItem('user_info');
    await setSessionMode(SESSION_MODES.GUEST);
    return SESSION_MODES.GUEST;
};

export const startAuthenticatedSession = async () => {
    await setSessionMode(SESSION_MODES.AUTHENTICATED);
    return SESSION_MODES.AUTHENTICATED;
};

export const clearSession = async () => {
    await AsyncStorage.removeItem('jwt_token');
    await AsyncStorage.removeItem('user_info');
    await AsyncStorage.removeItem(SESSION_MODE_KEY);
    return SESSION_MODES.LOGGED_OUT;
};

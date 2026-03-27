// mobile/src/services/authService.js
import { apiRequest } from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Hàm Đăng ký (Register)
export const register = async (username, email, password, fullName) => {
    const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password, fullName }),
    });

    if (data.token) {
        await AsyncStorage.setItem('jwt_token', data.token);
        await AsyncStorage.setItem('user_info', JSON.stringify({ name: data.name, email: data.email }));
        return data;
    } else {
        // Đọc lỗi từ errors map của GlobalExceptionHandler
        let msg = data.message || "Đăng ký thất bại";
        if (data.errors) {
            msg = Object.values(data.errors)[0]; // Lấy lỗi validation đầu tiên
        }
        throw new Error(msg);
    }
};

// 2. Hàm Đăng nhập (Login)
export const login = async (usernameOrEmail, password) => {
    // Gọi API thật đến Backend
    const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ usernameOrEmail, password }),
    });

    if (data && data.token) {
        await AsyncStorage.setItem('jwt_token', data.token);
        const displayName = data.fullName || data.name || "User";
        await AsyncStorage.setItem('user_info', JSON.stringify({
            name: displayName,
            email: data.email
        }));
    }
    return data;
};

export const loginWithGoogle = async (idToken) => {
    const data = await apiRequest('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ idToken }),
    });

    if (data && data.token) {
        await AsyncStorage.setItem('jwt_token', data.token);
        await AsyncStorage.setItem('user_info', JSON.stringify({
            name: data.name || "User",
            email: data.email
        }));
    }

    return data;
};

export const getMyAuthProfile = async () => {
    return await apiRequest('/auth/my-profile');
};

// 3. Hàm Đăng xuất (Logout)
export const logout = async () => {
    await AsyncStorage.removeItem('jwt_token');
    await AsyncStorage.removeItem('user_info');
};

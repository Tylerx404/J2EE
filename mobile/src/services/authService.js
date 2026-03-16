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

    // Bypass cho tài khoản Admin
    if (usernameOrEmail === 'admin' && password === 'admin123') {
        const mockAdminData = {
            token: 'mock-jwt-token-for-admin-only',
            email: 'admin@j2ee.com',
            name: 'Admin'
        };
        await AsyncStorage.setItem('jwt_token', mockAdminData.token);
        await AsyncStorage.setItem('user_info', JSON.stringify({ name: mockAdminData.name, email: mockAdminData.email }));
        return mockAdminData;
    }

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

// 3. Hàm Đăng xuất (Logout)
export const logout = async () => {
    await AsyncStorage.removeItem('jwt_token');
    await AsyncStorage.removeItem('user_info');
};
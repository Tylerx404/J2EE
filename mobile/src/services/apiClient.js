import AsyncStorage from '@react-native-async-storage/async-storage';
import { env } from '../config/env';

const BASE_URL = env.apiUrl;

export const apiRequest = async (endpoint, options = {}) => {
    try {
        const token = await AsyncStorage.getItem('jwt_token');

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`; // Khớp JwtFilter Backend
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

        // 1. Đọc dưới dạng text để tránh lỗi "Unexpected end of input" khi body rỗng
        const responseText = await response.text();
        if (responseText.startsWith('<')) {
            console.log("Nội dung lỗi là:");
            console.log(responseText);
        }

        // 2. Phân tích JSON nếu có nội dung, nếu không trả về Object rỗng
        const data = responseText ? JSON.parse(responseText) : {};

        // 3. Xử lý Token hết hạn (401)
        if (response.status === 401) {
            await AsyncStorage.removeItem('jwt_token');
            // Hiệp có thể thêm logic điều hướng về Login ở đây nếu cần
        }

        // 4. Kiểm tra lỗi HTTP
        if (!response.ok) {
            throw new Error(data.message || `Lỗi Server: ${response.status}`);
        }

        return data; // Kết thúc hàm tại đây
    } catch (error) {
        console.error("API Call Error:", error.message);
        throw error;
    }
};

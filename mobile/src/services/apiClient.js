import AsyncStorage from '@react-native-async-storage/async-storage';
import { env } from '../config/env';

const BASE_URL = env.apiUrl;

const tryParseJson = (text) => {
    if (!text) {
        return {};
    }

    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
};

const buildErrorFromResponse = (response, data, responseText) => {
    if (data && typeof data === 'object') {
        const message = data.message || data.error || data.details;
        if (message) {
            return new Error(message);
        }
    }

    if (responseText && !responseText.startsWith('<')) {
        return new Error(responseText);
    }

    return new Error(`Loi Server: ${response.status}`);
};

export const apiRequest = async (endpoint, options = {}) => {
    try {
        const token = await AsyncStorage.getItem('jwt_token');

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
        const responseText = await response.text();
        const data = tryParseJson(responseText);

        if (response.status === 401) {
            await AsyncStorage.removeItem('jwt_token');
        }

        if (!response.ok) {
            throw buildErrorFromResponse(response, data, responseText);
        }

        if (data !== null) {
            return data;
        }

        if (!responseText) {
            return {};
        }

        return { rawText: responseText };
    } catch (error) {
        console.error('API Call Error:', error.message);
        throw error;
    }
};

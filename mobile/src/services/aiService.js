import { apiRequest } from './apiClient';

export const parseVoiceToTransaction = async (text) => {
    try {
        return await apiRequest('/ai/voice/parse', {
            method: 'POST',
            body: JSON.stringify({ voiceText: text }),
        });
    } catch (error) {
        console.error('Loi AI Parse:', error);
        throw error;
    }
};

export const generateAiAdvice = async ({ period, walletId } = {}) => {
    return await apiRequest('/ai/advice/generate', {
        method: 'POST',
        body: JSON.stringify({ period, walletId }),
    });
};

export const getAiAdviceHistory = async () => {
    return await apiRequest('/ai/advice/history');
};

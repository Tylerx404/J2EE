import { apiRequest } from './apiClient';

// Gửi chuỗi voiceText lên để Backend parse ra số tiền/loại chi tiêu
export const parseVoiceToTransaction = async (text) => {
    try {
        return await apiRequest('/ai/voice/parse', {
            method: 'POST',
            body: JSON.stringify({ voiceText: text }),
        });
    } catch (error) {
        console.error("Lỗi AI Parse:", error);
        throw error;
    }
};

// Lấy lời khuyên tài chính từ AI
export const generateAiAdvice = async (period) => {
    return await apiRequest('/ai/advice/generate', {
        method: 'POST',
        body: JSON.stringify({ period }),
    });
};
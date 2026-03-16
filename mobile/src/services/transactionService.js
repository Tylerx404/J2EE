import { apiRequest } from './apiClient';

// Lấy danh sách từ Backend
export const getTransactionsFromBackend = async () => {
    return await apiRequest('/transactions');
};

// Lưu lên Backend
export const createTransactionOnBackend = async (transactionData) => {
    return await apiRequest('/transactions', {
        method: 'POST',
        body: JSON.stringify(transactionData),
    });
};
import { apiRequest } from './apiClient';

// Lấy tất cả giao dịch của user
export const getTransactionsFromBackend = async () => {
    return await apiRequest('/transactions');
};

// Lấy giao dịch theo ví
export const getTransactionsByWallet = async (walletId) => {
    return await apiRequest(`/transactions/wallet/${walletId}`);
};

// Tạo giao dịch mới
export const createTransactionOnBackend = async (transactionData) => {
    return await apiRequest('/transactions', {
        method: 'POST',
        body: JSON.stringify(transactionData),
    });
};

// Xóa giao dịch
export const deleteTransactionOnBackend = async (transactionId) => {
    return await apiRequest(`/transactions/${transactionId}`, {
        method: 'DELETE',
    });
};

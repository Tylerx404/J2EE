// src/services/transactionService.js
import { apiRequest } from './apiClient';

// Lấy danh sách giao dịch từ Backend
export const getTransactionsFromBackend = async () => {
    return await apiRequest('/transactions');
};

// Lưu giao dịch mới lên Backend
export const createTransactionOnBackend = async (transactionData) => {
    return await apiRequest('/transactions', {
        method: 'POST',
        body: JSON.stringify({
            title: transactionData.title,
            amount: transactionData.amount,
            categoryName: transactionData.category, // Backend nhận categoryName để xử lý
            walletId: 1 // Tạm thời set 1 cho ví mặc định
        }),
    });
};
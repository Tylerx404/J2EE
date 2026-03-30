import { apiRequest } from '../../services/apiClient';

export const getTransactionsFromApi = async () => apiRequest('/transactions');

export const getTransactionsByWalletFromApi = async (walletId) => apiRequest(`/transactions/wallet/${walletId}`);

export const createTransactionOnApi = async (transactionData) => apiRequest('/transactions', {
    method: 'POST',
    body: JSON.stringify(transactionData),
});

export const deleteTransactionOnApi = async (transactionId) => apiRequest(`/transactions/${transactionId}`, {
    method: 'DELETE',
});

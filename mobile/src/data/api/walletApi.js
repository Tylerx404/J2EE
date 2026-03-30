import { apiRequest } from '../../services/apiClient';

export const getWalletsFromApi = async () => apiRequest('/wallets');

export const getWalletByIdFromApi = async (id) => apiRequest(`/wallets/${id}`);

export const createWalletOnApi = async ({ name, currency, initialBalance }) => apiRequest('/wallets', {
    method: 'POST',
    body: JSON.stringify({ name, currency, initialBalance }),
});

export const deleteWalletOnApi = async (id) => apiRequest(`/wallets/${id}`, {
    method: 'DELETE',
});

import { apiRequest } from './apiClient';

export const getWalletsFromBackend = async () => {
  return await apiRequest('/wallets');
};

export const getWalletByIdFromBackend = async (id) => {
  return await apiRequest(`/wallets/${id}`);
};

export const createWalletOnBackend = async ({ name, currency, initialBalance }) => {
  return await apiRequest('/wallets', {
    method: 'POST',
    body: JSON.stringify({ name, currency, initialBalance }),
  });
};

export const deleteWalletOnBackend = async (id) => {
  return await apiRequest(`/wallets/${id}`, {
    method: 'DELETE',
  });
};

import { apiRequest } from './apiClient';

export const getUserProfileFromBackend = async () => {
  return await apiRequest('/user/profile');
};

export const updateUserProfileOnBackend = async (payload) => {
  return await apiRequest('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const changePasswordOnBackend = async ({ oldPassword, newPassword }) => {
  return await apiRequest('/user/change-password', {
    method: 'POST',
    body: JSON.stringify({ oldPassword, newPassword }),
  });
};

export const deleteAccountOnBackend = async (password) => {
  return await apiRequest('/user/account', {
    method: 'DELETE',
    body: JSON.stringify({ password }),
  });
};

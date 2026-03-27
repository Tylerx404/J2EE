import { apiRequest } from './apiClient';

export const getCategoriesFromBackend = async (type) => {
  const query = type ? `?type=${encodeURIComponent(type)}` : '';
  return await apiRequest(`/categories${query}`);
};

export const getCategoryByIdFromBackend = async (id) => {
  return await apiRequest(`/categories/${id}`);
};

export const createCategoryOnBackend = async ({ name, type, icon }) => {
  return await apiRequest('/categories', {
    method: 'POST',
    body: JSON.stringify({ name, type, icon }),
  });
};

export const deleteCategoryOnBackend = async (id) => {
  return await apiRequest(`/categories/${id}`, {
    method: 'DELETE',
  });
};

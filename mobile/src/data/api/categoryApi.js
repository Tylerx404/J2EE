import { apiRequest } from '../../services/apiClient';

export const getCategoriesFromApi = async (type) => {
    const query = type ? `?type=${encodeURIComponent(type)}` : '';
    return apiRequest(`/categories${query}`);
};

export const getCategoryByIdFromApi = async (id) => apiRequest(`/categories/${id}`);

export const createCategoryOnApi = async ({ name, type, icon }) => apiRequest('/categories', {
    method: 'POST',
    body: JSON.stringify({ name, type, icon }),
});

export const deleteCategoryOnApi = async (id) => apiRequest(`/categories/${id}`, {
    method: 'DELETE',
});

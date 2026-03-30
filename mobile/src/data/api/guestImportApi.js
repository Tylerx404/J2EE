import { apiRequest } from '../../services/apiClient';

export const importGuestDataOnApi = async (payload) => apiRequest('/guest-import', {
    method: 'POST',
    body: JSON.stringify(payload),
});

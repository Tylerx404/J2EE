import { apiRequest } from '../../services/apiClient';

const buildQueryString = (params) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        query.append(key, String(value));
    });
    const text = query.toString();
    return text ? `?${text}` : '';
};

export const getCurrentMonthReportFromApi = async ({ walletId, type } = {}) => {
    const query = buildQueryString({ walletId, type });
    return apiRequest(`/reports/current-month${query}`);
};

export const getMonthlyReportFromApi = async ({ period, walletId, type }) => {
    const query = buildQueryString({ period, walletId, type });
    return apiRequest(`/reports/monthly${query}`);
};

export const getFilteredTransactionsFromApi = async ({
    startDate,
    endDate,
    walletId,
    type,
}) => {
    const query = buildQueryString({ startDate, endDate, walletId, type });
    return apiRequest(`/reports/transactions${query}`);
};

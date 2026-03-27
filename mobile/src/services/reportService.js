import { apiRequest } from './apiClient';

const buildQueryString = (params) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.append(key, String(value));
  });
  const text = query.toString();
  return text ? `?${text}` : '';
};

export const getCurrentMonthReportFromBackend = async ({ walletId, type } = {}) => {
  const query = buildQueryString({ walletId, type });
  return await apiRequest(`/reports/current-month${query}`);
};

export const getMonthlyReportFromBackend = async ({ period, walletId, type }) => {
  const query = buildQueryString({ period, walletId, type });
  return await apiRequest(`/reports/monthly${query}`);
};

export const getFilteredTransactionsFromBackend = async ({
  startDate,
  endDate,
  walletId,
  type,
}) => {
  const query = buildQueryString({ startDate, endDate, walletId, type });
  return await apiRequest(`/reports/transactions${query}`);
};

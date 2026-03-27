import {
  getCurrentMonthReportFromApi,
  getFilteredTransactionsFromApi,
  getMonthlyReportFromApi,
} from '../data/api/reportApi';
import {
  getCurrentMonthReportLocal,
  getFilteredTransactionsLocal,
  getMonthlyReportLocal,
} from '../data/guest/reportRepo';
import { getSessionMode, SESSION_MODES } from './sessionService';

const useGuestReports = async () => (await getSessionMode()) === SESSION_MODES.GUEST;

export const getCurrentMonthReport = async ({ walletId, type } = {}) => (
  await useGuestReports()
    ? getCurrentMonthReportLocal({ walletId, type })
    : getCurrentMonthReportFromApi({ walletId, type })
);

export const getMonthlyReport = async ({ period, walletId, type }) => (
  await useGuestReports()
    ? getMonthlyReportLocal({ period, walletId, type })
    : getMonthlyReportFromApi({ period, walletId, type })
);

export const getFilteredTransactions = async ({
  startDate,
  endDate,
  walletId,
  type,
}) => (
  await useGuestReports()
    ? getFilteredTransactionsLocal({ startDate, endDate, walletId, type })
    : getFilteredTransactionsFromApi({ startDate, endDate, walletId, type })
);

export const getCurrentMonthReportFromBackend = getCurrentMonthReport;
export const getMonthlyReportFromBackend = getMonthlyReport;
export const getFilteredTransactionsFromBackend = getFilteredTransactions;

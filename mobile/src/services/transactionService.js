import {
    createTransactionOnApi,
    deleteTransactionOnApi,
    getTransactionsByWalletFromApi,
    getTransactionsFromApi,
} from '../data/api/transactionApi';
import {
    createTransactionLocal,
    deleteTransactionLocal,
    listTransactionsByWalletLocal,
    listTransactionsLocal,
} from '../data/guest/transactionRepo';
import { getSessionMode, SESSION_MODES } from './sessionService';

const useGuestTransactions = async () => (await getSessionMode()) === SESSION_MODES.GUEST;

export const getTransactions = async () => (
    await useGuestTransactions() ? listTransactionsLocal() : getTransactionsFromApi()
);

export const getTransactionsByWallet = async (walletId) => (
    await useGuestTransactions()
        ? listTransactionsByWalletLocal(walletId)
        : getTransactionsByWalletFromApi(walletId)
);

export const createTransaction = async (transactionData) => (
    await useGuestTransactions()
        ? createTransactionLocal(transactionData)
        : createTransactionOnApi(transactionData)
);

export const deleteTransaction = async (transactionId) => (
    await useGuestTransactions()
        ? deleteTransactionLocal(transactionId)
        : deleteTransactionOnApi(transactionId)
);

export const getTransactionsFromBackend = getTransactions;
export const createTransactionOnBackend = createTransaction;
export const deleteTransactionOnBackend = deleteTransaction;

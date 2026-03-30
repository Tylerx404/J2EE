import {
  createWalletOnApi,
  deleteWalletOnApi,
  getWalletByIdFromApi,
  getWalletsFromApi,
} from '../data/api/walletApi';
import {
  createWalletLocal,
  deleteWalletLocal,
  getWalletByIdLocal,
  listWalletsLocal,
} from '../data/guest/walletRepo';
import { getSessionMode, SESSION_MODES } from './sessionService';

const useGuestWallets = async () => (await getSessionMode()) === SESSION_MODES.GUEST;

export const getWallets = async () => (await useGuestWallets() ? listWalletsLocal() : getWalletsFromApi());

export const getWalletById = async (id) => (await useGuestWallets() ? getWalletByIdLocal(id) : getWalletByIdFromApi(id));

export const createWallet = async ({ name, currency, initialBalance }) => (
  await useGuestWallets()
    ? createWalletLocal({ name, currency, initialBalance })
    : createWalletOnApi({ name, currency, initialBalance })
);

export const deleteWallet = async (id) => (await useGuestWallets() ? deleteWalletLocal(id) : deleteWalletOnApi(id));

export const getWalletsFromBackend = getWallets;
export const getWalletByIdFromBackend = getWalletById;
export const createWalletOnBackend = createWallet;
export const deleteWalletOnBackend = deleteWallet;

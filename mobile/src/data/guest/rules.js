import { addMoney, subtractMoney } from './money';

export const DEFAULT_WALLET = {
    name: 'Vi chinh',
    currency: 'VND',
    initialBalance: '0',
    balance: '0',
};

export const applyTransactionBalanceChange = (walletBalance, amount, type) => {
    if (type === 'INCOME') {
        return addMoney(walletBalance, amount);
    }

    if (type === 'EXPENSE') {
        return subtractMoney(walletBalance, amount);
    }

    throw new Error('Loai giao dich khong hop le.');
};

export const rollbackTransactionBalanceChange = (walletBalance, amount, type) => {
    if (type === 'INCOME') {
        return subtractMoney(walletBalance, amount);
    }

    if (type === 'EXPENSE') {
        return addMoney(walletBalance, amount);
    }

    throw new Error('Loai giao dich khong hop le.');
};

export const assertWalletDeletionAllowed = (transactionCount) => {
    if (transactionCount > 0) {
        throw new Error('Khong the xoa vi co giao dich.');
    }
};

export const assertCategoryDeletionAllowed = (category) => {
    if (category?.isDefault) {
        throw new Error('Khong the xoa category mac dinh.');
    }
};

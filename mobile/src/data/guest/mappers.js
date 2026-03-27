import { moneyToNumber } from './money';

export const mapWalletRowToResponse = (row) => ({
    id: row.local_id,
    name: row.name,
    initialBalance: moneyToNumber(row.initial_balance),
    balance: moneyToNumber(row.balance),
    currency: row.currency,
    createdAt: row.created_at,
    userId: null,
    isDefault: Boolean(row.is_default),
});

export const mapCategoryRowToResponse = (row) => ({
    id: row.local_id,
    name: row.name,
    type: row.type,
    icon: row.icon,
    isDefault: Boolean(row.is_default),
    userId: null,
});

export const mapTransactionRowToResponse = (row) => ({
    id: row.local_id,
    walletId: row.wallet_local_id,
    walletName: row.wallet_name,
    amount: moneyToNumber(row.amount),
    type: row.type,
    categoryId: row.category_local_id,
    categoryName: row.category_name,
    note: row.note,
    transactionDate: row.transaction_date,
    createdAt: row.created_at,
});

export const mapCategoryStatistic = (row) => ({
    categoryName: row.category_name || 'Khac',
    total: moneyToNumber(row.total_amount),
    count: row.entry_count ?? 0,
});

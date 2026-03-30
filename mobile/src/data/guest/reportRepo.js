import { buildPeriod, endOfMonthIso, getYearMonthParts, startOfMonthIso } from './date';
import { initGuestDb } from './guestDb';
import { addMoney, moneyToNumber, subtractMoney } from './money';
import { mapCategoryStatistic, mapTransactionRowToResponse } from './mappers';

const FILTERED_TRANSACTION_SELECT = `
SELECT
    t.local_id,
    t.wallet_local_id,
    w.name AS wallet_name,
    t.amount,
    t.type,
    t.category_local_id,
    c.name AS category_name,
    t.note,
    t.transaction_date,
    t.created_at
FROM transactions t
INNER JOIN wallets w ON w.local_id = t.wallet_local_id
LEFT JOIN categories c ON c.local_id = t.category_local_id
WHERE t.transaction_date BETWEEN ? AND ?
`;

const appendOptionalFilters = ({ walletId, type }) => {
    let whereClause = '';
    const params = [];

    if (walletId) {
        whereClause += ' AND t.wallet_local_id = ?';
        params.push(walletId);
    }

    if (type) {
        whereClause += ' AND t.type = ?';
        params.push(type);
    }

    return { whereClause, params };
};

export const getFilteredTransactionsLocal = async ({
    startDate,
    endDate,
    walletId,
    type,
}) => {
    const db = await initGuestDb();
    const optional = appendOptionalFilters({ walletId, type });
    const rows = await db.getAllAsync(
        `${FILTERED_TRANSACTION_SELECT}${optional.whereClause} ORDER BY t.transaction_date DESC, t.created_at DESC`,
        startDate,
        endDate,
        ...optional.params
    );
    return rows.map(mapTransactionRowToResponse);
};

const getBalanceSnapshot = async (walletId) => {
    const db = await initGuestDb();
    if (walletId) {
        const wallet = await db.getFirstAsync('SELECT balance FROM wallets WHERE local_id = ?', walletId);
        return wallet?.balance ?? '0';
    }

    const wallets = await db.getAllAsync('SELECT balance FROM wallets');
    return wallets.reduce((sum, wallet) => addMoney(sum, wallet.balance), '0');
};

const sumTransactionAmounts = (transactions, targetType) => transactions.reduce((sum, tx) => {
    if (tx.type !== targetType) return sum;
    return addMoney(sum, tx.amount);
}, '0');

const groupByCategory = (transactions, targetType) => {
    const buckets = new Map();

    transactions.forEach((transaction) => {
        if (targetType && transaction.type !== targetType) return;
        const key = transaction.categoryName || 'Khac';
        const current = buckets.get(key) || { category_name: key, total_amount: '0', entry_count: 0 };
        current.total_amount = addMoney(current.total_amount, transaction.amount);
        current.entry_count += 1;
        buckets.set(key, current);
    });

    return Array.from(buckets.values())
        .sort((left, right) => moneyToNumber(right.total_amount) - moneyToNumber(left.total_amount))
        .map(mapCategoryStatistic);
};

export const getMonthlyReportLocal = async ({ period, walletId, type }) => {
    const [yearText, monthText] = period.split('-');
    const year = Number(yearText);
    const month = Number(monthText);
    const startDate = startOfMonthIso(year, month);
    const endDate = endOfMonthIso(year, month);
    const previousMonthDate = new Date(Date.UTC(year, month - 2, 1, 0, 0, 0));
    const previousParts = getYearMonthParts(previousMonthDate);

    const transactions = await getFilteredTransactionsLocal({ startDate, endDate, walletId, type });
    const previousTransactions = await getFilteredTransactionsLocal({
        startDate: startOfMonthIso(previousParts.year, previousParts.month),
        endDate: endOfMonthIso(previousParts.year, previousParts.month),
        walletId,
        type,
    });

    const totalIncome = sumTransactionAmounts(transactions, 'INCOME');
    const totalExpense = sumTransactionAmounts(transactions, 'EXPENSE');
    const previousMonthIncome = sumTransactionAmounts(previousTransactions, 'INCOME');
    const previousMonthExpense = sumTransactionAmounts(previousTransactions, 'EXPENSE');
    const balance = await getBalanceSnapshot(walletId);

    return {
        month,
        year,
        totalIncome: moneyToNumber(totalIncome),
        totalExpense: moneyToNumber(totalExpense),
        balance: moneyToNumber(balance),
        previousMonthIncome: moneyToNumber(previousMonthIncome),
        previousMonthExpense: moneyToNumber(previousMonthExpense),
        incomeChange: moneyToNumber(subtractMoney(totalIncome, previousMonthIncome)),
        expenseChange: moneyToNumber(subtractMoney(totalExpense, previousMonthExpense)),
        topExpenseCategories: groupByCategory(transactions, 'EXPENSE').slice(0, 5),
        topIncomeCategories: groupByCategory(transactions, 'INCOME').slice(0, 5),
        expenseByCategoryChart: groupByCategory(transactions, 'EXPENSE'),
        incomeByCategoryChart: groupByCategory(transactions, 'INCOME'),
        aiAdvice: null,
    };
};

export const getCurrentMonthReportLocal = async ({ walletId, type } = {}) => {
    const parts = getYearMonthParts();
    return getMonthlyReportLocal({
        period: buildPeriod(parts.year, parts.month),
        walletId,
        type,
    });
};

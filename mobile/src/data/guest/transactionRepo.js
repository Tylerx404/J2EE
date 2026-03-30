import { initGuestDb, runInDbTransaction } from './guestDb';
import { createLocalId } from './id';
import { nowIso } from './date';
import { mapTransactionRowToResponse } from './mappers';
import { applyTransactionBalanceChange, rollbackTransactionBalanceChange } from './rules';

const TRANSACTION_SELECT = `
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
`;

export const listTransactionsLocal = async () => {
    const db = await initGuestDb();
    const rows = await db.getAllAsync(`${TRANSACTION_SELECT} ORDER BY t.transaction_date DESC, t.created_at DESC`);
    return rows.map(mapTransactionRowToResponse);
};

export const listTransactionsByWalletLocal = async (walletId) => {
    const db = await initGuestDb();
    const rows = await db.getAllAsync(
        `${TRANSACTION_SELECT} WHERE t.wallet_local_id = ? ORDER BY t.transaction_date DESC, t.created_at DESC`,
        walletId
    );
    return rows.map(mapTransactionRowToResponse);
};

export const getTransactionByIdLocal = async (id) => {
    const db = await initGuestDb();
    const row = await db.getFirstAsync(`${TRANSACTION_SELECT} WHERE t.local_id = ?`, id);
    if (!row) {
        throw new Error('Transaction khong ton tai.');
    }
    return mapTransactionRowToResponse(row);
};

export const createTransactionLocal = async ({
    walletId,
    categoryId,
    amount,
    type,
    note,
    transactionDate,
    origin = 'manual',
    voiceText = null,
}) => {
    const localId = createLocalId('tx');
    const timestamp = nowIso();
    const storedAmount = String(amount);

    await runInDbTransaction(async (db) => {
        const wallet = await db.getFirstAsync('SELECT local_id, balance FROM wallets WHERE local_id = ?', walletId);
        if (!wallet) {
            throw new Error('Wallet khong ton tai.');
        }

        if (categoryId) {
            const category = await db.getFirstAsync('SELECT local_id FROM categories WHERE local_id = ?', categoryId);
            if (!category) {
                throw new Error('Category khong ton tai.');
            }
        }

        const nextBalance = applyTransactionBalanceChange(wallet.balance, storedAmount, type);

        await db.runAsync(
            `
            INSERT INTO transactions (
                local_id,
                wallet_local_id,
                category_local_id,
                amount,
                type,
                note,
                transaction_date,
                origin,
                voice_text,
                created_at,
                updated_at,
                migration_state,
                imported_server_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'LOCAL_ONLY', NULL)
            `,
            localId,
            walletId,
            categoryId ?? null,
            storedAmount,
            type,
            note ?? '',
            transactionDate ?? timestamp,
            origin,
            voiceText,
            timestamp,
            timestamp
        );

        await db.runAsync(
            'UPDATE wallets SET balance = ?, updated_at = ? WHERE local_id = ?',
            nextBalance,
            timestamp,
            walletId
        );
    });

    return getTransactionByIdLocal(localId);
};

export const deleteTransactionLocal = async (id) => {
    await runInDbTransaction(async (db) => {
        const transaction = await db.getFirstAsync(
            'SELECT local_id, wallet_local_id, amount, type FROM transactions WHERE local_id = ?',
            id
        );
        if (!transaction) {
            throw new Error('Transaction khong ton tai.');
        }

        const wallet = await db.getFirstAsync('SELECT local_id, balance FROM wallets WHERE local_id = ?', transaction.wallet_local_id);
        if (!wallet) {
            throw new Error('Wallet khong ton tai.');
        }

        const nextBalance = rollbackTransactionBalanceChange(wallet.balance, transaction.amount, transaction.type);

        await db.runAsync('DELETE FROM transactions WHERE local_id = ?', id);
        await db.runAsync(
            'UPDATE wallets SET balance = ?, updated_at = ? WHERE local_id = ?',
            nextBalance,
            nowIso(),
            wallet.local_id
        );
    });
};

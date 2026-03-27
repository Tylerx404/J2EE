import { initGuestDb, runInDbTransaction } from './guestDb';
import { createLocalId } from './id';
import { nowIso } from './date';
import { mapWalletRowToResponse } from './mappers';
import { assertWalletDeletionAllowed } from './rules';

const WALLET_SELECT = `
SELECT
    local_id,
    name,
    currency,
    initial_balance,
    balance,
    is_default,
    created_at,
    updated_at
FROM wallets
`;

export const listWalletsLocal = async () => {
    const db = await initGuestDb();
    const rows = await db.getAllAsync(`${WALLET_SELECT} ORDER BY is_default DESC, created_at ASC`);
    return rows.map(mapWalletRowToResponse);
};

export const getWalletByIdLocal = async (id) => {
    const db = await initGuestDb();
    const row = await db.getFirstAsync(`${WALLET_SELECT} WHERE local_id = ?`, id);
    if (!row) {
        throw new Error('Wallet khong ton tai.');
    }
    return mapWalletRowToResponse(row);
};

export const createWalletLocal = async ({ name, currency, initialBalance }) => {
    const localId = createLocalId('wallet');
    const timestamp = nowIso();
    const balance = String(initialBalance ?? 0);

    await runInDbTransaction(async (db) => {
        await db.runAsync(
            `
            INSERT INTO wallets (
                local_id,
                name,
                currency,
                initial_balance,
                balance,
                is_default,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, 0, ?, ?)
            `,
            localId,
            name,
            currency,
            balance,
            balance,
            timestamp,
            timestamp
        );
    });

    return getWalletByIdLocal(localId);
};

export const deleteWalletLocal = async (id) => {
    await runInDbTransaction(async (db) => {
        const transactionCount = await db.getFirstAsync(
            'SELECT COUNT(*) as count FROM transactions WHERE wallet_local_id = ?',
            id
        );
        assertWalletDeletionAllowed(Number(transactionCount?.count ?? 0));
        await db.runAsync('DELETE FROM wallets WHERE local_id = ?', id);
    });
};

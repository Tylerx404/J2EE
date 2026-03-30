import { DEFAULT_CATEGORIES } from './defaultCategories';
import { createLocalId } from './id';
import { nowIso } from './date';
import { initGuestDb, runInDbTransaction } from './guestDb';
import { DEFAULT_WALLET } from './rules';

const META_KEYS = {
    SEEDED_AT: 'seeded_at',
    SCHEMA_VERSION: 'schema_version',
};

export const getMetaValue = async (key) => {
    const db = await initGuestDb();
    const record = await db.getFirstAsync('SELECT value FROM app_meta WHERE key = ?', key);
    return record?.value ?? null;
};

const setMetaValue = async (db, key, value) => {
    const timestamp = nowIso();
    await db.runAsync(
        `
        INSERT INTO app_meta (key, value, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
        `,
        key,
        value,
        timestamp
    );
};

export const seedGuestDataIfNeeded = async () => {
    const seededAt = await getMetaValue(META_KEYS.SEEDED_AT);
    if (seededAt) {
        return false;
    }

    await runInDbTransaction(async (db) => {
        const timestamp = nowIso();

        await db.runAsync(
            `
            INSERT OR IGNORE INTO guest_profile (id, created_at, updated_at)
            VALUES (1, ?, ?)
            `,
            timestamp,
            timestamp
        );

        await db.runAsync(
            `
            INSERT OR IGNORE INTO wallets (
                local_id,
                name,
                currency,
                initial_balance,
                balance,
                is_default,
                created_at,
                updated_at,
                migration_state,
                imported_server_id
            ) VALUES (?, ?, ?, ?, ?, 1, ?, ?, 'LOCAL_ONLY', NULL)
            `,
            createLocalId('wallet'),
            DEFAULT_WALLET.name,
            DEFAULT_WALLET.currency,
            DEFAULT_WALLET.initialBalance,
            DEFAULT_WALLET.balance,
            timestamp,
            timestamp
        );

        for (const category of DEFAULT_CATEGORIES) {
            await db.runAsync(
                `
                INSERT OR IGNORE INTO categories (
                    local_id,
                    name,
                    type,
                    icon,
                    is_default,
                    created_at,
                    updated_at,
                    migration_state,
                    imported_server_id
                ) VALUES (?, ?, ?, ?, 1, ?, ?, 'LOCAL_ONLY', NULL)
                `,
                createLocalId('category'),
                category.name,
                category.type,
                category.icon,
                timestamp,
                timestamp
            );
        }

        await setMetaValue(db, META_KEYS.SEEDED_AT, timestamp);
        await setMetaValue(db, META_KEYS.SCHEMA_VERSION, '3');
    });

    return true;
};

export const hasGuestDataToImport = async () => {
    const db = await initGuestDb();
    const [walletCount, categoryCount, transactionCount] = await Promise.all([
        db.getFirstAsync(
            "SELECT COUNT(*) as count FROM wallets WHERE is_default = 0 AND migration_state = 'LOCAL_ONLY'"
        ),
        db.getFirstAsync(
            "SELECT COUNT(*) as count FROM categories WHERE is_default = 0 AND migration_state = 'LOCAL_ONLY'"
        ),
        db.getFirstAsync(
            "SELECT COUNT(*) as count FROM transactions WHERE migration_state = 'LOCAL_ONLY'"
        ),
    ]);

    return Number(walletCount?.count ?? 0) > 0
        || Number(categoryCount?.count ?? 0) > 0
        || Number(transactionCount?.count ?? 0) > 0;
};

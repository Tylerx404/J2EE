import { openDatabaseAsync } from 'expo-sqlite';
import { nowIso } from './date';
import { applyTransactionBalanceChange } from './rules';

const DATABASE_NAME = 'guest_finance.db';
const DATABASE_VERSION = 3;

let dbPromise;

const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS guest_profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS wallets (
    local_id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    currency TEXT NOT NULL,
    initial_balance TEXT NOT NULL,
    balance TEXT NOT NULL,
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    migration_state TEXT NOT NULL DEFAULT 'LOCAL_ONLY',
    imported_server_id TEXT
);

CREATE TABLE IF NOT EXISTS categories (
    local_id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    icon TEXT,
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    migration_state TEXT NOT NULL DEFAULT 'LOCAL_ONLY',
    imported_server_id TEXT
);

CREATE TABLE IF NOT EXISTS transactions (
    local_id TEXT PRIMARY KEY NOT NULL,
    wallet_local_id TEXT NOT NULL,
    category_local_id TEXT,
    amount TEXT NOT NULL,
    type TEXT NOT NULL,
    note TEXT,
    transaction_date TEXT NOT NULL,
    origin TEXT NOT NULL,
    voice_text TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    migration_state TEXT NOT NULL DEFAULT 'LOCAL_ONLY',
    imported_server_id TEXT,
    FOREIGN KEY (wallet_local_id) REFERENCES wallets(local_id) ON DELETE RESTRICT,
    FOREIGN KEY (category_local_id) REFERENCES categories(local_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_wallet_date
ON transactions(wallet_local_id, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_category
ON transactions(category_local_id);
`;

const columnExists = async (db, tableName, columnName) => {
    const rows = await db.getAllAsync(`PRAGMA table_info(${tableName})`);
    return rows.some((row) => row.name === columnName);
};

const ensureColumn = async (db, tableName, columnName, definitionSql) => {
    const exists = await columnExists(db, tableName, columnName);
    if (!exists) {
        await db.execAsync(`ALTER TABLE ${tableName} ADD COLUMN ${definitionSql};`);
    }
};

const rebuildWalletBalances = async (db) => {
    const wallets = await db.getAllAsync('SELECT local_id, initial_balance FROM wallets');
    const transactions = await db.getAllAsync(
        `
        SELECT wallet_local_id, amount, type
        FROM transactions
        ORDER BY transaction_date ASC, created_at ASC
        `
    );

    const nextBalances = new Map(
        wallets.map((wallet) => [wallet.local_id, String(wallet.initial_balance ?? '0')])
    );

    transactions.forEach((transaction) => {
        const currentBalance = nextBalances.get(transaction.wallet_local_id);
        if (currentBalance === undefined) {
            return;
        }

        nextBalances.set(
            transaction.wallet_local_id,
            applyTransactionBalanceChange(currentBalance, transaction.amount, transaction.type)
        );
    });

    const timestamp = nowIso();
    await db.withTransactionAsync(async () => {
        for (const wallet of wallets) {
            await db.runAsync(
                'UPDATE wallets SET balance = ?, updated_at = ? WHERE local_id = ?',
                nextBalances.get(wallet.local_id) ?? String(wallet.initial_balance ?? '0'),
                timestamp,
                wallet.local_id
            );
        }
    });
};

const applyImportStateMigration = async (db) => {
    await ensureColumn(db, 'wallets', 'migration_state', "migration_state TEXT NOT NULL DEFAULT 'LOCAL_ONLY'");
    await ensureColumn(db, 'wallets', 'imported_server_id', 'imported_server_id TEXT');
    await ensureColumn(db, 'categories', 'migration_state', "migration_state TEXT NOT NULL DEFAULT 'LOCAL_ONLY'");
    await ensureColumn(db, 'categories', 'imported_server_id', 'imported_server_id TEXT');
    await ensureColumn(db, 'transactions', 'imported_server_id', 'imported_server_id TEXT');
};

export const getGuestDb = async () => {
    if (!dbPromise) {
        dbPromise = openDatabaseAsync(DATABASE_NAME);
    }

    return dbPromise;
};

export const migrateGuestDb = async (db) => {
    await db.execAsync('PRAGMA foreign_keys = ON;');
    const result = await db.getFirstAsync('PRAGMA user_version;');
    const currentVersion = result?.user_version ?? 0;

    await db.execAsync(SCHEMA_SQL);

    if (currentVersion < 2) {
        await rebuildWalletBalances(db);
    }

    if (currentVersion < 3) {
        await applyImportStateMigration(db);
    }

    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION};`);
    return db;
};

export const initGuestDb = async () => {
    const db = await getGuestDb();
    await migrateGuestDb(db);
    return db;
};

export const runInDbTransaction = async (task) => {
    const db = await initGuestDb();
    await db.withTransactionAsync(async () => {
        await task(db);
    });
    return db;
};

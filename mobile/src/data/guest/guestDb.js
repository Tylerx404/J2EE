import { openDatabaseAsync } from 'expo-sqlite';

const DATABASE_NAME = 'guest_finance.db';
const DATABASE_VERSION = 1;

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
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
    local_id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    icon TEXT,
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
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
    FOREIGN KEY (wallet_local_id) REFERENCES wallets(local_id) ON DELETE RESTRICT,
    FOREIGN KEY (category_local_id) REFERENCES categories(local_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_wallet_date
ON transactions(wallet_local_id, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_category
ON transactions(category_local_id);
`;

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

    if (currentVersion >= DATABASE_VERSION) {
        return db;
    }

    await db.execAsync(SCHEMA_SQL);
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

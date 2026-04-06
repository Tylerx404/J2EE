import AsyncStorage from '@react-native-async-storage/async-storage';
import { importGuestDataOnApi } from '../api/guestImportApi';
import { initGuestDb, runInDbTransaction } from './guestDb';

export const GUEST_IMPORT_PENDING_KEY = 'guest_import_pending';
export const GUEST_IMPORT_SUMMARY_KEY = 'guest_import_summary';

const LOCAL_ONLY = 'LOCAL_ONLY';
const IMPORTED = 'IMPORTED';

const buildInClause = (ids) => ids.map(() => '?').join(', ');

const uniqueIds = (values) => Array.from(new Set(values.filter(Boolean)));

const summarizePayload = (payload) => ({
    walletCount: payload.wallets.length,
    categoryCount: payload.categories.length,
    transactionCount: payload.transactions.length,
});

const getRowsByIds = async (db, tableName, ids) => {
    if (ids.length === 0) {
        return [];
    }

    return db.getAllAsync(
        `SELECT * FROM ${tableName} WHERE local_id IN (${buildInClause(ids)})`,
        ...ids
    );
};

const getGuestFinanceSnapshot = async () => {
    const db = await initGuestDb();
    const [
        localOnlyWalletCount,
        localOnlyCategoryCount,
        localOnlyTransactionCount,
        totalTransactionCount,
        customWalletCount,
        customCategoryCount,
    ] = await Promise.all([
        db.getFirstAsync(
            `SELECT COUNT(*) AS count FROM wallets WHERE is_default = 0 AND migration_state = ?`,
            LOCAL_ONLY
        ),
        db.getFirstAsync(
            `SELECT COUNT(*) AS count FROM categories WHERE is_default = 0 AND migration_state = ?`,
            LOCAL_ONLY
        ),
        db.getFirstAsync(
            `SELECT COUNT(*) AS count FROM transactions WHERE migration_state = ?`,
            LOCAL_ONLY
        ),
        db.getFirstAsync('SELECT COUNT(*) AS count FROM transactions'),
        db.getFirstAsync('SELECT COUNT(*) AS count FROM wallets WHERE is_default = 0'),
        db.getFirstAsync('SELECT COUNT(*) AS count FROM categories WHERE is_default = 0'),
    ]);

    return {
        localOnlyWalletCount: Number(localOnlyWalletCount?.count ?? 0),
        localOnlyCategoryCount: Number(localOnlyCategoryCount?.count ?? 0),
        localOnlyTransactionCount: Number(localOnlyTransactionCount?.count ?? 0),
        totalTransactionCount: Number(totalTransactionCount?.count ?? 0),
        customWalletCount: Number(customWalletCount?.count ?? 0),
        customCategoryCount: Number(customCategoryCount?.count ?? 0),
    };
};

export const hasPendingGuestImport = async () => {
    const snapshot = await getGuestFinanceSnapshot();

    if (snapshot.localOnlyWalletCount > 0
        || snapshot.localOnlyCategoryCount > 0
        || snapshot.localOnlyTransactionCount > 0) {
        return true;
    }

    // Fallback thuc te hon: neu guest da co du lieu tai chinh local dang ke,
    // van hien prompt import de nguoi dung khong bo lo du lieu sau khi dang nhap.
    return snapshot.totalTransactionCount > 0
        || snapshot.customWalletCount > 0
        || snapshot.customCategoryCount > 0;
};

export const buildGuestImportPayload = async () => {
    const db = await initGuestDb();
    const transactions = await db.getAllAsync(
        `SELECT * FROM transactions WHERE migration_state = ? ORDER BY transaction_date ASC, created_at ASC`,
        LOCAL_ONLY
    );

    const walletIdsFromTransactions = uniqueIds(transactions.map((transaction) => transaction.wallet_local_id));
    const categoryIdsFromTransactions = uniqueIds(transactions.map((transaction) => transaction.category_local_id));

    const [localOnlyWallets, referencedWallets, localOnlyCategories, referencedCategories] = await Promise.all([
        db.getAllAsync(`SELECT * FROM wallets WHERE migration_state = ? ORDER BY is_default DESC, created_at ASC`, LOCAL_ONLY),
        getRowsByIds(db, 'wallets', walletIdsFromTransactions),
        db.getAllAsync(`SELECT * FROM categories WHERE migration_state = ? ORDER BY is_default DESC, name ASC`, LOCAL_ONLY),
        getRowsByIds(db, 'categories', categoryIdsFromTransactions),
    ]);

    const wallets = uniqueIds(
        [...localOnlyWallets, ...referencedWallets].map((wallet) => wallet.local_id)
    ).map((id) => [...localOnlyWallets, ...referencedWallets].find((wallet) => wallet.local_id === id));

    const categories = uniqueIds(
        [...localOnlyCategories, ...referencedCategories].map((category) => category.local_id)
    ).map((id) => [...localOnlyCategories, ...referencedCategories].find((category) => category.local_id === id));

    return {
        wallets: wallets.map((wallet) => ({
            localId: wallet.local_id,
            name: wallet.name,
            currency: wallet.currency,
            initialBalance: wallet.initial_balance,
            balance: wallet.balance,
            isDefault: Boolean(wallet.is_default),
            createdAt: wallet.created_at,
            updatedAt: wallet.updated_at,
        })),
        categories: categories.map((category) => ({
            localId: category.local_id,
            name: category.name,
            type: category.type,
            icon: category.icon,
            isDefault: Boolean(category.is_default),
            createdAt: category.created_at,
            updatedAt: category.updated_at,
        })),
        transactions: transactions.map((transaction) => ({
            localId: transaction.local_id,
            walletLocalId: transaction.wallet_local_id,
            categoryLocalId: transaction.category_local_id,
            amount: transaction.amount,
            type: transaction.type,
            note: transaction.note,
            transactionDate: transaction.transaction_date,
            origin: transaction.origin,
            voiceText: transaction.voice_text,
            createdAt: transaction.created_at,
            updatedAt: transaction.updated_at,
        })),
    };
};

export const markGuestImportPending = async (payload) => {
    const summary = {
        ...summarizePayload(payload),
        preparedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(GUEST_IMPORT_PENDING_KEY, 'pending');
    await AsyncStorage.setItem(GUEST_IMPORT_SUMMARY_KEY, JSON.stringify(summary));
    return summary;
};

export const markGuestRowsImported = async (importResponse) => {
    const walletMap = importResponse?.walletMap || {};
    const categoryMap = importResponse?.categoryMap || {};
    const transactionMap = importResponse?.transactionMap || {};
    const timestamp = new Date().toISOString();

    await runInDbTransaction(async (db) => {
        for (const [localId, serverId] of Object.entries(walletMap)) {
            await db.runAsync(
                'UPDATE wallets SET migration_state = ?, imported_server_id = ?, updated_at = ? WHERE local_id = ?',
                IMPORTED,
                String(serverId),
                timestamp,
                localId
            );
        }

        for (const [localId, serverId] of Object.entries(categoryMap)) {
            await db.runAsync(
                'UPDATE categories SET migration_state = ?, imported_server_id = ?, updated_at = ? WHERE local_id = ?',
                IMPORTED,
                String(serverId),
                timestamp,
                localId
            );
        }

        for (const [localId, serverId] of Object.entries(transactionMap)) {
            await db.runAsync(
                'UPDATE transactions SET migration_state = ?, imported_server_id = ?, updated_at = ? WHERE local_id = ?',
                IMPORTED,
                String(serverId),
                timestamp,
                localId
            );
        }
    });

    const summary = {
        ...(await getGuestImportSummary()),
        importedAt: timestamp,
        importedCounts: importResponse?.importedCounts || null,
    };

    await AsyncStorage.setItem(GUEST_IMPORT_PENDING_KEY, 'imported');
    await AsyncStorage.setItem(GUEST_IMPORT_SUMMARY_KEY, JSON.stringify(summary));
    return summary;
};

export const getGuestImportSummary = async () => {
    const storedValue = await AsyncStorage.getItem(GUEST_IMPORT_SUMMARY_KEY);
    return storedValue ? JSON.parse(storedValue) : {};
};

export const importGuestDataToBackend = async () => {
    const payload = await buildGuestImportPayload();
    await markGuestImportPending(payload);

    const response = await importGuestDataOnApi(payload);
    await markGuestRowsImported(response);
    return {
        payload,
        response,
    };
};

export const postponeGuestImport = async () => {
    await AsyncStorage.setItem(GUEST_IMPORT_PENDING_KEY, 'later');
};

export const keepGuestImportSeparate = async () => {
    await AsyncStorage.setItem(GUEST_IMPORT_PENDING_KEY, 'keep_separate');
};

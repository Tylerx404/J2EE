import AsyncStorage from '@react-native-async-storage/async-storage';
import { initGuestDb } from './guestDb';

export const GUEST_IMPORT_PENDING_KEY = 'guest_import_pending';
export const GUEST_IMPORT_SUMMARY_KEY = 'guest_import_summary';

const selectAll = async (db, tableName) => db.getAllAsync(`SELECT * FROM ${tableName}`);

export const buildGuestImportPayload = async () => {
    const db = await initGuestDb();
    const [wallets, categories, transactions] = await Promise.all([
        selectAll(db, 'wallets'),
        selectAll(db, 'categories'),
        selectAll(db, 'transactions'),
    ]);

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
            migrationState: transaction.migration_state,
        })),
    };
};

export const markGuestImportPending = async (payload) => {
    const summary = {
        walletCount: payload.wallets.length,
        categoryCount: payload.categories.length,
        transactionCount: payload.transactions.length,
        preparedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(GUEST_IMPORT_PENDING_KEY, 'pending');
    await AsyncStorage.setItem(GUEST_IMPORT_SUMMARY_KEY, JSON.stringify(summary));
    return summary;
};

export const postponeGuestImport = async () => {
    await AsyncStorage.setItem(GUEST_IMPORT_PENDING_KEY, 'later');
};

export const keepGuestImportSeparate = async () => {
    await AsyncStorage.setItem(GUEST_IMPORT_PENDING_KEY, 'keep_separate');
};

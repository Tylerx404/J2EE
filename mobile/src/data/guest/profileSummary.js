import AsyncStorage from '@react-native-async-storage/async-storage';
import { initGuestDb } from './guestDb';
import { GUEST_IMPORT_PENDING_KEY } from './import';

export const getGuestProfileSummary = async () => {
    const db = await initGuestDb();

    const [walletResult, categoryResult, transactionResult, importState] = await Promise.all([
        db.getFirstAsync('SELECT COUNT(*) AS count FROM wallets'),
        db.getFirstAsync('SELECT COUNT(*) AS count FROM categories'),
        db.getFirstAsync('SELECT COUNT(*) AS count FROM transactions'),
        AsyncStorage.getItem(GUEST_IMPORT_PENDING_KEY),
    ]);

    return {
        walletCount: Number(walletResult?.count ?? 0),
        categoryCount: Number(categoryResult?.count ?? 0),
        transactionCount: Number(transactionResult?.count ?? 0),
        importState: importState || 'none',
    };
};

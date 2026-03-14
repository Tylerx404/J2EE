// === SECTION 1: IMPORTS ===
import AsyncStorage from '@react-native-async-storage/async-storage';

// === SECTION 2: CONFIG ===
const TRANSACTION_KEY = '@transactions';

// === SECTION 3: STORAGE METHODS ===

// Lấy danh sách giao dịch
export const getTransactions = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(TRANSACTION_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error('Lỗi khi đọc giao dịch:', e);
        return [];
    }
};

// Lưu giao dịch mới (Thêm vào đầu danh sách)
export const saveTransaction = async (newTransaction) => {
    try {
        const existingData = await getTransactions();
        const updatedData = [newTransaction, ...existingData];
        await AsyncStorage.setItem(TRANSACTION_KEY, JSON.stringify(updatedData));
        return updatedData;
    } catch (e) {
        console.error('Lỗi khi lưu giao dịch:', e);
    }
};

// Xoá toàn bộ (Dùng khi muốn reset app)
export const clearAllTransactions = async () => {
    try {
        await AsyncStorage.removeItem(TRANSACTION_KEY);
    } catch (e) {
        console.error('Lỗi khi xoá dữ liệu:', e);
    }
};
// === SECTION 1: IMPORTS ===
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LucideUtensils, LucideCar, LucideHand } from 'lucide-react-native';

// === SECTION 2: CONFIG ===
const CATEGORY_KEY = '@categories';

// Dữ liệu mặc định khi người dùng mới tải app lần đầu
const DEFAULT_CATEGORIES = [
    { id: '1', name: 'Ăn uống', count: 24, type: 'Auto', iconId: 'utensils', color: '#F97316', bg: '#FFF7ED' },
    { id: '2', name: 'Di chuyển', count: 18, type: 'Auto', iconId: 'car', color: '#10B981', bg: '#F0FDF4' },
    { id: '3', name: 'uống thuốc', count: 5, type: 'Manual', iconId: 'hand', color: '#8B5CF6', bg: '#F5F3FF' }
];

// === SECTION 3: STORAGE METHODS ===
export const getCategories = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(CATEGORY_KEY);
        if (jsonValue !== null) {
            return JSON.parse(jsonValue);
        }
        // Nếu chưa có data, lưu và trả về data mặc định
        await saveCategories(DEFAULT_CATEGORIES);
        return DEFAULT_CATEGORIES;
    } catch (e) {
        console.error('Lỗi khi đọc danh mục:', e);
        return DEFAULT_CATEGORIES;
    }
};

export const saveCategories = async (categories) => {
    try {
        const jsonValue = JSON.stringify(categories);
        await AsyncStorage.setItem(CATEGORY_KEY, jsonValue);
    } catch (e) {
        console.error('Lỗi khi lưu danh mục:', e);
    }
};
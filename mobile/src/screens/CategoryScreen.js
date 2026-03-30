// === SECTION 1: IMPORTS ===
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { LucideArrowLeft, LucidePlus, LucideSearch, LucideMoreVertical, LucideSparkles, LucideHand } from 'lucide-react-native';
import CreateCategoryModal from '../components/CreateCategoryModal';
import { styles } from './css/CategoryScreenStyles';
import DeleteCategoryModal from '../components/DeleteCategoryModal';
import {
    getCategories,
    createCategory,
    deleteCategory,
} from '../services/categoryService';

// Hàm map iconId dạng string thành Component (vì AsyncStorage không lưu được Component)
import { LucideUtensils, LucideCar, LucideBook, LucideShoppingBag, LucideMusic, LucideHeart, LucideCoffee, LucideHome, LucideWifi, LucideDumbbell, LucidePlane, LucideBriefcase, LucideCamera, LucideFilm, LucideBus, LucidePill } from 'lucide-react-native';

// === SECTION 2: CONSTANTS & MOCK DATA ===
const ICON_MAP = {
    utensils: LucideUtensils, car: LucideCar, book: LucideBook, bag: LucideShoppingBag, music: LucideMusic, heart: LucideHeart, coffee: LucideCoffee, home: LucideHome, wifi: LucideWifi, dumbbell: LucideDumbbell, plane: LucidePlane, briefcase: LucideBriefcase, camera: LucideCamera, film: LucideFilm, bus: LucideBus, pill: LucidePill, hand: LucideHand
};
const COLOR_POOL = ['#F97316', '#10B981', '#8B5CF6', '#3B82F6', '#EF4444', '#F59E0B'];

const getColorById = (id) => {
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
        const hash = String(id).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        return COLOR_POOL[Math.abs(hash) % COLOR_POOL.length];
    }
    return COLOR_POOL[Math.abs(numericId) % COLOR_POOL.length];
};

const mapCategoryToUi = (category) => {
    const color = getColorById(category.id);
    return {
        id: category.id,
        name: category.name,
        iconId: category.icon || 'pill',
        color,
        bg: `${color}20`,
        isDefault: Boolean(category.isDefault),
        type: category.type,
    };
};

// === SECTION 3: COMPONENT LOGIC ===
const CategoryScreen = () => {
    const [activeTab, setActiveTab] = useState('Tất cả');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [searchText, setSearchText] = useState('');

    // State lưu danh sách hạng mục từ backend
    const [categories, setCategories] = useState([]);

    const defaultCount = categories.filter((cat) => cat.isDefault).length;
    const customCount = categories.length - defaultCount;

    const filteredCategories = useMemo(() => {
        const keyword = searchText.trim().toLowerCase();
        return categories.filter((cat) => {
            if (activeTab === 'Auto' && !cat.isDefault) return false;
            if (activeTab === 'Manual' && cat.isDefault) return false;
            if (!keyword) return true;
            return cat.name.toLowerCase().includes(keyword);
        });
    }, [activeTab, categories, searchText]);

    const loadData = async () => {
        try {
            const data = await getCategories();
            setCategories(data.map(mapCategoryToUi));
        } catch (error) {
            Alert.alert('Lỗi', `Không tải được danh mục: ${error.message}`);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // 3. Xử lý Tạo mới
    const handleCreateCategory = async (newCategoryData) => {
        try {
            const created = await createCategory({
                name: newCategoryData.name,
                type: newCategoryData.type,
                icon: newCategoryData.icon,
            });

            const mapped = mapCategoryToUi(created);
            mapped.color = newCategoryData.color || mapped.color;
            mapped.bg = `${mapped.color}20`;

            setCategories((prev) => [mapped, ...prev]);
            setShowCreateModal(false);
        } catch (error) {
            Alert.alert('Lỗi', `Không tạo được danh mục: ${error.message}`);
        }
    };

    // 4. Xử lý Xóa
    const handleDeleteConfirm = async () => {
        if (!categoryToDelete) return;
        try {
            await deleteCategory(categoryToDelete.id);
            setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
            setShowDeleteModal(false);
            setCategoryToDelete(null);
        } catch (error) {
            Alert.alert('Lỗi', `Không xóa được danh mục: ${error.message}`);
        }
    };

    // === SECTION 4: MAIN RENDER ===
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.blueHeader}>
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.backBtn}>
                        <LucideArrowLeft color="#fff" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Hạng mục</Text>
                        <Text style={styles.headerSub}>
                            {categories.length} danh mục • {defaultCount} Auto • {customCount} Manual
                        </Text>
                    </View>
                </View>

                {/* Nút Tạo hạng mục mới */}
                <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreateModal(true)}>
                    <View style={styles.iconPlusBox}><LucidePlus size={16} color="#4F46E5" /></View>
                    <Text style={styles.createBtnText}>Tạo hạng mục mới</Text>
                </TouchableOpacity>

                {/* Tabs */}
                <View style={styles.tabRow}>
                    {['Tất cả', 'Auto', 'Manual'].map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={activeTab === tab ? styles.tabActive : styles.tabInactive}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={activeTab === tab ? styles.tabTextActive : styles.tabTextInactive}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Thanh Tìm kiếm */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <LucideSearch size={20} color="#9CA3AF" />
                    <TextInput
                        placeholder="Tìm kiếm hạng mục..."
                        style={styles.searchInput}
                        placeholderTextColor="#9CA3AF"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>
            </View>

            {/* Danh sách lưới (Grid) */}
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>{activeTab.toUpperCase()} ({filteredCategories.length})</Text>
                </View>
                <View style={styles.grid}>
                    {/* Render từ State categories */}
                    {filteredCategories.map(cat => {
                        const IconComponent = ICON_MAP[cat.iconId] || LucidePill; // Map String sang Icon
                        return (
                            <View key={cat.id} style={styles.card}>
                                {!cat.isDefault ? (
                                    <TouchableOpacity style={styles.moreBtn} onPress={() => { setCategoryToDelete(cat); setShowDeleteModal(true); }}>
                                        <LucideMoreVertical size={20} color="#9CA3AF" />
                                    </TouchableOpacity>
                                ) : null}

                                <View style={[styles.iconBox, { backgroundColor: cat.bg }]}>
                                    <IconComponent size={30} color={cat.color} />
                                </View>
                                <Text style={styles.catName}>{cat.name}</Text>
                                <Text style={styles.txCount}>{cat.type === 'INCOME' ? 'Thu nhập' : 'Chi tiêu'}</Text>

                                {cat.isDefault ? (
                                    <View style={styles.badgeAuto}><LucideSparkles size={12} color="#4F46E5" /><Text style={styles.badgeTextAuto}>Auto</Text></View>
                                ) : (
                                    <View style={styles.badgeManual}><LucideHand size={12} color="#6B7280" /><Text style={styles.badgeTextManual}>Manual</Text></View>
                                )}
                            </View>
                        );
                    })}
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Truyền hàm xử lý Tạo mới vào Modal */}
            <CreateCategoryModal
                visible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateCategory}
            />

            <DeleteCategoryModal
                visible={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                categoryName={categoryToDelete?.name || ''}
            />
        </View>
    );
};

export default CategoryScreen;

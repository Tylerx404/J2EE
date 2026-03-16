// === SECTION 1: IMPORTS ===
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { LucideArrowLeft, LucidePlus, LucideSearch, LucideMoreVertical, LucideSparkles, LucideHand } from 'lucide-react-native';
import CreateCategoryModal from '../components/CreateCategoryModal';
import { styles } from './css/CategoryScreenStyles';
import DeleteCategoryModal from '../components/DeleteCategoryModal';
import { getCategories, saveCategories } from '../services/categoryStorage';

// Hàm map iconId dạng string thành Component (vì AsyncStorage không lưu được Component)
import { LucideUtensils, LucideCar, LucideBook, LucideShoppingBag, LucideMusic, LucideHeart, LucideCoffee, LucideHome, LucideWifi, LucideDumbbell, LucidePlane, LucideBriefcase, LucideCamera, LucideFilm, LucideBus, LucidePill } from 'lucide-react-native';

// === SECTION 2: CONSTANTS & MOCK DATA ===
const ICON_MAP = {
    utensils: LucideUtensils, car: LucideCar, book: LucideBook, bag: LucideShoppingBag, music: LucideMusic, heart: LucideHeart, coffee: LucideCoffee, home: LucideHome, wifi: LucideWifi, dumbbell: LucideDumbbell, plane: LucidePlane, briefcase: LucideBriefcase, camera: LucideCamera, film: LucideFilm, bus: LucideBus, pill: LucidePill, hand: LucideHand
};

// === SECTION 3: COMPONENT LOGIC ===
const CategoryScreen = () => {
    const [activeTab, setActiveTab] = useState('Tất cả');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    // 1. State lưu danh sách hạng mục
    const [categories, setCategories] = useState([]);

    // 2. Load dữ liệu khi vào màn hình
    useEffect(() => {
        const loadData = async () => {
            const data = await getCategories();
            setCategories(data);
        };
        loadData();
    }, []);

    // 3. Xử lý Tạo mới
    const handleCreateCategory = async (newCategoryData) => {
        const newCat = {
            id: Date.now().toString(), // Tạo ID ngẫu nhiên
            name: newCategoryData.name,
            count: 0,
            type: newCategoryData.type,
            iconId: newCategoryData.icon,
            color: newCategoryData.color,
            bg: newCategoryData.color + '15', // Tạo màu nền nhạt
        };

        const updatedList = [newCat, ...categories];
        setCategories(updatedList); // Cập nhật UI
        await saveCategories(updatedList); // Lưu vào máy
        setShowCreateModal(false);
    };

    // 4. Xử lý Xóa
    const handleDeleteConfirm = async () => {
        const updatedList = categories.filter(c => c.id !== categoryToDelete.id);
        setCategories(updatedList); // Cập nhật UI
        await saveCategories(updatedList); // Lưu vào máy
        setShowDeleteModal(false);
    };
    // Sau này tích hợp API ở đây

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
                        <Text style={styles.headerSub}>12 danh mục • 5 Auto • 7 Manual</Text>
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
                    <TextInput placeholder="Tìm kiếm hạng mục..." style={styles.searchInput} placeholderTextColor="#9CA3AF" />
                </View>
            </View>

            {/* Danh sách lưới (Grid) */}
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>TẤT CẢ ({categories.length})</Text>
                </View>
                <View style={styles.grid}>
                    {/* Render từ State categories */}
                    {categories.map(cat => {
                        const IconComponent = ICON_MAP[cat.iconId] || LucidePill; // Map String sang Icon
                        return (
                            <View key={cat.id} style={styles.card}>
                                <TouchableOpacity style={styles.moreBtn} onPress={() => { setCategoryToDelete(cat); setShowDeleteModal(true); }}>
                                    <LucideMoreVertical size={20} color="#9CA3AF" />
                                </TouchableOpacity>

                                <View style={[styles.iconBox, { backgroundColor: cat.bg }]}>
                                    <IconComponent size={30} color={cat.color} />
                                </View>
                                <Text style={styles.catName}>{cat.name}</Text>
                                <Text style={styles.txCount}>{cat.count} giao dịch</Text>

                                {cat.type === 'Auto' ? (
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
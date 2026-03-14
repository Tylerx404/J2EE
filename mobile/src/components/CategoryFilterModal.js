// === SECTION 1: IMPORTS ===
import { styles } from './css/CategoryFilterModalStyles';

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { LucideCheck, LucideBook, LucideUtensils, LucideCar, LucideShoppingBag, LucideMusic, LucideHeart, LucideCoffee, LucideHome, LucideWifi, LucideDumbbell } from 'lucide-react-native';

// === SECTION 2: CONFIG & UI CONSTANTS ===
const CATEGORIES = [
    { id: 1, name: 'Học tập', icon: LucideBook, color: '#EEF2FF', iconColor: '#6366F1' },
    { id: 2, name: 'Ăn uống', icon: LucideUtensils, color: '#FFF7ED', iconColor: '#F97316' },
    { id: 3, name: 'Di chuyển', icon: LucideCar, color: '#F0FDF4', iconColor: '#22C55E' },
    { id: 4, name: 'Mua sắm', icon: LucideShoppingBag, color: '#EFF6FF', iconColor: '#3B82F6' },
    { id: 5, name: 'Giải trí', icon: LucideMusic, color: '#FDF2F8', iconColor: '#EC4899' },
    { id: 6, name: 'Sức khỏe', icon: LucideHeart, color: '#FEF2F2', iconColor: '#EF4444' },
    { id: 7, name: 'Cà phê', icon: LucideCoffee, color: '#FFFBEB', iconColor: '#F59E0B' },
    { id: 8, name: 'Nhà ở', icon: LucideHome, color: '#F0F9FF', iconColor: '#0EA5E9' },
    { id: 9, name: 'Internet', icon: LucideWifi, color: '#EEF2FF', iconColor: '#6366F1' },
    { id: 10, name: 'Thể thao', icon: LucideDumbbell, color: '#F0FDF4', iconColor: '#22C55E' },
];

// === SECTION 3: MODAL LOGIC ===
const CategoryFilterModal = ({ visible, onClose }) => {
    const [selectedIds, setSelectedIds] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]); // Mặc định chọn tất cả

    const toggleCategory = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    // === SECTION 4: MODAL RENDER ===
    return (
        <Modal transparent visible={visible} animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.handle} />
                    <View style={styles.header}>
                        <Text style={styles.title}>Lọc theo Hạng mục</Text>
                        <TouchableOpacity onPress={() => setSelectedIds([])}>
                            <Text style={styles.clearText}>Xoá tất cả</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.grid}>
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[styles.catItem, { borderColor: selectedIds.includes(cat.id) ? cat.iconColor : '#E5E7EB' }]}
                                onPress={() => toggleCategory(cat.id)}
                            >
                                <View style={[styles.iconBox, { backgroundColor: cat.color }]}>
                                    <cat.icon size={20} color={cat.iconColor} />
                                </View>
                                <Text style={styles.catName}>{cat.name}</Text>
                                {selectedIds.includes(cat.id) && <LucideCheck size={14} color={cat.iconColor} />}
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.applyBtn} onPress={onClose}>
                        <Text style={styles.applyText}>Áp dụng ({selectedIds.length})</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
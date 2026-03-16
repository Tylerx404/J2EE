// === SECTION 1: IMPORTS ===
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import {
    LucideX, LucidePill, LucideUtensils, LucideCar, LucideBook, LucideShoppingBag,
    LucideMusic, LucideHeart, LucideCoffee, LucideHome, LucideWifi, LucideDumbbell,
    LucidePlane, LucideBriefcase, LucideCamera, LucideFilm, LucideBus, LucideCheck, LucideSparkles
} from 'lucide-react-native';
import { styles } from './css/CreateCategoryModalStyles';

// === SECTION 2: CONFIG & UI CONSTANTS ===
// Danh sách màu và icon theo thiết kế
const COLORS = ['#F97316', '#22C55E', '#8B5CF6', '#3B82F6', '#EC4899', '#EF4444', '#EAB308', '#0EA5E9', '#6366F1', '#14B8A6', '#64748B', '#F43F5E'];
const ICONS = [
    { id: 'utensils', icon: LucideUtensils }, { id: 'car', icon: LucideCar }, { id: 'book', icon: LucideBook },
    { id: 'bag', icon: LucideShoppingBag }, { id: 'music', icon: LucideMusic }, { id: 'heart', icon: LucideHeart },
    { id: 'coffee', icon: LucideCoffee }, { id: 'home', icon: LucideHome }, { id: 'wifi', icon: LucideWifi },
    { id: 'dumbbell', icon: LucideDumbbell }, { id: 'plane', icon: LucidePlane }, { id: 'briefcase', icon: LucideBriefcase },
    { id: 'camera', icon: LucideCamera }, { id: 'film', icon: LucideFilm }, { id: 'bus', icon: LucideBus },
    { id: 'pill', icon: LucidePill }
];

// === SECTION 3: MODAL LOGIC ===
const CreateCategoryModal = ({ visible, onClose }) => {
    // State lưu trữ dữ liệu người dùng nhập
    const [name, setName] = useState('uống thuốc');
    const [selectedIcon, setSelectedIcon] = useState('pill');
    const [selectedColor, setSelectedColor] = useState('#8B5CF6'); // Màu tím mặc định
    const [type, setType] = useState('Auto'); // 'Auto' hoặc 'Manual'

    // Component icon được chọn hiện tại
    const ActiveIcon = ICONS.find(i => i.id === selectedIcon)?.icon || LucidePill;

    // === SECTION 4: MODAL RENDER ===
    return (
        <Modal transparent visible={visible} animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.handle} />
                    <View style={styles.headerRow}>
                        <View>
                            <Text style={styles.title}>Tạo hạng mục mới</Text>
                            <Text style={styles.subtitle}>Tuỳ chỉnh danh mục của bạn</Text>
                        </View>
                        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                            <LucideX size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* 1. Thẻ Preview (Cập nhật Real-time) */}
                        <View style={[styles.previewCard, { borderColor: selectedColor + '40' }]}>
                            <View style={[styles.previewIconBox, { backgroundColor: selectedColor + '15' }]}>
                                <ActiveIcon size={28} color={selectedColor} />
                            </View>
                            <View style={styles.previewInfo}>
                                <Text style={styles.previewName}>{name || 'Tên hạng mục'}</Text>
                                <View style={styles.typeBadge}>
                                    {type === 'Auto' ? <LucideSparkles size={12} color="#4F46E5" /> : null}
                                    <Text style={[styles.typeBadgeText, type === 'Manual' && { color: '#6B7280' }]}>
                                        {type}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* 2. Nhập tên */}
                        <Text style={styles.sectionLabel}>TÊN HẠNG MỤC</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Ví dụ: Ăn sáng, Đổ xăng..."
                            placeholderTextColor="#9CA3AF"
                        />

                        {/* 3. Chọn Icon */}
                        <Text style={styles.sectionLabel}>BIỂU TƯỢNG</Text>
                        <View style={styles.iconGrid}>
                            {ICONS.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.iconBox, selectedIcon === item.id && { backgroundColor: selectedColor + '20', borderColor: selectedColor }]}
                                    onPress={() => setSelectedIcon(item.id)}
                                >
                                    <item.icon size={24} color={selectedIcon === item.id ? selectedColor : '#9CA3AF'} />
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* 4. Chọn Màu */}
                        <Text style={styles.sectionLabel}>MÀU SẮC</Text>
                        <View style={styles.colorGrid}>
                            {COLORS.map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    onPress={() => setSelectedColor(color)}
                                    style={[styles.colorOuter, selectedColor === color && { borderColor: color }]}
                                >
                                    <View style={[styles.colorInner, { backgroundColor: color }]} />
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* 5. Phân loại (Auto / Manual) */}
                        <Text style={styles.sectionLabel}>PHÂN LOẠI</Text>
                        <View style={styles.typeRow}>
                            <TouchableOpacity
                                style={[styles.typeCard, type === 'Auto' && styles.typeCardActive]}
                                onPress={() => setType('Auto')}
                            >
                                <View style={styles.typeCardHeader}>
                                    <LucideSparkles size={16} color={type === 'Auto' ? '#4F46E5' : '#6B7280'} />
                                    <Text style={[styles.typeTitle, type === 'Auto' && { color: '#4F46E5' }]}>Auto</Text>
                                    {type === 'Auto' && <LucideCheck size={16} color="#4F46E5" style={{ marginLeft: 'auto' }} />}
                                </View>
                                <Text style={styles.typeDesc}>Tự động nhận dạng từ giọng nói</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.typeCard, type === 'Manual' && styles.typeCardActive]}
                                onPress={() => setType('Manual')}
                            >
                                <View style={styles.typeCardHeader}>
                                    <Text style={[styles.typeTitle, type === 'Manual' && { color: '#4F46E5' }]}>✋ Manual</Text>
                                    {type === 'Manual' && <LucideCheck size={16} color="#4F46E5" style={{ marginLeft: 'auto' }} />}
                                </View>
                                <Text style={styles.typeDesc}>Chọn thủ công khi nhập</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Nút Tạo */}
                        <TouchableOpacity
                            style={styles.createBtn}
                            onPress={() => {
                                // Gọi hàm onCreate được truyền từ CategoryScreen
                                if (onCreate) {
                                    onCreate({
                                        name: name,
                                        icon: selectedIcon,
                                        color: selectedColor,
                                        type: type
                                    });
                                }
                            }}
                        >
                            <Text style={styles.createBtnText}>+ Tạo hạng mục</Text>
                        </TouchableOpacity>
                        <View style={{ height: 40 }} />
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default CreateCategoryModal;
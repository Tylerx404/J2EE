// === SECTION 1: IMPORTS ===
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { LucideTrash2 } from 'lucide-react-native';
import { styles } from './css/DeleteCategoryModalStyles';

// === SECTION 2: CONFIG & UI CONSTANTS ===


// === SECTION 3: MODAL LOGIC ===
const DeleteCategoryModal = ({ visible, onClose, onConfirm, categoryName }) => {
    // === SECTION 4: MODAL RENDER ===
    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.content}>
                    {/* Icon Thùng rác nền đỏ nhạt */}
                    <View style={styles.iconBg}>
                        <LucideTrash2 size={28} color="#EF4444" />
                    </View>

                    <Text style={styles.title}>Xoá hạng mục?</Text>

                    <Text style={styles.subtitle}>
                        Bạn có chắc muốn xoá "<Text style={styles.boldText}>{categoryName}</Text>"? Hành động này không thể hoàn tác.
                    </Text>

                    {/* Hai nút Huỷ / Xoá */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
                            <Text style={styles.btnTextCancel}>Huỷ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnDelete} onPress={onConfirm}>
                            <Text style={styles.btnTextDelete}>Xoá</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default DeleteCategoryModal;
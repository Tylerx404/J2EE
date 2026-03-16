import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

const DeleteCategoryModal = ({ visible, onClose, onConfirm, categoryName }) => {
    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>Xóa hạng mục?</Text>
                    <Text style={styles.desc}>
                        Bạn có chắc muốn xóa {categoryName ? `"${categoryName}"` : 'hạng mục này'} không?
                    </Text>

                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.btnGhost} onPress={onClose}>
                            <Text style={styles.btnGhostText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnDanger} onPress={onConfirm}>
                            <Text style={styles.btnDangerText}>Xóa</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        width: '100%',
        backgroundColor: COLORS.cardBg,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    title: { fontSize: 18, fontWeight: '700', color: COLORS.textMain, marginBottom: 8 },
    desc: { fontSize: 13, color: COLORS.textSub, marginBottom: 18 },
    actions: { flexDirection: 'row', gap: 10 },
    btnGhost: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    btnGhostText: { color: COLORS.textSub, fontWeight: '600' },
    btnDanger: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: COLORS.danger,
    },
    btnDangerText: { color: '#fff', fontWeight: '700' },
});

export default DeleteCategoryModal;

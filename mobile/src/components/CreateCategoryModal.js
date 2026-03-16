import React, { useEffect, useMemo, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import {
    LucideUtensils,
    LucideCar,
    LucideBook,
    LucideShoppingBag,
    LucideMusic,
    LucideHeart,
    LucideCoffee,
    LucideHome,
    LucideWifi,
    LucideDumbbell,
    LucidePlane,
    LucideBriefcase,
    LucideCamera,
    LucideFilm,
    LucideBus,
    LucidePill,
    LucideHand
} from 'lucide-react-native';
import { COLORS } from '../theme/colors';

const ICON_OPTIONS = [
    { id: 'utensils', Icon: LucideUtensils },
    { id: 'car', Icon: LucideCar },
    { id: 'book', Icon: LucideBook },
    { id: 'bag', Icon: LucideShoppingBag },
    { id: 'music', Icon: LucideMusic },
    { id: 'heart', Icon: LucideHeart },
    { id: 'coffee', Icon: LucideCoffee },
    { id: 'home', Icon: LucideHome },
    { id: 'wifi', Icon: LucideWifi },
    { id: 'dumbbell', Icon: LucideDumbbell },
    { id: 'plane', Icon: LucidePlane },
    { id: 'briefcase', Icon: LucideBriefcase },
    { id: 'camera', Icon: LucideCamera },
    { id: 'film', Icon: LucideFilm },
    { id: 'bus', Icon: LucideBus },
    { id: 'pill', Icon: LucidePill },
    { id: 'hand', Icon: LucideHand },
];

const COLOR_OPTIONS = ['#F97316', '#10B981', '#8B5CF6', '#3B82F6', '#EF4444', '#F59E0B'];

const CreateCategoryModal = ({ visible, onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('Manual');
    const [iconId, setIconId] = useState('hand');
    const [color, setColor] = useState(COLOR_OPTIONS[0]);

    useEffect(() => {
        if (!visible) return;
        setName('');
        setType('Manual');
        setIconId('hand');
        setColor(COLOR_OPTIONS[0]);
    }, [visible]);

    const selectedIcon = useMemo(() => ICON_OPTIONS.find(item => item.id === iconId), [iconId]);

    const handleCreate = () => {
        const trimmed = name.trim();
        if (!trimmed) return;
        onCreate?.({ name: trimmed, type, icon: iconId, color });
    };

    return (
        <Modal transparent visible={visible} animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <View style={styles.handle} />
                    <Text style={styles.title}>Tạo hạng mục mới</Text>

                    <Text style={styles.label}>Tên hạng mục</Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Ví dụ: Ăn uống"
                        placeholderTextColor={COLORS.textLight}
                        style={styles.input}
                    />

                    <Text style={styles.label}>Loại</Text>
                    <View style={styles.row}>
                        {['Auto', 'Manual'].map(item => (
                            <TouchableOpacity
                                key={item}
                                style={[styles.chip, type === item && styles.chipActive]}
                                onPress={() => setType(item)}
                            >
                                <Text style={[styles.chipText, type === item && styles.chipTextActive]}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Biểu tượng</Text>
                    <ScrollView style={styles.iconWrap} contentContainerStyle={styles.iconGrid}>
                        {ICON_OPTIONS.map(({ id, Icon }) => {
                            const isActive = id === iconId;
                            return (
                                <TouchableOpacity
                                    key={id}
                                    style={[styles.iconBtn, isActive && styles.iconBtnActive]}
                                    onPress={() => setIconId(id)}
                                >
                                    <Icon size={22} color={isActive ? color : COLORS.textSub} />
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    <Text style={styles.label}>Màu sắc</Text>
                    <View style={styles.row}>
                        {COLOR_OPTIONS.map((c) => (
                            <TouchableOpacity
                                key={c}
                                style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotActive]}
                                onPress={() => setColor(c)}
                            />
                        ))}
                    </View>

                    <View style={styles.preview}>
                        <View style={[styles.previewIcon, { backgroundColor: `${color}22` }]}>
                            {selectedIcon ? <selectedIcon.Icon size={26} color={color} /> : null}
                        </View>
                        <View>
                            <Text style={styles.previewName}>{name || 'Tên hạng mục'}</Text>
                            <Text style={styles.previewSub}>{type}</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.btnPrimary} onPress={handleCreate}>
                        <Text style={styles.btnPrimaryText}>Tạo mới</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnGhost} onPress={onClose}>
                        <Text style={styles.btnGhostText}>Hủy</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    card: {
        backgroundColor: COLORS.cardBg,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 24,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    handle: {
        alignSelf: 'center',
        width: 60,
        height: 5,
        borderRadius: 99,
        backgroundColor: COLORS.border,
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textMain,
        marginBottom: 14,
    },
    label: {
        fontSize: 12,
        color: COLORS.textSub,
        fontWeight: '600',
        marginTop: 10,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.background,
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 46,
        borderWidth: 1,
        borderColor: COLORS.border,
        color: COLORS.textMain,
    },
    row: {
        flexDirection: 'row',
        gap: 10,
        flexWrap: 'wrap',
    },
    chip: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 999,
        paddingVertical: 6,
        paddingHorizontal: 16,
        backgroundColor: COLORS.background,
    },
    chipActive: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primaryLight,
    },
    chipText: { color: COLORS.textSub, fontWeight: '600' },
    chipTextActive: { color: COLORS.primary },
    iconWrap: { maxHeight: 140 },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconBtnActive: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primaryLight,
    },
    colorDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    colorDotActive: {
        borderColor: COLORS.textMain,
    },
    preview: {
        marginTop: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderRadius: 16,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    previewIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewName: { fontSize: 15, fontWeight: '700', color: COLORS.textMain },
    previewSub: { fontSize: 12, color: COLORS.textSub, marginTop: 2 },
    btnPrimary: {
        marginTop: 18,
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: 'center',
    },
    btnPrimaryText: { color: '#fff', fontWeight: '700' },
    btnGhost: {
        marginTop: 10,
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    btnGhostText: { color: COLORS.textSub, fontWeight: '600' },
});

export default CreateCategoryModal;

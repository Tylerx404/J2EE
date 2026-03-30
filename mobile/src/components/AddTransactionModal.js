import React, { useEffect, useMemo, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { COLORS } from '../theme/colors';

const TYPE_OPTIONS = [
    { value: 'EXPENSE', label: 'Chi tieu' },
    { value: 'INCOME', label: 'Thu nhap' },
];

const AddTransactionModal = ({
    visible,
    wallets,
    categories,
    defaultWalletId,
    onClose,
    onSave,
}) => {
    const [walletId, setWalletId] = useState(defaultWalletId || null);
    const [type, setType] = useState('EXPENSE');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [categoryId, setCategoryId] = useState(null);

    const filteredCategories = useMemo(
        () => categories.filter((category) => category.type === type),
        [categories, type]
    );

    useEffect(() => {
        if (!visible) return;
        setWalletId(defaultWalletId || wallets[0]?.id || null);
        setType('EXPENSE');
        setAmount('');
        setNote('');
        setCategoryId(null);
    }, [defaultWalletId, visible, wallets]);

    useEffect(() => {
        if (filteredCategories.length === 0) {
            setCategoryId(null);
            return;
        }

        const current = filteredCategories.find((item) => item.id === categoryId);
        if (!current) {
            setCategoryId(filteredCategories[0].id);
        }
    }, [categoryId, filteredCategories]);

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.keyboardWrap}
                >
                    <View style={styles.card}>
                        <View style={styles.handle} />
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={styles.scrollContent}
                        >
                            <Text style={styles.title}>Them giao dich thu cong</Text>

                            <Text style={styles.label}>Loai giao dich</Text>
                            <View style={styles.row}>
                                {TYPE_OPTIONS.map((item) => (
                                    <TouchableOpacity
                                        key={item.value}
                                        style={[styles.chip, type === item.value && styles.chipActive]}
                                        onPress={() => setType(item.value)}
                                    >
                                        <Text style={[styles.chipText, type === item.value && styles.chipTextActive]}>
                                            {item.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.label}>Vi</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                                contentContainerStyle={styles.row}
                            >
                                {wallets.map((wallet) => (
                                    <TouchableOpacity
                                        key={wallet.id}
                                        style={[styles.chip, walletId === wallet.id && styles.chipActive]}
                                        onPress={() => setWalletId(wallet.id)}
                                    >
                                        <Text style={[styles.chipText, walletId === wallet.id && styles.chipTextActive]}>
                                            {wallet.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={styles.label}>So tien</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="Vi du: 50000"
                                value={amount}
                                onChangeText={setAmount}
                            />

                            <Text style={styles.label}>Ghi chu</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhap ghi chu"
                                value={note}
                                onChangeText={setNote}
                            />

                            <Text style={styles.label}>Hang muc</Text>
                            {filteredCategories.length > 0 ? (
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                    contentContainerStyle={styles.row}
                                >
                                    {filteredCategories.map((category) => (
                                        <TouchableOpacity
                                            key={category.id}
                                            style={[styles.chip, categoryId === category.id && styles.chipActive]}
                                            onPress={() => setCategoryId(category.id)}
                                        >
                                            <Text style={[styles.chipText, categoryId === category.id && styles.chipTextActive]}>
                                                {category.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            ) : (
                                <Text style={styles.emptyText}>Chua co hang muc phu hop cho loai giao dich nay.</Text>
                            )}

                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={() => onSave?.({
                                    walletId,
                                    categoryId,
                                    amount,
                                    type,
                                    note,
                                    transactionDate: new Date().toISOString().slice(0, 19),
                                })}
                            >
                                <Text style={styles.primaryButtonText}>Luu giao dich</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
                                <Text style={styles.secondaryButtonText}>Huy</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'flex-end',
    },
    keyboardWrap: {
        justifyContent: 'flex-end',
    },
    card: {
        backgroundColor: COLORS.cardBg,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 24,
        maxHeight: '88%',
    },
    scrollContent: {
        paddingBottom: 8,
    },
    handle: {
        alignSelf: 'center',
        width: 56,
        height: 5,
        borderRadius: 99,
        backgroundColor: COLORS.border,
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textMain,
        marginBottom: 12,
    },
    label: {
        color: COLORS.textSub,
        fontSize: 12,
        fontWeight: '600',
        marginTop: 12,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    chip: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: COLORS.background,
    },
    chipActive: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primaryLight,
    },
    chipText: {
        color: COLORS.textSub,
        fontWeight: '600',
    },
    chipTextActive: {
        color: COLORS.primary,
    },
    emptyText: {
        color: COLORS.textLight,
        fontSize: 13,
        lineHeight: 18,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        backgroundColor: '#fff',
        color: COLORS.textMain,
        paddingHorizontal: 12,
        paddingVertical: 11,
    },
    primaryButton: {
        marginTop: 20,
        backgroundColor: COLORS.primary,
        borderRadius: 14,
        alignItems: 'center',
        paddingVertical: 12,
    },
    primaryButtonText: {
        color: '#fff',
        fontWeight: '700',
    },
    secondaryButton: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 14,
        alignItems: 'center',
        paddingVertical: 12,
        backgroundColor: COLORS.background,
    },
    secondaryButtonText: {
        color: COLORS.textSub,
        fontWeight: '600',
    },
});

export default AddTransactionModal;

import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    RefreshControl,
    StyleSheet,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { LucideWallet, LucidePlus, LucideTrash2 } from 'lucide-react-native';
import {
    getWallets,
    createWallet,
    deleteWallet,
} from '../services/walletService';
import { COLORS } from '../theme/colors';

const WalletScreen = () => {
    const isFocused = useIsFocused();
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [name, setName] = useState('');
    const [currency, setCurrency] = useState('VND');
    const [initialBalance, setInitialBalance] = useState('');

    const totalBalance = useMemo(
        () => wallets.reduce((sum, wallet) => sum + Number(wallet.balance || 0), 0),
        [wallets]
    );

    const loadWallets = async () => {
        try {
            setLoading(true);
            const data = await getWallets();
            setWallets(data || []);
        } catch (error) {
            Alert.alert('Lỗi', `Không tải được ví: ${error.message}`);
            setWallets([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isFocused) return;
        loadWallets();
    }, [isFocused]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadWallets();
        setRefreshing(false);
    };

    const handleCreateWallet = async () => {
        const trimmedName = name.trim();
        const trimmedCurrency = currency.trim().toUpperCase();

        if (!trimmedName) {
            Alert.alert('Thiếu dữ liệu', 'Tên ví không được để trống.');
            return;
        }
        if (!/^[A-Z]{3}$/.test(trimmedCurrency)) {
            Alert.alert('Sai định dạng', 'Currency phải là mã 3 ký tự, ví dụ VND hoặc USD.');
            return;
        }

        const parsedBalance = Number((initialBalance || '0').replace(/,/g, ''));
        if (Number.isNaN(parsedBalance) || parsedBalance < 0) {
            Alert.alert('Sai dữ liệu', 'Số dư ban đầu phải là số >= 0.');
            return;
        }

        try {
            const created = await createWallet({
                name: trimmedName,
                currency: trimmedCurrency,
                initialBalance: parsedBalance,
            });
            setWallets((prev) => [created, ...prev]);
            setName('');
            setCurrency('VND');
            setInitialBalance('');
        } catch (error) {
            Alert.alert('Lỗi', `Không tạo được ví: ${error.message}`);
        }
    };

    const handleDeleteWallet = (wallet) => {
        Alert.alert('Xóa ví', `Bạn có chắc muốn xóa "${wallet.name}"?`, [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteWallet(wallet.id);
                        setWallets((prev) => prev.filter((item) => item.id !== wallet.id));
                    } catch (error) {
                        Alert.alert('Không thể xóa', error.message);
                    }
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                    />
                }
            >
                <View style={styles.header}>
                    <View style={styles.headerTitleRow}>
                        <LucideWallet size={20} color="#fff" />
                        <Text style={styles.headerTitle}>Quản lý ví</Text>
                    </View>
                    <Text style={styles.headerSubtitle}>
                        {wallets.length} ví • Tổng số dư {Math.round(totalBalance).toLocaleString('vi-VN')}đ
                    </Text>
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.sectionTitle}>Tạo ví mới</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Tên ví"
                        value={name}
                        onChangeText={setName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Currency (VD: VND)"
                        value={currency}
                        onChangeText={setCurrency}
                        autoCapitalize="characters"
                        maxLength={3}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Số dư ban đầu"
                        value={initialBalance}
                        onChangeText={setInitialBalance}
                        keyboardType="numeric"
                    />
                    <TouchableOpacity style={styles.primaryButton} onPress={handleCreateWallet}>
                        <LucidePlus size={16} color="#fff" />
                        <Text style={styles.primaryButtonText}>Tạo ví</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.listSection}>
                    <Text style={styles.sectionTitle}>Danh sách ví</Text>
                    {loading ? (
                        <View style={styles.loadingWrap}>
                            <ActivityIndicator size="large" color={COLORS.primary} />
                        </View>
                    ) : wallets.length === 0 ? (
                        <Text style={styles.emptyText}>Chưa có ví nào.</Text>
                    ) : (
                        wallets.map((wallet) => (
                            <View key={wallet.id} style={styles.walletCard}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.walletName}>{wallet.name}</Text>
                                    <Text style={styles.walletMeta}>
                                        {wallet.currency} • Số dư đầu {Math.round(Number(wallet.initialBalance || 0)).toLocaleString('vi-VN')}đ
                                    </Text>
                                    <Text style={styles.walletBalance}>
                                        {Math.round(Number(wallet.balance || 0)).toLocaleString('vi-VN')}đ
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDeleteWallet(wallet)}
                                >
                                    <LucideTrash2 size={16} color={COLORS.danger} />
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
    headerTitle: { color: '#fff', fontWeight: '700', fontSize: 20 },
    headerSubtitle: { color: '#E0E7FF', fontSize: 13 },
    formCard: {
        margin: 16,
        marginTop: -12,
        backgroundColor: COLORS.cardBg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 16,
    },
    listSection: { paddingHorizontal: 16, paddingBottom: 30 },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textMain,
        marginBottom: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 10,
        color: COLORS.textMain,
    },
    primaryButton: {
        marginTop: 4,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    primaryButtonText: { color: '#fff', fontWeight: '700' },
    walletCard: {
        backgroundColor: COLORS.cardBg,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    walletName: { color: COLORS.textMain, fontSize: 16, fontWeight: '700' },
    walletMeta: { color: COLORS.textSub, marginTop: 4, fontSize: 12 },
    walletBalance: { color: COLORS.primary, marginTop: 6, fontSize: 14, fontWeight: '700' },
    deleteButton: {
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.dangerLight,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    loadingWrap: { paddingVertical: 32 },
    emptyText: { color: COLORS.textSub, textAlign: 'center', paddingVertical: 20 },
});

export default WalletScreen;

import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Easing,
    Modal,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { AudioModule } from 'expo-audio';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { LucideChevronDown, LucideCirclePlus, LucideEye, LucideEyeOff, LucideLogOut, LucideMic } from 'lucide-react-native';

import AddTransactionModal from '../components/AddTransactionModal';
import TransactionItem from '../components/TransactionItem';
import { COLORS } from '../theme/colors';
import { logout } from '../services/authService';
import { parseVoiceToTransaction } from '../services/aiService';
import { getCategories } from '../services/categoryService';
import { createTransaction, getTransactionsByWallet } from '../services/transactionService';
import { getWallets } from '../services/walletService';
import { styles } from './css/HomeScreenStyles';

const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('vi-VN');
};

const HomeScreen = ({ onLogout, sessionMode }) => {
    const isGuest = sessionMode === 'guest';
    const [refreshing, setRefreshing] = useState(false);
    const [isVoiceModalVisible, setVoiceModalVisible] = useState(false);
    const [isManualModalVisible, setManualModalVisible] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isWalletPickerOpen, setWalletPickerOpen] = useState(false);
    const [parsedData, setParsedData] = useState({ amount: '0đ', note: '', type: 'EXPENSE' });
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [walletBalance, setWalletBalance] = useState(0);
    const [isBalanceVisible, setIsBalanceVisible] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [walletId, setWalletId] = useState(null);
    const filteredCategoriesByType = categories.filter((cat) => cat.type === parsedData.type);

    const pulseAnim = useRef(new Animated.Value(1)).current;

    const formatCurrency = (num) => `${Math.round(Number(num || 0)).toLocaleString('vi-VN')}đ`;
    const selectedWalletName = wallets.find((wallet) => wallet.id === walletId)?.name || 'Chọn ví';

    const handleLogout = async () => {
        await logout();
        onLogout?.();
    };

    const normalizeTransactions = (txData) => (
        (txData || []).slice(0, 5).map((item) => ({
            id: item.id,
            title: item.note || item.categoryName || 'Giao dịch',
            amount: item.amount,
            date: formatDate(item.transactionDate),
            category: item.categoryName || item.walletName,
            type: item.type || 'EXPENSE',
        }))
    );

    const loadAllData = async (preferredWalletId = walletId) => {
        try {
            const [catData, walletData] = await Promise.all([
                getCategories(),
                getWallets(),
            ]);

            const normalizedCategories = catData.map((item) => ({
                id: item.id,
                name: item.name,
                type: item.type,
            }));

            const activeWalletId = preferredWalletId && walletData.some((wallet) => wallet.id === preferredWalletId)
                ? preferredWalletId
                : walletData[0]?.id || null;
            const activeWallet = walletData.find((wallet) => wallet.id === activeWalletId) || walletData[0];
            const txData = activeWalletId ? await getTransactionsByWallet(activeWalletId) : [];

            setTransactions(normalizeTransactions(txData));
            setCategories(normalizedCategories);
            setWallets(walletData || []);
            setWalletId(activeWalletId);
            setWalletBalance(activeWallet?.balance || 0);

            if (normalizedCategories.length > 0 && !selectedCategory) {
                setSelectedCategory(normalizedCategories[0]);
            }
        } catch (error) {
            console.error('Lỗi đồng bộ dữ liệu:', error.message);
        }
    };

    const handleSelectWallet = async (nextWalletId) => {
        setWalletId(nextWalletId);
        setWalletPickerOpen(false);
        const activeWallet = wallets.find((wallet) => wallet.id === nextWalletId);
        setWalletBalance(activeWallet?.balance || 0);

        try {
            const txData = nextWalletId ? await getTransactionsByWallet(nextWalletId) : [];
            setTransactions(normalizeTransactions(txData));
        } catch (error) {
            console.error('Lỗi tải giao dịch theo ví:', error.message);
            setTransactions([]);
        }
    };

    const persistTransaction = async ({
        walletId: nextWalletId,
        categoryId,
        amount,
        type,
        note,
        transactionDate,
        origin,
        voiceText,
    }) => {
        const finalAmount = Number(String(amount).replace(/[^\d.]/g, ''));
        if (Number.isNaN(finalAmount) || finalAmount <= 0) {
            throw new Error('Số tiền không hợp lệ hoặc bằng 0.');
        }

        if (!nextWalletId) {
            throw new Error('Chưa tìm thấy ví để lưu giao dịch.');
        }

        await createTransaction({
            walletId: nextWalletId,
            categoryId: categoryId || null,
            amount: finalAmount,
            type,
            note,
            transactionDate: transactionDate || new Date().toISOString().slice(0, 19),
            origin,
            voiceText,
        });

        await loadAllData(nextWalletId);
    };

    const handleSaveRecording = async () => {
        try {
            await persistTransaction({
                walletId,
                categoryId: selectedCategory?.id || null,
                amount: parsedData.amount,
                type: parsedData.type || 'EXPENSE',
                note: parsedData.note,
                origin: 'voice',
                voiceText: parsedData.note,
            });
            setVoiceModalVisible(false);
            Alert.alert('Thành công', 'Lưu giao dịch thành công!');
        } catch (error) {
            Alert.alert('Lỗi lưu', error.message);
        }
    };

    const handleManualSave = async (entry) => {
        try {
            await persistTransaction({
                walletId: entry.walletId,
                categoryId: entry.categoryId,
                amount: entry.amount,
                type: entry.type,
                note: entry.note,
                transactionDate: entry.transactionDate,
                origin: 'manual',
                voiceText: null,
            });
            setManualModalVisible(false);
            Alert.alert('Thành công', 'Đã tạo giao dịch mới.');
        } catch (error) {
            Alert.alert('Lỗi', error.message);
        }
    };

    useSpeechRecognitionEvent('result', async (event) => {
        const transcript = event.results[0]?.transcript;
        if (!transcript) return;

        setIsParsing(true);
        setVoiceModalVisible(true);

        try {
            const aiResult = await parseVoiceToTransaction(transcript);
            setParsedData({
                amount: aiResult.amount ? `${aiResult.amount}` : '0',
                note: aiResult.note || transcript,
                type: aiResult.type || 'EXPENSE',
            });
        } catch (error) {
            console.error('Lỗi AI:', error);
            Alert.alert('Lỗi', 'Không phân tích được giọng nói.');
            setVoiceModalVisible(false);
        } finally {
            setIsParsing(false);
        }
    });

    useEffect(() => {
        loadAllData();
    }, []);

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ])
        ).start();
    }, [pulseAnim]);

    useEffect(() => {
        if (filteredCategoriesByType.length === 0) {
            setSelectedCategory(null);
            return;
        }

        const stillValid = filteredCategoriesByType.find((item) => item.id === selectedCategory?.id);
        if (!stillValid) {
            setSelectedCategory(filteredCategoriesByType[0]);
        }
    }, [categories, parsedData.type, selectedCategory]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadAllData();
        setRefreshing(false);
    };

    const startRecording = async () => {
        if (isGuest) {
            Alert.alert('Cần đăng nhập', 'Tính năng ghi âm hiện chỉ hỗ trợ khi đăng nhập.');
            return;
        }

        if (!ExpoSpeechRecognitionModule) {
            Alert.alert('Thông báo', 'Tính năng giọng nói hiện không hỗ trợ trên môi trường này.');
            return;
        }

        try {
            const status = await AudioModule.requestRecordingPermissionsAsync();
            if (!status.granted) {
                Alert.alert('Thông báo', 'Cần cấp quyền microphone.');
                return;
            }

            await AudioModule.setAudioModeAsync({
                allowsRecordingIOS: true,
                interruptionModeIOS: 1,
                playsInSilentModeIOS: true,
            });

            ExpoSpeechRecognitionModule.start({ lang: 'vi-VN' });
            setIsRecording(true);
        } catch (error) {
            console.error('Lỗi mic:', error);
        }
    };

    const stopRecording = () => {
        try {
            ExpoSpeechRecognitionModule.stop();
            setIsRecording(false);
        } catch (error) {
            console.error('Lỗi dừng ghi âm:', error);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={(
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                    />
                )}
            >
                <View style={styles.header}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                        <Text style={styles.welcomeText}>{isGuest ? 'Đang dùng guest mode' : 'Tổng quan chi tiêu'}</Text>
                        <TouchableOpacity onPress={handleLogout} style={{ padding: 5 }}>
                            <LucideLogOut color={COLORS.danger} size={22} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.balanceCard}>
                        <View style={styles.walletPickerRow}>
                            <TouchableOpacity style={styles.walletDropdown} onPress={() => setWalletPickerOpen((value) => !value)}>
                                <Text style={styles.walletDropdownLabel}>{selectedWalletName}</Text>
                                <LucideChevronDown size={18} color={COLORS.textSub} />
                            </TouchableOpacity>

                            {isWalletPickerOpen ? (
                                <View style={styles.walletDropdownMenu}>
                                    {wallets.map((wallet) => (
                                        <TouchableOpacity
                                            key={wallet.id}
                                            style={[styles.walletDropdownItem, walletId === wallet.id && styles.walletDropdownItemActive]}
                                            onPress={() => handleSelectWallet(wallet.id)}
                                        >
                                            <Text style={[styles.walletDropdownItemText, walletId === wallet.id && styles.walletDropdownItemTextActive]}>
                                                {wallet.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            ) : null}
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View>
                                <Text style={styles.balanceAmount}>
                                    {isBalanceVisible ? formatCurrency(walletBalance) : '******'}
                                </Text>
                                <Text style={{ color: COLORS.textSub, fontSize: 12 }}>
                                    {selectedWalletName}
                                </Text>
                            </View>

                            <TouchableOpacity
                                onPress={() => setIsBalanceVisible(!isBalanceVisible)}
                                style={{ padding: 10 }}
                            >
                                {isBalanceVisible ? (
                                    <LucideEye size={20} color={COLORS.textSub} />
                                ) : (
                                    <LucideEyeOff size={20} color={COLORS.textSub} />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.historyContainer}>
                    <View style={styles.historyHeader}>
                        <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 6,
                                backgroundColor: COLORS.primaryLight,
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                borderRadius: 999,
                            }}
                            onPress={() => setManualModalVisible(true)}
                        >
                            <LucideCirclePlus color={COLORS.primary} size={16} />
                            <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Thêm thủ công</Text>
                        </TouchableOpacity>
                    </View>

                    {transactions.length > 0 ? (
                        transactions.map((item) => (
                            <TransactionItem
                                key={item.id}
                                title={item.title}
                                amount={item.amount}
                                date={item.date}
                                category={item.category}
                                type={item.type}
                            />
                        ))
                    ) : (
                        <Text style={{ color: COLORS.textSub, textAlign: 'center', marginVertical: 20 }}>
                            Chưa có giao dịch nào trong ví này
                        </Text>
                    )}
                </View>

                <View style={styles.micWrapper}>
                    <Animated.View
                        style={[
                            styles.micRing,
                            {
                                transform: [{ scale: pulseAnim }],
                                opacity: isGuest ? 0.15 : (isRecording ? 0.8 : 0.4),
                            },
                        ]}
                    />
                    <TouchableOpacity
                        style={[
                            styles.micButton,
                            isRecording && { backgroundColor: COLORS.danger },
                            isGuest && { opacity: 0.45 },
                        ]}
                        onPressIn={startRecording}
                        onPressOut={stopRecording}
                    >
                        <LucideMic color="#fff" size={32} />
                    </TouchableOpacity>
                    <Text style={styles.micHint}>
                        {isGuest ? 'Đăng nhập để dùng voice' : (isRecording ? 'Đang nghe...' : 'Nhấn giữ để nói')}
                    </Text>
                </View>

                <Modal transparent visible={isVoiceModalVisible} animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHandle} />

                            {isParsing ? (
                                <View style={{ padding: 40, alignItems: 'center' }}>
                                    <Text style={{ color: COLORS.primary, fontWeight: '600' }}>AI đang phân tích...</Text>
                                    <Text style={{ color: COLORS.textSub, fontSize: 12, marginTop: 10 }}>Vui lòng đợi một chút</Text>
                                </View>
                            ) : (
                                <>
                                    <Text style={styles.modalTitle}>
                                        {parsedData.type === 'INCOME' ? 'Xác nhận thu nhập' : 'Xác nhận chi tiêu'}
                                    </Text>

                                    <View style={styles.amountBox}>
                                        <Text style={styles.amountLabel}>SỐ TIỀN</Text>
                                        <Text style={styles.amountValue}>{formatCurrency(parsedData.amount)}</Text>
                                    </View>

                                    <View style={styles.noteBox}>
                                        <Text style={styles.noteLabel}>GHI CHÚ</Text>
                                        <Text style={styles.noteValue}>{parsedData.note}</Text>
                                    </View>

                                    <Text style={styles.subTitle}>Hạng mục</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                                        {filteredCategoriesByType.map((category) => (
                                            <TouchableOpacity
                                                key={category.id}
                                                onPress={() => setSelectedCategory(category)}
                                                style={[styles.chip, selectedCategory?.id === category.id && styles.chipActive]}
                                            >
                                                <Text style={[styles.chipText, selectedCategory?.id === category.id && styles.chipTextActive]}>
                                                    {category.name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>

                                    <TouchableOpacity style={styles.btnConfirm} onPress={handleSaveRecording}>
                                        <Text style={styles.btnTextConfirm}>XÁC NHẬN LƯU</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.btnCancel} onPress={() => setVoiceModalVisible(false)}>
                                        <Text style={styles.btnTextCancel}>Hủy bỏ</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                </Modal>

                <AddTransactionModal
                    visible={isManualModalVisible}
                    wallets={wallets}
                    categories={categories}
                    defaultWalletId={walletId}
                    onClose={() => setManualModalVisible(false)}
                    onSave={handleManualSave}
                />
            </ScrollView>
        </View>
    );
};

export default HomeScreen;

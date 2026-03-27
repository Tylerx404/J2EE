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
import { LucideCirclePlus, LucideEye, LucideEyeOff, LucideLogOut, LucideMic } from 'lucide-react-native';

import AddTransactionModal from '../components/AddTransactionModal';
import TransactionItem from '../components/TransactionItem';
import { COLORS } from '../theme/colors';
import { logout } from '../services/authService';
import { parseVoiceToTransaction } from '../services/aiService';
import { getCategoriesFromBackend } from '../services/categoryService';
import { createTransactionOnBackend, getTransactionsFromBackend } from '../services/transactionService';
import { getWalletsFromBackend } from '../services/walletService';
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
    const [parsedData, setParsedData] = useState({ amount: '0d', note: '', type: 'EXPENSE' });
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

    const formatCurrency = (num) => `${Math.round(Number(num || 0)).toLocaleString('vi-VN')}d`;

    const handleLogout = async () => {
        await logout();
        onLogout?.();
    };

    const loadAllData = async () => {
        try {
            const [txData, catData, walletData] = await Promise.all([
                getTransactionsFromBackend(),
                getCategoriesFromBackend(),
                getWalletsFromBackend(),
            ]);

            const normalizedTransactions = txData.slice(0, 5).map((item) => ({
                id: item.id,
                title: item.note || item.categoryName || 'Giao dich',
                amount: item.amount,
                date: formatDate(item.transactionDate),
                category: item.categoryName || item.walletName,
                type: item.type || 'EXPENSE',
            }));

            const normalizedCategories = catData.map((item) => ({
                id: item.id,
                name: item.name,
                type: item.type,
            }));

            setTransactions(normalizedTransactions);
            setCategories(normalizedCategories);
            setWallets(walletData || []);

            const activeWalletId = walletId && walletData.some((wallet) => wallet.id === walletId)
                ? walletId
                : walletData[0]?.id || null;
            const activeWallet = walletData.find((wallet) => wallet.id === activeWalletId) || walletData[0];
            setWalletId(activeWalletId);
            setWalletBalance(activeWallet?.balance || 0);

            if (normalizedCategories.length > 0 && !selectedCategory) {
                setSelectedCategory(normalizedCategories[0]);
            }
        } catch (error) {
            console.error('Loi dong bo du lieu:', error.message);
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
            throw new Error('So tien khong hop le hoac bang 0.');
        }

        if (!nextWalletId) {
            throw new Error('Chua tim thay vi de luu giao dich.');
        }

        await createTransactionOnBackend({
            walletId: nextWalletId,
            categoryId: categoryId || null,
            amount: finalAmount,
            type,
            note,
            transactionDate: transactionDate || new Date().toISOString().slice(0, 19),
            origin,
            voiceText,
        });

        await loadAllData();
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
            Alert.alert('Thanh cong', 'Luu giao dich thanh cong!');
        } catch (error) {
            Alert.alert('Loi luu', error.message);
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
            Alert.alert('Thanh cong', 'Da tao giao dich moi.');
        } catch (error) {
            Alert.alert('Loi', error.message);
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
            console.error('Loi AI:', error);
            Alert.alert('Loi', 'Khong phan tich duoc giọng noi.');
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
            Alert.alert('Can dang nhap', 'Tinh nang ghi am hien chi ho tro khi dang nhap.');
            return;
        }

        if (!ExpoSpeechRecognitionModule) {
            Alert.alert('Thong bao', 'Tinh nang giong noi hien khong ho tro tren moi truong nay.');
            return;
        }

        try {
            const status = await AudioModule.requestRecordingPermissionsAsync();
            if (!status.granted) {
                Alert.alert('Thong bao', 'Can cap quyen microphone.');
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
            console.error('Loi mic:', error);
        }
    };

    const stopRecording = () => {
        try {
            ExpoSpeechRecognitionModule.stop();
            setIsRecording(false);
        } catch (error) {
            console.error('Loi dung ghi am:', error);
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
                        <Text style={styles.welcomeText}>{isGuest ? 'Dang dung guest mode' : 'Tong quan chi tieu'}</Text>
                        <TouchableOpacity onPress={handleLogout} style={{ padding: 5 }}>
                            <LucideLogOut color={COLORS.danger} size={22} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.balanceCard}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View>
                                <Text style={styles.balanceAmount}>
                                    {isBalanceVisible ? formatCurrency(walletBalance) : '******'}
                                </Text>
                                <Text style={{ color: COLORS.textSub, fontSize: 12 }}>So du vi hien tai</Text>
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
                        <Text style={styles.sectionTitle}>Giao dich gan day</Text>
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
                            <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Them thu cong</Text>
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
                            Chua co giao dich nao
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
                        {isGuest ? 'Dang nhap de dung voice' : (isRecording ? 'Dang nghe...' : 'Nhan giu de noi')}
                    </Text>
                </View>

                <Modal transparent visible={isVoiceModalVisible} animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHandle} />

                            {isParsing ? (
                                <View style={{ padding: 40, alignItems: 'center' }}>
                                    <Text style={{ color: COLORS.primary, fontWeight: '600' }}>AI dang phan tich...</Text>
                                    <Text style={{ color: COLORS.textSub, fontSize: 12, marginTop: 10 }}>Vui long doi mot chut</Text>
                                </View>
                            ) : (
                                <>
                                    <Text style={styles.modalTitle}>
                                        {parsedData.type === 'INCOME' ? 'Xac nhan thu nhap' : 'Xac nhan chi tieu'}
                                    </Text>

                                    <View style={styles.amountBox}>
                                        <Text style={styles.amountLabel}>SO TIEN</Text>
                                        <Text style={styles.amountValue}>{formatCurrency(parsedData.amount)}</Text>
                                    </View>

                                    <View style={styles.noteBox}>
                                        <Text style={styles.noteLabel}>GHI CHU</Text>
                                        <Text style={styles.noteValue}>{parsedData.note}</Text>
                                    </View>

                                    <Text style={styles.subTitle}>Hang muc</Text>
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
                                        <Text style={styles.btnTextConfirm}>XAC NHAN LUU</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.btnCancel} onPress={() => setVoiceModalVisible(false)}>
                                        <Text style={styles.btnTextCancel}>Huy bo</Text>
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

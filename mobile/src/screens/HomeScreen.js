// === SECTION 1: IMPORTS ===
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Easing, Modal } from 'react-native';
import { LucideMic, LucideWallet, LucideTrendingUp } from 'lucide-react-native';
import { AudioModule, useAudioRecorder } from 'expo-audio';
import TransactionItem from '../components/TransactionItem';
import CreateCategoryModal from '../components/CreateCategoryModal';
import { styles } from './css/HomeScreenStyles';
import { COLORS } from '../theme/colors';
import { getTransactions, saveTransaction } from '../services/transactionStorage';
import { getCategories } from '../services/categoryStorage';

// === SECTION 2: CONSTANTS & MOCK DATA ===
// (Dữ liệu hiện tại được quản lý qua Storage Services)

// === SECTION 3: COMPONENT LOGIC ===
const HomeScreen = () => {
    // 1. Khai báo States
    const [isModalVisible, setModalVisible] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [parsedData, setParsedData] = useState({ amount: "45.000đ", category: "Ăn uống" });
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [totalSpent, setTotalSpent] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // 2. Helpers (Xử lý tiền tệ)
    const parseAmount = (amountStr) => {
        if (!amountStr) return 0;
        return parseInt(amountStr.replace(/\./g, ''), 10) || 0;
    };

    const formatCurrency = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
    };

    // 3. Animation Logic (Nút Mic)
    const pulseAnim = useRef(new Animated.Value(1)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ])
        ).start();
    }, [pulseAnim]);

    // 4. Data Sync (Đồng bộ dữ liệu từ máy)
    useEffect(() => {
        const loadAllData = async () => {
            const [txData, catData] = await Promise.all([
                getTransactions(),
                getCategories()
            ]);
            const total = txData.reduce((sum, tx) => sum + parseAmount(tx.amount), 0);

            setTransactions(txData.slice(0, 5));
            setTotalSpent(total);
            setCategories(catData);
            if (catData.length > 0) setSelectedCategory(catData[0]);
        };
        loadAllData();
    }, []);

    // 5. Recording Logic
    const audioRecorder = useAudioRecorder({ sampleRate: 44100, channels: 1, bitRate: 128000 });

    async function startRecording() {
        try {
            const status = await AudioModule.requestRecordingPermissionsAsync();
            if (status.granted) {
                audioRecorder.record();
                setIsRecording(true);
            }
        } catch (err) { console.error('Lỗi khởi động ghi âm:', err); }
    }

    async function stopRecording() {
        try {
            await audioRecorder.stop();
            setIsRecording(false);
            setModalVisible(true);
        } catch (err) { console.error('Lỗi dừng ghi âm:', err); }
    }

    // 6. Save Logic (Lưu giao dịch và cập nhật Dashboard)
    const handleSaveRecording = async () => {
        const amountClean = parsedData.amount.replace('đ', '').replace(/\./g, '');
        const newEntry = {
            id: Date.now().toString(),
            title: selectedCategory?.name || "Giao dịch mới",
            amount: parsedData.amount.replace('đ', ''),
            date: new Date().toLocaleDateString('vi-VN'),
            category: selectedCategory?.name || "Khác"
        };

        const updatedList = await saveTransaction(newEntry);
        setTransactions(updatedList.slice(0, 5));
        setTotalSpent(prev => prev + parseInt(amountClean, 10));
        setModalVisible(false);
    };

    // === SECTION 4: MAIN RENDER ===
    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header & Tổng tiền */}
                <View style={styles.header}>
                    <Text style={styles.welcomeText}>Chào Hiệp 👋</Text>
                    <View style={styles.balanceCard}>
                        <Text style={styles.balanceAmount}>{formatCurrency(totalSpent)}</Text>
                        <Text style={{ color: COLORS.textSub, fontSize: 12 }}>Tổng chi tiêu tháng này</Text>
                    </View>
                </View>

                {/* Danh sách Giao dịch gần đây */}
                <View style={styles.historyContainer}>
                    <View style={styles.historyHeader}>
                        <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
                    </View>
                    {transactions.length > 0 ? (
                        transactions.map(item => (
                            <TransactionItem key={item.id} title={item.title} amount={item.amount} date={item.date} category={item.category} />
                        ))
                    ) : (
                        <Text style={{ color: COLORS.textSub, textAlign: 'center', marginVertical: 20 }}>Chưa có giao dịch nào</Text>
                    )}
                </View>

                {/* Nút Mic ghi âm */}
                <View style={styles.micWrapper}>
                    <Animated.View style={[styles.micRing, { transform: [{ scale: pulseAnim }], opacity: isRecording ? 0.8 : 0.4 }]} />
                    <TouchableOpacity style={[styles.micButton, isRecording && { backgroundColor: COLORS.danger }]} onPressIn={startRecording} onPressOut={stopRecording}>
                        <LucideMic color="#fff" size={32} />
                    </TouchableOpacity>
                    <Text style={styles.micHint}>{isRecording ? "Đang nghe..." : "Nhấn giữ để nói"}</Text>
                </View>

                {/* Modal Xác nhận từ AI */}
                <Modal transparent visible={isModalVisible} animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHandle} />
                            <Text style={styles.modalTitle}>Xác nhận giao dịch</Text>
                            <View style={styles.inputField}>
                                <Text style={{ color: COLORS.textSub, marginBottom: 5 }}>Số tiền nhận diện:</Text>
                                <Text style={styles.fieldValue}>{parsedData.amount}</Text>
                            </View>

                            <Text style={{ fontWeight: 'bold', color: COLORS.textMain, marginTop: 15 }}>Chọn hạng mục chuẩn:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 15 }}>
                                {categories.map(cat => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        onPress={() => setSelectedCategory(cat)}
                                        style={[{ paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1 }, selectedCategory?.id === cat.id ? { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight } : { borderColor: COLORS.border, backgroundColor: COLORS.background }]}
                                    >
                                        <Text style={{ color: selectedCategory?.id === cat.id ? COLORS.primary : COLORS.textSub, fontWeight: '600' }}>{cat.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <TouchableOpacity style={styles.btnSave} onPress={handleSaveRecording}>
                                <Text style={styles.btnTextSave}>Xác nhận & Lưu</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
            <CreateCategoryModal visible={showCategoryModal} onClose={() => setShowCategoryModal(false)} />
        </View>
    );
};

export default HomeScreen;
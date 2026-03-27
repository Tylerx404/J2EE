// === SECTION 1: IMPORTS ===
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Easing, Modal, RefreshControl } from 'react-native';
import { AudioModule } from 'expo-audio';
import { LucideMic, LucideLogOut, LucideEye, LucideEyeOff } from 'lucide-react-native';
import TransactionItem from '../components/TransactionItem';

// Services
import { logout } from '../services/authService';
import { getTransactionsFromBackend, createTransactionOnBackend } from '../services/transactionService';
import { getCategoriesFromBackend } from '../services/categoryService';
import { getWalletsFromBackend } from '../services/walletService';
import { parseVoiceToTransaction } from '../services/aiService';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { styles } from './css/HomeScreenStyles';
import { COLORS } from '../theme/colors';

// === SECTION 3: COMPONENT LOGIC ===
const HomeScreen = ({ onLogout }) => {
    const [refreshing, setRefreshing] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [parsedData, setParsedData] = useState({ amount: "0đ", note: "", type: "EXPENSE" });
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [walletBalance, setWalletBalance] = useState(0);
    const [isBalanceVisible, setIsBalanceVisible] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [walletId, setWalletId] = useState(null);
    const filteredCategoriesByType = categories.filter((cat) => cat.type === parsedData.type);

    const formatDate = (value) => {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        return date.toLocaleDateString('vi-VN');
    };

    const handleLogout = async () => {
        await logout();
        if (onLogout) onLogout();
    };

    // Lắng nghe kết quả từ giọng nói
    useSpeechRecognitionEvent("result", async (event) => {
        const transcript = event.results[0]?.transcript;
        if (transcript) {
            setIsParsing(true); // Bắt đầu xoay loading
            setModalVisible(true); // Hiện modal ngay để thông báo đang xử lý
            try {
                // Gửi text thật lên Backend AI
                const aiResult = await parseVoiceToTransaction(transcript);
                setParsedData({
                    amount: aiResult.amount ? `${aiResult.amount.toLocaleString()}đ` : "0đ",
                    note: aiResult.note || transcript,
                    type: aiResult.type || "EXPENSE",
                });
            } catch (error) {
                console.error("Lỗi AI:", error);
            } finally {
                setIsParsing(false); // Xử lý xong, hiện data thật
            }
        }
    });

    // 1. Hàm lấy số dư từ Backend
    const fetchWalletData = async () => {
        try {
            const wallets = await getWalletsFromBackend();
            if (wallets && wallets.length > 0) {
                setWalletBalance(wallets[0].balance);
                setWalletId(wallets[0].id);
            }
        } catch (error) {
            console.warn("Lỗi lấy số dư ví:", error.message);
        }
    };

    // 2. Hàm tải toàn bộ dữ liệu (Dùng chung cho useEffect và Refresh)
    const loadAllData = async () => {
        try {
            const [txData, catData] = await Promise.all([
                getTransactionsFromBackend(),
                getCategoriesFromBackend()
            ]);

            const normalizedTransactions = txData.slice(0, 5).map((item) => ({
                id: item.id,
                title: item.note || item.categoryName || 'Giao dịch',
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
            if (normalizedCategories.length > 0) setSelectedCategory(normalizedCategories[0]);

            await fetchWalletData();
        } catch (error) {
            console.error("Lỗi đồng bộ dữ liệu:", error.message);
        }
    };

    // Khởi tạo dữ liệu khi vào App
    useEffect(() => {
        const checkStatus = async () => {
            await loadAllData();
        };
        checkStatus();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadAllData();
        setRefreshing(false);
    };

    // 3. Helpers
    const formatCurrency = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
    };

    // 4. Animation Mic
    const pulseAnim = useRef(new Animated.Value(1)).current;
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

    // 5. Recording Logic
    // const audioRecorder = useAudioRecorder({ sampleRate: 44100, channels: 1, bitRate: 128000 });

    const startRecording = async () => {
        if (!ExpoSpeechRecognitionModule) {
            alert("Tính năng giọng nói chỉ hỗ trợ trên bản Android Build. iOS hiện đang dùng Expo Go nên không hỗ trợ.");
            return;
        }

        try {
            // 1. Kiểm tra quyền TRƯỚC
            const status = await AudioModule.requestRecordingPermissionsAsync();
            if (!status.granted) return alert("Cần cấp quyền Mic!");

            // 2. Cấu hình Audio Mode cho iOS
            await AudioModule.setAudioModeAsync({
                allowsRecordingIOS: true,
                interruptionModeIOS: 1,
                playsInSilentModeIOS: true,
            });

            // 3. Khởi động nhận diện (Bỏ audioRecorder.record())
            ExpoSpeechRecognitionModule.start({ lang: "vi-VN" });
            setIsRecording(true);
        } catch (err) {
            console.error('Lỗi Mic:', err);
        }
    };

    const stopRecording = () => {
        try {
            ExpoSpeechRecognitionModule.stop();
            setIsRecording(false);
        } catch (err) { console.error('Lỗi dừng:', err); }
    };

    // 6. Lưu giao dịch: Đẩy lên Backend + Cập nhật UI
    const handleSaveRecording = async () => {
        // 1. Kiểm tra ví
        if (!walletId) {
            return alert("Chưa tìm thấy ID ví. Hãy vuốt xuống để làm mới trang.");
        }

        // 2. Làm sạch số tiền (Xóa chữ đ, xóa dấu chấm)
        const amountClean = parsedData.amount.replace(/[^\d]/g, '');
        const finalAmount = parseInt(amountClean, 10);

        if (isNaN(finalAmount) || finalAmount <= 0) {
            return alert("Số tiền không hợp lệ hoặc bằng 0.");
        }

        // 3. Tạo Object gửi đi (Khớp 100% với Record Java của bạn)
        const parsedCategoryId = Number(selectedCategory?.id);
        const newEntry = {
            walletId: walletId,
            categoryId: Number.isFinite(parsedCategoryId) ? parsedCategoryId : null,
            amount: finalAmount,
            type: parsedData.type || "EXPENSE",
            note: parsedData.note,
            transactionDate: new Date().toISOString().slice(0, 19),
        };

        try {
            await createTransactionOnBackend(newEntry);
            await loadAllData(); // Tải lại số dư và lịch sử ngay lập tức
            setModalVisible(false);
            alert("Lưu giao dịch thành công!");
        } catch (error) {
            // Hiện lỗi chi tiết từ GlobalExceptionHandler để dễ bắt bệnh
            alert("Lỗi lưu: " + error.message);
        }
    };

    // === SECTION 4: MAIN RENDER ===
    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]} // Màu vòng xoay tải
                    />
                }
            >
                {/* Header & Tổng tiền */}
                <View style={styles.header}>
                    {/* <Text style={styles.welcomeText}>Chào Hiệp 👋</Text> */}

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                        <Text style={styles.welcomeText}>Chào Hiệp 👋</Text>
                        <TouchableOpacity onPress={handleLogout} style={{ padding: 5 }}>
                            <LucideLogOut color={COLORS.danger} size={22} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.balanceCard}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View>
                                {/* Hiển thị số tiền hoặc dấu hoa thị dựa trên trạng thái bảo mật */}
                                <Text style={styles.balanceAmount}>
                                    {isBalanceVisible ? formatCurrency(walletBalance) : "******"}
                                </Text>
                                <Text style={{ color: COLORS.textSub, fontSize: 12 }}>Số dư ví hiện tại</Text>
                            </View>

                            {/* Nút ẩn/hiện số dư */}
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

                {/* Danh sách Giao dịch gần đây */}
                <View style={styles.historyContainer}>
                    <View style={styles.historyHeader}>
                        <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
                    </View>
                    {transactions.length > 0 ? (
                        transactions.map(item => (
                            <TransactionItem key={item.id} title={item.title} amount={item.amount} date={item.date} category={item.category} type={item.type} />
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

                            {isParsing ? (
                                <View style={{ padding: 40, alignItems: 'center' }}>
                                    <Text style={{ color: COLORS.primary, fontWeight: '600' }}>🤖 AI ĐANG PHÂN TÍCH...</Text>
                                    <Text style={{ color: COLORS.textSub, fontSize: 12, marginTop: 10 }}>Vui lòng đợi trong giây lát</Text>
                                </View>
                            ) : (
                                <>
                                    <Text style={styles.modalTitle}>
                                        {parsedData.type === 'INCOME' ? 'Xác nhận thu nhập' : 'Xác nhận chi tiêu'}
                                    </Text>

                                    <View style={styles.amountBox}>
                                        <Text style={styles.amountLabel}>SỐ TIỀN</Text>
                                        <Text style={styles.amountValue}>{parsedData.amount}</Text>
                                    </View>

                                    <View style={styles.noteBox}>
                                        <Text style={styles.noteLabel}>GHI CHÚ</Text>
                                        <Text style={styles.noteValue}>{parsedData.note}</Text>
                                    </View>

                                    <Text style={styles.subTitle}>Hạng mục</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                                        {filteredCategoriesByType.map(cat => (
                                            <TouchableOpacity
                                                key={cat.id}
                                                onPress={() => setSelectedCategory(cat)}
                                                style={[styles.chip, selectedCategory?.id === cat.id && styles.chipActive]}
                                            >
                                                <Text style={[styles.chipText, selectedCategory?.id === cat.id && styles.chipTextActive]}>
                                                    {cat.name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                        {filteredCategoriesByType.length === 0 ? (
                                            <Text style={{ color: COLORS.textSub, fontSize: 12 }}>
                                                Chưa có hạng mục phù hợp, bạn có thể để trống.
                                            </Text>
                                        ) : null}
                                    </ScrollView>

                                    <TouchableOpacity style={styles.btnConfirm} onPress={handleSaveRecording}>
                                        <Text style={styles.btnTextConfirm}>XÁC NHẬN LƯU</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
                                        <Text style={styles.btnTextCancel}>Hủy bỏ</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </View>
    );

};

export default HomeScreen;

// === SECTION 1: IMPORTS ===
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { LucideSearch, LucideCalendar, LucideArrowUpDown, LucideFilter, LucideArrowLeft } from 'lucide-react-native';
import TransactionItem from '../components/TransactionItem';
import { styles } from './css/HistoryScreenStyles';
import { getTransactionsFromBackend } from '../services/transactionService';

const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('vi-VN');
};

// === SECTION 3: COMPONENT LOGIC ===
const HistoryScreen = () => {
    const isFocused = useIsFocused();
    const [searchText, setSearchText] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            const data = await getTransactionsFromBackend();
            const normalized = data.map((tx) => ({
                id: tx.id,
                title: tx.note || tx.categoryName || 'Giao dịch',
                amount: tx.amount,
                date: formatDate(tx.transactionDate),
                category: tx.categoryName || tx.walletName,
                type: tx.type || 'EXPENSE',
            }));
            setTransactions(normalized);
        } catch (error) {
            console.warn('Lỗi tải lịch sử giao dịch:', error.message);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isFocused) return;
        loadTransactions();
    }, [isFocused]);

    const filteredTransactions = useMemo(() => {
        const keyword = searchText.trim().toLowerCase();
        if (!keyword) return transactions;
        return transactions.filter((tx) =>
            tx.title.toLowerCase().includes(keyword) ||
            (tx.category || '').toLowerCase().includes(keyword)
        );
    }, [transactions, searchText]);

    const totalExpense = filteredTransactions.reduce((sum, tx) => {
        if (tx.type !== 'EXPENSE') return sum;
        return sum + Number(tx.amount || 0);
    }, 0);

    const now = new Date();
    const monthLabel = now.getMonth() + 1;
    const yearLabel = now.getFullYear();

    // === SECTION 4: MAIN RENDER ===
    return (
        <View style={styles.container}>
            {/* Blue Header & Filter Chips giữ nguyên như cũ... */}
            <View style={styles.blueHeader}>
                <View style={styles.headerTopRow}>
                    <TouchableOpacity style={styles.backButton}>
                        <LucideArrowLeft color="#fff" size={24} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleBox}>
                        <Text style={styles.headerTitle}>Lịch sử chi tiêu</Text>
                        <Text style={styles.headerSubtitle}>Tháng {monthLabel}/{yearLabel} • {filteredTransactions.length} giao dịch</Text>
                    </View>
                    <View style={styles.totalBadge}>
                        <Text style={styles.totalLabel}>Tổng chi</Text>
                        <Text style={styles.totalText}>{Math.round(totalExpense).toLocaleString('vi-VN')}đ</Text>
                    </View>
                </View>

                <View style={styles.chipRow}>
                    <TouchableOpacity style={styles.chipOutline}>
                        <LucideCalendar size={14} color="#fff" />
                        <Text style={styles.chipTextWhite}> Ngày</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.chipActive}>
                        <Text style={styles.chipTextDark}>$ Số tiền </Text>
                        <LucideArrowUpDown size={14} color="#4F46E5" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.chipOutline}>
                        <LucideFilter size={14} color="#fff" />
                        <Text style={styles.chipTextWhite}> Hạng mục 10</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 4. Search Bar - Kết nối với State */}
            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <LucideSearch size={18} color="#9CA3AF" />
                    <TextInput
                        placeholder="Tìm kiếm giao dịch..."
                        style={styles.searchInput}
                        placeholderTextColor="#9CA3AF"
                        value={searchText}
                        onChangeText={(text) => setSearchText(text)} // Cập nhật state khi gõ
                    />
                </View>
            </View>

            {/* 5. Render danh sách đã được lọc */}
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                <Text style={styles.sortHint}>
                    {filteredTransactions.length} GIAO DỊCH • SẮP XẾP MỚI NHẤT
                </Text>

                {loading ? (
                    <View style={{ marginTop: 30, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#4F46E5" />
                    </View>
                ) : filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx) => (
                        <TransactionItem
                            key={tx.id}
                            title={tx.title}
                            amount={tx.amount}
                            date={tx.date}
                            category={tx.category}
                            type={tx.type}
                        />
                    ))
                ) : (
                    // Hiển thị thông báo nếu không tìm thấy kết quả
                    <View style={{ alignItems: 'center', marginTop: 40 }}>
                        <Text style={{ color: '#9CA3AF' }}>Không tìm thấy giao dịch nào</Text>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

export default HistoryScreen;

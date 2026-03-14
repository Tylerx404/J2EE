// === SECTION 1: IMPORTS ===
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { LucideSearch, LucideCalendar, LucideArrowUpDown, LucideFilter, LucideArrowLeft } from 'lucide-react-native';
import TransactionItem from '../components/TransactionItem';
import { styles } from './css/HistoryScreenStyles';

// === SECTION 2: CONSTANTS & MOCK DATA ===
// 1. Dữ liệu giả lập (Mock Data) - Chuẩn bị cho API Backend
const MOCK_TRANSACTIONS = [
    { id: '1', title: 'Học tập', amount: '150.000', date: '26/02/2026', category: 'Học tập' },
    { id: '2', title: 'Ăn sáng phở bò', amount: '45.000', date: '26/02/2026', category: 'Ăn uống' },
    { id: '3', title: 'Grab về nhà', amount: '32.000', date: '25/02/2026', category: 'Di chuyển' },
    { id: '4', title: 'Áo polo mới', amount: '320.000', date: '25/02/2026', category: 'Mua sắm' },
    { id: '5', title: 'Highlands - cappuccino', amount: '65.000', date: '23/02/2026', category: 'Cà phê' },
];

// === SECTION 3: COMPONENT LOGIC ===
const HistoryScreen = () => {
    // 2. State lưu trữ từ khóa tìm kiếm
    const [searchText, setSearchText] = useState('');

    // 3. Logic lọc danh sách theo tên giao dịch hoặc hạng mục
    const filteredTransactions = MOCK_TRANSACTIONS.filter((tx) =>
        tx.title.toLowerCase().includes(searchText.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchText.toLowerCase())
    );

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
                        <Text style={styles.headerSubtitle}>Tháng 2 • 15 giao dịch</Text>
                    </View>
                    <View style={styles.totalBadge}>
                        <Text style={styles.totalLabel}>Tổng chi</Text>
                        <Text style={styles.totalText}>2.486.000đ</Text>
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
                    {filteredTransactions.length} GIAO DỊCH • SẮP XẾP THEO THẤP → CAO
                </Text>

                {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx) => (
                        <TransactionItem
                            key={tx.id}
                            title={tx.title}
                            amount={tx.amount}
                            date={tx.date}
                            category={tx.category}
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
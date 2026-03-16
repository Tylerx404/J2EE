// === SECTION 1: IMPORTS ===
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideUtensils, LucideCar, LucideShoppingBag, LucideBook } from 'lucide-react-native';
import { styles } from './css/TransactionItemStyles';

// === SECTION 2: CONFIG & UI CONSTANTS ===


// === SECTION 3: MODAL LOGIC ===
const TransactionItem = ({ title, amount, date, category }) => {
    // Logic chọn icon dựa trên hạng mục
    const getIcon = () => {
        switch (category) {
            case 'Ăn uống': return <LucideUtensils color="#F59E0B" size={20} />;
            case 'Di chuyển': return <LucideCar color="#10B981" size={20} />;
            case 'Mua sắm': return <LucideShoppingBag color="#3B82F6" size={20} />;
            case 'Học tập': return <LucideBook color="#8B5CF6" size={20} />;
            default: return <LucideUtensils color="#6B7280" size={20} />;
        }
    };

    // === SECTION 4: MODAL RENDER ===
    return (
        <View style={styles.container}>
            <View style={styles.iconWrapper}>{getIcon()}</View>
            <View style={styles.info}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.date}>{date}</Text>
            </View>
            <Text style={styles.amount}>-{amount}đ</Text>
        </View>
    );
};

export default TransactionItem;
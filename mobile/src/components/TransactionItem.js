import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return '';
    let text = typeof amount === 'number' ? amount.toLocaleString('vi-VN') : String(amount).trim();
    if (text === '') return '';
    const hasCurrency = /đ|vnd/i.test(text);
    return hasCurrency ? text : `${text}đ`;
};

const applySign = (text, type) => {
    if (!text) return text;
    const hasSign = /^[+-]/.test(text);
    if (hasSign) return text;
    const sign = type === 'INCOME' ? '+' : '-';
    return `${sign}${text}`;
};

const buildMeta = (category, date) => {
    const parts = [];
    if (category) parts.push(category);
    if (date) parts.push(date);
    return parts.join(' - ');
};

const TransactionItem = ({ title, amount, date, category, type = 'EXPENSE' }) => {
    const amountText = applySign(formatAmount(amount), type);
    const metaText = buildMeta(category, date);
    const amountStyle = type === 'INCOME' ? styles.amountIncome : styles.amountExpense;

    return (
        <View style={styles.item}>
            <View style={styles.left}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                {metaText ? <Text style={styles.meta} numberOfLines={1}>{metaText}</Text> : null}
            </View>
            <Text style={[styles.amount, amountStyle]}>{amountText}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    item: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    left: { flex: 1, marginRight: 12 },
    title: { fontSize: 15, fontWeight: '600', color: COLORS.textMain, marginBottom: 4 },
    meta: { fontSize: 12, color: COLORS.textLight },
    amount: { fontSize: 15, fontWeight: '700' },
    amountExpense: { color: COLORS.danger },
    amountIncome: { color: COLORS.success },
});

export default TransactionItem;

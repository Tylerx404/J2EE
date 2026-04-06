import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import {
    LucideAlertTriangle,
    LucideChevronDown,
    LucideChevronLeft,
    LucideChevronRight,
    LucideLightbulb,
    LucideTrendingUp,
} from 'lucide-react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import TransactionItem from '../components/TransactionItem';
import { styles } from './css/ReportScreenStyles';
import { COLORS } from '../theme/colors';
import { getFilteredTransactions, getMonthlyReport } from '../services/reportService';
import { generateAiAdvice, getAiAdviceHistory } from '../services/aiService';
import { getWallets } from '../services/walletService';

const REPORT_TYPE_OPTIONS = [
    { key: 'ALL', label: 'Tat ca' },
    { key: 'EXPENSE', label: 'Chi tieu' },
    { key: 'INCOME', label: 'Thu nhap' },
];

const CATEGORY_COLORS = {
    'An uong': '#F97316',
    'Di chuyen': '#10B981',
    'Mua sam': '#6366F1',
    'Hoc phi / Sach vo': '#8B5CF6',
    'Giai tri': '#D946EF',
    Khac: '#9CA3AF',
};

const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('vi-VN');
};

const getCurrentPeriod = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const formatPeriodLabel = (period) => {
    const [year, month] = period.split('-');
    return `Thang ${Number(month)} / ${year}`;
};

const shiftPeriod = (period, offset) => {
    const [yearText, monthText] = period.split('-');
    const baseDate = new Date(Number(yearText), Number(monthText) - 1 + offset, 1);
    return `${baseDate.getFullYear()}-${String(baseDate.getMonth() + 1).padStart(2, '0')}`;
};

const buildTrendPeriods = (period, count = 6) => (
    Array.from({ length: count }, (_, index) => shiftPeriod(period, index - (count - 1)))
);

const getPeriodBounds = (period) => {
    const [yearText, monthText] = period.split('-');
    const year = Number(yearText);
    const month = Number(monthText);
    const startDate = new Date(year, month - 1, 1, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    return {
        startDate: startDate.toISOString().slice(0, 19),
        endDate: endDate.toISOString().slice(0, 19),
    };
};

const toNumber = (value) => Number(value || 0);

const formatCompactMoney = (value) => {
    const amount = toNumber(value);
    if (Math.abs(amount) >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}M`;
    }
    return `${Math.round(amount).toLocaleString('vi-VN')}d`;
};

const formatMoney = (value) => `${Math.round(toNumber(value)).toLocaleString('vi-VN')}d`;

const calculateChangePercent = (currentValue, previousValue) => {
    const current = toNumber(currentValue);
    const previous = toNumber(previousValue);
    if (previous === 0) {
        return current === 0 ? 0 : 100;
    }
    return ((current - previous) / Math.abs(previous)) * 100;
};

const ReportScreen = ({ sessionMode }) => {
    const isGuest = sessionMode === 'guest';
    const currentPeriod = useMemo(() => getCurrentPeriod(), []);
    const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
    const [catStats, setCatStats] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [walletOptions, setWalletOptions] = useState([]);
    const [selectedWalletId, setSelectedWalletId] = useState(null);
    const [activeTrendTab, setActiveTrendTab] = useState('trend');
    const [reportDate, setReportDate] = useState({ month: '--', year: '----' });
    const [loading, setLoading] = useState(true);
    const [reportError, setReportError] = useState('');
    const [aiAdviceText, setAiAdviceText] = useState('Dang tai goi y AI...');
    const [aiAdviceSource, setAiAdviceSource] = useState('/api/ai/advice/history');
    const [isRefreshingAdvice, setIsRefreshingAdvice] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState(currentPeriod);
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [trendData, setTrendData] = useState([]);
    const [periodTransactions, setPeriodTransactions] = useState([]);
    const [expenseChangePercent, setExpenseChangePercent] = useState(0);
    const [incomeChangePercent, setIncomeChangePercent] = useState(0);

    const dynamicPieData = catStats.map((item) => ({
        name: item.name,
        population: item.spent,
        color: CATEGORY_COLORS[item.name] || '#CBD5E1',
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
    })).sort((left, right) => right.population - left.population);
    const pieData = dynamicPieData.filter((item) => Number(item.population) > 0);
    const hasPieData = pieData.length > 0;

    const screenWidth = Dimensions.get('window').width;
    const donutSize = Math.min(screenWidth - 120, 220);
    const chartConfig = {
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#fff',
        color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
        strokeWidth: 3,
        decimalPlaces: 1,
        labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
    };

    const loadWalletOptions = async () => {
        try {
            const wallets = await getWallets();
            setWalletOptions(wallets || []);
            setSelectedWalletId((current) => {
                if (current && wallets?.some((wallet) => wallet.id === current)) {
                    return current;
                }
                return null;
            });
        } catch (error) {
            console.warn('Loi tai danh sach vi:', error.message);
            setWalletOptions([]);
            setSelectedWalletId(null);
        }
    };

    const loadAiAdvice = async ({ forceRefresh = false } = {}) => {
        if (isGuest) {
            setAiAdviceText('Guest mode dang dung thong ke local. Dang nhap de xem AI advice.');
            setAiAdviceSource('guest-local');
            return;
        }

        if (typeFilter !== 'ALL') {
            setAiAdviceText('Goi y AI hien duoc hien theo tong quan ky. Chon "Tat ca" de xem.');
            setAiAdviceSource('filter-blocked');
            return;
        }

        setAiAdviceText('Dang tai goi y AI...');
        setAiAdviceSource('/api/ai/advice/generate');

        try {
            if (!forceRefresh) {
                const history = await getAiAdviceHistory();
                const matchedAdvice = history?.find((item) => item.period === selectedPeriod);

                if (matchedAdvice?.adviceText) {
                    setAiAdviceText(matchedAdvice.adviceText);
                    setAiAdviceSource('/api/ai/advice/history');
                    return;
                }
            }

            const generated = await generateAiAdvice({
                period: selectedPeriod,
                walletId: selectedWalletId,
            });
            setAiAdviceText(generated?.adviceText || 'Chua co goi y AI.');
            setAiAdviceSource('/api/ai/advice/generate');
        } catch (error) {
            setAiAdviceText(`Khong tai duoc goi y AI: ${error.message}`);
            setAiAdviceSource('error');
        }
    };

    const handleRegenerateAdvice = async () => {
        setIsRefreshingAdvice(true);
        try {
            await loadAiAdvice({ forceRefresh: true });
        } finally {
            setIsRefreshingAdvice(false);
        }
    };

    const fetchReportData = async () => {
        try {
            setLoading(true);
            setReportError('');
            const normalizedType = typeFilter === 'ALL' ? undefined : typeFilter;
            const walletId = selectedWalletId || undefined;
            const { startDate, endDate } = getPeriodBounds(selectedPeriod);
            const trendPeriods = buildTrendPeriods(selectedPeriod);

            const [responseData, filteredTransactions, trendReports] = await Promise.all([
                getMonthlyReport({ period: selectedPeriod, walletId, type: normalizedType }),
                getFilteredTransactions({ startDate, endDate, walletId, type: normalizedType }),
                Promise.all(
                    trendPeriods.map(async (period) => ({
                        period,
                        report: await getMonthlyReport({ period, walletId, type: normalizedType }),
                    }))
                ),
            ]);

            const totalIncome = toNumber(responseData.totalIncome);
            const totalExpense = toNumber(responseData.totalExpense);
            const balance = toNumber(responseData.balance);

            setReportDate({ month: responseData.month, year: responseData.year });
            setSummary({
                income: totalIncome,
                expense: totalExpense,
                balance,
            });
            setIncomeChangePercent(calculateChangePercent(totalIncome, responseData.previousMonthIncome));
            setExpenseChangePercent(calculateChangePercent(totalExpense, responseData.previousMonthExpense));

            const sourceCategories = typeFilter === 'INCOME'
                ? (responseData.incomeByCategoryChart || [])
                : (responseData.expenseByCategoryChart || []);
            const totalForCategory = typeFilter === 'INCOME' ? totalIncome : totalExpense;
            const calculatedCatStats = sourceCategories.map((item) => ({
                name: item.categoryName,
                spent: toNumber(item.total),
                percentage: totalForCategory > 0 ? (toNumber(item.total) / totalForCategory) * 100 : 0,
            }));
            setCatStats(calculatedCatStats);

            const nextAlerts = [];
            const topExpenseCategory = responseData.topExpenseCategories?.[0];
            const topIncomeCategory = responseData.topIncomeCategories?.[0];

            if (balance < 0) {
                nextAlerts.push(`Canh bao: Ky nay dang am ${formatMoney(Math.abs(balance))}.`);
            }

            if (typeFilter !== 'INCOME' && totalIncome > 0 && totalExpense > totalIncome) {
                nextAlerts.push(`Chi tieu da vuot thu nhap ${formatMoney(totalExpense - totalIncome)}.`);
            }

            if (typeFilter !== 'INCOME' && topExpenseCategory) {
                nextAlerts.push(`Hang muc chi nhieu nhat: ${topExpenseCategory.categoryName} (${formatMoney(topExpenseCategory.total)}).`);
            }

            if (typeFilter === 'INCOME' && topIncomeCategory) {
                nextAlerts.push(`Nguon thu noi bat: ${topIncomeCategory.categoryName} (${formatMoney(topIncomeCategory.total)}).`);
            }

            setAlerts(nextAlerts);
            setPeriodTransactions(filteredTransactions.slice(0, 5));
            setTrendData(trendReports.map(({ period, report }) => ({
                label: `T${Number(period.split('-')[1])}`,
                value: (typeFilter === 'INCOME' ? toNumber(report.totalIncome) : toNumber(report.totalExpense)) / 1000000,
            })));
        } catch (error) {
            console.warn('Loi tai report:', error.message);
            setReportError(error.message || 'Khong tai duoc bao cao.');
            setSummary({ income: 0, expense: 0, balance: 0 });
            setCatStats([]);
            setAlerts([]);
            setTrendData([]);
            setPeriodTransactions([]);
            setIncomeChangePercent(0);
            setExpenseChangePercent(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWalletOptions();
    }, [sessionMode]);

    useEffect(() => {
        fetchReportData();
    }, [selectedPeriod, sessionMode, typeFilter, selectedWalletId]);

    useEffect(() => {
        loadAiAdvice();
    }, [selectedPeriod, sessionMode, typeFilter, selectedWalletId]);

    const canGoNextPeriod = selectedPeriod !== currentPeriod;
    const periodTitle = formatPeriodLabel(selectedPeriod);
    const badgeChange = typeFilter === 'INCOME' ? incomeChangePercent : expenseChangePercent;

    return (
        <View style={styles.container}>
            <View style={styles.blueHeader}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => setSelectedPeriod((value) => shiftPeriod(value, -1))}
                >
                    <LucideChevronLeft color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>Bao cao tai chinh</Text>
                    <Text style={styles.headerSubtitle}>
                        {periodTitle}{isGuest ? ' • Guest' : ''}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.monthPicker, !canGoNextPeriod && styles.monthPickerDisabled]}
                    onPress={() => canGoNextPeriod && setSelectedPeriod((value) => shiftPeriod(value, 1))}
                    disabled={!canGoNextPeriod}
                >
                    <Text style={styles.monthText}>{reportDate.month}/{reportDate.year} </Text>
                    <LucideChevronRight size={14} color="#fff" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={{ marginTop: 10, color: COLORS.textSub }}>Dang phan tich...</Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                    {reportError ? (
                        <View style={[styles.alertCard, { backgroundColor: '#FEF2F2', marginTop: 20 }]}> 
                            <Text style={styles.alertText}>{`Khong tai duoc bao cao: ${reportError}`}</Text>
                        </View>
                    ) : null}

                    <View style={styles.walletFilterWrap}>
                        <Text style={styles.walletFilterTitle}>Pham vi bao cao</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.walletFilterRow}>
                            <TouchableOpacity
                                style={[styles.walletChip, selectedWalletId === null && styles.walletChipActive]}
                                onPress={() => setSelectedWalletId(null)}
                            >
                                <Text style={[styles.walletChipText, selectedWalletId === null && styles.walletChipTextActive]}>
                                    Tat ca vi
                                </Text>
                            </TouchableOpacity>
                            {walletOptions.map((wallet) => (
                                <TouchableOpacity
                                    key={wallet.id}
                                    style={[styles.walletChip, selectedWalletId === wallet.id && styles.walletChipActive]}
                                    onPress={() => setSelectedWalletId(wallet.id)}
                                >
                                    <Text style={[styles.walletChipText, selectedWalletId === wallet.id && styles.walletChipTextActive]}>
                                        {wallet.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.summaryRow}>
                        <View style={[styles.summaryCard, { backgroundColor: COLORS.primary }]}>
                            <Text style={styles.sumLabel}>Thu nhap</Text>
                            <Text style={styles.sumValue}>{formatCompactMoney(summary.income)}</Text>
                        </View>
                        <View style={[styles.summaryCard, { backgroundColor: `${COLORS.primary}CC` }]}>
                            <Text style={styles.sumLabel}>Chi tieu</Text>
                            <Text style={styles.sumValue}>{formatCompactMoney(summary.expense)}</Text>
                        </View>
                        <View style={[styles.summaryCard, { backgroundColor: summary.balance < 0 ? COLORS.danger : COLORS.success }]}>
                            <Text style={styles.sumLabel}>Can doi</Text>
                            <Text style={styles.sumValue}>{formatCompactMoney(summary.balance)}</Text>
                        </View>
                    </View>

                    <View style={styles.filterRow}>
                        {REPORT_TYPE_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.key}
                                style={[
                                    styles.filterChip,
                                    typeFilter === option.key && styles.filterChipActive,
                                ]}
                                onPress={() => setTypeFilter(option.key)}
                            >
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        typeFilter === option.key && styles.filterChipTextActive,
                                    ]}
                                >
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.whiteCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>
                                {typeFilter === 'INCOME' ? 'Phan bo thu nhap' : 'Phan bo chi tieu'}
                            </Text>
                            <Text style={[styles.badgeText, badgeChange > 0 && { color: COLORS.danger }]}>
                                {`${badgeChange >= 0 ? '+' : ''}${badgeChange.toFixed(0)}% vs thang truoc`}
                            </Text>
                        </View>
                        <View style={styles.mainProgressBg}>
                            <View
                                style={[
                                    styles.mainProgressFill,
                                    {
                                        width: `${Math.min(Math.max(Math.abs(badgeChange), 8), 100)}%`,
                                        backgroundColor: badgeChange > 0 ? COLORS.danger : COLORS.primary,
                                    },
                                ]}
                            />
                        </View>
                        <Text style={[styles.cardTitle, { marginTop: 15, fontSize: 14 }]}>Chi tiet hang muc</Text>
                        {catStats.length > 0 ? (
                            catStats.map((item, index) => (
                                <View key={`${item.name}-${index}`} style={styles.categoryProgressRow}>
                                    <Text style={styles.catLabel}>{item.name}</Text>
                                    <View style={styles.miniBarBg}>
                                        <View
                                            style={[
                                                styles.miniBarFill,
                                                {
                                                    width: `${Math.min(item.percentage, 100)}%`,
                                                    backgroundColor: CATEGORY_COLORS[item.name] || COLORS.primary,
                                                },
                                            ]}
                                        />
                                    </View>
                                    <Text style={styles.catPercent}>{item.percentage.toFixed(0)}%</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyStateText}>Chua co du lieu phan bo cho ky nay.</Text>
                        )}
                    </View>

                    <View style={styles.insightsCard}>
                        <View style={styles.insightHeader}>
                            <View style={styles.insightTitleRow}>
                                <View style={styles.insightIconBox}>
                                    <LucideTrendingUp size={18} color="#8B5CF6" />
                                </View>
                                <View>
                                    <Text style={styles.insightTitle}>Insights & Reports</Text>
                                    <Text style={styles.insightSub}>Du lieu truc quan</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.collapseBtn}>
                                <LucideChevronDown size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.trendTabContainer}>
                            <TouchableOpacity
                                style={[styles.trendTab, activeTrendTab === 'trend' && styles.trendTabActive]}
                                onPress={() => setActiveTrendTab('trend')}
                            >
                                <Text style={[styles.trendTabText, activeTrendTab === 'trend' && styles.trendTabTextActive]}>Xu huong</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.trendTab, activeTrendTab === 'breakdown' && styles.trendTabActive]}
                                onPress={() => setActiveTrendTab('breakdown')}
                            >
                                <Text style={[styles.trendTabText, activeTrendTab === 'breakdown' && styles.trendTabTextActive]}>Phan loai</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.chartContainer}>
                            {activeTrendTab === 'trend' ? (
                                trendData.length > 0 ? (
                                    <LineChart
                                        data={{
                                            labels: trendData.map((item) => item.label),
                                            datasets: [{ data: trendData.map((item) => item.value) }],
                                        }}
                                        width={screenWidth - 80}
                                        height={200}
                                        chartConfig={chartConfig}
                                        bezier
                                        style={styles.lineChartStyle}
                                    />
                                ) : (
                                    <View style={styles.emptyDonut}>
                                        <Text style={styles.donutCenterText}>Xu huong</Text>
                                        <Text style={styles.emptyDonutHint}>Khong co du lieu de ve bieu do</Text>
                                    </View>
                                )
                            ) : (
                                <View style={styles.donutContainer}>
                                    {hasPieData ? (
                                        <View style={styles.donutChartWrap}>
                                            <PieChart
                                                data={pieData}
                                                width={donutSize}
                                                height={donutSize}
                                                chartConfig={chartConfig}
                                                accessor="population"
                                                backgroundColor="transparent"
                                                paddingLeft="0"
                                                center={[0, 0]}
                                                absolute
                                                hasLegend={false}
                                            />
                                            <View style={styles.donutCenterLabel}>
                                                <Text style={styles.donutCenterText}>
                                                    {typeFilter === 'INCOME' ? 'Tong thu' : 'Tong chi'}
                                                </Text>
                                                <Text style={styles.donutCenterAmount}>
                                                    {formatCompactMoney(typeFilter === 'INCOME' ? summary.income : summary.expense)}
                                                </Text>
                                            </View>
                                        </View>
                                    ) : (
                                        <View style={styles.emptyDonut}>
                                            <Text style={styles.donutCenterText}>
                                                {typeFilter === 'INCOME' ? 'Tong thu' : 'Tong chi'}
                                            </Text>
                                            <Text style={styles.donutCenterAmount}>0d</Text>
                                            <Text style={styles.emptyDonutHint}>Chua co du lieu phan bo</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>
                        {activeTrendTab === 'breakdown' ? (
                            <View style={styles.customLegendContainer}>
                                {[...catStats].sort((left, right) => right.spent - left.spent).map((item, index) => (
                                    <View key={`${item.name}-${index}`} style={styles.legendRow}>
                                        <View style={styles.legendLeft}>
                                            <View style={[styles.legendDot, { backgroundColor: CATEGORY_COLORS[item.name] || '#CBD5E1' }]} />
                                            <Text style={styles.legendName}>{item.name}</Text>
                                        </View>
                                        <Text style={styles.legendPercent}>{item.percentage.toFixed(0)}%</Text>
                                    </View>
                                ))}
                            </View>
                        ) : null}
                    </View>

                    <View style={styles.sectionHeader}>
                        <LucideAlertTriangle size={18} color="#EF4444" />
                        <Text style={styles.sectionTitle}> Canh bao</Text>
                    </View>
                    {alerts.length > 0 ? alerts.map((message, index) => (
                        <View key={`${message}-${index}`} style={[styles.alertCard, { backgroundColor: '#FEF2F2' }]}>
                            <Text style={styles.alertText}>{message}</Text>
                        </View>
                    )) : (
                        <View style={[styles.alertCard, { backgroundColor: '#F0FDF4' }]}>
                            <Text style={[styles.alertText, { color: '#166534' }]}>Chi tieu an toan!</Text>
                        </View>
                    )}

                    <View style={styles.sectionHeader}>
                        <LucideTrendingUp size={18} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}> Giao dich trong ky</Text>
                    </View>
                    {periodTransactions.length > 0 ? (
                        periodTransactions.map((transaction) => (
                            <TransactionItem
                                key={transaction.id}
                                title={transaction.note || transaction.categoryName || 'Giao dich'}
                                amount={transaction.amount}
                                date={formatDate(transaction.transactionDate)}
                                category={transaction.categoryName || transaction.walletName}
                                type={transaction.type}
                            />
                        ))
                    ) : (
                        <View style={[styles.alertCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                            <Text style={[styles.alertText, { color: COLORS.primary }]}>Khong co giao dich nao trong ky nay.</Text>
                        </View>
                    )}

                    {!isGuest ? (
                        <>
                            <View style={styles.sectionHeaderBetween}>
                                <View style={styles.sectionHeaderInline}>
                                    <LucideLightbulb size={18} color="#10B981" />
                                    <Text style={styles.sectionTitle}> Goi y tu AI</Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.refreshAdviceButton, isRefreshingAdvice && styles.refreshAdviceButtonDisabled]}
                                    onPress={handleRegenerateAdvice}
                                    disabled={isRefreshingAdvice || typeFilter !== 'ALL'}
                                >
                                    <Text style={styles.refreshAdviceButtonText}>
                                        {isRefreshingAdvice ? 'Dang tao...' : 'Tao lai goi y AI'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity style={styles.suggestionCard}>
                                <View style={styles.suggestIcon}>
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>AI</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.suggestTitle}>{aiAdviceText}</Text>
                                    <Text style={styles.suggestAmount}>{`Nguon: ${aiAdviceSource}`}</Text>
                                </View>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View style={[styles.alertCard, { backgroundColor: '#EEF2FF' }]}>
                            <Text style={[styles.alertText, { color: COLORS.primary }]}>{aiAdviceText}</Text>
                        </View>
                    )}

                    <View style={{ height: 100 }} />
                </ScrollView>
            )}
        </View>
    );
};

export default ReportScreen;

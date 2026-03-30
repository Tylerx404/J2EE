import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import {
    LucideAlertTriangle,
    LucideChevronDown,
    LucideChevronLeft,
    LucideLightbulb,
    LucideTrendingUp,
} from 'lucide-react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { styles } from './css/ReportScreenStyles';
import { COLORS } from '../theme/colors';
import { getCurrentMonthReport } from '../services/reportService';
import { generateAiAdvice, getAiAdviceHistory } from '../services/aiService';

const GLOBAL_BUDGET = 5000000;
const CATEGORY_BUDGETS = {
    'An uong': 1500000,
    'Di chuyen': 800000,
    'Mua sam': 1200000,
    Khac: 500000,
};

const ReportScreen = ({ sessionMode }) => {
    const isGuest = sessionMode === 'guest';
    const [stats, setStats] = useState({ spent: 0, remaining: GLOBAL_BUDGET, percentage: 0 });
    const [catStats, setCatStats] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [activeTrendTab, setActiveTrendTab] = useState('trend');
    const [reportDate, setReportDate] = useState({ month: '--', year: '----' });
    const [loading, setLoading] = useState(true);
    const [aiAdviceText, setAiAdviceText] = useState('Dang tai goi y AI...');

    const trendData = [
        { month: 'T9', spent: 2.8, budget: 3.5 },
        { month: 'T10', spent: 3.1, budget: 3.5 },
        { month: 'T11', spent: 2.7, budget: 3.5 },
        { month: 'T12', spent: 4.0, budget: 3.5 },
        { month: 'T1', spent: 3.0, budget: 3.5 },
        { month: 'T2', spent: 2.2, budget: 3.5 },
    ];

    const CATEGORY_COLORS = {
        'An uong': '#F97316',
        'Di chuyen': '#10B981',
        'Mua sam': '#6366F1',
        'Hoc phi / Sach vo': '#8B5CF6',
        'Giai tri': '#D946EF',
        Khac: '#9CA3AF',
    };

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

    const fetchReportData = async () => {
        try {
            setLoading(true);
            const responseData = await getCurrentMonthReport();

            setReportDate({ month: responseData.month, year: responseData.year });
            setStats({
                spent: responseData.totalExpense,
                remaining: responseData.balance,
                percentage: Math.min((responseData.totalExpense / GLOBAL_BUDGET) * 100, 100),
            });

            const calculatedCatStats = responseData.expenseByCategoryChart.map((item) => ({
                name: item.categoryName,
                spent: item.total,
                percentage: (item.total / (CATEGORY_BUDGETS[item.categoryName] || 1000000)) * 100,
            }));
            setCatStats(calculatedCatStats);

            const nextAlerts = [];
            if (responseData.totalExpense > GLOBAL_BUDGET * 0.8) {
                nextAlerts.push(
                    `Canh bao: Ban da dung ${((responseData.totalExpense / GLOBAL_BUDGET) * 100).toFixed(0)}% tong ngan sach!`
                );
            }
            setAlerts(nextAlerts);

            if (isGuest) {
                setAiAdviceText('Guest mode dang dung thong ke local. Dang nhap de xem AI advice.');
                return;
            }

            const period = `${responseData.year}-${String(responseData.month).padStart(2, '0')}`;
            try {
                const history = await getAiAdviceHistory();
                const latestAdvice = history?.[0]?.adviceText;
                if (latestAdvice) {
                    setAiAdviceText(latestAdvice);
                } else {
                    const generated = await generateAiAdvice(period);
                    setAiAdviceText(generated?.adviceText || 'Chua co goi y AI.');
                }
            } catch (adviceError) {
                setAiAdviceText(`Khong tai duoc goi y AI: ${adviceError.message}`);
            }
        } catch (error) {
            console.warn('Loi tai report:', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, [sessionMode]);

    return (
        <View style={styles.container}>
            <View style={styles.blueHeader}>
                <TouchableOpacity style={styles.backBtn}>
                    <LucideChevronLeft color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>Bao cao & Ngan sach</Text>
                    <Text style={styles.headerSubtitle}>
                        Thang {reportDate.month} • {reportDate.year}{isGuest ? ' • Guest' : ''}
                    </Text>
                </View>
                <TouchableOpacity style={styles.monthPicker}>
                    <Text style={styles.monthText}>Thang {reportDate.month} </Text>
                    <LucideChevronDown size={14} color="#fff" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={{ marginTop: 10, color: COLORS.textSub }}>Dang phan tich...</Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                    <View style={styles.summaryRow}>
                        <View style={[styles.summaryCard, { backgroundColor: COLORS.primary }]}>
                            <Text style={styles.sumLabel}>Ngan sach</Text>
                            <Text style={styles.sumValue}>5.0M</Text>
                        </View>
                        <View style={[styles.summaryCard, { backgroundColor: `${COLORS.primary}CC` }]}>
                            <Text style={styles.sumLabel}>Da chi</Text>
                            <Text style={styles.sumValue}>{(stats.spent / 1000000).toFixed(1)}M</Text>
                        </View>
                        <View style={[styles.summaryCard, { backgroundColor: stats.remaining < 0 ? COLORS.danger : COLORS.textLight }]}>
                            <Text style={styles.sumLabel}>So du</Text>
                            <Text style={styles.sumValue}>{(stats.remaining / 1000000).toFixed(1)}M</Text>
                        </View>
                    </View>

                    <View style={styles.whiteCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Tinh trang ngan sach</Text>
                            <Text style={[styles.badgeText, stats.percentage > 80 && { color: COLORS.danger }]}>
                                {stats.percentage.toFixed(0)}% da dung
                            </Text>
                        </View>
                        <View style={styles.mainProgressBg}>
                            <View
                                style={[
                                    styles.mainProgressFill,
                                    {
                                        width: `${stats.percentage}%`,
                                        backgroundColor: stats.percentage > 80 ? COLORS.danger : COLORS.primary,
                                    },
                                ]}
                            />
                        </View>
                        <Text style={[styles.cardTitle, { marginTop: 15, fontSize: 14 }]}>Chi tiet hang muc</Text>
                        {catStats.map((item, index) => (
                            <View key={`${item.name}-${index}`} style={styles.categoryProgressRow}>
                                <Text style={styles.catLabel}>{item.name}</Text>
                                <View style={styles.miniBarBg}>
                                    <View
                                        style={[
                                            styles.miniBarFill,
                                            { width: `${Math.min(item.percentage, 100)}%`, backgroundColor: COLORS.primary },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.catPercent}>{item.percentage.toFixed(0)}%</Text>
                            </View>
                        ))}
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
                                <LineChart
                                    data={{ labels: trendData.map((item) => item.month), datasets: [{ data: trendData.map((item) => item.spent) }] }}
                                    width={screenWidth - 80}
                                    height={200}
                                    chartConfig={chartConfig}
                                    bezier
                                    style={styles.lineChartStyle}
                                />
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
                                                <Text style={styles.donutCenterText}>Tong chi</Text>
                                                <Text style={styles.donutCenterAmount}>{(stats.spent / 1000000).toFixed(1)}Md</Text>
                                            </View>
                                        </View>
                                    ) : (
                                        <View style={styles.emptyDonut}>
                                            <Text style={styles.donutCenterText}>Tong chi</Text>
                                            <Text style={styles.donutCenterAmount}>0.0Md</Text>
                                            <Text style={styles.emptyDonutHint}>Chua co du lieu chi tieu</Text>
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

                    {!isGuest ? (
                        <>
                            <View style={styles.sectionHeader}>
                                <LucideLightbulb size={18} color="#10B981" />
                                <Text style={styles.sectionTitle}> Goi y tu AI</Text>
                            </View>
                            <TouchableOpacity style={styles.suggestionCard}>
                                <View style={styles.suggestIcon}>
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>AI</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.suggestTitle} numberOfLines={2}>{aiAdviceText}</Text>
                                    <Text style={styles.suggestAmount}>Nguon: /api/ai/advice/history</Text>
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

// === SECTION 1: IMPORTS ===
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { LucideChevronLeft, LucideChevronDown, LucideAlertTriangle, LucideLightbulb, LucideTrendingUp } from 'lucide-react-native';
import { styles } from './css/ReportScreenStyles';
import { COLORS } from '../theme/colors';
import { LineChart, PieChart } from "react-native-chart-kit";
import { getCurrentMonthReportFromBackend } from '../services/reportService';
import { generateAiAdvice, getAiAdviceHistory } from '../services/aiService';

// === SECTION 2: CONSTANTS ===
const GLOBAL_BUDGET = 5000000;
const CATEGORY_BUDGETS = {
    "Ăn uống": 1500000,
    "Di chuyển": 800000,
    "Mua sắm": 1200000,
    "Khác": 500000
};

// === SECTION 3: COMPONENT LOGIC ===
const ReportScreen = () => {
    const [stats, setStats] = useState({ spent: 0, remaining: GLOBAL_BUDGET, percentage: 0 });
    const [catStats, setCatStats] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false, value: 0 });
    const [activeTrendTab, setActiveTrendTab] = useState('Xu hướng chi tiêu');
    const [reportDate, setReportDate] = useState({ month: '--', year: '----' });
    const [loading, setLoading] = useState(true);
    const [aiAdviceText, setAiAdviceText] = useState('Đang tải gợi ý AI...');

    // Dữ liệu mẫu cho LineChart (Chờ API xu hướng từ Backend)
    const trendData = [
        { month: 'T9', spent: 2.8, budget: 3.5 }, { month: 'T10', spent: 3.1, budget: 3.5 },
        { month: 'T11', spent: 2.7, budget: 3.5 }, { month: 'T12', spent: 4.0, budget: 3.5 },
        { month: 'T1', spent: 3.0, budget: 3.5 }, { month: 'T2', spent: 2.2, budget: 3.5 },
    ];

    const CATEGORY_COLORS = {
        "Ăn uống": "#F97316", "Di chuyển": "#10B981", "Mua sắm": "#6366F1",
        "Học tập": "#8B5CF6", "Giải trí": "#D946EF", "Khác": "#9CA3AF"
    };

    // Tự động tính toán dữ liệu Biểu đồ tròn từ catStats (dữ liệu thật từ Backend)
    const dynamicPieData = catStats.map(item => ({
        name: item.name,
        population: item.spent,
        color: CATEGORY_COLORS[item.name] || "#CBD5E1",
        legendFontColor: "#7F7F7F",
        legendFontSize: 12
    })).sort((a, b) => b.population - a.population);

    const screenWidth = Dimensions.get("window").width;
    const chartConfig = {
        backgroundGradientFrom: "#fff", backgroundGradientTo: "#fff",
        color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
        strokeWidth: 3, decimalPlaces: 1,
        labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
    };

    const lineData = {
        labels: trendData.map(d => d.month),
        datasets: [
            { data: trendData.map(d => d.spent), color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`, strokeWidth: 3 },
            { data: trendData.map(d => d.budget), color: (opacity = 1) => `rgba(229, 231, 235, ${opacity})`, strokeWidth: 2, withDots: false }
        ],
        legend: ["Chi tiêu", "Ngân sách"]
    };

    // Hàm lấy dữ liệu thật từ Backend
    const fetchReportData = async () => {
        try {
            setLoading(true);
            const responseData = await getCurrentMonthReportFromBackend();

            // 1. Cập nhật ngày tháng báo cáo
            setReportDate({ month: responseData.month, year: responseData.year });

            // 2. Cập nhật thẻ tóm tắt tổng quát
            setStats({
                spent: responseData.totalExpense,
                remaining: responseData.balance,
                percentage: Math.min((responseData.totalExpense / GLOBAL_BUDGET) * 100, 100)
            });

            // 3. Map danh sách thống kê hạng mục cho biểu đồ
            const calculatedCatStats = responseData.expenseByCategoryChart.map(item => ({
                name: item.categoryName,
                spent: item.total,
                percentage: (item.total / (CATEGORY_BUDGETS[item.categoryName] || 1000000)) * 100
            }));
            setCatStats(calculatedCatStats);

            // 4. Logic AI tạo Cảnh báo dựa trên ngân sách thật
            const newAlerts = [];
            if (responseData.totalExpense > GLOBAL_BUDGET * 0.8) {
                newAlerts.push(`Cảnh báo: Bạn đã dùng ${((responseData.totalExpense / GLOBAL_BUDGET) * 100).toFixed(0)}% tổng ngân sách!`);
            }
            setAlerts(newAlerts);

            const period = `${responseData.year}-${String(responseData.month).padStart(2, '0')}`;
            try {
                const history = await getAiAdviceHistory();
                const latestAdvice = history?.[0]?.adviceText;
                if (latestAdvice) {
                    setAiAdviceText(latestAdvice);
                } else {
                    const generated = await generateAiAdvice(period);
                    setAiAdviceText(generated?.adviceText || 'Chưa có gợi ý AI.');
                }
            } catch (adviceError) {
                setAiAdviceText(`Không tải được gợi ý AI: ${adviceError.message}`);
            }

        } catch (error) {
            console.warn("Lỗi kết nối Backend:", error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, []);

    // === SECTION 4: MAIN RENDER ===
    return (
        <View style={styles.container}>
            <View style={styles.blueHeader}>
                <TouchableOpacity style={styles.backBtn}><LucideChevronLeft color="#fff" /></TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>Báo cáo & Ngân sách</Text>
                    <Text style={styles.headerSubtitle}>Tháng {reportDate.month} • {reportDate.year}</Text>
                </View>
                <TouchableOpacity style={styles.monthPicker}>
                    <Text style={styles.monthText}>Tháng {reportDate.month} </Text>
                    <LucideChevronDown size={14} color="#fff" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={{ marginTop: 10, color: COLORS.textSub }}>Đang phân tích...</Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                    {/* THẺ TÓM TẮT */}
                    <View style={styles.summaryRow}>
                        <View style={[styles.summaryCard, { backgroundColor: COLORS.primary }]}><Text style={styles.sumLabel}>Ngân sách</Text><Text style={styles.sumValue}>5.0M</Text></View>
                        <View style={[styles.summaryCard, { backgroundColor: COLORS.primary + 'CC' }]}><Text style={styles.sumLabel}>Đã chi</Text><Text style={styles.sumValue}>{(stats.spent / 1000000).toFixed(1)}M</Text></View>
                        <View style={[styles.summaryCard, { backgroundColor: stats.remaining < 0 ? COLORS.danger : COLORS.textLight }]}><Text style={styles.sumLabel}>Số dư</Text><Text style={styles.sumValue}>{(stats.remaining / 1000000).toFixed(1)}M</Text></View>
                    </View>

                    {/* TÌNH TRẠNG NGÂN SÁCH */}
                    <View style={styles.whiteCard}>
                        <View style={styles.cardHeader}><Text style={styles.cardTitle}>Tình trạng ngân sách</Text><Text style={[styles.badgeText, stats.percentage > 80 && { color: COLORS.danger }]}>{stats.percentage.toFixed(0)}% đã dùng</Text></View>
                        <View style={styles.mainProgressBg}><View style={[styles.mainProgressFill, { width: `${stats.percentage}%`, backgroundColor: stats.percentage > 80 ? COLORS.danger : COLORS.primary }]} /></View>
                        <Text style={[styles.cardTitle, { marginTop: 15, fontSize: 14 }]}>Chi tiết hạng mục</Text>
                        {catStats.map((item, index) => (
                            <View key={index} style={styles.categoryProgressRow}>
                                <Text style={styles.catLabel}>{item.name}</Text>
                                <View style={styles.miniBarBg}><View style={[styles.miniBarFill, { width: `${Math.min(item.percentage, 100)}%`, backgroundColor: COLORS.primary }]} /></View>
                                <Text style={styles.catPercent}>{item.percentage.toFixed(0)}%</Text>
                            </View>
                        ))}
                    </View>

                    {/* AI INSIGHTS & CHARTS */}
                    <View style={styles.insightsCard}>
                        <View style={styles.insightHeader}>
                            <View style={styles.insightTitleRow}><View style={styles.insightIconBox}><LucideTrendingUp size={18} color="#8B5CF6" /></View><View><Text style={styles.insightTitle}>AI Insights & Reports</Text><Text style={styles.insightSub}>Dữ liệu trực quan</Text></View></View>
                            <TouchableOpacity style={styles.collapseBtn}><LucideChevronDown size={20} color="#9CA3AF" /></TouchableOpacity>
                        </View>
                        <View style={styles.trendTabContainer}>
                            <TouchableOpacity style={[styles.trendTab, activeTrendTab === 'Xu hướng chi tiêu' && styles.trendTabActive]} onPress={() => setActiveTrendTab('Xu hướng chi tiêu')}><Text style={[styles.trendTabText, activeTrendTab === 'Xu hướng chi tiêu' && styles.trendTabTextActive]}>Xu hướng</Text></TouchableOpacity>
                            <TouchableOpacity style={[styles.trendTab, activeTrendTab === 'Phân loại tháng' && styles.trendTabActive]} onPress={() => setActiveTrendTab('Phân loại tháng')}><Text style={[styles.trendTabText, activeTrendTab === 'Phân loại tháng' && styles.trendTabTextActive]}>Phân loại</Text></TouchableOpacity>
                        </View>
                        <View style={styles.chartContainer}>
                            {activeTrendTab === 'Xu hướng chi tiêu' ? (
                                <LineChart data={{ labels: trendData.map(d => d.month), datasets: [{ data: trendData.map(d => d.spent) }] }} width={screenWidth - 80} height={200} chartConfig={chartConfig} bezier style={styles.lineChartStyle} />
                            ) : (
                                <View style={styles.donutContainer}>
                                    <PieChart data={dynamicPieData.length > 0 ? dynamicPieData : [{ name: "Trống", population: 1, color: "#eee" }]} width={screenWidth - 40} height={220} chartConfig={chartConfig} accessor={"population"} backgroundColor={"transparent"} paddingLeft={"15"} center={[10, 0]} absolute hasLegend={false} />
                                    <View style={styles.donutCenterLabel}><Text style={styles.donutCenterText}>Tổng chi</Text><Text style={styles.donutCenterAmount}>{(stats.spent / 1000000).toFixed(1)}Mđ</Text></View>
                                </View>
                            )}
                        </View>
                        {activeTrendTab === 'Phân loại tháng' && (
                            <View style={styles.customLegendContainer}>
                                {catStats.sort((a, b) => b.spent - a.spent).map((item, index) => (
                                    <View key={index} style={styles.legendRow}>
                                        <View style={styles.legendLeft}><View style={[styles.legendDot, { backgroundColor: CATEGORY_COLORS[item.name] || "#CBD5E1" }]} /><Text style={styles.legendName}>{item.name}</Text></View>
                                        <Text style={styles.legendPercent}>{item.percentage.toFixed(0)}%</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* CẢNH BÁO & GỢI Ý (KHÔI PHỤC) */}
                    <View style={styles.sectionHeader}><LucideAlertTriangle size={18} color="#EF4444" /><Text style={styles.sectionTitle}> Cảnh báo</Text></View>
                    {alerts.length > 0 ? alerts.map((msg, i) => (<View key={i} style={[styles.alertCard, { backgroundColor: '#FEF2F2' }]}><Text style={styles.alertText}>{msg}</Text></View>))
                        : <View style={[styles.alertCard, { backgroundColor: '#F0FDF4' }]}><Text style={[styles.alertText, { color: '#166534' }]}>Chi tiêu an toàn!</Text></View>}

                    <View style={styles.sectionHeader}><LucideLightbulb size={18} color="#10B981" /><Text style={styles.sectionTitle}> Gợi ý từ AI</Text></View>
                    <TouchableOpacity style={styles.suggestionCard}>
                        <View style={styles.suggestIcon}><Text style={{ color: '#fff', fontWeight: 'bold' }}>AI</Text></View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.suggestTitle} numberOfLines={2}>{aiAdviceText}</Text>
                            <Text style={styles.suggestAmount}>Nguồn: /api/ai/advice/history</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={{ height: 100 }} />
                </ScrollView>
            )}
        </View>
    );
};

export default ReportScreen;

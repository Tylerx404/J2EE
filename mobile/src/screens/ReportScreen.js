// === SECTION 1: IMPORTS ===
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LucideChevronLeft, LucideChevronDown, LucideAlertTriangle, LucideLightbulb, LucideTrendingUp } from 'lucide-react-native';
import { styles } from './css/ReportScreenStyles';
import { COLORS } from '../theme/colors';
import { getTransactions } from '../services/transactionStorage';

import { LineChart, PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

// === SECTION 2: CONSTANTS & MOCK DATA ===
const GLOBAL_BUDGET = 5000000; // Ngân sách tổng: 5 triệu
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

    // START LOGIC CHO BIỂU ĐỒ XU HƯỚNG
    const [activeTrendTab, setActiveTrendTab] = useState('Xu hướng chi tiêu');
    const trendData = [
        { month: 'T9', spent: 2.8, budget: 3.5 },
        { month: 'T10', spent: 3.1, budget: 3.5 },
        { month: 'T11', spent: 2.7, budget: 3.5 },
        { month: 'T12', spent: 4.0, budget: 3.5 },
        { month: 'T1', spent: 3.0, budget: 3.5 },
        { month: 'T2', spent: 2.2, budget: 3.5 },
    ];
    // END LOGIC CHO BIỂU ĐỒ XU HƯỚNG

    // START DỮ LIỆU CHO BIỂU ĐỒ PHÂN LOẠI THÁNG
    const CATEGORY_COLORS = {
        "Ăn uống": "#F97316",
        "Di chuyển": "#10B981",
        "Mua sắm": "#6366F1",
        "Học tập": "#8B5CF6",
        "Giải trí": "#D946EF",
        "Khác": "#9CA3AF"
    };

    const dynamicPieData = catStats.map(item => ({
        name: item.name,
        population: item.spent,
        color: CATEGORY_COLORS[item.name] || "#CBD5E1",
        legendFontColor: "#7F7F7F",
        legendFontSize: 12
    })).sort((a, b) => b.population - a.population);
    // END DỮ LIỆU CHO BIỂU ĐỒ PHÂN LOẠI THÁNG

    // START CẤU HÌNH BIỂU ĐỒ LINE CHART
    const screenWidth = Dimensions.get("window").width;
    const chartConfig = {
        backgroundGradientFrom: "#fff", backgroundGradientTo: "#fff",
        color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
        strokeWidth: 3, decimalPlaces: 1,
        labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
        propsForDots: { r: "5", strokeWidth: "2", stroke: "#fff" },
        fillShadowGradientFrom: "#4F46E5", fillShadowGradientTo: "#fff", fillShadowGradientOpacity: 0.2,
    };
    const data = {
        labels: trendData.map(d => d.month),
        datasets: [
            { data: trendData.map(d => d.spent), color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`, strokeWidth: 3 },
            { data: trendData.map(d => d.budget), color: (opacity = 1) => `rgba(229, 231, 235, ${opacity})`, strokeWidth: 2, withDots: false }
        ],
        legend: ["Chi tiêu", "Ngân sách"]
    };
    // END CẤU HÌNH BIỂU ĐỒ LINE CHART

    useEffect(() => {
        const analyzeData = async () => {
            const txData = await getTransactions();

            // 1. Tính tổng chi tiêu
            const totalSpent = txData.reduce((sum, tx) => {
                const amount = parseInt(tx.amount.replace(/\./g, ''), 10) || 0;
                return sum + amount;
            }, 0);

            // 2. Phân tích theo từng hạng mục
            const categoryMap = {};
            txData.forEach(tx => {
                const amount = parseInt(tx.amount.replace(/\./g, ''), 10) || 0;
                categoryMap[tx.category] = (categoryMap[tx.category] || 0) + amount;
            });

            // 3. Chuyển Map thành mảng để vẽ biểu đồ
            const calculatedCatStats = Object.entries(categoryMap).map(([name, spent]) => {
                const budget = CATEGORY_BUDGETS[name] || 1000000;
                return {
                    name,
                    spent,
                    percentage: Math.min((spent / budget) * 100, 100)
                };
            });

            // 4. Logic AI tạo Cảnh báo
            const newAlerts = [];
            if (totalSpent > GLOBAL_BUDGET * 0.8) {
                newAlerts.push("Bạn đã tiêu hơn 80% tổng ngân sách tháng!");
            }
            if (categoryMap["Ăn uống"] > CATEGORY_BUDGETS["Ăn uống"] * 0.9) {
                newAlerts.push("Cảnh báo: Quỹ Ăn uống sắp cạn kiệt!");
            }

            setStats({
                spent: totalSpent,
                remaining: GLOBAL_BUDGET - totalSpent,
                percentage: Math.min((totalSpent / GLOBAL_BUDGET) * 100, 100)
            });
            setCatStats(calculatedCatStats);
            setAlerts(newAlerts);
        };
        analyzeData();
    }, []);

    const formatMoney = (num) => num.toLocaleString('vi-VN') + "đ";

    {/*// === SECTION 4: MAIN RENDER ===*/ }
    return (
        <View style={styles.container}>
            {/* Header: Báo cáo & Ngân sách */}
            <View style={styles.blueHeader}>
                <TouchableOpacity style={styles.backBtn}><LucideChevronLeft color="#fff" /></TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>Báo cáo & Ngân sách</Text>
                    <Text style={styles.headerSubtitle}>Tháng 2 • 2026</Text>
                </View>
                <TouchableOpacity style={styles.monthPicker}>
                    <Text style={styles.monthText}>Feb 2026 </Text>
                    <LucideChevronDown size={14} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>

                {/* START THẺ TÓM TẮT HÀNH ĐỘNG */}
                <View style={styles.summaryRow}>
                    <View style={[styles.summaryCard, { backgroundColor: COLORS.primary }]}>
                        <Text style={styles.sumLabel}>Ngân sách</Text>
                        <Text style={styles.sumValue}>5.0M</Text>
                    </View>
                    <View style={[styles.summaryCard, { backgroundColor: COLORS.primary + 'CC' }]}>
                        <Text style={styles.sumLabel}>Đã chi</Text>
                        <Text style={styles.sumValue}>{(stats.spent / 1000000).toFixed(1)}M</Text>
                    </View>
                    <View style={[styles.summaryCard, { backgroundColor: stats.remaining < 0 ? COLORS.danger : COLORS.textLight }]}>
                        <Text style={styles.sumLabel}>Còn lại</Text>
                        <Text style={styles.sumValue}>{(stats.remaining / 1000000).toFixed(1)}M</Text>
                    </View>
                </View>
                {/* END THẺ TÓM TẮT HÀNH ĐỘNG */}

                {/* START TÌNH TRẠNG NGÂN SÁCH */}
                {/* Biểu đồ Tổng quát */}
                <View style={styles.whiteCard}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Tình trạng ngân sách</Text>
                        <Text style={[styles.badgeText, stats.percentage > 80 && { color: COLORS.danger }]}>
                            {stats.percentage.toFixed(0)}% đã dùng
                        </Text>
                    </View>
                    <View style={styles.mainProgressBg}>
                        <View style={[
                            styles.mainProgressFill,
                            { width: `${stats.percentage}%`, backgroundColor: stats.percentage > 80 ? COLORS.danger : COLORS.primary }
                        ]} />
                    </View>

                    {/* Biểu đồ chi tiết theo hạng mục */}
                    <Text style={[styles.cardTitle, { marginTop: 10, fontSize: 14 }]}>Chi tiết theo hạng mục</Text>
                    {catStats.map((item, index) => (
                        <View key={index} style={styles.categoryProgressRow}>
                            <Text style={styles.catLabel}>{item.name}</Text>
                            <View style={styles.miniBarBg}>
                                <View style={[
                                    styles.miniBarFill,
                                    { width: `${item.percentage}%`, backgroundColor: COLORS.primary }
                                ]} />
                            </View>
                            <Text style={styles.catPercent}>{item.percentage.toFixed(0)}%</Text>
                        </View>
                    ))}
                </View>
                {/* END TÌNH TRẠNG NGÂN SÁCH */}






                {/* START PHẦN AI INSIGHTS & BIỂU ĐỒ TỔNG HỢP */}
                <View style={styles.insightsCard}>
                    <View style={styles.insightHeader}>
                        <View style={styles.insightTitleRow}>
                            <View style={styles.insightIconBox}><LucideTrendingUp size={18} color="#8B5CF6" /></View>
                            <View><Text style={styles.insightTitle}>AI Insights & Reports</Text><Text style={styles.insightSub}>Nhấn để thu gọn</Text></View>
                        </View>
                        <TouchableOpacity style={styles.collapseBtn}><LucideChevronDown size={20} color="#9CA3AF" /></TouchableOpacity>
                    </View>

                    <View style={styles.trendTabContainer}>
                        <TouchableOpacity style={[styles.trendTab, activeTrendTab === 'Xu hướng chi tiêu' && styles.trendTabActive]} onPress={() => setActiveTrendTab('Xu hướng chi tiêu')}>
                            <Text style={[styles.trendTabText, activeTrendTab === 'Xu hướng chi tiêu' && styles.trendTabTextActive]}>Xu hướng chi tiêu</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.trendTab, activeTrendTab === 'Phân loại tháng' && styles.trendTabActive]} onPress={() => setActiveTrendTab('Phân loại tháng')}>
                            <Text style={[styles.trendTabText, activeTrendTab === 'Phân loại tháng' && styles.trendTabTextActive]}>Phân loại tháng</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.chartUnit}>{activeTrendTab === 'Xu hướng chi tiêu' ? 'triệu đồng / tháng' : 'Tỷ lệ % chi tiêu'}</Text>

                    <View style={styles.chartContainer}>
                        {activeTrendTab === 'Xu hướng chi tiêu' ? (
                            <View>
                                <LineChart
                                    data={data} width={screenWidth - 80} height={200}
                                    chartConfig={chartConfig} bezier style={styles.lineChartStyle}
                                    withVerticalLines={false} fromZero={true}
                                    onDataPointClick={(d) => setTooltipPos({ x: d.x, y: d.y, value: d.value, visible: tooltipPos.x !== d.x || !tooltipPos.visible })}
                                />
                                {tooltipPos.visible && (
                                    <View style={[styles.tooltipBox, { top: tooltipPos.y - 40, left: tooltipPos.x - 30 }]}><Text style={styles.tooltipText}>{tooltipPos.value}Mđ</Text></View>
                                )}
                            </View>
                        ) : (
                            <View style={styles.donutContainer}>
                                <PieChart
                                    data={dynamicPieData.length > 0 ? dynamicPieData : [{ name: "Trống", population: 1, color: "#eee" }]}
                                    width={screenWidth - 40} height={220} chartConfig={chartConfig}
                                    accessor={"population"} backgroundColor={"transparent"} paddingLeft={"15"} center={[10, 0]} absolute hasLegend={false}
                                />
                                <View style={styles.donutCenterLabel}><Text style={styles.donutCenterText}>Tổng chi</Text><Text style={styles.donutCenterAmount}>{(stats.spent / 1000000).toFixed(1)}Mđ</Text></View>
                            </View>
                        )}
                    </View>

                    {/* HIỂN THỊ DANH SÁCH HẠNG MỤC (LEGEND) KHI Ở TAB PHÂN LOẠI */}
                    {activeTrendTab === 'Phân loại tháng' && (
                        <View style={styles.customLegendContainer}>
                            {catStats.sort((a, b) => b.spent - a.spent).map((item, index) => (
                                <View key={index} style={styles.legendRow}>
                                    <View style={styles.legendLeft}>
                                        <View style={[styles.legendDot, { backgroundColor: CATEGORY_COLORS[item.name] || "#CBD5E1" }]} />
                                        <Text style={styles.legendName}>{item.name}</Text>
                                    </View>
                                    <Text style={styles.legendPercent}>{item.percentage.toFixed(0)}%</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
                {/* END PHẦN AI INSIGHTS & BIỂU ĐỒ TỔNG HỢP */}

                <View style={styles.chartContainer}>
                    {activeTrendTab === 'Xu hướng chi tiêu' ? (
                        // Giữ nguyên LineChart cũ ở đây
                        <LineChart
                            data={data}
                            width={screenWidth - 80}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.lineChartStyle}
                        />
                    ) : (
                        // Render PieChart cho tab Phân loại tháng
                        <View style={styles.donutContainer}>
                            <PieChart
                                data={pieData}
                                width={screenWidth - 40}
                                height={220}
                                chartConfig={pieChartConfig}
                                accessor={"population"}
                                backgroundColor={"transparent"}
                                paddingLeft={"15"}
                                center={[10, 0]}
                                absolute // Hiển thị số phần trăm tuyệt đối
                                hasLegend={false} // Tắt legend mặc định để tự làm legend đẹp hơn
                            />
                            {/* START NHÃN TỔNG CHI Ở GIỮA BIỂU ĐỒ */}
                            <View style={styles.donutCenterLabel}>
                                <Text style={styles.donutCenterText}>Tổng chi</Text>
                                <Text style={styles.donutCenterAmount}>2.1Mđ</Text>
                            </View>
                            {/* END NHÃN TỔNG CHI Ở GIỮA BIỂU ĐỒ */}
                        </View>
                    )}
                </View>

                {/* START CUSTOM LEGEND CHO PIE CHART */}
                {activeTrendTab === 'Phân loại tháng' && (
                    <View style={styles.customLegendContainer}>
                        {pieData.map((item, index) => (
                            <View key={index} style={styles.legendRow}>
                                <View style={styles.legendLeft}>
                                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                                    <Text style={styles.legendName}>{item.name}</Text>
                                </View>
                                <Text style={styles.legendPercent}>{item.population}%</Text>
                            </View>
                        ))}
                    </View>
                )}
                {/* END CUSTOM LEGEND CHO PIE CHART */}

                {/* START GỢI Ý TỪ AI (FIX CỨNG ĐỂ TEST) */}
                {/* 3. Cảnh báo từ AI */}
                <View style={styles.sectionHeader}>
                    <LucideAlertTriangle size={18} color="#EF4444" />
                    <Text style={styles.sectionTitle}> Cảnh báo</Text>
                    <View style={styles.countBadge}><Text style={styles.countText}>3</Text></View>
                </View>

                <View style={[styles.alertCard, { backgroundColor: '#FEF2F2', borderColor: '#FEE2E2' }]}>
                    <Text style={styles.alertText}>Bạn đã xài 80% ngân sách Ăn uống!</Text>
                    <Text style={styles.alertSub}>960,000 / 1,200,000đ đã chi</Text>
                </View>

                {/* 4. Gợi ý từ AI */}
                <View style={styles.sectionHeader}>
                    <LucideLightbulb size={18} color="#10B981" />
                    <Text style={styles.sectionTitle}> Gợi ý từ AI</Text>
                </View>

                <TouchableOpacity style={styles.suggestionCard}>
                    <View style={styles.suggestIcon}><Text style={{ color: '#fff' }}>1</Text></View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.suggestTitle}>Thử giảm chi phí Café để đạt mục tiêu tiết kiệm</Text>
                        <Text style={styles.suggestAmount}>~180,000đ/tháng</Text>
                    </View>
                </TouchableOpacity>
                {/* END GỢI Ý TỪ AI */}

                {/* START CẢNH BÁO AI (DÙNG DỮ LIỆU THẬT)*/}
                {alerts.length > 0 && (
                    <View>
                        <View style={styles.sectionHeader}>
                            <LucideAlertTriangle size={18} color={COLORS.danger} />
                            <Text style={styles.sectionTitle}> Cảnh báo AI</Text>
                        </View>
                        {alerts.map((msg, index) => (
                            <View key={index} style={styles.alertCard}>
                                <Text style={styles.alertText}>{msg}</Text>
                            </View>
                        ))}
                    </View>
                )}
                {/* END CẢNH BÁO AI */}

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

export default ReportScreen;
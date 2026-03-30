// === SECTION 1: IMPORTS ===
import { StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';

// === SECTION 2: STYLE DEFINITIONS ===
export const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },

    // Header xanh bao phủ
    blueHeader: { backgroundColor: COLORS.primary, padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, paddingBottom: 40 },
    headerInfo: { flex: 1, paddingHorizontal: 15 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    headerSubtitle: { color: COLORS.primaryLight, fontSize: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    monthPicker: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
    monthPickerDisabled: { opacity: 0.45 },
    monthText: { color: '#fff', fontSize: 12 },

    content: { padding: 16 },

    // Hàng tóm tắt nằm trong Header
    summaryRow: { flexDirection: 'row', gap: 10, marginTop: -8, marginBottom: 20 },
    summaryCard: { flex: 1, padding: 12, borderRadius: 20, elevation: 4 },
    sumLabel: { color: '#fff', fontSize: 10, opacity: 0.8 },
    sumValue: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 4 },
    filterRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    filterChip: {
        flex: 1,
        borderRadius: 14,
        paddingVertical: 10,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    filterChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterChipText: { color: COLORS.textSub, fontSize: 13, fontWeight: '600' },
    filterChipTextActive: { color: '#fff' },

    // Thẻ trắng đè lên Header (Overlap effect)
    whiteCard: { backgroundColor: COLORS.cardBg, padding: 20, borderRadius: 24, marginBottom: 20, elevation: 2, marginTop: 0 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textMain },
    badgeText: { fontSize: 12, color: COLORS.primary, backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },

    // Progress Bars
    mainProgressBg: { height: 12, backgroundColor: COLORS.border, borderRadius: 6, marginVertical: 15, overflow: 'hidden' },
    mainProgressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 6 },

    categoryProgressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    catLabel: { width: 70, fontSize: 12, color: COLORS.textSub },
    miniBarBg: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3, marginHorizontal: 10, overflow: 'hidden' },
    miniBarFill: { height: '100%', borderRadius: 3 },
    catPercent: { width: 30, fontSize: 12, color: COLORS.textLight, textAlign: 'right' },
    emptyStateText: { marginTop: 14, color: COLORS.textSub, fontSize: 13 },

    // Alerts & Suggestions
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 10 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textMain },

    countBadge: { backgroundColor: COLORS.dangerLight, width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
    countText: { color: COLORS.danger, fontSize: 12, fontWeight: 'bold' },

    alertCard: { padding: 16, borderRadius: 20, borderLeftWidth: 4, borderColor: COLORS.dangerLight, marginBottom: 10, backgroundColor: COLORS.dangerLight },
    alertText: { fontWeight: 'bold', color: COLORS.danger },
    alertSub: { fontSize: 12, color: COLORS.danger, marginTop: 4 },

    suggestionCard: { flexDirection: 'row', backgroundColor: COLORS.successLight, padding: 16, borderRadius: 20, alignItems: 'center', gap: 12 },
    suggestIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.success, justifyContent: 'center', alignItems: 'center' },
    suggestTitle: { fontSize: 14, color: COLORS.success, fontWeight: '500' },
    suggestAmount: { fontSize: 12, color: COLORS.success, marginTop: 2 },

    // START SECTION: AI INSIGHTS & TREND CHART
    insightsCard: { backgroundColor: '#fff', marginHorizontal: 0, borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, marginBottom: 20 },
    insightHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    insightTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    insightIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F3FF', justifyContent: 'center', alignItems: 'center' },
    insightTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
    insightSub: { fontSize: 12, color: '#9CA3AF' },
    collapseBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center' },
    trendTabContainer: { flexDirection: 'row', backgroundColor: '#F9FAFB', borderRadius: 16, padding: 4, marginBottom: 20 },
    trendTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
    trendTabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    trendTabText: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },
    trendTabTextActive: { color: '#4F46E5', fontWeight: 'bold' },
    chartUnit: { fontSize: 11, color: '#9CA3AF', marginBottom: 10 },
    chartPlaceholder: { flexDirection: 'row', height: 160, alignItems: 'flex-end' },
    yAxis: { height: '100%', justifyContent: 'space-between', paddingRight: 10, paddingBottom: 20 },
    chartArea: { flex: 1, height: '100%' },
    mockChartLine: { flex: 1, borderBottomWidth: 1, borderColor: '#F3F4F6', borderStyle: 'dashed' },
    xAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    axisLabel: { fontSize: 10, color: '#9CA3AF' },
    legendContainer: { flexDirection: 'row', gap: 20, marginTop: 20, justifyContent: 'center' },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendLine: { width: 20, height: 3, borderRadius: 2 },
    legendText: { fontSize: 11, color: '#9CA3AF' },
    chartContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    lineChartStyle: { marginVertical: 8, borderRadius: 16 },
    tooltipBox: { position: 'absolute', backgroundColor: '#1F2937', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
    tooltipText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

    // BIỂU ĐỒ TRÒN DONUT
    donutContainer: { alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: 240 },
    donutChartWrap: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center', position: 'relative' },
    donutCenterLabel: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center'
    },
    donutCenterText: { fontSize: 12, color: '#9CA3AF' },
    donutCenterAmount: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
    emptyDonut: {
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 14,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        alignItems: 'center',
        justifyContent: 'center'
    },
    emptyDonutHint: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
    customLegendContainer: { marginTop: 20, paddingHorizontal: 10 },
    legendRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    legendLeft: { flexDirection: 'row', alignItems: 'center' },
    legendDot: { width: 12, height: 12, borderRadius: 4, marginRight: 10 },
    legendName: { fontSize: 14, color: '#4B5563' },
    legendPercent: { fontSize: 14, fontWeight: 'bold', color: '#1F2937' },
});

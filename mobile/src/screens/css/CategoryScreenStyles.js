// === SECTION 1: IMPORTS ===
import { StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';

// === SECTION 2: STYLE DEFINITIONS ===
export const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    blueHeader: { backgroundColor: COLORS.primary, padding: 20, paddingTop: 50, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingBottom: 30 },
    headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    headerSub: { color: COLORS.primaryLight, fontSize: 13, marginTop: 4 },
    createBtn: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', padding: 15, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', borderStyle: 'dashed', marginBottom: 20 },
    createBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
    iconPlusBox: { backgroundColor: COLORS.cardBg, borderRadius: 8, padding: 2 },
    tabRow: { flexDirection: 'row', gap: 10 },
    tabActive: { backgroundColor: COLORS.cardBg, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
    tabInactive: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
    tabTextActive: { color: COLORS.primary, fontWeight: 'bold' },
    tabTextInactive: { color: '#fff', fontWeight: 'bold' },
    searchContainer: { padding: 20, marginTop: -25 },
    searchBar: { flexDirection: 'row', backgroundColor: COLORS.cardBg, padding: 15, borderRadius: 16, alignItems: 'center', elevation: 2 },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: COLORS.textMain },
    listHeader: { paddingHorizontal: 20, marginBottom: 15 },
    listTitle: { color: COLORS.textSub, fontSize: 12, fontWeight: 'bold' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15, justifyContent: 'space-between' },
    card: { width: '48%', backgroundColor: COLORS.cardBg, padding: 20, borderRadius: 24, alignItems: 'center', marginBottom: 15, elevation: 1 },
    moreBtn: { position: 'absolute', top: 15, right: 15 },
    iconBox: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    catName: { fontSize: 16, fontWeight: 'bold', color: COLORS.textMain, marginBottom: 5 },
    txCount: { fontSize: 12, color: COLORS.textLight, marginBottom: 15 },
    badgeAuto: { flexDirection: 'row', backgroundColor: COLORS.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignItems: 'center', gap: 4 },
    badgeManual: { flexDirection: 'row', backgroundColor: COLORS.background, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignItems: 'center', gap: 4 },
    badgeTextAuto: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },
    badgeTextManual: { color: COLORS.textSub, fontSize: 12, fontWeight: '600' }
});
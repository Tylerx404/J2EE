// === SECTION 1: IMPORTS ===
import { StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';

// === SECTION 2: STYLE DEFINITIONS ===
export const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    blueHeader: { backgroundColor: COLORS.primary, padding: 20, paddingTop: 50, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    headerTitleBox: { flex: 1, marginLeft: 15 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    headerSubtitle: { color: COLORS.primaryLight, fontSize: 12, marginTop: 4 },
    totalBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignItems: 'flex-end' },
    totalLabel: { color: COLORS.primaryLight, fontSize: 10 },
    totalText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    chipRow: { flexDirection: 'row', gap: 10 },
    chipOutline: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
    chipActive: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    chipTextWhite: { color: '#fff', fontSize: 13, fontWeight: '500', marginLeft: 6 },
    chipTextDark: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
    searchSection: { padding: 20, paddingBottom: 10 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, paddingHorizontal: 16, height: 48, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: COLORS.textMain },
    list: { paddingHorizontal: 20 },
    sortHint: { fontSize: 12, color: COLORS.textLight, fontWeight: '600', marginBottom: 15 },
    groupTitle: { fontSize: 13, fontWeight: 'bold', color: COLORS.textSub, marginTop: 10, marginBottom: 10 }
});
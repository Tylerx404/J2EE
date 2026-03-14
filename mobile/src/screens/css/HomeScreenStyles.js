// === SECTION 1: IMPORTS ===
import { StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';

// === SECTION 2: STYLE DEFINITIONS ===
export const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { padding: 20, backgroundColor: COLORS.primary, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, paddingTop: 60 },
    welcomeText: { color: '#fff', fontSize: 18, marginBottom: 15 },
    balanceCard: { backgroundColor: COLORS.cardBg, padding: 20, borderRadius: 20, elevation: 5 },
    balanceAmount: { fontSize: 32, fontWeight: 'bold', color: COLORS.textMain },
    historyContainer: { paddingHorizontal: 20, paddingBottom: 20 },
    historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 15, color: COLORS.textMain },
    micWrapper: { alignItems: 'center', marginTop: 20, marginBottom: 40 },
    micButton: { backgroundColor: COLORS.primary, width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
    micRing: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primaryLight, top: -10 },
    micHint: { marginTop: 15, fontWeight: '600', color: COLORS.textMain },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: COLORS.cardBg, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, alignItems: 'center' },
    modalHandle: { width: 40, height: 4, backgroundColor: COLORS.border, borderRadius: 2, marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textMain, marginBottom: 20 },
    inputField: { width: '100%', backgroundColor: COLORS.background, padding: 16, borderRadius: 16, marginBottom: 20 },
    fieldValue: { fontSize: 16, fontWeight: '600', color: COLORS.textMain },
    btnSave: { width: '100%', backgroundColor: COLORS.success, padding: 16, borderRadius: 16, alignItems: 'center' },
    btnTextSave: { color: '#fff', fontWeight: 'bold' },
});
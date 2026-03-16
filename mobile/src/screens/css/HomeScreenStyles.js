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
    amountBox: { backgroundColor: '#F8F9FA', padding: 20, borderRadius: 15, alignItems: 'center', marginVertical: 15, borderWidth: 1, borderColor: '#EEEEEE', },
    amountLabel: { fontSize: 12, color: '#6C757D', fontWeight: 'bold', letterSpacing: 1 },
    amountValue: { fontSize: 32, color: COLORS.primary, fontWeight: '800', marginTop: 5 },
    noteBox: { paddingHorizontal: 10, marginBottom: 20 },
    noteLabel: { fontSize: 12, color: '#6C757D', marginBottom: 5 },
    noteValue: { fontSize: 16, color: '#212529', fontWeight: '500' },
    btnConfirm: { backgroundColor: COLORS.primary, paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginTop: 10, },
    btnTextConfirm: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    btnCancel: { paddingVertical: 15, alignItems: 'center' },
    btnTextCancel: { color: '#6C757D', fontSize: 14 },
});
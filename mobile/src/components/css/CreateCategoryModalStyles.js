// === SECTION 1: IMPORTS ===
import { StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';

// === SECTION 2: STYLE DEFINITIONS ===
export const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    content: { backgroundColor: COLORS.cardBg, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 24, paddingTop: 16, height: '90%' },
    handle: { width: 40, height: 4, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 20, fontWeight: 'bold', color: COLORS.textMain },
    subtitle: { color: COLORS.textSub, marginTop: 4, fontSize: 13 },
    closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
    previewCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 24 },
    previewIconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    previewName: { fontSize: 18, fontWeight: 'bold', color: COLORS.textMain, marginBottom: 4 },
    typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    typeBadgeText: { fontSize: 12, color: COLORS.primary, fontWeight: '500' },
    sectionLabel: { fontSize: 12, fontWeight: 'bold', color: COLORS.textSub, marginBottom: 12, marginTop: 10, letterSpacing: 0.5 },
    input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 16, fontSize: 16, color: COLORS.textMain, marginBottom: 24 },
    iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
    iconBox: { width: 50, height: 50, borderRadius: 16, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
    colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
    colorOuter: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
    colorInner: { width: 30, height: 30, borderRadius: 15 },
    typeRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
    typeCard: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 16, backgroundColor: COLORS.cardBg },
    typeCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
    typeCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    typeTitle: { fontWeight: 'bold', color: COLORS.textMain, fontSize: 15 },
    typeDesc: { fontSize: 12, color: COLORS.textSub, lineHeight: 18 },
    createBtn: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 16, alignItems: 'center' },
    createBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
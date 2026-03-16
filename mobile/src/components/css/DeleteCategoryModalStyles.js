// === SECTION 1: IMPORTS ===
import { StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';

// === SECTION 2: STYLE DEFINITIONS ===
export const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    content: { backgroundColor: COLORS.cardBg, borderRadius: 24, padding: 24, alignItems: 'center', width: '100%' },
    iconBg: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.dangerLight, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 20, fontWeight: 'bold', color: COLORS.textMain, marginBottom: 8 },
    subtitle: { fontSize: 14, color: COLORS.textSub, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
    boldText: { fontWeight: 'bold', color: COLORS.textMain },
    buttonRow: { flexDirection: 'row', gap: 12 },
    btnCancel: { flex: 1, backgroundColor: COLORS.background, paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
    btnDelete: { flex: 1, backgroundColor: COLORS.danger, paddingVertical: 14, borderRadius: 16, alignItems: 'center', shadowColor: COLORS.danger, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    btnTextCancel: { color: COLORS.textSub, fontSize: 16, fontWeight: 'bold' },
    btnTextDelete: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
// === SECTION 1: IMPORTS ===
import { StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';

// === SECTION 2: STYLE DEFINITIONS ===
export const styles = StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, padding: 16, borderRadius: 20, marginBottom: 12 },
    iconWrapper: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    info: { flex: 1 },
    title: { fontSize: 16, fontWeight: '600', color: COLORS.textMain },
    date: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
    amount: { fontSize: 16, fontWeight: 'bold', color: COLORS.danger }
});
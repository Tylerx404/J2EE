import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import {
    LucideCircleHelp,
    LucideDownload,
    LucideLogOut,
    LucideMail,
    LucideShield,
    LucideSparkles,
    LucideTrash2,
    LucideUser,
} from 'lucide-react-native';
import { logout } from '../services/authService';
import { getGuestProfileSummary } from '../data/guest/profileSummary';
import { getGuestImportSummary, hasPendingGuestImport, importGuestDataToBackend } from '../data/guest/import';
import {
    changePasswordOnBackend,
    deleteAccountOnBackend,
    getUserProfileFromBackend,
    updateUserProfileOnBackend,
} from '../services/userService';
import { COLORS } from '../theme/colors';

const IMPORT_STATE_LABELS = {
    none: 'Chưa có yêu cầu import',
    pending: 'Đã chuẩn bị import local',
    imported: 'Đã import dữ liệu local lên server',
    later: 'Đã hẹn import sau',
    keep_separate: 'Đang giữ riêng dữ liệu local',
};

const StatPill = ({ label, value }) => (
    <View style={styles.statPill}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const SectionHeader = ({ icon, title, subtitle }) => (
    <View style={styles.sectionHeaderWrap}>
        <View style={styles.sectionHeaderIcon}>{icon}</View>
        <View style={styles.sectionHeaderTextWrap}>
            <Text style={styles.cardTitle}>{title}</Text>
            {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
        </View>
    </View>
);

const GuestProfileCard = ({
    summary,
    loading,
    onGoToLogin,
    onGoToRegister,
    onContinueLocal,
}) => (
    <>
        <View style={[styles.card, styles.heroCard]}>
            <View style={styles.heroBadge}>
                <LucideSparkles size={16} color={COLORS.primary} />
                <Text style={styles.heroBadgeText}>Guest local mode</Text>
            </View>
            <Text style={styles.heroTitle}>Bạn đang quản lý dữ liệu ngay trên thiết bị này</Text>
            <Text style={styles.infoText}>
                Đăng nhập để đồng bộ dữ liệu nhiều thiết bị, dùng profile backend, voice/AI và các tính năng nâng cao hơn.
            </Text>
            <View style={styles.actionColumn}>
                <TouchableOpacity style={styles.primaryButton} onPress={onGoToLogin}>
                    <Text style={styles.primaryButtonText}>Đăng nhập</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={onGoToRegister}>
                    <Text style={styles.secondaryButtonText}>Đăng ký</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.linkGhostButton} onPress={onContinueLocal}>
                    <Text style={styles.linkGhostText}>Tiếp tục dùng local</Text>
                </TouchableOpacity>
            </View>
        </View>

        <View style={styles.card}>
            <SectionHeader
                icon={<LucideUser size={16} color={COLORS.primary} />}
                title="Tổng quan dữ liệu local"
                subtitle="Đây là các dữ liệu hiện đang được lưu trên máy"
            />
            {loading ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
            ) : (
                <>
                    <View style={styles.statsRow}>
                        <StatPill label="Ví" value={summary.walletCount} />
                        <StatPill label="Danh mục" value={summary.categoryCount} />
                        <StatPill label="Giao dịch" value={summary.transactionCount} />
                    </View>
                    <View style={styles.stateBox}>
                        <Text style={styles.stateLabel}>Trạng thái import</Text>
                        <Text style={styles.stateValue}>{IMPORT_STATE_LABELS[summary.importState] || summary.importState}</Text>
                    </View>
                </>
            )}
        </View>

        <View style={styles.card}>
            <SectionHeader
                icon={<LucideCircleHelp size={16} color={COLORS.primary} />}
                title="Khi nào cần đăng nhập"
                subtitle="Bạn có thể tiếp tục guest và quyết định việc import sau"
            />
            <Text style={styles.infoText}>Dữ liệu SQLite local vẫn được giữ nguyên nếu bạn chỉ vào login/register rồi quay lại.</Text>
            <Text style={styles.infoText}>Sau khi đăng nhập backend, app sẽ hỏi bạn có muốn xử lý dữ liệu local hay không.</Text>
        </View>
    </>
);

const ProfileScreen = ({
    sessionMode,
    onGoToLogin,
    onGoToRegister,
    onContinueLocal,
    onLogout,
}) => {
    const isFocused = useIsFocused();
    const isGuest = sessionMode === 'guest';
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState(null);
    const [guestSummary, setGuestSummary] = useState({
        walletCount: 0,
        categoryCount: 0,
        transactionCount: 0,
        importState: 'none',
    });
    const [syncInfo, setSyncInfo] = useState({
        hasPending: false,
        importedAt: null,
    });
    const [isSyncing, setIsSyncing] = useState(false);
    const [profileForm, setProfileForm] = useState({
        fullName: '',
        email: '',
        avatarUrl: '',
    });
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
    });
    const [deletePassword, setDeletePassword] = useState('');

    const loadGuestSummary = async () => {
        try {
            setLoading(true);
            const summary = await getGuestProfileSummary();
            setGuestSummary(summary);
        } catch (error) {
            Alert.alert('Lỗi', `Không tải được thông tin local: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const loadSyncInfo = async () => {
        const [hasPending, summary] = await Promise.all([
            hasPendingGuestImport(),
            getGuestImportSummary(),
        ]);

        setSyncInfo({
            hasPending,
            importedAt: summary?.importedAt || null,
        });
    };

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await getUserProfileFromBackend();
            setProfile(data);
            setProfileForm({
                fullName: data.fullName || '',
                email: data.email || '',
                avatarUrl: data.avatarUrl || '',
            });
            await loadSyncInfo();
        } catch (error) {
            Alert.alert('Lỗi', `Không tải được profile: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isFocused) return;

        if (isGuest) {
            loadGuestSummary();
            return;
        }

        loadProfile();
    }, [isFocused, sessionMode]);

    const handleUpdateProfile = async () => {
        try {
            const updated = await updateUserProfileOnBackend(profileForm);
            setProfile(updated);
            Alert.alert('Thành công', 'Đã cập nhật hồ sơ.');
        } catch (error) {
            Alert.alert('Lỗi', `Không cập nhật được hồ sơ: ${error.message}`);
        }
    };

    const handleChangePassword = async () => {
        if (!passwordForm.oldPassword || !passwordForm.newPassword) {
            Alert.alert('Thiếu dữ liệu', 'Nhập đủ mật khẩu cũ và mật khẩu mới.');
            return;
        }

        try {
            await changePasswordOnBackend(passwordForm);
            setPasswordForm({ oldPassword: '', newPassword: '' });
            Alert.alert('Thành công', 'Đã đổi mật khẩu.');
        } catch (error) {
            Alert.alert('Lỗi', `Không đổi được mật khẩu: ${error.message}`);
        }
    };

    const handleSyncLocalData = async () => {
        try {
            setIsSyncing(true);
            const { payload, response } = await importGuestDataToBackend();
            const importedCounts = response?.importedCounts || {};
            await loadSyncInfo();
            Alert.alert(
                'Đồng bộ thành công',
                `Ví ${payload.wallets.length}: tạo ${importedCounts.walletsCreated || 0}, dùng lại ${importedCounts.walletsReused || 0}.\nDanh mục ${payload.categories.length}: tạo ${importedCounts.categoriesCreated || 0}, dùng lại ${importedCounts.categoriesReused || 0}.\nGiao dịch ${payload.transactions.length}: tạo ${importedCounts.transactionsCreated || 0}, dùng lại ${importedCounts.transactionsReused || 0}.`
            );
        } catch (error) {
            Alert.alert('Đồng bộ thất bại', error.message || 'Không đồng bộ được dữ liệu local.');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert('Xóa tài khoản', 'Hành động này không thể hoàn tác. Bạn muốn tiếp tục?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteAccountOnBackend(deletePassword || null);
                        await logout();
                        onLogout?.();
                    } catch (error) {
                        Alert.alert('Lỗi', `Không xóa được tài khoản: ${error.message}`);
                    }
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.headerRow}>
                        <View style={styles.avatarShell}>
                            <LucideUser color="#fff" size={20} />
                        </View>
                        <View style={styles.headerTextWrap}>
                            <Text style={styles.headerTitle}>Hồ sơ cá nhân</Text>
                            <Text style={styles.headerSubtitle}>
                                {isGuest
                                    ? 'Guest local mode • Đăng nhập để mở rộng tính năng'
                                    : `${profile?.username || 'User'} • ${profile?.provider || 'LOCAL'}`}
                            </Text>
                        </View>
                    </View>
                </View>

                {isGuest ? (
                    <GuestProfileCard
                        summary={guestSummary}
                        loading={loading}
                        onGoToLogin={onGoToLogin}
                        onGoToRegister={onGoToRegister}
                        onContinueLocal={onContinueLocal}
                    />
                ) : loading ? (
                    <View style={styles.loadingWrap}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                ) : (
                    <>
                        <View style={[styles.card, styles.profileSummaryCard]}>
                            <View style={styles.summaryTopRow}>
                                <View style={styles.profileBadgeLarge}>
                                    <LucideUser size={22} color={COLORS.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.summaryName}>{profile?.fullName || profile?.username || 'Người dùng'}</Text>
                                    <Text style={styles.summaryMeta}>@{profile?.username || 'user'}</Text>
                                </View>
                            </View>
                            <View style={styles.inlineInfoRow}>
                                <LucideMail size={14} color={COLORS.textSub} />
                                <Text style={styles.inlineInfoText}>{profile?.email || 'Chưa cập nhật email'}</Text>
                            </View>
                            <View style={styles.providerPill}>
                                <Text style={styles.providerPillText}>{profile?.provider || 'LOCAL'}</Text>
                            </View>
                        </View>

                        <View style={styles.card}>
                            <SectionHeader
                                icon={<LucideDownload size={16} color={COLORS.primary} />}
                                title="Đồng bộ dữ liệu local"
                                subtitle="Chủ động đẩy dữ liệu guest local lên tài khoản hiện tại"
                            />
                            <View style={styles.stateBox}>
                                <Text style={styles.stateLabel}>Trạng thái đồng bộ</Text>
                                <Text style={styles.stateValue}>
                                    {syncInfo.hasPending ? 'Có dữ liệu local chờ đồng bộ' : 'Hiện không có dữ liệu local cần đồng bộ'}
                                </Text>
                                {syncInfo.importedAt ? (
                                    <Text style={styles.syncMetaText}>{`Lần đồng bộ gần nhất: ${new Date(syncInfo.importedAt).toLocaleString('vi-VN')}`}</Text>
                                ) : null}
                            </View>
                            <TouchableOpacity
                                style={[styles.primaryButton, (!syncInfo.hasPending || isSyncing) && styles.disabledButton]}
                                onPress={handleSyncLocalData}
                                disabled={!syncInfo.hasPending || isSyncing}
                            >
                                <Text style={styles.primaryButtonText}>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ dữ liệu local'}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.card}>
                            <SectionHeader
                                icon={<LucideUser size={16} color={COLORS.primary} />}
                                title="Thông tin tài khoản"
                                subtitle="Cập nhật tên hiển thị, email và avatar khi cần"
                            />
                            <Text style={styles.fieldLabel}>Họ tên</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Họ tên"
                                value={profileForm.fullName}
                                onChangeText={(value) => setProfileForm((prev) => ({ ...prev, fullName: value }))}
                            />
                            <Text style={styles.fieldLabel}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={profileForm.email}
                                onChangeText={(value) => setProfileForm((prev) => ({ ...prev, email: value }))}
                            />
                            <Text style={styles.fieldLabel}>Avatar URL</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Avatar URL"
                                autoCapitalize="none"
                                value={profileForm.avatarUrl}
                                onChangeText={(value) => setProfileForm((prev) => ({ ...prev, avatarUrl: value }))}
                            />
                            <TouchableOpacity style={styles.primaryButton} onPress={handleUpdateProfile}>
                                <Text style={styles.primaryButtonText}>Cập nhật hồ sơ</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.card}>
                            <SectionHeader
                                icon={<LucideShield size={16} color={COLORS.primary} />}
                                title="Bảo mật"
                                subtitle="Đổi mật khẩu để giữ tài khoản an toàn hơn"
                            />
                            <Text style={styles.fieldLabel}>Mật khẩu hiện tại</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Mật khẩu hiện tại"
                                secureTextEntry
                                value={passwordForm.oldPassword}
                                onChangeText={(value) => setPasswordForm((prev) => ({ ...prev, oldPassword: value }))}
                            />
                            <Text style={styles.fieldLabel}>Mật khẩu mới</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Mật khẩu mới"
                                secureTextEntry
                                value={passwordForm.newPassword}
                                onChangeText={(value) => setPasswordForm((prev) => ({ ...prev, newPassword: value }))}
                            />
                            <TouchableOpacity style={styles.primaryButton} onPress={handleChangePassword}>
                                <Text style={styles.primaryButtonText}>Đổi mật khẩu</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.card, styles.dangerCard]}>
                            <SectionHeader
                                icon={<LucideTrash2 size={16} color={COLORS.danger} />}
                                title="Đăng xuất và xóa tài khoản"
                                subtitle="Cân nhắc kỹ trước khi thực hiện những thao tác này"
                            />
                            <TouchableOpacity
                                style={styles.logoutButton}
                                onPress={async () => {
                                    await logout();
                                    onLogout?.();
                                }}
                            >
                                <LucideLogOut size={16} color={COLORS.primary} />
                                <Text style={styles.logoutButtonText}>Đăng xuất</Text>
                            </TouchableOpacity>

                            <Text style={styles.fieldLabel}>Mật khẩu xác nhận</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập mật khẩu để xóa tài khoản"
                                secureTextEntry
                                value={deletePassword}
                                onChangeText={setDeletePassword}
                            />
                            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
                                <Text style={styles.deleteButtonText}>Xóa tài khoản</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scrollContent: { paddingBottom: 32 },
    header: {
        backgroundColor: COLORS.primary,
        paddingTop: 52,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarShell: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTextWrap: { flex: 1 },
    headerTitle: { color: '#fff', fontSize: 21, fontWeight: '800' },
    headerSubtitle: { color: '#E0E7FF', fontSize: 13, marginTop: 4 },
    loadingWrap: { paddingVertical: 40, alignItems: 'center' },
    card: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
    },
    heroCard: {
        marginTop: -10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
        elevation: 4,
    },
    heroBadge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        marginBottom: 12,
    },
    heroBadgeText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
    heroTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textMain, lineHeight: 28, marginBottom: 10 },
    sectionHeaderWrap: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
    sectionHeaderIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    sectionHeaderTextWrap: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textMain },
    sectionSubtitle: { color: COLORS.textSub, fontSize: 13, marginTop: 4, lineHeight: 18 },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    statPill: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingVertical: 14,
        alignItems: 'center',
    },
    statValue: { fontSize: 20, fontWeight: '800', color: COLORS.textMain },
    statLabel: { fontSize: 12, color: COLORS.textSub, marginTop: 4 },
    stateBox: {
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 14,
    },
    stateLabel: { color: COLORS.textSub, fontSize: 12, marginBottom: 4 },
    stateValue: { color: COLORS.textMain, fontSize: 14, fontWeight: '700' },
    syncMetaText: { color: COLORS.textSub, fontSize: 12, marginTop: 6 },
    disabledButton: { opacity: 0.6 },
    profileSummaryCard: { marginTop: -10 },
    summaryTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    profileBadgeLarge: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    summaryName: { fontSize: 18, fontWeight: '800', color: COLORS.textMain },
    summaryMeta: { color: COLORS.textSub, fontSize: 13, marginTop: 4 },
    inlineInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    inlineInfoText: { color: COLORS.textSub, fontSize: 14 },
    providerPill: {
        alignSelf: 'flex-start',
        backgroundColor: '#ECFDF3',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
    },
    providerPillText: { color: '#15803D', fontWeight: '700', fontSize: 12 },
    infoText: { color: COLORS.textSub, fontSize: 14, lineHeight: 21, marginBottom: 8 },
    actionColumn: { marginTop: 6 },
    fieldLabel: { color: COLORS.textSub, fontSize: 12, fontWeight: '700', marginBottom: 6, marginTop: 4 },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 11,
        marginBottom: 10,
        color: COLORS.textMain,
    },
    primaryButton: {
        marginTop: 6,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 13,
        alignItems: 'center',
    },
    primaryButtonText: { color: '#fff', fontWeight: '700' },
    secondaryButton: {
        marginTop: 10,
        borderRadius: 12,
        paddingVertical: 13,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary,
        backgroundColor: '#fff',
    },
    secondaryButtonText: { color: COLORS.primary, fontWeight: '700' },
    linkGhostButton: {
        marginTop: 10,
        paddingVertical: 10,
        alignItems: 'center',
    },
    linkGhostText: { color: COLORS.textSub, fontWeight: '600' },
    dangerCard: {
        borderColor: '#FECACA',
        backgroundColor: '#FFF7F7',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.primary,
        paddingVertical: 12,
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    logoutButtonText: { color: COLORS.primary, fontWeight: '700' },
    deleteButton: {
        backgroundColor: COLORS.danger,
        borderRadius: 12,
        paddingVertical: 13,
        alignItems: 'center',
        marginTop: 4,
    },
    deleteButtonText: { color: '#fff', fontWeight: '700' },
});

export default ProfileScreen;

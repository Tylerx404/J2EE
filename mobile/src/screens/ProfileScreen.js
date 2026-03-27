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
import { LucideCircleHelp, LucideLogOut, LucideShield, LucideSparkles, LucideUser } from 'lucide-react-native';
import { logout } from '../services/authService';
import { getGuestProfileSummary } from '../data/guest/profileSummary';
import {
    changePasswordOnBackend,
    deleteAccountOnBackend,
    getUserProfileFromBackend,
    updateUserProfileOnBackend,
} from '../services/userService';
import { COLORS } from '../theme/colors';

const IMPORT_STATE_LABELS = {
    none: 'Chua co yeu cau import',
    pending: 'Da chuan bi import local',
    later: 'Da hen import sau',
    keep_separate: 'Dang giu rieng du lieu local',
};

const GuestProfileCard = ({
    summary,
    loading,
    onGoToLogin,
    onGoToRegister,
    onContinueLocal,
}) => (
    <>
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Ban dang dung local mode</Text>
            <Text style={styles.infoText}>
                Dang nhap de dong bo du lieu nhieu thiet bi, dung profile backend, voice/AI va cac tinh nang nang cao hon.
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={onGoToLogin}>
                <Text style={styles.primaryButtonText}>Dang nhap</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={onGoToRegister}>
                <Text style={styles.secondaryButtonText}>Dang ky</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkGhostButton} onPress={onContinueLocal}>
                <Text style={styles.linkGhostText}>Tiep tuc dung local</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.card}>
            <View style={styles.cardTitleRow}>
                <LucideSparkles size={16} color={COLORS.primary} />
                <Text style={styles.cardTitle}>Du lieu dang luu tren may</Text>
            </View>
            {loading ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
            ) : (
                <>
                    <Text style={styles.infoText}>Vi local: {summary.walletCount}</Text>
                    <Text style={styles.infoText}>Category local: {summary.categoryCount}</Text>
                    <Text style={styles.infoText}>Transaction local: {summary.transactionCount}</Text>
                    <Text style={styles.infoText}>
                        Trang thai import: {IMPORT_STATE_LABELS[summary.importState] || summary.importState}
                    </Text>
                </>
            )}
        </View>

        <View style={styles.card}>
            <View style={styles.cardTitleRow}>
                <LucideCircleHelp size={16} color={COLORS.primary} />
                <Text style={styles.cardTitle}>Neu ban dang dung guest</Text>
            </View>
            <Text style={styles.infoText}>Du lieu SQLite local van duoc giu nguyen neu ban chi vao login/register roi quay lai.</Text>
            <Text style={styles.infoText}>Sau khi dang nhap backend, app se hoi ban co muon xu ly du lieu local hay khong.</Text>
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
            Alert.alert('Loi', `Khong tai duoc thong tin local: ${error.message}`);
        } finally {
            setLoading(false);
        }
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
        } catch (error) {
            Alert.alert('Loi', `Khong tai duoc profile: ${error.message}`);
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
            Alert.alert('Thanh cong', 'Da cap nhat ho so.');
        } catch (error) {
            Alert.alert('Loi', `Khong cap nhat duoc ho so: ${error.message}`);
        }
    };

    const handleChangePassword = async () => {
        if (!passwordForm.oldPassword || !passwordForm.newPassword) {
            Alert.alert('Thieu du lieu', 'Nhap du mat khau cu va mat khau moi.');
            return;
        }

        try {
            await changePasswordOnBackend(passwordForm);
            setPasswordForm({ oldPassword: '', newPassword: '' });
            Alert.alert('Thanh cong', 'Da doi mat khau.');
        } catch (error) {
            Alert.alert('Loi', `Khong doi duoc mat khau: ${error.message}`);
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert('Xoa tai khoan', 'Hanh dong nay khong the hoan tac. Ban muon tiep tuc?', [
            { text: 'Huy', style: 'cancel' },
            {
                text: 'Xoa',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteAccountOnBackend(deletePassword || null);
                        await logout();
                        onLogout?.();
                    } catch (error) {
                        Alert.alert('Loi', `Khong xoa duoc tai khoan: ${error.message}`);
                    }
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.headerRow}>
                        <LucideUser color="#fff" size={20} />
                        <Text style={styles.headerTitle}>Ho so ca nhan</Text>
                    </View>
                    <Text style={styles.headerSubtitle}>
                        {isGuest
                            ? 'Guest local mode • Dang nhap de mo rong tinh nang'
                            : `${profile?.username || 'User'} • ${profile?.provider || 'LOCAL'}`}
                    </Text>
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
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Thong tin tai khoan</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ho ten"
                                value={profileForm.fullName}
                                onChangeText={(value) => setProfileForm((prev) => ({ ...prev, fullName: value }))}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={profileForm.email}
                                onChangeText={(value) => setProfileForm((prev) => ({ ...prev, email: value }))}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Avatar URL"
                                autoCapitalize="none"
                                value={profileForm.avatarUrl}
                                onChangeText={(value) => setProfileForm((prev) => ({ ...prev, avatarUrl: value }))}
                            />
                            <TouchableOpacity style={styles.primaryButton} onPress={handleUpdateProfile}>
                                <Text style={styles.primaryButtonText}>Cap nhat ho so</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.card}>
                            <View style={styles.cardTitleRow}>
                                <LucideShield size={16} color={COLORS.primary} />
                                <Text style={styles.cardTitle}>Bao mat</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Mat khau hien tai"
                                secureTextEntry
                                value={passwordForm.oldPassword}
                                onChangeText={(value) => setPasswordForm((prev) => ({ ...prev, oldPassword: value }))}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Mat khau moi"
                                secureTextEntry
                                value={passwordForm.newPassword}
                                onChangeText={(value) => setPasswordForm((prev) => ({ ...prev, newPassword: value }))}
                            />
                            <TouchableOpacity style={styles.primaryButton} onPress={handleChangePassword}>
                                <Text style={styles.primaryButtonText}>Doi mat khau</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Dang xuat / Xoa tai khoan</Text>
                            <TouchableOpacity
                                style={styles.logoutButton}
                                onPress={async () => {
                                    await logout();
                                    onLogout?.();
                                }}
                            >
                                <LucideLogOut size={16} color={COLORS.primary} />
                                <Text style={styles.logoutButtonText}>Dang xuat</Text>
                            </TouchableOpacity>

                            <TextInput
                                style={styles.input}
                                placeholder="Mat khau xac nhan de xoa tai khoan"
                                secureTextEntry
                                value={deletePassword}
                                onChangeText={setDeletePassword}
                            />
                            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
                                <Text style={styles.deleteButtonText}>Xoa tai khoan</Text>
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
    header: {
        backgroundColor: COLORS.primary,
        paddingTop: 50,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
    headerSubtitle: { color: '#E0E7FF', fontSize: 13 },
    loadingWrap: { paddingVertical: 40, alignItems: 'center' },
    card: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
    },
    cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textMain, marginBottom: 10 },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
    infoText: { color: COLORS.textSub, fontSize: 14, lineHeight: 20, marginBottom: 8 },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 10,
        color: COLORS.textMain,
    },
    primaryButton: {
        marginTop: 2,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
    },
    primaryButtonText: { color: '#fff', fontWeight: '700' },
    secondaryButton: {
        marginTop: 10,
        borderRadius: 12,
        paddingVertical: 12,
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
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.primary,
        paddingVertical: 11,
        marginBottom: 10,
    },
    logoutButtonText: { color: COLORS.primary, fontWeight: '700' },
    deleteButton: {
        backgroundColor: COLORS.danger,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
    },
    deleteButtonText: { color: '#fff', fontWeight: '700' },
});

export default ProfileScreen;

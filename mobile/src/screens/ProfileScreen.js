import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { LucideUser, LucideLogOut, LucideShield } from 'lucide-react-native';
import {
    getUserProfileFromBackend,
    updateUserProfileOnBackend,
    changePasswordOnBackend,
    deleteAccountOnBackend,
} from '../services/userService';
import { logout } from '../services/authService';
import { COLORS } from '../theme/colors';

const ProfileScreen = ({ onLogout }) => {
    const isFocused = useIsFocused();
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState(null);
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
            Alert.alert('Lỗi', `Không tải được profile: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isFocused) return;
        loadProfile();
    }, [isFocused]);

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
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.headerRow}>
                        <LucideUser color="#fff" size={20} />
                        <Text style={styles.headerTitle}>Hồ sơ cá nhân</Text>
                    </View>
                    <Text style={styles.headerSubtitle}>
                        {profile?.username || 'User'} • {profile?.provider || 'LOCAL'}
                    </Text>
                </View>

                {loading ? (
                    <View style={styles.loadingWrap}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                ) : (
                    <>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Thông tin tài khoản</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Họ tên"
                                value={profileForm.fullName}
                                onChangeText={(v) => setProfileForm((prev) => ({ ...prev, fullName: v }))}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={profileForm.email}
                                onChangeText={(v) => setProfileForm((prev) => ({ ...prev, email: v }))}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Avatar URL"
                                autoCapitalize="none"
                                value={profileForm.avatarUrl}
                                onChangeText={(v) => setProfileForm((prev) => ({ ...prev, avatarUrl: v }))}
                            />
                            <TouchableOpacity style={styles.primaryButton} onPress={handleUpdateProfile}>
                                <Text style={styles.primaryButtonText}>Cập nhật hồ sơ</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.card}>
                            <View style={styles.cardTitleRow}>
                                <LucideShield size={16} color={COLORS.primary} />
                                <Text style={styles.cardTitle}>Bảo mật</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Mật khẩu hiện tại"
                                secureTextEntry
                                value={passwordForm.oldPassword}
                                onChangeText={(v) => setPasswordForm((prev) => ({ ...prev, oldPassword: v }))}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Mật khẩu mới"
                                secureTextEntry
                                value={passwordForm.newPassword}
                                onChangeText={(v) => setPasswordForm((prev) => ({ ...prev, newPassword: v }))}
                            />
                            <TouchableOpacity style={styles.primaryButton} onPress={handleChangePassword}>
                                <Text style={styles.primaryButtonText}>Đổi mật khẩu</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Đăng xuất / Xóa tài khoản</Text>
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

                            <TextInput
                                style={styles.input}
                                placeholder="Mật khẩu xác nhận để xóa tài khoản"
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

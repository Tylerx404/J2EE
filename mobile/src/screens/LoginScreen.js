import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { login } from '../services/authService';
import { COLORS } from '../theme/colors';

const LoginScreen = ({
    onLoginSuccess,
    onGoToRegister,
    onContinueAsGuest,
    onBack,
    showGuestEntry = true,
    isGuestEntryLoading = false,
}) => {
    const [account, setAccount] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!account.trim() || !password.trim()) {
            Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin đăng nhập');
            return;
        }

        try {
            const data = await login(account, password);
            Alert.alert('Thành công', `Chào mừng ${data.name}!`);
            await onLoginSuccess?.();
        } catch (error) {
            Alert.alert('Lỗi đăng nhập', error.message);
        }
    };

    return (
        <View style={styles.container}>
            {onBack ? (
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Quay lại</Text>
                </TouchableOpacity>
            ) : null}

            <Text style={styles.title}>Đăng nhập J2EE</Text>
            <TextInput
                style={styles.input}
                placeholder="Username hoặc Email"
                value={account}
                onChangeText={setAccount}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>ĐĂNG NHẬP</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onGoToRegister} style={styles.linkButton}>
                <Text style={styles.linkText}>
                    Chưa có tài khoản? <Text style={styles.linkTextBold}>Đăng ký ngay</Text>
                </Text>
            </TouchableOpacity>

            {showGuestEntry ? (
                <TouchableOpacity
                    onPress={onContinueAsGuest}
                    style={[styles.guestButton, isGuestEntryLoading && styles.guestButtonDisabled]}
                    disabled={isGuestEntryLoading}
                >
                    {isGuestEntryLoading ? (
                        <View style={styles.guestLoadingRow}>
                            <ActivityIndicator size="small" color={COLORS.primary} />
                            <Text style={styles.guestButtonText}>Đang khởi tạo guest mode...</Text>
                        </View>
                    ) : (
                        <Text style={styles.guestButtonText}>Dùng thử không cần đăng nhập</Text>
                    )}
                </TouchableOpacity>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#fff' },
    backButton: { position: 'absolute', top: 56, left: 24, padding: 8 },
    backButtonText: { color: COLORS.primary, fontWeight: '600' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: COLORS.primary },
    input: { borderBottomWidth: 1, borderColor: '#ccc', paddingVertical: 10, marginBottom: 20 },
    button: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 10, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    linkButton: { marginTop: 20 },
    linkText: { color: COLORS.primary, textAlign: 'center' },
    linkTextBold: { fontWeight: 'bold' },
    guestButton: {
        marginTop: 12,
        borderWidth: 1,
        borderColor: COLORS.primary,
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    guestButtonDisabled: {
        opacity: 0.7,
    },
    guestLoadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    guestButtonText: { color: COLORS.primary, fontWeight: '600' },
});

export default LoginScreen;

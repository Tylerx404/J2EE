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
            Alert.alert('Thong bao', 'Vui long dien day du thong tin dang nhap');
            return;
        }

        try {
            const data = await login(account, password);
            Alert.alert('Thanh cong', `Chao mung ${data.name}!`);
            await onLoginSuccess?.();
        } catch (error) {
            Alert.alert('Loi dang nhap', error.message);
        }
    };

    return (
        <View style={styles.container}>
            {onBack ? (
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Quay lai</Text>
                </TouchableOpacity>
            ) : null}

            <Text style={styles.title}>Dang nhap J2EE</Text>
            <TextInput
                style={styles.input}
                placeholder="Username hoac Email"
                value={account}
                onChangeText={setAccount}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Mat khau"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>DANG NHAP</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onGoToRegister} style={styles.linkButton}>
                <Text style={styles.linkText}>
                    Chua co tai khoan? <Text style={styles.linkTextBold}>Dang ky ngay</Text>
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
                            <Text style={styles.guestButtonText}>Dang khoi tao guest mode...</Text>
                        </View>
                    ) : (
                        <Text style={styles.guestButtonText}>Dung thu khong can dang nhap</Text>
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

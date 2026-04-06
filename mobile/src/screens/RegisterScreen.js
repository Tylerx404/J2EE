import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { register } from '../services/authService';
import { COLORS } from '../theme/colors';

const RegisterScreen = ({ onRegisterSuccess, onBackToLogin, onBack }) => {
    const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '' });

    const handleRegister = async () => {
        const { username, email, password, fullName } = form;
        if (!username.trim() || !email.trim() || !password.trim() || !fullName.trim()) {
            return Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
        }

        try {
            const data = await register(form.username, form.email, form.password, form.fullName);
            const displayName = data.fullName || data.username || 'mới';
            Alert.alert('Thành công', `Tài khoản ${displayName} đã được tạo!`);
            await onRegisterSuccess?.();
        } catch (error) {
            Alert.alert('Lỗi đăng ký', error.message);
        }
    };

    return (
        <View style={styles.container}>
            {onBack ? (
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Quay lại</Text>
                </TouchableOpacity>
            ) : null}

            <Text style={styles.title}>Tạo tài khoản mới</Text>

            <TextInput
                style={styles.input}
                placeholder="Họ và tên"
                onChangeText={(value) => setForm({ ...form, fullName: value })}
            />

            <TextInput
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={(value) => setForm({ ...form, email: value })}
            />

            <TextInput
                style={styles.input}
                placeholder="Username"
                autoCapitalize="none"
                onChangeText={(value) => setForm({ ...form, username: value })}
            />

            <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                secureTextEntry
                onChangeText={(value) => setForm({ ...form, password: value })}
            />

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>ĐĂNG KÝ</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onBackToLogin} style={{ marginTop: 20 }}>
                <Text style={{ color: COLORS.primary, textAlign: 'center' }}>Đã có tài khoản? Đăng nhập</Text>
            </TouchableOpacity>
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
});

export default RegisterScreen;

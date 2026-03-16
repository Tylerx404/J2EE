import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { login } from '../services/authService';
import { COLORS } from '../theme/colors';

const LoginScreen = ({ onLoginSuccess, onGoToRegister }) => {
    const [account, setAccount] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        // 1. Kiểm tra trống ngay tại đây
        if (!account.trim() || !password.trim()) {
            Alert.alert("Thông báo", "Vui lòng điền đầy đủ thông tin đăng nhập");
            return;
        }

        try {
            const data = await login(account, password);
            Alert.alert("Thành công", `Chào mừng ${data.name}!`);
            onLoginSuccess();
        } catch (error) {
            // Nếu Backend trả về lỗi "Vui lòng điền đầy đủ...", nó sẽ hiện ở đây
            Alert.alert("Lỗi đăng nhập", error.message);
        }
    };

    return (
        <View style={lStyles.container}>
            <Text style={lStyles.title}>Đăng nhập J2EE</Text>
            <TextInput style={lStyles.input} placeholder="Username hoặc Email" value={account} onChangeText={setAccount} autoCapitalize="none" />
            <TextInput style={lStyles.input} placeholder="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry />

            <TouchableOpacity style={lStyles.button} onPress={handleLogin}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>ĐĂNG NHẬP</Text>
            </TouchableOpacity>

            {/* NÚT ĐĂNG KÝ BỔ SUNG */}
            <TouchableOpacity onPress={onGoToRegister} style={{ marginTop: 20 }}>
                <Text style={{ color: COLORS.primary, textAlign: 'center' }}>
                    Chưa có tài khoản? <Text style={{ fontWeight: 'bold' }}>Đăng ký ngay</Text>
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const lStyles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: COLORS.primary },
    input: { borderBottomWidth: 1, borderColor: '#ccc', paddingVertical: 10, marginBottom: 20 },
    button: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 10, alignItems: 'center' }
});

export default LoginScreen;
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { register } from '../services/authService'; //
import { COLORS } from '../theme/colors';

const RegisterScreen = ({ onRegisterSuccess, onBackToLogin }) => {
    const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '' });

    const handleRegister = async () => {
        const { username, email, password, fullName } = form;
        // Kiểm tra cơ bản trước khi gửi lên Server
        if (!username.trim() || !email.trim() || !password.trim() || !fullName.trim()) {
            return Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
        }

        try {
            // Gọi API đăng ký tài khoản local
            const data = await register(form.username, form.email, form.password, form.fullName);
            const displayName = data.fullName || data.username || "mới";
            Alert.alert("Thành công", `Tài khoản ${displayName} đã được tạo!`);
            onRegisterSuccess(); // Chuyển thẳng vào App chính
        } catch (error) {
            Alert.alert("Lỗi đăng ký", error.message);
        }
    };

    return (
        <View style={rStyles.container}>
            <Text style={rStyles.title}>Tạo tài khoản mới</Text>

            <TextInput style={rStyles.input} placeholder="Họ và tên"
                onChangeText={(v) => setForm({ ...form, fullName: v })} />

            <TextInput style={rStyles.input} placeholder="Email" autoCapitalize="none"
                keyboardType="email-address" onChangeText={(v) => setForm({ ...form, email: v })} />

            <TextInput style={rStyles.input} placeholder="Username" autoCapitalize="none"
                onChangeText={(v) => setForm({ ...form, username: v })} />

            <TextInput style={rStyles.input} placeholder="Mật khẩu" secureTextEntry
                onChangeText={(v) => setForm({ ...form, password: v })} />

            <TouchableOpacity style={rStyles.button} onPress={handleRegister}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>ĐĂNG KÝ</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onBackToLogin} style={{ marginTop: 20 }}>
                <Text style={{ color: COLORS.primary, textAlign: 'center' }}>Đã có tài khoản? Đăng nhập</Text>
            </TouchableOpacity>
        </View>
    );
};

const rStyles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: COLORS.primary },
    input: { borderBottomWidth: 1, borderColor: '#ccc', paddingVertical: 10, marginBottom: 20 },
    button: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 10, alignItems: 'center' }
});

export default RegisterScreen;
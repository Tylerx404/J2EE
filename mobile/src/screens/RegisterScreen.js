import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { register } from '../services/authService';
import { COLORS } from '../theme/colors';

const RegisterScreen = ({ onRegisterSuccess, onBackToLogin }) => {
    const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '' });

    const handleRegister = async () => {
        const { username, email, password, fullName } = form;
        if (!username.trim() || !email.trim() || !password.trim() || !fullName.trim()) {
            return Alert.alert('Loi', 'Vui long dien day du thong tin');
        }

        try {
            const data = await register(form.username, form.email, form.password, form.fullName);
            const displayName = data.fullName || data.username || 'moi';
            Alert.alert('Thanh cong', `Tai khoan ${displayName} da duoc tao!`);
            await onRegisterSuccess?.();
        } catch (error) {
            Alert.alert('Loi dang ky', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Tao tai khoan moi</Text>

            <TextInput
                style={styles.input}
                placeholder="Ho va ten"
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
                placeholder="Mat khau"
                secureTextEntry
                onChangeText={(value) => setForm({ ...form, password: value })}
            />

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>DANG KY</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onBackToLogin} style={{ marginTop: 20 }}>
                <Text style={{ color: COLORS.primary, textAlign: 'center' }}>Da co tai khoan? Dang nhap</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: COLORS.primary },
    input: { borderBottomWidth: 1, borderColor: '#ccc', paddingVertical: 10, marginBottom: 20 },
    button: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 10, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default RegisterScreen;

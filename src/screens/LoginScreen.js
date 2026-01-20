import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, TextInput, Dimensions, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Por favor ingresa email y contraseña');
            return;
        }
        await login(email, password);
    };

    const quickLogin = (roleEmail) => {
        setEmail(roleEmail);
        setPassword('password'); // Password is fake for quick login, auth handles it
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Image
                            source={require('../../assets/logo.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                        {/* Title removed as it's in the logo, or we can keep it small/hidden if logo has text */}
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputBox}>
                            <Ionicons name="mail-outline" size={24} color={COLORS.textMuted} style={styles.icon} />
                            <TextInput
                                placeholder="Email"
                                placeholderTextColor={COLORS.textMuted}
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={styles.inputBox}>
                            <Ionicons name="lock-closed-outline" size={24} color={COLORS.textMuted} style={styles.icon} />
                            <TextInput
                                placeholder="Password"
                                placeholderTextColor={COLORS.textMuted}
                                style={styles.input}
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={isLoading}>
                            <LinearGradient colors={GRADIENTS.primary} style={styles.gradient}>
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.loginText}>Iniciar Sesión</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.forgotBtn}>
                            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>¿Eres nuevo en SingSoulStar?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.signupText}> Regístrate</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    // backgroundImage removed
    content: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 30 },
    header: { alignItems: 'center', marginBottom: 40, marginTop: 60 },
    logoImage: { width: 250, height: 250, marginBottom: 20 },
    // Title and subtitle styles kept just in case, or remove if unused in JSX
    title: { color: COLORS.text, fontSize: 32, fontWeight: 'bold' },
    subtitle: { color: COLORS.textSecondary, fontSize: 16, marginTop: 5 },
    title: { color: COLORS.text, fontSize: 32, fontWeight: 'bold' },
    subtitle: { color: COLORS.textSecondary, fontSize: 16, marginTop: 5 },
    form: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 20, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    inputBox: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border, marginBottom: 25, paddingBottom: 10 },
    icon: { marginRight: 15 },
    input: { flex: 1, color: COLORS.text, fontSize: 16 },
    loginBtn: { borderRadius: 25, overflow: 'hidden', marginTop: 10, elevation: 5 },
    gradient: { paddingVertical: 15, alignItems: 'center' },
    loginText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    forgotBtn: { marginTop: 15, alignItems: 'center' },
    forgotText: { color: COLORS.textMuted, fontSize: 14 },
    orText: { color: COLORS.textMuted, textAlign: 'center', marginVertical: 20 },
    socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
    socialBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
    footerText: { color: COLORS.textMuted },
    signupText: { color: COLORS.primary, fontWeight: 'bold', marginLeft: 5 },

    // Dev
    devSection: { marginTop: 20, alignItems: 'center' },
    devTitle: { color: COLORS.textMuted, fontSize: 12, marginBottom: 5 },
    devRow: { flexDirection: 'row', gap: 10 },
    devBtn: { padding: 5, borderWidth: 1, borderRadius: 5, minWidth: 60, alignItems: 'center' },
});

export default LoginScreen;

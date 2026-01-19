import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, TextInput, Dimensions, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
    const { register, isLoading } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async () => {
        if (!name || !email || !password) {
            return Alert.alert('Error', 'Por favor rellena todos los campos');
        }
        try {
            await register(name, email, password);
            Alert.alert('¡Bienvenido!', 'Tu cuenta ha sido creada con éxito.');
            // Navigation might happen automatically if auth state changes, or user manually goes to login
        } catch (error) {
            Alert.alert('Error', error.message || 'No se pudo crear la cuenta');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=1000' }}
                style={styles.backgroundImage}
            >
                <LinearGradient
                    colors={['rgba(255,255,255,0.2)', COLORS.background]}
                    style={StyleSheet.absoluteFill}
                />
            </ImageBackground>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={28} color={COLORS.text} />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.title}>Crea tu cuenta</Text>
                        <Text style={styles.subtitle}>Únete a la mayor comunidad de karaoke</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputBox}>
                            <Ionicons name="person-outline" size={20} color={COLORS.textMuted} style={styles.icon} />
                            <TextInput
                                placeholder="Nombre de Usuario"
                                placeholderTextColor={COLORS.textMuted}
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <View style={styles.inputBox}>
                            <Ionicons name="mail-outline" size={20} color={COLORS.textMuted} style={styles.icon} />
                            <TextInput
                                placeholder="Correo Electrónico"
                                placeholderTextColor={COLORS.textMuted}
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={styles.inputBox}>
                            <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} style={styles.icon} />
                            <TextInput
                                placeholder="Contraseña"
                                placeholderTextColor={COLORS.textMuted}
                                style={styles.input}
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        <TouchableOpacity style={styles.regBtn} onPress={handleRegister} disabled={isLoading}>
                            <LinearGradient colors={GRADIENTS.primary} style={styles.gradient}>
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.regText}>Registrarse Gratis</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
                            <Text style={styles.loginText}>¿Ya tienes cuenta? <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Entrar</Text></Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    backgroundImage: { width, height: height * 0.4, position: 'absolute', top: 0, opacity: 0.15 },
    content: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 30 },
    backBtn: { position: 'absolute', top: 50, left: 10, zIndex: 10, padding: 10 },
    header: { marginBottom: 30, marginTop: 80, alignItems: 'center' },
    title: { color: COLORS.text, fontSize: 32, fontWeight: 'bold' },
    subtitle: { color: COLORS.textSecondary, fontSize: 16, marginTop: 5, textAlign: 'center' },
    form: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 20, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    inputBox: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border, marginBottom: 25, paddingBottom: 10 },
    icon: { marginRight: 15 },
    input: { flex: 1, color: COLORS.text, fontSize: 16 },
    regBtn: { borderRadius: 25, overflow: 'hidden', marginTop: 10 },
    gradient: { paddingVertical: 15, alignItems: 'center' },
    regText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    loginLink: { marginTop: 25, alignItems: 'center' },
    loginText: { color: COLORS.textMuted, fontSize: 14 }
});

export default RegisterScreen;

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { StatusBar } from 'expo-status-bar';

const SettingsScreen = ({ navigation }) => {
    const { logout } = useAuth();

    const handleLogout = () => {
        if (Platform.OS === 'web') {
            const confirmed = window.confirm("¿Estás seguro que quieres salir?");
            if (confirmed) logout();
            return;
        }

        Alert.alert(
            "Cerrar sesión",
            "¿Estás seguro que quieres salir?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Salir", onPress: logout, style: 'destructive' }
            ]
        );
    };

    const MenuItem = ({ label, value, onPress, isFirst, isLast }) => (
        <TouchableOpacity
            style={[
                styles.menuItem,
                isFirst && styles.menuItemFirst,
                isLast && styles.menuItemLast
            ]}
            onPress={onPress}
        >
            <Text style={styles.menuLabel}>{label}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {value && <Text style={styles.menuValue}>{value}</Text>}
                <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </View>
        </TouchableOpacity>
    );

    const MenuGroup = ({ title, children }) => (
        <View style={styles.groupContainer}>
            {title && <Text style={styles.groupTitle}>{title}</Text>}
            <View style={styles.groupItems}>
                {children}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Configuración</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                <MenuGroup title="Información personal">
                    <MenuItem label="Editar perfil" onPress={() => navigation.navigate('EditProfile')} isFirst isLast />
                </MenuGroup>

                <MenuGroup title="Cuenta">
                    <MenuItem label="Seguridad de la cuenta" isFirst />
                    <MenuItem label="Privacidad de la cuenta" />
                    <MenuItem label="Lista de bloqueos" isLast />
                </MenuGroup>

                <MenuGroup title="Activo">
                    <MenuItem label="Noble" value="Hazte noble ahora" isFirst />
                    <MenuItem label="VIP" value="VIP 1" /> {/* Mock value */}
                    <MenuItem label="Ingresos" value="$ 0.00" />
                    <MenuItem label="Recargar" value="2" isLast />
                </MenuGroup>

                <MenuGroup title="General">
                    <MenuItem label="Notificaciones" isFirst />
                    <MenuItem label="Mensajes" />
                    <MenuItem label="Configuración general" />
                    <MenuItem label="Diagnóstico de red" isLast />
                </MenuGroup>

                <MenuGroup title="Borrar">
                    <MenuItem label="Borrar caché" isFirst isLast onPress={() => Alert.alert('Limpiar', 'Caché borrada')} />
                </MenuGroup>

                <MenuGroup title="Acerca de">
                    <MenuItem label="Centro de atención al cliente" isFirst />
                    <MenuItem label="Acerca de" isLast />
                </MenuGroup>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Cerrar sesión</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>SingSoulStar v1.0.0</Text>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' }, // System Gray Background
    header: {
        height: 100,
        paddingTop: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA'
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: 'black' },
    scrollContent: { paddingBottom: 50 },

    groupContainer: { marginTop: 20 },
    groupTitle: { marginLeft: 15, marginBottom: 8, fontSize: 13, color: '#666', textTransform: 'uppercase' },
    groupItems: { backgroundColor: 'white', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E5E5EA' },

    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
        marginLeft: 15 // iOS style separator inset
    },
    menuItemFirst: { borderTopWidth: 0 },
    menuItemLast: { borderBottomWidth: 0, marginLeft: 0, paddingLeft: 30 }, // Remove inset for last item border

    menuLabel: { fontSize: 16, color: 'black' },
    menuValue: { fontSize: 14, color: '#8E8E93', marginRight: 5 },

    logoutBtn: {
        backgroundColor: 'white',
        marginTop: 30,
        paddingVertical: 15,
        alignItems: 'center',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E5E5EA'
    },
    logoutText: { color: COLORS.error, fontSize: 16, fontWeight: 'bold' },
    versionText: { textAlign: 'center', color: '#8E8E93', marginTop: 20, fontSize: 12 }
});

export default SettingsScreen;

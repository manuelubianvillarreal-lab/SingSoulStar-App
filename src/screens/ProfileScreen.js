import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
    const { user, logout } = useAuth();
    const TABS = ['Momentos', 'Covers', 'Duetos'];
    const [activeTab, setActiveTab] = React.useState('Covers');

    const handleLogout = async () => {
        if (Platform.OS === 'web') {
            // En web, las alertas de React Native a veces fallan. Usamos confirm directo o logout.
            const confirmed = window.confirm('¿Estás seguro de que quieres salir?');
            if (confirmed) logout();
            return;
        }

        Alert.alert('Cerrar Sesión', '¿Estás seguro de que quieres salir?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Cerrar Sesión', style: 'destructive', onPress: logout }
        ]);
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header / Top Bar */}
            <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
                    </TouchableOpacity>
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.iconBtn}>
                            <Ionicons name="scan-outline" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Settings')}>
                            <Ionicons name="settings-outline" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Profile Card Section */}
                <View style={styles.profileSection}>
                    <View style={styles.userInfoRow}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: user?.avatar || 'https://i.pravatar.cc/300' }}
                                style={styles.avatar}
                            />
                            {/* VIP Badge Mockup */}
                            <View style={styles.vipBadge}>
                                <Text style={styles.vipText}>VIP 1</Text>
                            </View>
                        </View>

                        <View style={styles.statsContainer}>
                            <StatBox value="121" label="Seguidos" />
                            <StatBox value="13.5K" label="Seguidores" />
                            <StatBox value="3.7K" label="Clasificación" />
                        </View>
                    </View>

                    <View style={styles.nameSection}>
                        <Text style={styles.username}>{user?.name || 'Usuario'}</Text>
                        <View style={styles.idRow}>
                            <Text style={styles.userId}>ID: {user?.id?.substring(0, 10) || '13323708085'}</Text>
                            <TouchableOpacity>
                                <Ionicons name="copy-outline" size={14} color={COLORS.textMuted} style={{ marginLeft: 5 }} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Tags / Badges Row */}
                    <View style={styles.tagsRow}>
                        <TagBadge text="♂ Escorpio" color="#89CFF0" icon="male" />
                        <TagBadge text="Cantante verificado" color="#FFA500" icon="checkmark-circle" />
                        <TagBadge text="Nvl. 56" color="#FF69B4" />
                    </View>

                    <Text style={styles.bioText} numberOfLines={2}>
                        {user?.bio || 'Sin firma...'}
                    </Text>

                    {/* Action Buttons */}
                    <View style={styles.actionButtonsRow}>
                        <TouchableOpacity
                            style={styles.editProfileBtn}
                            onPress={() => navigation.navigate('EditProfile')}
                        >
                            <Text style={styles.editProfileText}>Editar perfil</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.friendBtn}>
                            <Ionicons name="people" size={20} color="white" />
                            <Text style={styles.friendBtnText}>Amigos</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Gifts Banner Mockup */}
                    <View style={styles.giftBanner}>
                        <LinearGradient
                            colors={['#FFF5E6', '#FFFFFF']}
                            start={[0, 0]} end={[1, 0]}
                            style={styles.giftGradient}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/6609/6609059.png' }} style={{ width: 30, height: 30, marginRight: 10 }} />
                                <View>
                                    <Text style={styles.giftTitle}>Reclama monedas cada semana</Text>
                                    <Text style={styles.giftSubtitle}>Familia SingSoul</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                        </LinearGradient>
                    </View>
                </View>

                {/* Content Tabs */}
                <View style={styles.tabBar}>
                    {TABS.map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={styles.tab}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                            {activeTab === tab && <View style={styles.tabIndicator} />}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Grid Content */}
                <View style={styles.contentGrid}>
                    <CoverItem title="Despacito - Remix" plays="5.4k" date="Hace 2 días" />
                    <CoverItem title="Shape of You" plays="2.1k" date="Hace 1 sem" />
                    <CoverItem title="My Way" plays="10k" date="Hace 2 sem" />
                </View>

            </ScrollView>
        </View>
    );
};

const StatBox = ({ value, label }) => (
    <View style={styles.statBox}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const TagBadge = ({ text, color, icon }) => (
    <View style={[styles.tagBadge, { backgroundColor: color + '20' }]}>
        {icon && <Ionicons name={icon} size={10} color={color} style={{ marginRight: 4 }} />}
        <Text style={[styles.tagText, { color: color }]}>{text}</Text>
    </View>
);

const CoverItem = ({ title, plays, date }) => (
    <View style={styles.coverItem}>
        <Image source={{ uri: `https://via.placeholder.com/300?text=${title}` }} style={styles.coverImage} />
        <View style={styles.coverOverlay}>
            <View style={styles.playCountBadge}>
                <Ionicons name="play" size={10} color="white" />
                <Text style={styles.playCountText}>{plays}</Text>
            </View>
        </View>
        <Text style={styles.coverTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.coverDate}>{date}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    headerSafeArea: { backgroundColor: 'white' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    headerRight: { flexDirection: 'row' },
    iconBtn: { marginLeft: 15 },

    scrollContent: { paddingBottom: 80 },
    profileSection: { paddingHorizontal: 20 },

    userInfoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    avatarContainer: { marginRight: 20 },
    avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 1, borderColor: '#eee' },
    vipBadge: {
        position: 'absolute', bottom: -5, left: 20, right: 20,
        backgroundColor: '#4169E1', borderRadius: 10, alignItems: 'center', paddingVertical: 2
    },
    vipText: { color: 'white', fontSize: 10, fontWeight: 'bold' },

    statsContainer: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
    statBox: { alignItems: 'center' },
    statValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
    statLabel: { fontSize: 12, color: COLORS.textMuted },

    nameSection: { marginTop: 15 },
    username: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
    idRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    userId: { fontSize: 12, color: COLORS.textMuted },

    tagsRow: { flexDirection: 'row', marginTop: 10, flexWrap: 'wrap', gap: 8 },
    tagBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    tagText: { fontSize: 10, fontWeight: 'bold' },

    bioText: { marginTop: 12, fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },

    actionButtonsRow: { flexDirection: 'row', marginTop: 20, gap: 10 },
    editProfileBtn: {
        flex: 1, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#F2F2F7', alignItems: 'center',
        borderWidth: 1, borderColor: '#E5E5EA'
    },
    editProfileText: { color: COLORS.text, fontWeight: '600' },
    friendBtn: {
        width: 100, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#404040', alignItems: 'center',
        flexDirection: 'row', justifyContent: 'center', gap: 5
    },
    friendBtnText: { color: 'white', fontWeight: 'bold' },

    giftBanner: { marginTop: 20, borderRadius: 15, overflow: 'hidden' },
    giftGradient: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
    giftTitle: { fontSize: 14, fontWeight: 'bold', color: '#D97706' },
    giftSubtitle: { fontSize: 12, color: '#F59E0B' },

    // Tabs
    tabBar: { flexDirection: 'row', marginTop: 20, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
    tab: { marginRight: 25, paddingVertical: 10, alignItems: 'center' },
    tabText: { fontSize: 16, color: COLORS.textMuted, fontWeight: '600' },
    activeTabText: { color: COLORS.text, fontSize: 18 },
    tabIndicator: { position: 'absolute', bottom: -1, width: 20, height: 3, backgroundColor: COLORS.primary, borderRadius: 2 },

    // Grid
    contentGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 5, paddingBottom: 50 },
    coverItem: { width: width / 3 - 10, margin: 5, marginBottom: 15 },
    coverImage: { width: '100%', height: 120, borderRadius: 10, backgroundColor: '#eee' },
    coverOverlay: { position: 'absolute', bottom: 40, left: 5 },
    playCountBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
    playCountText: { color: 'white', fontSize: 10, marginLeft: 2 },
    coverTitle: { fontSize: 12, fontWeight: '600', marginTop: 5, color: COLORS.text },
    coverDate: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
});

export default ProfileScreen;

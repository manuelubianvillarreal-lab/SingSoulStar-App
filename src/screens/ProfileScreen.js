import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = () => {
    const { user, logout, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = React.useState(false);
    const [name, setName] = React.useState(user?.name || '');
    const [bio, setBio] = React.useState(user?.bio || '¡Hola! Soy nuevo en SingSoulStar.');

    const TABS = ['Moments', 'Covers', 'Duets'];
    const [activeTab, setActiveTab] = React.useState('Covers');

    const handleSave = async () => {
        const success = await updateProfile({ name, bio });
        if (success) {
            setIsEditing(false);
            Alert.alert('Éxito', 'Perfil actualizado correctamente');
        } else {
            Alert.alert('Error', 'No se pudo actualizar el perfil');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="person-add-outline" size={24} color="white" />
                <Text style={styles.headerTitle}>{user?.name || 'Invitado'}</Text>
                <TouchableOpacity onPress={logout}>
                    <Ionicons name="log-out-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* User Info Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: user?.avatar || 'https://i.pravatar.cc/300' }}
                            style={styles.avatar}
                        />
                        <View style={styles.vipBadge}>
                            <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.vipGradient}>
                                <Text style={styles.vipText}>VIP</Text>
                            </LinearGradient>
                        </View>
                    </View>

                    <Text style={styles.username}>{user?.name || 'Invitado'}</Text>
                    <Text style={styles.bioText} numberOfLines={2}>{user?.bio || 'Sin biografía'}</Text>
                    <Text style={styles.userId}>ID: {user?.id?.substring(0, 8) || '98765432'}</Text>

                    <View style={styles.statsRow}>
                        <StatItem value="0" label="Seguidores" />
                        <StatItem value="0" label="Siguiendo" />
                        <StatItem value="A+" label="Rango" />
                    </View>

                    <TouchableOpacity onPress={() => setIsEditing(true)}>
                        <LinearGradient colors={GRADIENTS.primary} style={styles.editBtn}>
                            <Text style={styles.editBtnText}>Editar Perfil</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Edit Modal */}
                <Modal visible={isEditing} animationType="slide" transparent={true}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalHeader}>Editar Perfil</Text>

                            <Text style={styles.label}>Nombre</Text>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                style={styles.textInput}
                                placeholder="Tu nombre"
                                placeholderTextColor="#666"
                            />

                            <Text style={styles.label}>Biografía</Text>
                            <TextInput
                                value={bio}
                                onChangeText={setBio}
                                style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                                multiline
                                placeholder="Cuéntanos sobre ti..."
                                placeholderTextColor="#666"
                            />

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}>
                                    <Text style={{ color: 'white' }}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Guardar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Daily Tasks (Gamification) */}
                <View style={styles.taskSection}>
                    <View style={styles.taskHeader}>
                        <Text style={styles.sectionTitle}>Daily Tasks</Text>
                        <Text style={styles.seeAll}>See All</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.taskList}>
                        <TaskCard title="Check-in" reward="+20 Exp" icon="calendar" done />
                        <TaskCard title="Sing 1 Song" reward="+50 Exp" icon="mic" />
                        <TaskCard title="Send Gift" reward="+10 Gold" icon="gift" />
                    </ScrollView>
                </View>

                {/* Content Tabs */}
                <View style={styles.tabBar}>
                    {TABS.map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.activeTab]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                            {activeTab === tab && <View style={styles.tabIndicator} />}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Grid Content */}
                <View style={styles.contentGrid}>
                    <CoverItem title="Despacito" plays="5.4k" />
                    <CoverItem title="Shape of You" plays="2.1k" />
                    <CoverItem title="My Way" plays="10k" />
                    <CoverItem title="Draft" plays="0" isDraft />
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const StatItem = ({ value, label }) => (
    <View style={styles.statItem}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const TaskCard = ({ title, reward, icon, done }) => (
    <LinearGradient
        colors={done ? ['#333', '#444'] : ['#2A2A2A', '#333']}
        style={[styles.taskCard, done && { opacity: 0.6 }]}
    >
        <Ionicons name={icon} size={24} color={done ? '#888' : COLORS.accent} />
        <View>
            <Text style={styles.taskTitle}>{title}</Text>
            <Text style={styles.taskReward}>{reward}</Text>
        </View>
        {done && <Ionicons name="checkmark-circle" size={16} color="#4CAF50" style={{ position: 'absolute', top: 5, right: 5 }} />}
    </LinearGradient>
);

const CoverItem = ({ title, plays, isDraft }) => (
    <View style={styles.coverItem}>
        <Image source={{ uri: `https://via.placeholder.com/150?text=${title}` }} style={styles.coverImage} />
        <View style={styles.coverInfo}>
            <Text style={styles.coverTitle}>{title}</Text>
            {isDraft ? (
                <Text style={{ color: 'orange', fontSize: 10 }}>Draft</Text>
            ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="play" size={10} color="#ccc" />
                    <Text style={styles.coverPlays}>{plays}</Text>
                </View>
            )}
        </View>
        <View style={styles.rankBadge}>
            <Text style={{ color: 'white', fontSize: 8, fontWeight: 'bold' }}>SS</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center' },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    scrollContent: { paddingBottom: 80 },
    profileCard: { alignItems: 'center', marginTop: 10 },
    avatarContainer: { marginBottom: 10 },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: COLORS.surfaceLight },
    vipBadge: { position: 'absolute', bottom: 0, right: 0, overflow: 'hidden', borderRadius: 10 },
    vipGradient: { paddingHorizontal: 8, paddingVertical: 2 },
    vipText: { fontSize: 10, fontWeight: 'bold', color: '#5D4037' },
    username: { color: 'white', fontSize: 22, fontWeight: 'bold' },
    userId: { color: COLORS.textMuted, fontSize: 12, marginBottom: 15 },
    bioText: { color: '#ccc', textAlign: 'center', marginHorizontal: 40, fontSize: 14, marginBottom: 10 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 20 },

    // Modal Edit Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 25 },
    modalHeader: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    label: { color: COLORS.textMuted, fontSize: 12, marginBottom: 5, marginTop: 15 },
    textInput: { backgroundColor: COLORS.surfaceLight, borderRadius: 10, padding: 12, color: 'white', fontSize: 16 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 30 },
    cancelBtn: { padding: 10, marginRight: 20 },
    saveBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },

    statItem: { alignItems: 'center' },
    statValue: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    statLabel: { color: COLORS.textMuted, fontSize: 12 },
    editBtn: { paddingVertical: 8, paddingHorizontal: 30, borderRadius: 20 },
    editBtnText: { color: 'white', fontWeight: 'bold' },

    taskSection: { marginTop: 20, paddingHorizontal: 15 },
    taskHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    sectionTitle: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    seeAll: { color: COLORS.textMuted, fontSize: 12 },
    taskList: { flexDirection: 'row' },
    taskCard: { width: 120, height: 60, borderRadius: 10, marginRight: 10, padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    taskTitle: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    taskReward: { color: COLORS.accent, fontSize: 10 },

    tabBar: { flexDirection: 'row', marginTop: 20, borderBottomWidth: 1, borderBottomColor: '#222' },
    tab: { flex: 1, alignItems: 'center', paddingVertical: 10 },
    activeTab: {},
    tabText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
    activeTabText: { color: 'white' },
    tabIndicator: { position: 'absolute', bottom: -1, width: 20, height: 3, backgroundColor: COLORS.accent, borderRadius: 2 },

    contentGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10 },
    coverItem: { width: '48%', margin: '1%', marginBottom: 10, borderRadius: 10, overflow: 'hidden', backgroundColor: COLORS.surface },
    coverImage: { width: '100%', height: 150 },
    coverInfo: { padding: 8 },
    coverTitle: { color: 'white', fontSize: 14, fontWeight: 'bold' },
    coverPlays: { color: '#ccc', fontSize: 10, marginLeft: 3 },
    rankBadge: { position: 'absolute', top: 5, left: 5, backgroundColor: 'rgba(0,0,0,0.6)', padding: 3, borderRadius: 4, borderWidth: 1, borderColor: COLORS.accent },
});

export default ProfileScreen;

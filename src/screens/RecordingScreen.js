import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Platform, Alert, Modal, Dimensions, Animated, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import LyricsView from '../components/LyricsView';
import PitchVisualizer from '../components/PitchVisualizer';
import { RecordingService } from '../services/RecordingService';
import { ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

const { width, height } = Dimensions.get('window');

const RecordingScreen = ({ route, navigation }) => {
    // ... (All state logic remains the same, only UI changes)
    const { song, mode = 'Solo', isJoining = false, isNewCollab = false, role = 'Both', parentRecording = null } = route.params || {};

    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [recording, setRecording] = useState(null);
    const [backingTrack, setBackingTrack] = useState(null);
    const [parentSound, setParentSound] = useState(null);
    const [playbackStatus, setPlaybackStatus] = useState(null);
    const [showPostRecord, setShowPostRecord] = useState(false);
    const [audioEffect, setAudioEffect] = useState('Studio');
    const [recordingUri, setRecordingUri] = useState(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const [userPart, setUserPart] = useState(mode === 'Duet' ? role : 'Both');
    const [isVideoMode, setIsVideoMode] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();

    const fadeAnim = useRef(new Animated.Value(0)).current;

    // ... (useEffect for Permissions & Audio Setup - No changes needed logic-wise)
    useEffect(() => {
        (async () => {
            // ... existing audio setup logic ... 
            try {
                const { status } = await Audio.requestPermissionsAsync();
                if (status !== 'granted') Alert.alert('Permiso necesario', 'Micrófono requerido.');
                await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true, staysActiveInBackground: true, shouldRouteThroughEarpieceAndroid: false });

                const audioUrl = song.audio_url || (song.audioFile ? song.audioFile.uri : null);
                if (audioUrl) {
                    const { sound } = await Audio.Sound.createAsync({ uri: audioUrl }, { shouldPlay: false, volume: isJoining ? 0.8 : 1.0 }, onPlaybackStatusUpdate);
                    setBackingTrack(sound);
                }
                if (isJoining && parentRecording?.audio_url) {
                    const { sound } = await Audio.Sound.createAsync({ uri: parentRecording.audio_url }, { shouldPlay: false, volume: 1.0 });
                    setParentSound(sound);
                }
            } catch (e) { console.error(e); }
        })();

        Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
        return () => {
            if (backingTrack) backingTrack.unloadAsync();
            if (parentSound) parentSound.unloadAsync();
            if (recording) recording.stopAndUnloadAsync();
        };
    }, []);

    const onPlaybackStatusUpdate = (status) => {
        if (status.isLoaded) {
            setPlaybackStatus(status);
            setDuration(status.positionMillis);
            if (status.didJustFinish) stopRecording();
        }
    };

    async function startRecording() {
        try {
            if (backingTrack) { await backingTrack.setPositionAsync(0); await backingTrack.playAsync(); }
            if (parentSound) { await parentSound.setPositionAsync(0); await parentSound.playAsync(); }
            const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            setRecording(recording);
            setIsRecording(true);
        } catch (err) { console.error('Failed to start', err); }
    }

    async function stopRecording() {
        setIsRecording(false);
        try {
            if (backingTrack) await backingTrack.stopAsync();
            if (parentSound) await parentSound.stopAsync();
            if (recording) {
                await recording.stopAndUnloadAsync();
                setRecordingUri(recording.getURI());
            }
            setShowPostRecord(true);
        } catch (error) { console.error(error); setShowPostRecord(true); }
    }

    const handlePublish = async () => {
        if (!recordingUri) return;
        setIsPublishing(true);
        try {
            await RecordingService.uploadRecording({
                songId: song.id, effect: audioEffect, mode: mode, duration: duration,
                parent_id: isJoining ? parentRecording.id : null, is_open_collab: isNewCollab, collab_part: userPart
            }, { uri: recordingUri });
            setShowPostRecord(false);
            Alert.alert("¡Éxito!", "Cover publicado.");
            navigation.navigate('Main');
        } catch (e) { Alert.alert("Error", "Fallo al subir."); } finally { setIsPublishing(false); }
    };

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ImageBackground
                source={{ uri: song.cover_url || 'https://via.placeholder.com/800' }}
                style={styles.backgroundImage}
                blurRadius={20} // Heavy blur for immersive feel
            >
                <View style={styles.darkOverlay} />

                {isVideoMode && permission?.granted ? (
                    <CameraView style={StyleSheet.absoluteFill} facing="front" />
                ) : null}

                <SafeAreaView style={styles.safeArea}>
                    {/* Header: Transparent & Minimal */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                            <Ionicons name="chevron-down" size={32} color="white" />
                        </TouchableOpacity>

                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.headerTitle} numberOfLines={1}>{song.title}</Text>
                            <Text style={styles.headerSubtitle}>{isJoining ? 'Dueto' : song.artist}</Text>
                        </View>

                        <TouchableOpacity style={styles.headerBtn} onPress={() => setShowPostRecord(true)}>
                            <Ionicons name="options" size={28} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Main Stage: Lyrics & Pitch */}
                    <View style={styles.stageArea}>
                        <View style={styles.pitchContainer}>
                            <PitchVisualizer currentTime={duration} isRecording={isRecording} />
                        </View>

                        {/* Duet Switcher */}
                        {mode === 'Duet' && (
                            <View style={styles.duetSwitcher}>
                                <TouchableOpacity onPress={() => !isJoining && setUserPart('A')} style={[styles.roleBtn, userPart === 'A' && styles.roleBtnActive]}>
                                    <Text style={styles.roleText}>Parte A</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => !isJoining && setUserPart('B')} style={[styles.roleBtn, userPart === 'B' && styles.roleBtnActive, { backgroundColor: userPart === 'B' ? '#FF00A2' : 'transparent' }]}>
                                    <Text style={styles.roleText}>Parte B</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={styles.lyricsContainer}>
                            <LyricsView lyrics={song.lyrics} currentTime={duration} mode={mode} userPart={userPart} />
                        </View>
                    </View>

                    {/* Footer Controls: The "Clone" Part */}
                    <View style={styles.footerControls}>
                        {/* Time Display */}
                        <Text style={styles.timeDisplay}>{formatTime(duration)}</Text>

                        <View style={styles.controlRow}>
                            {/* Monitor / Hooks */}
                            <TouchableOpacity style={styles.subControl} onPress={() => Alert.alert("Auriculares", "Conecta auriculares para monitorización.")}>
                                <Ionicons name="headset" size={28} color="white" />
                                <Text style={styles.subControlText}>Monitor</Text>
                            </TouchableOpacity>

                            {/* THE BIG RECORD BUTTON */}
                            <TouchableOpacity activeOpacity={0.8} onPress={isRecording ? stopRecording : startRecording}>
                                <View style={[styles.recordOuterRing, isRecording && styles.recordingPulse]}>
                                    <LinearGradient
                                        colors={isRecording ? ['#FF512F', '#DD2476'] : ['#FF512F', '#F09819']}
                                        style={styles.recordBtnGradient}
                                    >
                                        <Ionicons name={isRecording ? "stop" : "mic"} size={40} color="white" />
                                    </LinearGradient>
                                </View>
                            </TouchableOpacity>

                            {/* Camera Toggle */}
                            <TouchableOpacity style={styles.subControl} onPress={async () => {
                                if (!permission?.granted) await requestPermission();
                                setIsVideoMode(!isVideoMode);
                            }}>
                                <Ionicons name={isVideoMode ? "videocam" : "videocam-off"} size={28} color="white" />
                                <Text style={styles.subControlText}>Cámara</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </SafeAreaView>
            </ImageBackground>

            {/* Post-Record / Effects Modal */}
            <Modal visible={showPostRecord} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Estudio de Grabación</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.effectsRow}>
                            {['Original', 'Estudio', 'Pop', 'KTV', 'Rock'].map(effect => (
                                <TouchableOpacity key={effect} style={[styles.effectBubble, audioEffect === effect && styles.effectBubbleActive]} onPress={() => setAudioEffect(effect)}>
                                    <Ionicons name="musical-notes" size={24} color={audioEffect === effect ? 'white' : '#888'} />
                                    <Text style={[styles.effectText, audioEffect === effect && styles.effectTextActive]}>{effect}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => setShowPostRecord(false)}>
                                <Text style={styles.actionTextSecondary}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtnPrimary} onPress={handlePublish} disabled={isPublishing}>
                                {isPublishing ? <ActivityIndicator color="white" /> : <Text style={styles.actionTextPrimary}>Publicar</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    backgroundImage: { flex: 1, width: '100%', height: '100%' },
    darkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' }, // Darker for contrast
    safeArea: { flex: 1 },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, height: 60 },
    headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitleContainer: { alignItems: 'center', flex: 1 },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
    headerSubtitle: { color: '#ccc', fontSize: 12 },

    stageArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    pitchContainer: { height: 100, width: '100%', marginBottom: 20 },
    lyricsContainer: { width: '100%', paddingHorizontal: 20, height: 300, justifyContent: 'center' },

    duetSwitcher: { flexDirection: 'row', marginBottom: 20, gap: 10 },
    roleBtn: { paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    roleBtnActive: { backgroundColor: '#00D4FF', borderColor: '#00D4FF' },
    roleText: { color: 'white', fontSize: 12, fontWeight: 'bold' },

    footerControls: { paddingBottom: 40, alignItems: 'center', backgroundColor: 'transparent' },
    timeDisplay: { color: 'rgba(255,255,255,0.8)', fontSize: 36, fontWeight: '200', marginBottom: 20, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

    controlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', width: '100%' },
    subControl: { alignItems: 'center', opacity: 0.9 },
    subControlText: { color: 'white', fontSize: 10, marginTop: 5, fontWeight: '600' },

    recordOuterRing: { width: 90, height: 90, borderRadius: 45, padding: 3, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
    recordBtnGradient: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', shadowColor: "#FF512F", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20, elevation: 10 },
    recordingPulse: { borderColor: '#FF512F', borderWidth: 4 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#1E1E1E', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25 },
    modalHeader: { alignItems: 'center', marginBottom: 20 },
    modalTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    effectsRow: { flexDirection: 'row', marginBottom: 30, paddingVertical: 10 },
    effectBubble: { alignItems: 'center', marginRight: 20, width: 70 },
    effectBubbleActive: { opacity: 1 },
    effectText: { color: '#888', fontSize: 12, marginTop: 5 },
    effectTextActive: { color: COLORS.primary, fontWeight: 'bold' },

    modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
    actionBtnSecondary: { flex: 1, padding: 15, borderRadius: 30, backgroundColor: '#333', alignItems: 'center' },
    actionTextSecondary: { color: 'white', fontWeight: 'bold' },
    actionBtnPrimary: { flex: 1, padding: 15, borderRadius: 30, backgroundColor: COLORS.primary, alignItems: 'center' },
    actionTextPrimary: { color: 'white', fontWeight: 'bold' }
});

export default RecordingScreen;

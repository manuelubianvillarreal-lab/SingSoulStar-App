import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { SongService } from '../services/SongService';

const { width } = Dimensions.get('window');

const ManualSyncScreen = ({ route, navigation }) => {
    const { songData } = route.params;
    const [lines, setLines] = useState(songData.rawLyrics.split('\n').filter(l => l.trim() !== ''));
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [syncedLyrics, setSyncedLyrics] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [timer, setTimer] = useState(0);
    const [sound, setSound] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const scrollViewRef = useRef();

    // Audio Loading
    useEffect(() => {
        async function loadAudio() {
            try {
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: true,
                    shouldRouteThroughEarpieceAndroid: false
                });

                const { sound: playbackObject } = await Audio.Sound.createAsync(
                    { uri: songData.audioFile.uri },
                    { shouldPlay: false }
                );
                setSound(playbackObject);

                playbackObject.setOnPlaybackStatusUpdate((status) => {
                    if (status.isLoaded) {
                        setTimer(status.positionMillis);
                        setIsPlaying(status.isPlaying);
                        if (status.didJustFinish) {
                            setIsPlaying(false);
                            if (currentLineIndex >= lines.length) {
                                Alert.alert("Sincronización Terminada", "¿Deseas guardar el karaoke?", [
                                    { text: "Revisar", style: 'cancel' },
                                    { text: "Guardar", onPress: saveSong }
                                ]);
                            }
                        }
                    }
                });
            } catch (error) {
                console.error("Error loading audio", error);
                Alert.alert("Error", "No se pudo cargar el archivo de audio.");
            }
        }

        loadAudio();

        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, []);

    const togglePlay = async () => {
        if (!sound) return;
        if (isPlaying) {
            await sound.pauseAsync();
        } else {
            await sound.playAsync();
        }
    };

    const markLine = () => {
        if (currentLineIndex < lines.length) {
            let lineText = lines[currentLineIndex];
            let singer = 'Both';

            // Detect Singer Prefix
            if (lineText.startsWith('[A]') || lineText.startsWith('A:')) {
                singer = 'A';
                lineText = lineText.replace(/^(\[A\]|A:)\s*/, '');
            } else if (lineText.startsWith('[B]') || lineText.startsWith('B:')) {
                singer = 'B';
                lineText = lineText.replace(/^(\[B\]|B:)\s*/, '');
            }

            const newSyncLine = {
                time: timer,
                text: lineText,
                singer: singer
            };

            setSyncedLyrics(prev => [...prev, newSyncLine]);
            setCurrentLineIndex(prev => prev + 1);

            // Auto scroll preview
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({ y: currentLineIndex * 40, animated: true });
            }, 100);
        }
    };

    const saveSong = async () => {
        if (sound) await sound.stopAsync();
        setIsUploading(true);

        try {
            const metadata = {
                title: songData.title,
                artist: songData.artist,
                lyrics: syncedLyrics
            };

            await SongService.uploadSong(metadata, songData.audioFile, songData.coverFile);

            Alert.alert('¡Éxito!', 'Canción publicada correctamente.', [
                { text: 'Ir al Inicio', onPress: () => navigation.navigate('MainTabs') }
            ]);
        } catch (e) {
            console.error("Upload Error:", e);
            Alert.alert('Error', 'Hubo un problema al subir la canción.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleExit = () => {
        Alert.alert(
            "Salir del Editor",
            "¿Estás seguro que quieres salir? Perderás el progreso de sincronización.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Salir",
                    style: "destructive",
                    onPress: async () => {
                        if (sound) await sound.stopAsync();
                        navigation.goBack();
                    }
                }
            ]
        );
    };

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const millis = Math.floor((ms % 1000) / 100);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}.${millis}`;
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleExit}>
                    <Ionicons name="close" size={32} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Sincronización Manual</Text>
                <Text style={styles.timer}>{formatTime(timer)}</Text>
            </View>

            <View style={styles.lyricsPreview}>
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={{ alignItems: 'center', paddingVertical: 150 }}
                >
                    {syncedLyrics.map((line, index) => (
                        <Text key={`synced-${index}`} style={styles.syncedLine}>
                            {line.text}
                        </Text>
                    ))}

                    {currentLineIndex < lines.length && (
                        <Text style={styles.activeLine}>
                            {lines[currentLineIndex]}
                        </Text>
                    )}

                    {lines.slice(currentLineIndex + 1, currentLineIndex + 5).map((line, index) => (
                        <Text key={`future-${index}`} style={styles.futureLine}>
                            {line}
                        </Text>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.controls}>
                <Text style={styles.instruction}>
                    {currentLineIndex < lines.length
                        ? `Pulsa "TAP" cuando empiece la línea`
                        : "¡Sincronización lista! Pulsa GUARDAR."}
                </Text>

                <View style={styles.buttonsRow}>
                    <TouchableOpacity style={styles.playButton} onPress={togglePlay}>
                        <Ionicons name={isPlaying ? "pause" : "play"} size={36} color={COLORS.primary} />
                    </TouchableOpacity>

                    {currentLineIndex < lines.length ? (
                        <TouchableOpacity
                            style={[styles.syncButton, !isPlaying && { opacity: 0.5 }]}
                            onPress={markLine}
                            disabled={!isPlaying}
                        >
                            <LinearGradient
                                colors={GRADIENTS.singButton}
                                style={styles.syncGradient}
                            >
                                <Text style={styles.syncText}>TAP LINE</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.syncButton, { backgroundColor: COLORS.success }]}
                            onPress={saveSong}
                            disabled={isUploading}
                        >
                            <View style={styles.syncGradient}>
                                <Text style={styles.syncText}>{isUploading ? 'SUBIENDO...' : 'GUARDAR'}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#333' },
    headerTitle: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    timer: { color: COLORS.accent, fontSize: 18, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

    lyricsPreview: { flex: 1 },
    activeLine: { color: COLORS.accent, fontWeight: 'bold', fontSize: 28, textAlign: 'center', marginVertical: 20, paddingHorizontal: 30 },
    syncedLine: { color: '#555', fontSize: 16, textAlign: 'center', marginVertical: 5 },
    futureLine: { color: '#888', fontSize: 18, textAlign: 'center', marginVertical: 8, opacity: 0.6 },

    controls: { padding: 30, backgroundColor: '#1E1E1E', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
    instruction: { color: '#aaa', textAlign: 'center', marginBottom: 20, fontSize: 14 },
    buttonsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    playButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 5 },
    syncButton: { flex: 1, marginLeft: 20, height: 70, borderRadius: 35, overflow: 'hidden', elevation: 5 },
    syncGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    syncText: { color: 'white', fontSize: 20, fontWeight: 'bold', letterSpacing: 2 },
});

export default ManualSyncScreen;

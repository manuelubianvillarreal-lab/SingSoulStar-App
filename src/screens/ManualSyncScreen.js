import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SongService } from '../services/SongService';

const ManualSyncScreen = ({ route, navigation }) => {
    const { songData } = route.params;
    const [lines, setLines] = useState(songData.rawLyrics.split('\n').filter(l => l.trim() !== ''));
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [syncedLyrics, setSyncedLyrics] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [startTime, setStartTime] = useState(0);
    const [timer, setTimer] = useState(0); // Mock timer for web simulator

    const timerRef = useRef(null);

    const togglePlay = () => {
        if (isPlaying) {
            clearInterval(timerRef.current);
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
            const start = Date.now() - timer;
            setStartTime(start);
            timerRef.current = setInterval(() => {
                setTimer(Date.now() - start);
            }, 50);
        }
    };

    const markLine = () => {
        if (!isPlaying) {
            Alert.alert('Play Music First', 'Please start the music to sync lyrics.');
            return;
        }

        if (currentLineIndex < lines.length) {
            let lineText = lines[currentLineIndex];
            let singer = 'Both';

            // Detect Singer Prefix (e.g., "[A] Text", "[B] Text", "[Both] Text" or "A: Text")
            if (lineText.startsWith('[A]') || lineText.startsWith('A:')) {
                singer = 'A';
                lineText = lineText.replace(/^(\[A\]|A:)\s*/, '');
            } else if (lineText.startsWith('[B]') || lineText.startsWith('B:')) {
                singer = 'B';
                lineText = lineText.replace(/^(\[B\]|B:)\s*/, '');
            } else if (lineText.startsWith('[Both]') || lineText.startsWith('Ambos:')) {
                singer = 'Both';
                lineText = lineText.replace(/^(\[Both\]|Ambos:)\s*/, '');
            }

            const newSyncLine = {
                time: timer,
                text: lineText,
                singer: singer
            };
            setSyncedLyrics([...syncedLyrics, newSyncLine]);
            setCurrentLineIndex(currentLineIndex + 1);
        } else {
            // Finished
            clearInterval(timerRef.current);
            setIsPlaying(false);
            saveSong();
        }
    };

    const saveSong = async () => {
        setIsPlaying(false); // Ensure playback stops

        try {
            // Prepare metadata
            const metadata = {
                title: songData.title,
                artist: songData.artist,
                lyrics: syncedLyrics
            };

            // Call Cloud Service
            // Note: We need to handle file conversion for Web/Native compatibility if needed
            // But checking SongService, it expects the file objects.

            Alert.alert('Subiendo...', 'Tu canción se está enviando a la nube. Esto puede tardar unos segundos.');

            await SongService.uploadSong(metadata, songData.audioFile, songData.coverFile);

            Alert.alert('¡Éxito!', 'Canción publicada en el catálogo global de SingSoulStar 🌍', [
                { text: 'Genial', onPress: () => navigation.navigate('MainTabs') }
            ]);

        } catch (e) {
            console.error("Upload Error:", e);
            Alert.alert('Error', 'Hubo un problema al subir la canción. Asegúrate de que el bucket "singsoulstar-assets" exista y sea público.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Sync Lyrics</Text>
                <Text style={styles.timer}>{formatTime(timer)}</Text>
            </View>

            <View style={styles.lyricsPreview}>
                <ScrollView contentContainerStyle={{ alignItems: 'center', paddingVertical: 100 }}>
                    {lines.map((line, index) => (
                        <Text key={index} style={[
                            styles.lyricLine,
                            index === currentLineIndex ? styles.activeLine :
                                index < currentLineIndex ? styles.syncedLine : styles.futureLine
                        ]}>
                            {line}
                        </Text>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.controls}>
                <Text style={styles.instruction}>
                    {currentLineIndex < lines.length
                        ? `Tap "SYNC" when line ${currentLineIndex + 1} starts`
                        : "All lines synced! Saving..."}
                </Text>

                <View style={styles.buttonsRow}>
                    <TouchableOpacity style={styles.playButton} onPress={togglePlay}>
                        <Ionicons name={isPlaying ? "pause" : "play"} size={30} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.syncButton, !isPlaying && styles.disabledBtn]}
                        onPress={markLine}
                        disabled={!isPlaying || currentLineIndex >= lines.length}
                    >
                        <LinearGradient
                            colors={isPlaying ? GRADIENTS.singButton : ['#555', '#555']}
                            style={styles.syncGradient}
                        >
                            <Text style={styles.syncText}>TAP LINE</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const millis = Math.floor((ms % 1000) / 100);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}.${millis}`;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    timer: {
        color: COLORS.accent,
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'monospace',
    },
    lyricsPreview: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    lyricLine: {
        fontSize: 18,
        marginVertical: 10,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    activeLine: {
        color: COLORS.accent,
        fontWeight: 'bold',
        fontSize: 22,
        transform: [{ scale: 1.1 }],
    },
    syncedLine: {
        color: COLORS.primary,
        opacity: 0.6,
    },
    futureLine: {
        color: 'white',
        opacity: 0.8,
    },
    controls: {
        height: 200,
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        justifyContent: 'space-around',
    },
    instruction: {
        color: 'white',
        textAlign: 'center',
        marginBottom: 10,
        fontSize: 14,
    },
    buttonsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    playButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    syncButton: {
        flex: 1,
        marginLeft: 20,
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
    },
    syncGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    syncText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    disabledBtn: {
        opacity: 0.5,
    },
});

export default ManualSyncScreen;

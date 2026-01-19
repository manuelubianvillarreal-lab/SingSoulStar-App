import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UploadScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [lyrics, setLyrics] = useState('');
    const [audioFile, setAudioFile] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const pickAudio = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
            if (!result.canceled) { // Corrected check for newer Expo versions
                setAudioFile(result.assets ? result.assets[0] : result);
            }
        } catch (err) {
            console.warn(err);
        }
    };

    const pickImage = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: 'image/*' });
            if (!result.canceled) {
                setCoverImage(result.assets ? result.assets[0] : result);
            }
        } catch (err) {
            console.warn(err);
        }
    };

    const handleNext = async () => {
        if (!title || !artist || !audioFile || !lyrics) {
            alert('Please fill all fields and select files.');
            return;
        }

        navigation.navigate('ManualSync', {
            songData: {
                title,
                artist,
                audioFile: audioFile,
                coverFile: coverImage, // Can be null
                rawLyrics: lyrics,
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Creator Studio</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>Upload New Song</Text>
                <Text style={styles.subtitle}>Contribuye al catálogo de SingSoulStar</Text>

                {/* Metadata Form */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Song Title</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Bohemian Rhapsody"
                        placeholderTextColor={COLORS.textMuted}
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Artist Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Queen"
                        placeholderTextColor={COLORS.textMuted}
                        value={artist}
                        onChangeText={setArtist}
                    />
                </View>

                {/* File Pickers */}
                <View style={styles.row}>
                    <TouchableOpacity style={styles.fileButton} onPress={pickAudio}>
                        <Ionicons name={audioFile ? "checkmark-circle" : "musical-note"} size={24} color={audioFile ? COLORS.accent : "white"} />
                        <Text style={styles.fileButtonText}>{audioFile ? 'Audio Selected' : 'Select Audio'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.fileButton} onPress={pickImage}>
                        <Ionicons name={coverImage ? "checkmark-circle" : "image"} size={24} color={coverImage ? COLORS.accent : "white"} />
                        <Text style={styles.fileButtonText}>{coverImage ? 'Cover Selected' : 'Select Cover'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Lyrics Input */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Lyrics (Paste text here)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Paste the full lyrics here..."
                        placeholderTextColor={COLORS.textMuted}
                        multiline
                        textAlignVertical="top"
                        value={lyrics}
                        onChangeText={setLyrics}
                    />
                    <Text style={styles.hint}>Paste plain text. You will sync it in the next step.</Text>
                </View>

                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <LinearGradient
                        colors={GRADIENTS.primary}
                        style={styles.gradientBtn}
                    >
                        <Text style={styles.nextButtonText}>Next: Sync Lyrics</Text>
                        <Ionicons name="arrow-forward" size={20} color="white" />
                    </LinearGradient>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        color: COLORS.textMuted,
        marginBottom: 30,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        color: 'white',
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 15,
        color: 'white',
        fontSize: 16,
    },
    textArea: {
        height: 150,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    fileButton: {
        flex: 0.48,
        backgroundColor: COLORS.surfaceLight,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    fileButtonText: {
        color: 'white',
        marginTop: 10,
        fontSize: 12,
    },
    hint: {
        color: COLORS.textMuted,
        fontSize: 12,
        marginTop: 5,
    },
    nextButton: {
        marginTop: 20,
        borderRadius: 30,
        overflow: 'hidden',
    },
    gradientBtn: {
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    nextButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,
    },
});

export default UploadScreen;

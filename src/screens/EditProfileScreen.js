import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';

const EditProfileScreen = ({ navigation }) => {
    const { user, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [gender, setGender] = useState(user?.gender || '');
    const [hometown, setHometown] = useState(user?.hometown || '');
    const [profession, setProfession] = useState(user?.profession || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar || null);
    const [newAvatarUri, setNewAvatarUri] = useState(null);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setNewAvatarUri(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            let infoToUpdate = {
                name,
                bio,
                gender,
                hometown,
                profession
            };

            // Avatar Upload Logic
            if (newAvatarUri) {
                const response = await fetch(newAvatarUri);
                const blob = await response.blob();
                const fileExt = newAvatarUri.split('.').pop();
                const fileName = `${user.id}_${Date.now()}.${fileExt}`;
                const filePath = `avatars/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('singsoulstar-assets')
                    .upload(filePath, blob, { contentType: blob.type });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('singsoulstar-assets')
                    .getPublicUrl(filePath);

                infoToUpdate.avatar = publicUrl;
            }

            // Update Auth Metadata (and Profile table via Trigger ideally, but here simulated via Auth update)
            const success = await updateProfile(infoToUpdate);
            if (success) {
                Alert.alert("¡Éxito!", "Perfil actualizado correctamente.");
                navigation.goBack();
            } else {
                Alert.alert("Error", "No se pudo actualizar el perfil.");
            }

        } catch (error) {
            console.error("Save Profile Error:", error);
            Alert.alert("Error", "Falló la subida de datos.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Editar Perfil</Text>
                <TouchableOpacity onPress={handleSave} disabled={loading}>
                    {loading ? <ActivityIndicator color={COLORS.accent} /> : <Text style={styles.saveText}>Guardar</Text>}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
                        <Image source={{ uri: newAvatarUri || avatarUrl || 'https://via.placeholder.com/150' }} style={styles.avatar} />
                        <View style={styles.cameraIcon}>
                            <Ionicons name="camera" size={20} color="white" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.changePhotoText}>Cambiar Foto</Text>
                </View>

                <View style={styles.formElement}>
                    <Text style={styles.label}>Nombre de Usuario</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Tu nombre artístico" placeholderTextColor="#666" />
                </View>

                <View style={styles.formElement}>
                    <Text style={styles.label}>Biografía</Text>
                    <TextInput style={[styles.input, styles.textArea]} value={bio} onChangeText={setBio} multiline placeholder="Cuéntanos sobre ti..." placeholderTextColor="#666" />
                </View>

                <View style={styles.row}>
                    <View style={[styles.formElement, { flex: 1, marginRight: 10 }]}>
                        <Text style={styles.label}>Género</Text>
                        <TextInput style={styles.input} value={gender} onChangeText={setGender} placeholder="H/M/Otro" placeholderTextColor="#666" />
                    </View>
                    <View style={[styles.formElement, { flex: 1 }]}>
                        <Text style={styles.label}>Ciudad</Text>
                        <TextInput style={styles.input} value={hometown} onChangeText={setHometown} placeholder="Tu ciudad" placeholderTextColor="#666" />
                    </View>
                </View>

                <View style={styles.formElement}>
                    <Text style={styles.label}>Profesión</Text>
                    <TextInput style={styles.input} value={profession} onChangeText={setProfession} placeholder="¿A qué te dedicas?" placeholderTextColor="#666" />
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: 'bold' },
    backBtn: { padding: 5 },
    saveText: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },

    content: { padding: 20 },
    avatarSection: { alignItems: 'center', marginBottom: 30 },
    avatarWrapper: { position: 'relative' },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: COLORS.primary },
    cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.primary, padding: 8, borderRadius: 20 },
    changePhotoText: { color: COLORS.primary, marginTop: 10, fontSize: 14, fontWeight: 'bold' },

    formElement: { marginBottom: 20 },
    label: { color: COLORS.textSecondary, marginBottom: 5, fontSize: 12, textTransform: 'uppercase', fontWeight: '600' },
    input: { backgroundColor: '#F9FAFB', color: '#000000', padding: 15, borderRadius: 10, fontSize: 16, borderWidth: 1, borderColor: '#E5E7EB' },
    textArea: { height: 100, textAlignVertical: 'top' },
    row: { flexDirection: 'row' }
});

export default EditProfileScreen;

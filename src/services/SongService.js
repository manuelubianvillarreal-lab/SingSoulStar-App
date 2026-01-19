import { supabase } from '../lib/supabase';
import { Platform } from 'react-native';

export const SongService = {
    getSongs: async (page = 1, limit = 20) => {
        try {
            const start = (page - 1) * limit;
            const end = start + limit - 1;

            const { data, error } = await supabase
                .from('songs')
                .select('*')
                .range(start, end)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error("Supabase Fetch Error:", e);
            return []; // Return empty on error to avoid crash
        }
    },

    searchSongs: async (query) => {
        try {
            if (!query) return [];
            const { data, error } = await supabase
                .from('songs')
                .select('*')
                .ilike('title', `%${query}%`)
                .limit(20);

            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error("Supabase Search Error:", e);
            return [];
        }
    },

    uploadSong: async (metadata, audioFile, coverFile) => {
        try {
            console.log("--- INICIANDO PROCESO DE SUBIDA ---");
            console.log("Metadatos:", metadata);
            console.log("Archivo Audio:", audioFile);

            // Helper to get Blob (Web/Native)
            const getBlob = async (fileItem, type) => {
                try {
                    if (!fileItem) return null;
                    if (fileItem.file && Platform.OS === 'web') {
                        console.log(`Usando objeto File directo para ${type}`);
                        return fileItem.file;
                    }
                    console.log(`Obteniendo Blob vía fetch para ${type}: ${fileItem.uri}`);
                    const response = await fetch(fileItem.uri);
                    if (!response.ok) throw new Error(`Fetch falló con status ${response.status}`);
                    return await response.blob();
                } catch (err) {
                    console.error(`Error al obtener blob para ${type}:`, err);
                    throw new Error(`No se pudo procesar el archivo de ${type}. Asegúrate de que el archivo es válido.`);
                }
            };

            // 1. Upload Audio
            console.log("1. Procesando audio...");
            const audioExt = audioFile.name?.split('.').pop() || 'mp3';
            const audioPath = `${Date.now()}_audio.${audioExt}`;
            const audioBlob = await getBlob(audioFile, "audio");

            console.log(`2. Subiendo audio a Supabase Storage (Bucket: singsoulstar-assets, Path: ${audioPath})...`);
            const { data: audioData, error: audioError } = await supabase.storage
                .from('singsoulstar-assets')
                .upload(audioPath, audioBlob, {
                    contentType: audioBlob.type || 'audio/mpeg',
                    cacheControl: '3600',
                    upsert: false
                });

            if (audioError) {
                console.error("Error de Storage (Audio):", audioError);
                throw new Error(`Error al subir audio: ${audioError.message}. Verifica que el bucket 'singsoulstar-assets' existe y es público.`);
            }

            const audioUrl = supabase.storage.from('singsoulstar-assets').getPublicUrl(audioPath).data.publicUrl;
            console.log("Audio subido con éxito:", audioUrl);

            // 2. Upload Cover (Optional)
            let coverUrl = null;
            if (coverFile) {
                console.log("3. Procesando portada...");
                const coverExt = coverFile.name?.split('.').pop() || 'jpg';
                const coverPath = `${Date.now()}_cover.${coverExt}`;
                const coverBlob = await getBlob(coverFile, "portada");

                if (coverBlob) {
                    console.log("4. Subiendo portada...");
                    const { error: coverError } = await supabase.storage
                        .from('singsoulstar-assets')
                        .upload(coverPath, coverBlob, {
                            contentType: coverBlob.type || 'image/jpeg',
                            cacheControl: '3600',
                            upsert: false
                        });

                    if (coverError) {
                        console.warn("Fallo al subir portada, continuando sin ella:", coverError);
                    } else {
                        coverUrl = supabase.storage.from('singsoulstar-assets').getPublicUrl(coverPath).data.publicUrl;
                        console.log("Portada subida con éxito:", coverUrl);
                    }
                }
            }

            // 3. Insert Record
            console.log("5. Insertando registro en tabla 'songs'...");
            const { data, error } = await supabase
                .from('songs')
                .insert([{
                    title: metadata.title,
                    artist: metadata.artist,
                    lyrics: metadata.lyrics,
                    audio_url: audioUrl,
                    cover_url: coverUrl,
                    created_at: new Date(),
                }])
                .select();

            if (error) {
                console.error("Error de Base de Datos:", error);
                throw new Error(`Error al guardar en base de datos: ${error.message}. Verifica que la tabla 'songs' existe.`);
            }

            console.log("¡SUBIDA COMPLETADA CON ÉXITO!", data[0]);
            return data[0];

        } catch (e) {
            console.error("ERROR CRÍTICO EN SUBIDA:", e);
            throw e;
        }
    },

    parseLrc: (lrcContent) => {
        if (!lrcContent) return [];
        const lines = lrcContent.split(/\r?\n/); // Handle different line endings
        const lyrics = [];
        // More permissive regex: [00:00.00] or [00:00:00] or [0:00.00]
        const timeRegex = /\[(\d{1,2}):(\d{2})[.:](\d{2,3})\]/;

        lines.forEach(line => {
            const match = timeRegex.exec(line);
            if (match) {
                const minutes = parseInt(match[1], 10);
                const seconds = parseInt(match[2], 10);
                const milliseconds = parseInt(match[3].padEnd(3, '0'), 10);
                const time = (minutes * 60 * 1000) + (seconds * 1000) + milliseconds;
                const text = line.replace(timeRegex, '').trim();

                if (text) {
                    lyrics.push({ time, text, singer: 'Both' });
                }
            }
        });

        // Sort by time just in case
        return lyrics.sort((a, b) => a.time - b.time);
    }
};

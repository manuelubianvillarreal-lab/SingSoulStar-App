import { supabase } from '../lib/supabase';

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
            console.log("Iniciando subida...", { metadata, audioFile, coverFile });

            // Helper to get Blob (Web/Native)
            const getBlob = async (fileItem) => {
                if (!fileItem) return null;
                if (fileItem.file && Platform.OS === 'web') return fileItem.file; // Direct file on web
                const response = await fetch(fileItem.uri);
                return await response.blob();
            };

            // 1. Upload Audio
            const audioExt = audioFile.name?.split('.').pop() || 'mp3';
            const audioPath = `${Date.now()}_audio.${audioExt}`;
            const audioBlob = await getBlob(audioFile);

            if (!audioBlob) throw new Error("No se pudo procesar el archivo de audio.");

            const { data: audioData, error: audioError } = await supabase.storage
                .from('singsoulstar-assets')
                .upload(audioPath, audioBlob, {
                    contentType: audioBlob.type || 'audio/mpeg',
                    cacheControl: '3600',
                    upsert: false
                });

            if (audioError) {
                console.error("Storage Error (Audio):", audioError);
                throw new Error(`Error subiendo audio: ${audioError.message}`);
            }

            const audioUrl = supabase.storage.from('singsoulstar-assets').getPublicUrl(audioPath).data.publicUrl;

            // 2. Upload Cover (Optional)
            let coverUrl = null;
            if (coverFile) {
                const coverExt = coverFile.name?.split('.').pop() || 'jpg';
                const coverPath = `${Date.now()}_cover.${coverExt}`;
                const coverBlob = await getBlob(coverFile);

                if (coverBlob) {
                    const { error: coverError } = await supabase.storage
                        .from('singsoulstar-assets')
                        .upload(coverPath, coverBlob, {
                            contentType: coverBlob.type || 'image/jpeg',
                            cacheControl: '3600',
                            upsert: false
                        });

                    if (coverError) console.warn("Cover upload failed, continuing without cover:", coverError);
                    else coverUrl = supabase.storage.from('singsoulstar-assets').getPublicUrl(coverPath).data.publicUrl;
                }
            }

            // 3. Insert Record
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
                console.error("Database Insert Error:", error);
                throw new Error(`Error en base de datos: ${error.message}`);
            }

            return data[0];

        } catch (e) {
            console.error("Upload Error (Detailed):", e);
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

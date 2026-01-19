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
            // 1. Upload Audio
            const audioExt = audioFile.uri.split('.').pop();
            const audioPath = `${Date.now()}_audio.${audioExt}`;
            const { data: audioData, error: audioError } = await supabase.storage
                .from('singsoulstar-assets') // Ensure this bucket exists
                .upload(audioPath, audioFile, { contentType: 'audio/mpeg' }); // Expo handles file object for web/native differently, might need blob.

            if (audioError) throw audioError;

            const audioUrl = supabase.storage.from('singsoulstar-assets').getPublicUrl(audioPath).data.publicUrl;

            // 2. Upload Cover (Optional)
            let coverUrl = null;
            if (coverFile) {
                const coverExt = coverFile.uri.split('.').pop();
                const coverPath = `${Date.now()}_cover.${coverExt}`;
                const { error: coverError } = await supabase.storage
                    .from('singsoulstar-assets')
                    .upload(coverPath, coverFile, { contentType: 'image/jpeg' });

                if (coverError) throw coverError;
                coverUrl = supabase.storage.from('singsoulstar-assets').getPublicUrl(coverPath).data.publicUrl;
            }

            // 3. Insert Record
            const { data, error } = await supabase
                .from('songs')
                .insert([{
                    title: metadata.title,
                    artist: metadata.artist,
                    lyrics: metadata.lyrics, // JSON object
                    audio_url: audioUrl,
                    cover_url: coverUrl,
                    created_at: new Date(),
                }])
                .select();

            if (error) throw error;
            return data[0];

        } catch (e) {
            console.error("Upload Error:", e);
            throw e;
        }
    }
};

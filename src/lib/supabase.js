import { createClient } from '@supabase/supabase-js';

// URL del proyecto (Obtenida de tu captura)
const supabaseUrl = 'https://rvpvmszvfddtjwvrahss.supabase.co';

// ⚠️ IMPORTANTE: PEGA AQUÍ TU CLAVE PÚBLICA (ANON KEY)
// En tu captura de pantalla, es la que dice "Publishable key" -> "default"
// Pulsa el botón de copiar (cuadrados) en la web de Supabase para obtenerla completa.
const supabaseAnonKey = 'sb_publishable_Llmw_bRuJJCG0ddKIbNyWw_ge5DDzZc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

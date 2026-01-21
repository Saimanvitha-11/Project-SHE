import { createClient } from '@supabase/supabase-js';
import { fallbackSupabaseConfig } from "./supabaseFallback";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || fallbackSupabaseConfig.url;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || fallbackSupabaseConfig.key;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


import { createClient } from '@supabase/supabase-js';

// Pastikan nama tabel ini SAMA dengan yang ada di SQL Editor
export const TABLE_NAME = 'pixeltv_final';

const supabaseUrl = process.env.SUPABASE_URL || 'https://pktquztotlqvmrbxtele.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrdHF1enRvdGxxdm1yYnh0ZWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1OTEwMTIsImV4cCI6MjA4NTE2NzAxMn0.oi5Sk0sgv2KbO8Dp6Ksgh8eYsvLaN4mfYRNOiFzMOnI';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null as any;

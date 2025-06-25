import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qsyxpglzvwnqbddiflpv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzeXhwZ2x6dnducWJkZGlmbHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MzI4MjYsImV4cCI6MjA2NTQwODgyNn0.l-eKor_9AEoS1d3FOvd1u3ETx-GqHeju-ucQRJA7rhM';


export const supabase = createClient(supabaseUrl, supabaseAnonKey);
import { createClient } from '@supabase/supabase-js'


const supabaseUrl = 'https://jepglpevldstkeoxcntu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplcGdscGV2bGRzdGtlb3hjbnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5OTQ0MjAsImV4cCI6MjA2NzU3MDQyMH0.C88kAz7PvveZzDFpT7oXEu5H_F2V3TA76rUXJ30sUXk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
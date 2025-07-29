import { createClient } from '@supabase/supabase-js'


const supabaseUrl = 'https://ixifungzjmrzphttygsj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4aWZ1bmd6am1yenBodHR5Z3NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5OTI3NDAsImV4cCI6MjA2ODU2ODc0MH0.aAITV8y8U8OYebWoU9zhlTIQIGQal3Ybocx5Id2mkks'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
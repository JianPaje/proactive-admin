import { createClient } from '@supabase/supabase-js'


const supabaseUrl = 'https://hdfqfysrhlvpopevugvr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkZnFmeXNyaGx2cG9wZXZ1Z3ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MTY4ODgsImV4cCI6MjA2NDA5Mjg4OH0.HhbBR8ygApz0ZDa0ahBAovn6A7pOuAVcuQhbjPB2I3s'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
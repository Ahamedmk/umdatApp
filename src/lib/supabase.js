import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qrizcyutziaiiitkrsli.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyaXpjeXV0emlhaWlpdGtyc2xpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MTc3ODYsImV4cCI6MjA3ODI5Mzc4Nn0.u5tC3wvg4P1uo2FvcN2o3KMFrW0603ckSrnGH4AcV4I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

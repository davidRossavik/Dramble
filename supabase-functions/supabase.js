import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jsjliepluwxvrrtceghu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzamxpZXBsdXd4dnJydGNlZ2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NjQ0MzYsImV4cCI6MjA2NDU0MDQzNn0.B9qpCNjDQJpOO1DcTO6EHA6cHmxEFA2LIqnXUSrgLaU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ijqfuoriewstwhhziazx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqcWZ1b3JpZXdzdHdoaHppYXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1OTQ1NjQsImV4cCI6MjA2MTE3MDU2NH0.Or8TT1AMkaDaeBFWpPkH--vQx96MnLJMzpUAvv-ukjc';

export const supabase = createClient(supabaseUrl, supabaseKey);

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lvncxcgenyjqodvzebil.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bmN4Y2dlbnlqcW9kdnplYmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MzI3OTksImV4cCI6MjA5NTAwODc5OX0.8QbCaiA2PjORa86tgftDx7RHAkbNSoFzOMtpWiXNUhA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

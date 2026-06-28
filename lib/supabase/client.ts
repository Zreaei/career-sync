import { createClient } from "@supabase/supabase-js";
import { USE_MOCKS } from "./mockConfig";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ??
	(USE_MOCKS ? "https://example.supabase.co" : "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
	(USE_MOCKS ? "public-anon-key" : "");

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

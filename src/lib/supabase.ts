import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log("[Supabase] URL:", supabaseUrl ? `${supabaseUrl.slice(0, 30)}...` : "⚠️ MISSING");
console.log("[Supabase] Key:", supabaseKey ? `${supabaseKey.slice(0, 15)}...` : "⚠️ MISSING");

export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: "elephant" },
});

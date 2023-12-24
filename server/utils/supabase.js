// utils/supabase.js

import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const getSupabase = () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return supabase;
};

export { getSupabase };

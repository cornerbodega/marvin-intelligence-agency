import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
export default async function saveToSupabase(table, dataToSave) {
  const getSupabase = () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    return supabase;
  };

  const supabase = getSupabase();

  try {
    const response = await supabase.from(table).insert(dataToSave).select();

    if (response.error) {
      throw response.error;
    }

    // Successfully inserted data, response.data will contain the inserted data
    return response.data;
  } catch (error) {
    console.error("Error inserting data:", error.message);
  }
}

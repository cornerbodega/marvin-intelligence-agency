// utils/supabase.js

import { getSupabase } from "./supabase";

async function saveToSupabase(table, dataToSave) {
  const supabase = getSupabase();
  return await supabase.from(table).insert(dataToSave).select();
  // try {
  //   const response =

  //   if (response.error) {
  //     throw response.error;
  //   }

  //   // Successfully inserted data, response.data will contain the inserted data
  //   return response.data;
  // } catch (error) {
  //   console.error("Error inserting data:", error.message);

  // Here you can handle different types of errors (e.g., network issues, validation errors) differently
  // if (error.code === 'some_specific_error_code') {
  //   // Handle specific error type
  // }

  // Additionally, you may want to log the error to an error tracking service
  // }
}

export { saveToSupabase };

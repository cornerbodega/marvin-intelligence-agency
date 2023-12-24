// import { createClient } from "@supabase/supabase-js";
import saveToSupabase from "../../../utils/saveToSupabase.js";

export default async function saveAgentToSupabaseHandler(req, res) {
  console.log("UPLOAD AGENT PROFILE PIC ENDPOINT");
  console.log("Input:");
  console.log(req.body);
  const existingAgentId = req.body.existingAgentId;
  if (existingAgentId) {
    return { agentId: existingAgentId };
  }
  const expertise1 = req.body.expertiseOutput[0];
  let expertise2, expertise3;
  if (req.body.expertiseOutput[1]) {
    expertise2 = req.body.expertiseOutput[1];
  }
  if (req.body.expertiseOutput[2]) {
    expertise3 = req.body.expertiseOutput[2];
  }
  const newAgentModel = {
    agentName: req.body.agentName,
    userId: req.body.userId,
    expertise1,
    bio: req.body.bio,
    profilePicUrl: req.body.profilePicUrl,
    specializedTraining: req.body.specializedTraining,
  };
  if (expertise2) {
    newAgentModel.expertise2 = expertise2;
  }
  if (expertise3) {
    newAgentModel.expertise3 = expertise3;
  }
  const savedAgent = await saveToSupabase("agents", newAgentModel);
  console.log("savedAgent");
  console.log(savedAgent);
  const agentId = savedAgent[0].agentId;
  return { agentId };
}

// async function saveToSupabase(table, dataToSave) {
//   const getSupabase = () => {
//     const supabase = createClient(
//       "https://zibmgusmsqnpqacuygec.supabase.co",
//       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYm1ndXNtc3FucHFhY3V5Z2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTA4NDkzOTUsImV4cCI6MjAwNjQyNTM5NX0.DPSFsM5RekVICcIeV9PK08uwOEntnWuCVBWt-DBmxkA"
//     );

//     return supabase;
//   };

//   const supabase = getSupabase();

//   try {
//     const response = await supabase.from(table).insert(dataToSave).select();

//     if (response.error) {
//       throw response.error;
//     }

//     // Successfully inserted data, response.data will contain the inserted data
//     return response.data;
//   } catch (error) {
//     console.error("Error inserting data:", error.message);

//     // Here you can handle different types of errors (e.g., network issues, validation errors) differently
//     // if (error.code === 'some_specific_error_code') {
//     //   // Handle specific error type
//     // }

//     // Additionally, you may want to log the error to an error tracking service
//   }
// }

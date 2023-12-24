// @author Marvin-Rhone

import saveToFirebase from "../../../utils/saveToFirebase.js";
import { getSupabase } from "../../../utils/supabase.js";
export default async function handler(req, res) {
  console.log("QUEUE SAVE REGENERATE FOLDER TASK ENDPOINT");

  console.log(req.body);
  const { userId, folderId, currentGeneration, maxGenerations } = req.body;
  const supabase = getSupabase();
  try {
    const { foldersResponse, error } = await supabase
      .from("folders")
      .select("folderPicUrl")
      .eq("folderId", folderId);
    if (error) {
      console.log(error);
    }
    if (foldersResponse) {
      if (foldersResponse[0]) {
        if (foldersResponse[0].folderPicUrl) {
          console.log("folderPicUrl exists");
          return;
        }
      }
    }
  } catch (error) {
    console.log(error);
  }

  try {
    const newTask = {
      type: "regenerateFolder",
      status: "queued",
      userId,
      context: {
        folderId,
      },
      createdAt: new Date().toISOString(),
    };

    const saveTaskRef = await saveToFirebase(
      `/${process.env.NEXT_PUBLIC_env ? "asyncTasks" : "localAsyncTasks"}/${
        process.env.SERVER_UID
      }/${userId}/regenerateFolder`,
      newTask
    );

    if (saveTaskRef) {
      console.log("saveTaskRef");
      console.log(saveTaskRef);
      return { saveTaskRef };
    } else {
      console.error("Failed to queue the task.");
    }
  } catch (error) {
    console.error("Error queuing the task:", error.message);
  } finally {
  }
}

// @author Marvin-Rhone

import saveToFirebase from "../../../utils/saveToFirebase.js";

export default async function handler(req, res) {
  console.log("SAVE FOLDER ID TO FIREBASE ENDPOINT");
  console.log(req.body);
  const { userId, folderId } = req.body;

  try {
    const saveFolderIdRef = await saveToFirebase(
      `/${process.env.NEXT_PUBLIC_env ? "asyncTasks" : "localAsyncTasks"}/${
        process.env.SERVER_UID
      }/${userId}/finalizeAndVisualizeReport/context/folderId`,
      folderId
    );

    if (saveFolderIdRef) {
      return { saveFolderIdRef };
    } else {
      console.error("Failed to save the folder id.");
    }
  } catch (error) {
    console.error("Error queuing the task:", error.message);
  }
}

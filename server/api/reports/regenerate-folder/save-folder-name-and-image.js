import { getSupabase } from "../../../utils/supabase.js";
export default async function handler(req, res) {
  const supabase = getSupabase();
  console.log("SAVE FOLDER NAME AND IMAGE");
  console.log("Input:");
  console.log(req.body);
  const {
    folderName,
    folderPicUrl,
    folderDescription,
    folderId,
    folderImageResponse,
  } = req.body;

  // Get existing folder data
  const existingFolderData = await getExistingFolderData(folderId);
  async function getExistingFolderData() {
    try {
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .eq("folderId", folderId);
      if (error) {
        console.log(error);
      }
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  let existingFolderPicUrls = existingFolderData[0].folderPicUrls;
  if (existingFolderPicUrls) {
    existingFolderPicUrls = JSON.parse(existingFolderPicUrls);
  } else {
    existingFolderPicUrls = [];
  }
  existingFolderPicUrls.push(folderPicUrl);
  const folderPicUrls = JSON.stringify(existingFolderPicUrls);
  const folderNameAndImage = {
    folderName,
    folderPicUrl,
    folderPicUrls,
    folderDescription,
    folderPicDescription: folderImageResponse,
  };

  const updatedFolderData = await updateFolderData(
    folderId,
    folderNameAndImage
  );

  async function updateFolderData(folderId, folderNameAndImage) {
    try {
      const { data, error } = await supabase
        .from("folders")
        .update({
          folderName: folderNameAndImage.folderName,
          folderPicUrl: folderNameAndImage.folderPicUrl,
          folderPicUrls: folderNameAndImage.folderPicUrls,
          folderDescription: folderNameAndImage.folderDescription,
          folderPicDescription: folderNameAndImage.folderPicDescription,
        })
        .eq("folderId", folderId);

      if (error) {
        console.log(error);
      }

      return data;
    } catch (error) {
      console.log(error);
    }
  }

  return {};
}

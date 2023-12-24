// @author Marvin-Rhone
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: "dcf11wsow",
  api_key: "525679258926845",
  api_secret: "GfxhZesKW1PXljRLIh5Dz6-3XgM",
  secure: true,
});
export default async function handler(req, res) {
  console.log("UPLOAD FOLDER IMAGE TO CLOUDINARY ENDPOINT");
  const { imageUrl } = req.body;
  const cloudinaryImageUploadResult = await cloudinary.uploader
    .upload(imageUrl)
    .catch((error) => console.log(error));
  console.log("Folder cloudinaryImageUploadResult");
  const folderPicUrl = cloudinaryImageUploadResult.url;

  return { folderPicUrl };
}

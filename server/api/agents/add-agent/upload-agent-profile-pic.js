import lodash from "lodash";

// const { get } = lodash;

// import OpenAI from "openai";

import "dotenv/config";
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: "dcf11wsow",
  api_key: "525679258926845",
  api_secret: "GfxhZesKW1PXljRLIh5Dz6-3XgM",
  secure: true,
});
import { getSupabase } from "../../../utils/supabase.js";
export default async function uploadAgentProfilePicHandler(req, res) {
  const supabase = getSupabase();
  console.log("UPLOAD AGENT PROFILE PIC ENDPOINT");
  console.log("Input:");
  console.log(req.body);
  const existingAgentId = req.body.existingAgentId;
  if (existingAgentId) {
    // get existing agent name
    const { data: existingAgentData, error: existingAgentError } =
      await supabase
        .from("agents")
        .select("profilePicUrl")
        .eq("agentId", existingAgentId);
    if (existingAgentError) {
      console.log("error getting existingAgentData");
      console.log(existingAgentError);
    }
    return { profilePicUrl: existingAgentData[0].profilePicUrl };
  }
  if (!req.body.imageUrl) {
    return { error: "No image url provided" };
  }
  const imageUrl = req.body.imageUrl;
  // const imageUrl = get(req, "body.imageUrl");
  const cloudinaryImageUploadResult = await cloudinary.uploader
    .upload(imageUrl)
    .catch((error) => console.log(error));
  // console.log("cloudinaryImageUploadResult");
  const profilePicUrl = cloudinaryImageUploadResult.url;
  // newAgentModel.profilePicUrl = profilePicUrl;
  return { profilePicUrl };
}

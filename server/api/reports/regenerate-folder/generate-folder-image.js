// @author Marvin-Rhone
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export default async function handler(req, res) {
  console.log("GENERATE FOLDER IMAGE ENDPOINT");
  const folderImageResponse = req.body.folderImageResponse;

  const aiImageResponse = await openai.images.generate({
    prompt: folderImageResponse,
    n: 1,
    size: "1792x1024",
    model: "dall-e-3",
  });
  const imageUrl = aiImageResponse.data[0].url;

  return { imageUrl };
}

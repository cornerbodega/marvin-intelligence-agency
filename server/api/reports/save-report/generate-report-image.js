// @author Marvin-Rhone
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  console.log("GENERATE REPORT IMAGE ENDPOINT");
  console.log(req.body);
  const { imageDescriptionResponseContent } = req.body;
  if (!imageDescriptionResponseContent) {
    return {
      imageUrl:
        "https://res.cloudinary.com/dcf11wsow/image/upload/v1697948290/c5ejkmxbucery6xnz2mg.png",
    };
  }
  const aiImageResponse = await openai.images
    .generate({
      prompt: `${imageDescriptionResponseContent}`,
      n: 1,
      size: "1792x1024",
      model: "dall-e-3",
    })
    .catch((error) => {
      console.log(error);
      // todo: error logging here to determine why the image wasn't generated. for example, if it's a   code: 'content_policy_violation', why did it happen?
    });
  if (!aiImageResponse.data) {
    return {
      imageUrl:
        "https://res.cloudinary.com/dcf11wsow/image/upload/v1697948290/c5ejkmxbucery6xnz2mg.png",
    };
  }

  const imageUrl = aiImageResponse.data[0].url;
  return { imageUrl };
}

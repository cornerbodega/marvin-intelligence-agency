import { Configuration, OpenAIApi } from "openai";

export default async function handler(req, res) {
  console.log("generateFunnyAgencyName called");

  // Load your OpenAI API key from environment variables for security
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "OpenAI API key not configured" });
  }

  const configuration = new Configuration({
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);

  try {
    const prompt =
      "Generate a funny name for an agency using the format <random specific animal> <that animal's favorite food> Intelligence Agency.";

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a creative assistant. Your task is to generate unique and funny names for agencies.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 150,
    });

    const agencyName = response.data.choices[0].message.content.trim();
    console.log("Generated agency name:", agencyName);
    res.status(200).json({ agencyName });
  } catch (error) {
    console.error("Error in generateFunnyAgencyName:", error);
    res.status(500).json({ error: "Error generating funny agency name" });
  }
}

import { TextToSpeechClient } from "@google-cloud/text-to-speech";

// Decode the base64 environment variable to a JSON object
const credentialsJSON = JSON.parse(
  Buffer.from(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64,
    "base64"
  ).toString("utf-8")
);

// Instantiate the TextToSpeech client with decoded credentials
const client = new TextToSpeechClient({
  credentials: credentialsJSON,
});

export default async (req, res) => {
  // Parse the text from the request body
  const { text } = req.body;

  // Construct the request
  const request = {
    input: { text },
    // Select the language and SSML Voice Gender (optional)
    voice: { languageCode: "en-US", name: "en-US-Neural2-E" },
    // Select the type of audio encoding
    audioConfig: { audioEncoding: "MP3" },
  };

  try {
    // Perform the Text-to-Speech request
    const [response] = await client.synthesizeSpeech(request);
    // Set the content-type header and send the audio data
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(response.audioContent);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error in synthesizing speech");
  }
};

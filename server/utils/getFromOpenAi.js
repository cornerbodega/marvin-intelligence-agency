import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function getFromOpenAi(messages) {
  const results = await openai.chat.completions
    .create({
      model: "gpt-3.5-turbo",
      messages: messages,
    })
    .catch((error) => {
      console.log("get from open ai error");
      console.log(error);
    });

  return results.choices[0].message.content;
}

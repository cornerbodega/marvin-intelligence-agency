import "dotenv/config";

import lodash from "lodash";
const { get } = lodash;

import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
import { getSupabase } from "../../../utils/supabase.js";
export default async function generateAgentNameHandler(req, res) {
  const supabase = getSupabase();
  console.log("GENERATE EXPERTISE ENDPOINT");
  console.log("req.body");
  console.log(req.body);
  const existingAgentId = req.body.existingAgentId;
  if (existingAgentId) {
    // get existing agent name
    const { data: existingAgentData, error: existingAgentError } =
      await supabase
        .from("agents")
        .select("agentName")
        .eq("agentId", existingAgentId);
    if (existingAgentError) {
      console.log("error getting existingAgentData");
      console.log(existingAgentError);
    }
    return { agentName: existingAgentData[0].agentName };
  }
  const expertiseOutput = get(req, "body.expertiseOutput");
  console.log("GENERATE AGENT NAME FUNCTION");
  console.log("input: expertiseOutput");
  console.log(expertiseOutput);
  const expertises = expertiseOutput.filter((str) => str !== "");

  async function generateAnimalName() {
    let result = {
      animalName: "API Erorr 1: Generate Animal Name",
      bio: "API Error 2: Unable to Generate Animal Bio",
    };

    let expertiseString = expertises[0];
    if (expertises.length > 1) {
      expertiseString += " and " + expertises[1];
    }
    if (expertises.length > 2) {
      expertiseString += " and " + expertises[2];
    }
    let specializedTrainingString = "";
    if (req.body.specializedTraining) {
      specializedTrainingString = `Agent is trained to know ${req.body.specializedTraining}.`;
    }

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert at knowing lots of animal names and their characteristics. You are always as specific as possible with the sub-species. Return Emperor Penuin, instead of Penguin, Golden Retriever, instead of Dog.",
        },
        {
          role: "user",
          content: `Which animal embodies the characteristics of Writing Apps, and System Design, and React? Do not explain your answer. Return only the results in the following JSON format.`,
        },
        {
          role: "assistant",
          content: `{
                "animal": "Honeybee",
                "bio": "With a codebase that draws inspiration from one of nature's most impressive architects, this AI agent is here to ensure your tech solutions are nothing short of hive-quality excellence. Approach with curiosity, leave with clarity."
            }`,
        },
        {
          role: "user",
          content: `Which animal embodies the characteristics of ${expertiseString}? ${specializedTrainingString}. Return your answer in the following JSON format: {animal: "Animal Name", bio: "Animal Bio"}`,
        },
      ],
    });
    console.log(chatCompletion.choices[0].message);
    const animalNameResponseContent = chatCompletion.choices[0].message.content;
    if (animalNameResponseContent) {
      const animalNameResponseObject = JSON.parse(animalNameResponseContent);
      if (animalNameResponseObject) {
        if (animalNameResponseObject.animal) {
          result.animalName = animalNameResponseObject.animal;
        }
        if (animalNameResponseObject.bio) {
          result.bio = animalNameResponseObject.bio;
        }
      }
    }

    return result;
  }

  async function getAgentName() {
    let agentNameResponse = await generateAnimalName().catch((error) =>
      console.error(error)
    );
    return agentNameResponse;
  }
  const agentNameResponse = await getAgentName().catch((error) =>
    console.error(error)
  );

  const agentName = agentNameResponse.animalName;
  const bio = agentNameResponse.bio;
  console.log("output: agentName");
  console.log(agentName);
  console.log(bio);

  return { agentName, bio };
}

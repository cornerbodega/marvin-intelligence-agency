import { getSupabase } from "../../../utils/supabase";
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
export async function getSuggestionFunction({
  expertiseString,
  parentReportId,
  agentId,
  highlightedText,
}) {
  const supabase = getSupabase();
  const responseObj = {};

  // #######################
  // # Get agent reports
  // #######################
  let { data: agentMissionHistory, error } = await supabase
    .from("reports")
    .select(
      `
        reportTitle, 
        reportSummary, 
        reportId, 
        reportFolders (
          folderId
        )
    `
    )
    .eq("agentId", agentId)
    .limit(3);

  if (error) {
    console.error("Error fetching data:", error);
    return;
  }

  if (agentMissionHistory.length > 0) {
    responseObj.agentMissionHistory = agentMissionHistory;
  }
  const agentReportTitles = agentMissionHistory.map(
    (mission) => mission.reportTitle
  );

  // #######################
  // # Get parent report summary
  // #######################
  let parentReportSummary = undefined;
  if (parentReportId) {
    let { data: reports } = await supabase
      .from("reports")
      .select("reportSummary")
      .eq("reportId", parentReportId);
    if (!reports)
      return res.status(500).json({
        error: "Internal Server Error. No reports returned in get-suggestions",
      });
    if (reports.length > 0) {
      if (reports[0].reportSummary) {
        parentReportSummary = reports[0].reportSummary;
      }
    }
  }
  let getSuggestionQuestionText = `You are an expert in ${expertiseString}.  `;
  if (agentReportTitles.length > 0) {
    getSuggestionQuestionText += `We've already written reports on ${agentReportTitles.join(
      ", "
    )}.`;
  }
  if (parentReportSummary) {
    getSuggestionQuestionText += `We need a new research question about ${highlightedText}.Context: ${parentReportSummary}. Bring an inspirational, creative, and interesting angle from your expertise in ${expertiseString} whenever possible.`;
  }
  getSuggestionQuestionText += `What is an interesting research question for further research?`;
  try {
    const chat_completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert at generating an interesting research question for given areas of study. You always return exactly one answer in less than 300 characters.",
        },
        {
          role: "user",
          content: getSuggestionQuestionText,
        },
      ],
    });
    let briefingSuggestion = "";
    const suggestionResponseContent =
      chat_completion.data.choices[0].message.content;
    if (suggestionResponseContent) {
      if (typeof suggestionResponseContent === "object") {
        briefingSuggestion = suggestionResponseContent.suggestion;
      } else if (
        typeof suggestionResponseContent === "string" &&
        suggestionResponseContent.includes(`"suggestion":`)
      ) {
        const parsedSuggestionContent = JSON.parse(suggestionResponseContent);
        if (parsedSuggestionContent) {
          briefingSuggestion = parsedSuggestionContent.suggestion;
        }
      } else if (typeof suggestionResponseContent === "string") {
        briefingSuggestion = suggestionResponseContent;
      }
    }
    if (briefingSuggestion) {
      responseObj.briefingSuggestion = briefingSuggestion;
    }
    // Extract and process the suggestion as you were doing before...
    if (parentReportSummary) {
      responseObj.parentReportSummary = parentReportSummary;
    }

    return responseObj;
  } catch (error) {
    if (error.response) {
      const errorObject = error.response.data.error;
      console.log(errorObject); // this will log the error object
    } else {
      console.log(error);
      // Handle other types of errors (e.g., network errors)
    }
  }
}
export default async function getSuggestion(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }
  const { expertiseString, parentReportId, agentId, highlightedText } =
    req.body;
  const responseObj = await getSuggestionFunction({
    expertiseString,
    parentReportId,
    agentId,
    highlightedText,
  }).catch((error) => {
    res.status(500).json({ error: "Internal Server Error" });
  });
  res.status(200).json(responseObj);
}

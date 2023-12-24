// @author Marvin-Rhone
import getFromOpenAi from "../../../utils/getFromOpenAi.js";
export default async function handler(req, res) {
  const draft = req.body.draft;
  const reportSummaryMessages = [
    {
      role: "system",
      content:
        "You are an expert at summarizing reports. You receive html and return the summary in less than 300 characters in plain text.",
    },
    {
      role: "user",
      content: `please summarize the following report: ${draft}`,
    },
  ];
  const reportSummaryResponse = await getFromOpenAi(reportSummaryMessages);

  if (!reportSummaryResponse) {
    console.log("ERROR! NO reportSummaryResponse");
    return;
  }
  const reportSummary = reportSummaryResponse;
  return { reportSummary };
}

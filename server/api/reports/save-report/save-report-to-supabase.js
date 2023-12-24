import saveToSupabase from "../../../utils/saveToSupabase.js";
export default async function handler(req, res) {
  console.log("UPLOAD AGENT PROFILE PIC ENDPOINT");
  console.log(req.body);
  const { draft, agentId, briefingInput } = req.body;
  async function saveReportFunction({ draft, agentId, briefingInput }) {
    const reportPicUrl = req.body.reportPicUrl;
    const draftTitle = req.body.draftTitle;

    const reportSummary = req.body.reportSummary;
    const userId = req.body.userId;
    const imageDescriptionResponseContent =
      req.body.imageDescriptionResponseContent;

    const newReportModel = {};
    newReportModel.reportPicUrl = reportPicUrl;
    newReportModel.reportTitle = draftTitle;
    newReportModel.reportContent = draft;
    newReportModel.briefingInput = briefingInput;
    newReportModel.agentId = agentId;
    newReportModel.reportSummary = reportSummary;
    newReportModel.userId = userId;
    newReportModel.reportPicDescription = imageDescriptionResponseContent;

    const saveReportData = await saveToSupabase(
      "reports",
      newReportModel
    ).catch((error) => console.log(error));
    const childReportId = saveReportData[0].reportId;
    return childReportId;
  }
  const childReportId = await saveReportFunction({
    draft,
    agentId,
    briefingInput,
  });
  return { childReportId };
}

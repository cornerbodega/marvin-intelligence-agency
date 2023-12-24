import { getSupabase } from "../../../utils/supabase.js";
export default async function handler(req, res) {
  const supabase = getSupabase();
  console.log("UPLOAD AGENT PROFILE PIC ENDPOINT");
  console.log("Input:");
  console.log(req.body);
  const { draft, agentId, childReportId } = req.body;

  console.log("update report function");

  const reportPicUrl = req.body.reportPicUrl;
  const draftTitle = req.body.draftTitle;
  const briefingInput = req.body.briefingInput;
  const reportSummary = req.body.reportSummary;
  const userId = req.body.userId;
  const imageDescriptionResponseContent =
    req.body.imageDescriptionResponseContent;

  // SAVE REPORT TO SUPABASE
  let newReportModel = {};
  newReportModel.reportPicUrl = reportPicUrl;
  newReportModel.reportTitle = draftTitle;
  newReportModel.reportContent = draft;
  newReportModel.briefingInput = briefingInput;
  newReportModel.agentId = agentId;
  newReportModel.reportSummary = reportSummary;
  newReportModel.userId = userId;
  newReportModel.reportPicDescription = imageDescriptionResponseContent;

  newReportModel = removeEmptyStringKeys(newReportModel);
  function removeEmptyStringKeys(obj) {
    return Object.keys(obj).reduce((acc, key) => {
      if (obj[key] !== "") {
        acc[key] = obj[key];
      }
      return acc;
    }, {});
  }
  try {
    const { data, error } = await supabase
      .from("reports")
      .update({
        ...newReportModel,
      })
      .eq("reportId", childReportId);

    if (error) {
      console.log(error);
    }

    return { childReportId };
  } catch (error) {
    console.log(error);
  }
}

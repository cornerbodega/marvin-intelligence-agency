// @author Marvin-Rhone
import saveToSupabase from "../../../utils/saveToSupabase.js";
export default async function handler(req, res) {
  console.log("SAVE LINK ENDPOINT");
  console.log(req.body);

  const { parentReportId, childReportId, researchLink } = req.body;
  const { highlightedText, elementId } = researchLink;

  const saveLinksObj = {
    body: {
      childReportId,
      parentReportId,
      highlightedText,
      elementId,
    },
  };
  const saveLinksData = await saveToLinksTableFunction(saveLinksObj).catch(
    (error) => {
      console.log("SAVE LINKS DATA ERROR");
      console.log(error);
      return console.log({ error: error.message });
    }
  );

  return { saveLinksData };

  async function saveToLinksTableFunction(req) {
    const parentReportId = req.body.parentReportId;

    const childReportId = req.body.childReportId;
    const highlightedText = req.body.highlightedText;

    const elementId = req.body.elementId;
    const newLinkModel = {
      childReportId,
      parentReportId,
      highlightedText,
      elementId,
    };
    return await saveToSupabase("links", newLinkModel);
  }
}

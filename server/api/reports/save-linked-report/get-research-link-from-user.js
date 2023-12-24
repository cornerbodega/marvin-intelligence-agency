export default async function getResearchLinkFromUserHandler(req, res) {
  const { highlightedText, elementId } = req.body;

  return { researchLink: { highlightedText, elementId } };
}

import { getSupabase } from "../../../utils/supabase";

export default async function getChildrenOfReport(req, res) {
  const { parentReportId } = req.body;

  const supabase = getSupabase();

  let { data: childReports, error } = await supabase
    .from("links")
    .select(
      `
      childReportId,
      reports:childReportId (
          availability
      )
  `
    )
    .eq("parentReportId", parentReportId);

  if (!error) {
    childReports = childReports.filter((report) => {
      return report.reports.availability != "DELETED";
    });
  } else {
    console.error("Error fetching child reports:", error);
  }
  res.send({ childReports });
}

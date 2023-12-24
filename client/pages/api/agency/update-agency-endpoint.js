import { getSupabase } from "../../../utils/supabase";

export default async function handler(req, res) {
  console.log("Update AN AGENCY");
  const supabase = getSupabase();

  if (req.method === "POST") {
    const userId = req.body.user.sub;
    const updatedAgencyModel = { agencyName: req.body.agencyName };

    const saveAgencyData = await supabase
      .from("users")
      .update(updatedAgencyModel)
      .eq("userId", userId);

    if (saveAgencyData) {
      res.send(saveAgencyData);
    } else {
      res.send(500);
    }
  } else {
    return res.sendStatus(500);
    // Handle any other HTTP method
  }
}

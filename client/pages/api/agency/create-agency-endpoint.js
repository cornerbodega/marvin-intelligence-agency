import { saveToSupabase } from "../../../utils/saveToSupabase";

export default async function handler(req, res) {
  console.log("CREATE AN AGENCY");

  if (req.method === "POST") {
    const createUserModel = {
      userId: req.body.user.sub,
      email: req.body.user.email,
      agencyName: req.body.agencyName,
    };
    const savedUsersData = await saveToSupabase("users", createUserModel);

    // Add user with user id as sub from auth0
    // Add agency with agency name
    // Add agenciesUsers with agency id and user id

    if (savedUsersData) {
      res.send(savedUsersData);
    } else {
      res.send(500);
    }
  } else {
    return res.sendStatus(500);
    // Handle any other HTTP method
  }
}

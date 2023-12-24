// @author Marvin-Rhone

import saveToFirebase from "../../utils/saveToFirebase.js";

export default async function handler(req, res) {
  console.log("SAVE TASK ENDPOINT");

  const { userId, type } = req.body;

  const saveTaskRef = await saveToFirebase(
    `/${
      process.env.NEXT_PUBLIC_env
        ? process.env.NEXT_PUBLIC_env
        : "localAsyncTasks"
    }/${process.env.SERVER_UID}/${userId}/${type}/`,
    req.body
  );

  res.status(200).json({ status: 200, message: "Task saved successfully" });
}

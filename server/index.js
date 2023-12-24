console.log("INTELLIGENCE SERVER STARTED");
import express from "express";
import setupFirebaseListener from "./utils/firebaseListener.js";
const app = express();

import bodyParser from "body-parser";

app.use(bodyParser.json());

app.use("/assets", express.static("assets"));

// ///////////////////////////////////////////////////////
// // Save Firebase Task
// ///////////////////////////////////////////////////////
import saveTask from "./api/tasks/save-task.js";
app.use("/api/tasks/save-task", saveTask);

///////////////////////////////////////////////////////
// Root
///////////////////////////////////////////////////////

app.get("/", async (req, res) => {
  try {
    console.log("Marvin Intelligence Agency server received a request.");
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  setupFirebaseListener();
  console.log(
    `Hello from Cloud Run! The container started successfully and is listening for HTTP requests on ${PORT}`
  );
});

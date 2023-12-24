export default async function handler(req, res) {
  console.log("NEXT api Save Task Request");
  // const serverUrl = "http://localhost:8080";
  const serverUrl =
    process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8080";

  console.log("req.body");
  console.log(req.body);
  console.log("serverUrl");
  console.log(serverUrl);
  await fetch(
    `${serverUrl}/api/tasks/save-task`,

    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    }
  )
    .then((response) => {
      console.log(" save task response");
      // console.log(response);
      // response.json()
      res.send(response);
    })
    .catch((error) => {
      console.log("task executor error");
      console.log(error);
    });
  // res.status(200);
}

export default async function saveTask(newTask) {
  try {
    const response = await fetch("/api/tasks/save-task", {
      method: "POST", // Specify the request method
      headers: {
        "Content-Type": "application/json", // Content type header to tell the server the nature of the request body
      },
      body: JSON.stringify(newTask), // Convert the JavaScript object to a JSON string
    });

    if (response.ok) {
      console.log("Task saved successfully");
      // Process the response if needed
      const data = await response.json();
      console.log(data);
      return data;
    } else {
      console.error("Failed to save the task");
    }
  } catch (error) {
    console.error("An error occurred while saving the task:", error);
  }
}

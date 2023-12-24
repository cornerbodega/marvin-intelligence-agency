import taskSchema from "./taskSchema.js";
import saveToFirebase from "./saveToFirebase.js";
async function findTaskDefinition(taskName) {
  const taskSchemaDefinition = taskSchema();
  let taskDefinition;

  for (const topLevelTaskName in taskSchemaDefinition) {
    const topLevelTask = taskSchemaDefinition[topLevelTaskName];
    if (topLevelTaskName === taskName) {
      taskDefinition = topLevelTask;
      break;
    }

    if (topLevelTask.subtasks) {
      for (const subtask of topLevelTask.subtasks) {
        if (subtask.taskName === taskName) {
          taskDefinition = subtask;
          break;
        }
      }
    }

    if (taskDefinition) break;
  }

  return taskDefinition;
}

async function executeTask(taskName, inputs) {
  const taskDefinition = await findTaskDefinition(taskName);

  console.log(`Running ${taskName}`);

  if (inputs.currentGeneration) {
    if (inputs.currentGeneration > inputs.maxGenerations) {
      console.log("currentGeneration > maxGenerations. not executing task");
      return;
    }
  }
  if (!taskDefinition) {
    console.log("error 3454: missing taskDefinition for");
    console.log(taskName);
    return;
  }

  if (taskDefinition.function) {
    return await taskDefinition.function({ body: inputs });
  }
}
async function executeSubtasks(
  subtasks,
  context,
  firebaseRef,
  userId,
  taskType
) {
  async function clearSubtasks() {
    const clearSubtasksFirebasePath = `${firebaseRef}/${process.env.SERVER_UID}/${userId}/${taskType}/subtasks/`;
    await saveToFirebase(clearSubtasksFirebasePath, {});
  }
  await clearSubtasks();
  for (const subtask of subtasks) {
    // Update Firebase with the current subtask
    const createdAtFirebasePath = `${firebaseRef}/${process.env.SERVER_UID}/${userId}/${taskType}/subtasks/${subtask.taskName}/createdAt`;
    await saveToFirebase(createdAtFirebasePath, `${new Date().toISOString()}`);

    const inputs = subtask.inputs.reduce((acc, inputKey) => {
      acc[inputKey] = context[inputKey] || "";
      return acc;
    }, {});

    const output = await executeTask(subtask.taskName, inputs);
    context = { ...context, ...output };

    const completedAtFirebasePath = `${firebaseRef}/${process.env.SERVER_UID}/${userId}/${taskType}/subtasks/${subtask.taskName}/completedAt`;
    await saveToFirebase(
      completedAtFirebasePath,
      `${new Date().toISOString()}`
    );
  }

  return context;
}

export async function taskExecutor({
  taskName,
  taskData,
  taskContext,
  userId,
  taskType,
}) {
  let accumulatedContext = { ...taskContext, ...taskData.context };

  const outputData = await executeTask(taskName, accumulatedContext);
  accumulatedContext = { ...accumulatedContext, ...outputData };

  const taskDefinition = taskSchema()[taskName];
  if (taskDefinition.subtasks) {
    accumulatedContext = await executeSubtasks(
      taskDefinition.subtasks,
      accumulatedContext,
      `/${process.env.NEXT_PUBLIC_env ? "asyncTasks" : "localAsyncTasks"}`,
      userId,
      taskType
    );
  }

  return accumulatedContext;
}

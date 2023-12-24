export default function getEnv() {
  if (process.env.NEXT_PUBLIC_env === "production") {
    return "asyncTasks";
  }
  return "localAsyncTasks";
}

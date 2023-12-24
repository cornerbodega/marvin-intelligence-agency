import { useUser } from "@auth0/nextjs-auth0/client";
import getEnv from "../../utils/getEnv";
import { useFirebaseListener } from "../../utils/useFirebaseListener";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function IntelliNotificationsArea() {
  let { user } = useUser();
  let userId = user?.sub;
  const router = useRouter();
  if (!userId) {
    userId = router.query.userId;
  }

  const numberOfFinalizeAndVisualizeReportSubtasks = 13;
  const numberOfContinuumSubtasks = 11;

  const [notifications, setNotifications] = useState([]);
  const defaultLoadingMessage = "Loading"; // Set a default loading message
  const [notificationString, setNotificationString] = useState(
    defaultLoadingMessage
  );
  const [LibraryImage, setLibraryImage] = useState("");
  const [briefingInput, setBriefingInput] = useState("");
  // Firebase listeners - always called
  const firebaseContinuumStatus = useFirebaseListener(
    `/${getEnv()}/${process.env.NEXT_PUBLIC_SERVER_UID}/${
      userId || "default"
    }/continuum/status`
  );
  const firebaseVisualizeAndSaveStatus = useFirebaseListener(
    `/${getEnv()}/${process.env.NEXT_PUBLIC_SERVER_UID}/${
      userId || "default"
    }/finalizeAndVisualizeReport/status`
  );
  const firebaseContinuumBriefingInput = useFirebaseListener(
    `/${getEnv()}/${process.env.NEXT_PUBLIC_SERVER_UID}/${
      userId || "default"
    }/continuum/context/briefingInput`
  );
  const firebaseVisualizeAndSaveBriefingInput = useFirebaseListener(
    `/${getEnv()}/${process.env.NEXT_PUBLIC_SERVER_UID}/${
      userId || "default"
    }/continuum/context/briefingInput`
  );
  const firebaseVisualizeAndSaveSubtasks = useFirebaseListener(
    `/${getEnv()}/${process.env.NEXT_PUBLIC_SERVER_UID}/${
      userId || "default"
    }/finalizeAndVisualizeReport/subtasks`
  );
  const firebaseContinuumSubtasks = useFirebaseListener(
    `/${getEnv()}/${process.env.NEXT_PUBLIC_SERVER_UID}/${
      userId || "default"
    }/continuum/subtasks`
  );
  useEffect(() => {
    if (firebaseContinuumBriefingInput) {
      setBriefingInput(firebaseContinuumBriefingInput);
    } else if (firebaseVisualizeAndSaveBriefingInput) {
      setBriefingInput(firebaseVisualizeAndSaveBriefingInput);
    }
  }, [firebaseContinuumBriefingInput, firebaseVisualizeAndSaveBriefingInput]);
  useEffect(() => {
    if (
      userId &&
      (firebaseVisualizeAndSaveStatus === "in-progress" ||
        firebaseContinuumStatus === "in-progress")
    ) {
      const number =
        firebaseVisualizeAndSaveStatus === "in-progress"
          ? numberOfFinalizeAndVisualizeReportSubtasks
          : numberOfContinuumSubtasks;

      console.log("Sending Fetch Request with briefingInput:", briefingInput);

      fetch("/api/notifications/generate-loading-notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ briefingInput, userId, number }),
      })
        .then((response) => response.json())
        .then((data) => {
          const loadingNotifications = JSON.parse(data.loadingNotifications);
          setNotifications(loadingNotifications);
        })
        .catch((error) => {
          console.error("Error fetching notifications:", error);
        });
    }
  }, [userId, firebaseVisualizeAndSaveStatus, firebaseContinuumStatus]);

  useEffect(() => {
    const subtasks =
      firebaseVisualizeAndSaveStatus === "in-progress"
        ? firebaseVisualizeAndSaveSubtasks
        : firebaseContinuumSubtasks;

    if (subtasks && notifications.length) {
      const totalSubtasks =
        firebaseVisualizeAndSaveStatus === "in-progress"
          ? numberOfFinalizeAndVisualizeReportSubtasks
          : numberOfContinuumSubtasks;

      const completedSubtasks = Object.values(subtasks).filter(
        (subtask) => subtask.completedAt
      ).length;

      if (completedSubtasks >= totalSubtasks) {
        setNotificationString("All tasks completed.");
        return;
      }

      const currentSubtaskIndex = Math.min(
        completedSubtasks,
        notifications.length - 1
      );
      const percentage = ((completedSubtasks / totalSubtasks) * 100).toFixed(2);

      setNotificationString(
        `${completedSubtasks + 1}/${totalSubtasks} (${percentage}%) ${
          notifications[currentSubtaskIndex]
        } ${
          (completedSubtasks === 1 &&
            firebaseContinuumStatus === "in-progress") ||
          (completedSubtasks === 4 &&
            firebaseVisualizeAndSaveStatus === "in-progress") ||
          (completedSubtasks === 10 &&
            firebaseVisualizeAndSaveStatus === "in-progress")
            ? getThisIsTakingALongTimeMessage()
            : ""
        }`
      );
    }
  }, [
    firebaseVisualizeAndSaveSubtasks,
    firebaseContinuumSubtasks,
    notifications,
  ]);
  const [animate, setAnimate] = useState(false);

  // useEffect(() => {
  //   setAnimate(true);
  //   const timeout = setTimeout(() => setAnimate(false), 3000); // Adjust for fade duration
  //   return () => clearTimeout(timeout);
  // }, [notificationString]);
  // useEffect(() => {
  //   const dotInterval = setInterval(() => {
  //     setLibraryImage((dots) => (dots.length < 3 ? dots + "." : ""));
  //   }, 500); // Adjust timing as needed

  //   return () => clearInterval(dotInterval);
  // }, []);

  const isInProgress =
    firebaseVisualizeAndSaveStatus === "in-progress" ||
    firebaseContinuumStatus === "in-progress";

  useEffect(() => {
    if (isInProgress && !notifications.length) {
      setNotificationString(defaultLoadingMessage);
    }
  }, [isInProgress, notifications.length]);

  if (!isInProgress) {
    return null; // Hide the whole component if no process is in-progress
  }
  if (notificationString === "All tasks completed.") {
    return null;
  }

  return (
    <>
      {notifications.length > 0 && (
        <div
          className={`notification-area`}
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            backgroundColor: "black",
            display: "flex",
            justifyContent: "center", // Centers horizontally
            alignItems: "center", // Centers vertically
            color: "white",
            paddingTop: "10px",
            paddingBottom: "10px",
            fontSize: "3vw", // Responsive font size for desktop
            minHeight: "100px",
            "@media (max-width: 768px)": {
              fontSize: "5vw", // Larger font size for mobile
            },
          }}
        >
          {`${notificationString}`}
        </div>
      )}
    </>
  );
}
function getThisIsTakingALongTimeMessage() {
  const messages = [
    "Brace for a lengthy process ahead.",
    "Expect a significant wait, it's a long-term task.",
    "This is more of a marathon than a sprint.",
    "Anticipating a prolonged duration for completion.",
    "This will take a while, patience is key.",
    "A lengthy journey lies ahead of us.",
    "This task is a slow burner, please bear with us.",
    "Prepare for an extended period of work.",
    "We're looking at a long timeline here.",
    "Settling in for a substantial duration.",
    "This isn't a quick turnaround, expect some delay.",
    "A considerable amount of time is needed for this one.",
    "We're in for a long stretch, stay tuned.",
    "This will not be swift, it's a protracted task.",
    "Anticipate a slow progression on this project.",
    "It's a time-intensive undertaking, please hold on.",
    "This endeavor will span a considerable timeframe.",
    "Buckle up for a lengthy development period.",
    "This operation will require extended patience.",
    "Expect this to be a drawn-out process.",
    "A long and winding road lies ahead.",
    "This is not a race, but a long journey.",
    "We're embarking on a time-consuming task.",
    "Gear up for a prolonged engagement.",
    "This is a deep dive, not a quick glance.",
    "We're setting sail on a lengthy voyage.",
    "Expect more of a marathon than a dash.",
    "This is a drawn-out affair, not a fleeting moment.",
    "An extended timeline is inevitable for this task.",
    "This mission will take longer than usual, please be patient.",
    "Bracing for an extended expedition.",
    "This isn't a quick-fix scenario, it's a lengthy ordeal.",
    "We're looking at a protracted process.",
    "This is a long-term commitment, not a short stint.",
    "Settle in for an extended journey ahead.",
    "Expect this to unfold over a considerable span.",
    "This project is a long haul, not a short hop.",
    "We're on a lengthy trek, not a brief jaunt.",
    "This endeavor is more of an odyssey than a brief excursion.",
    "Anticipate a lengthy duration for this venture.",
    "A prolonged effort is required on this front.",
    "This will be more of an extended saga than a short story.",
    "Brace yourselves for a long and enduring process.",
    "This task will unfold over an extended period.",
    "We're facing a long road ahead, patience is appreciated.",
    "This is no quick endeavor; it's a lengthy undertaking.",
    "Expect a significant stretch of time for this operation.",
    "This will be a prolonged affair, not a fleeting task.",
    "We're in for a long-term engagement here.",
    "This is a prolonged journey, not a quick trip.",
  ];
  return ` ${messages[Math.floor(Math.random() * messages.length)]}`;
}

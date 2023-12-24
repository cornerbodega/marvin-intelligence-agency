import { useState, useEffect } from "react";
import { getDatabase, onValue } from "firebase/database";
import { db, ref } from "./_firebase";
export function useFirebaseListener(path) {
  const [firebaseData, setFirebaseData] = useState(null);

  useEffect(() => {
    console.log("path");
    console.log(path);
    if (!path) return;
    // const db = getDatabase();
    const dataRef = ref(db, path);

    const unsubscribe = onValue(dataRef, (snapshot) => {
      // console.log("settingFirebaseData(snapshot.val());");
      // console.log(snapshot.val());
      setFirebaseData(snapshot.val());
    });

    // Cleanup listener on component unmount
    return () => {
      unsubscribe();
    };
  }, [path]);

  return firebaseData;
}

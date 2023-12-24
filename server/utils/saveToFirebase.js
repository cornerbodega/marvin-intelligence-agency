import firebase from "./firebase.js"; // Adjust the path according to your project structure
import { ref, set } from "firebase/database";
const db = firebase.db;
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

let cachedCredential = null;

export default async function saveToFirebase(table, dataToSave) {
  // console.log("saveToFirebase");

  if (!cachedCredential) {
    cachedCredential = await signServerIntoFirebase();
  }
  // console.log("userCredential");
  // console.log(cachedCredential.user.uid);

  try {
    // console.log("table");
    // console.log(table);
    // console.log("dataToSave");
    // console.log(dataToSave);
    const tableRef = ref(db, table);
    return set(tableRef, dataToSave);
  } catch (error) {
    console.error("Error inserting data:", error.message);
    return { success: false, error: error.message };
  }
}
// export default async function saveToFirebase(table, dataToSave) {
//   console.log("saveToFirebase");
//   signServerIntoFirebase().then(async (userCredential) => {
//     console.log("userCredential");
//     console.log(userCredential.user.uid);
//     try {
//       console.log("table");
//       console.log(table);
//       console.log("dataToSave");
//       console.log(dataToSave);
//       const tableRef = ref(db, table);
//       return set(tableRef, dataToSave);
//       // Data saved successfully
//       // console.log("Data saved successfully");
//       // return { success: true };
//     } catch (error) {
//       console.error("Error inserting data:", error.message);
//       // Here you can handle different types of errors (e.g., network issues, validation errors) differently
//       // if (error.code === 'some_specific_error_code') {
//       //   // Handle specific error type
//       // }
//       // Additionally, you may want to log the error to an error tracking service
//       return { success: false, error: error.message };
//     }
//   });
// }
function signServerIntoFirebase() {
  const email = "merhone@gmail.com";
  const password = "suzi99";
  const auth = getAuth();
  return signInWithEmailAndPassword(auth, email, password);
}

import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyABE0tihe-J7yzi6_oCs4GT0kQQPQUWiiI",
  authDomain: "missions-server.firebaseapp.com",
  projectId: "missions-server",
  storageBucket: "missions-server.appspot.com",
  messagingSenderId: "716734779566",
  appId: "1:716734779566:web:7f869f2b38c807684add3f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const firebase = { db, ref };
export default firebase;

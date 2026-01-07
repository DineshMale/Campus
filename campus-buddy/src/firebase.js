import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBv7wI1mr4P9Ln19b4jTohdPXJ5RRT6Fj0",
  authDomain: "campusbuddycom.firebaseapp.com",
  projectId: "campusbuddycom",
  storageBucket: "campusbuddycom.firebasestorage.app",
  messagingSenderId: "1081054745392",
  appId: "1:1081054745392:web:37900ca1f6a0996b866ef5",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

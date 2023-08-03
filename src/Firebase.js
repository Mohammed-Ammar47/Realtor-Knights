// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyApR-M1yeuSl_baj-U-xFXbknGwp2OoFJo",
  authDomain: "realtor-knights.firebaseapp.com",
  projectId: "realtor-knights",
  storageBucket: "realtor-knights.appspot.com",
  messagingSenderId: "562448500575",
  appId: "1:562448500575:web:4e527c0c8deb87abc018ea",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore();

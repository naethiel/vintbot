// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDnv04yWFwTbOjTZDy6_3wixNeAlL-Ri08",
  authDomain: "vintbot-567f4.firebaseapp.com",
  projectId: "vintbot-567f4",
  storageBucket: "vintbot-567f4.appspot.com",
  messagingSenderId: "909316174993",
  appId: "1:909316174993:web:2fcecc7e601feb6f29fb30",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };

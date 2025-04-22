// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeAuth, Persistence, getAuth, getReactNativePersistence } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { getFirestore as getFireStore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBzvvdaVU_Yik0hvMkQJMCOr9xmssqFT-s",
    authDomain: "watchlist-5b1aa.firebaseapp.com",
    projectId: "watchlist-5b1aa",
    storageBucket: "watchlist-5b1aa.firebasestorage.app",
    messagingSenderId: "571116353159",
    appId: "1:571116353159:web:ecd3f929d6967cae086a22",
    measurementId: "G-EB1BJHPMJR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Auth with proper persistence
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFireStore(app);

const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider, db };
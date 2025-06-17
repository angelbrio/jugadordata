// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD0YiiGf72fg25nxZzhnx6cECObS3luYkY",
  authDomain: "porteroapp-aeddd.firebaseapp.com",
  projectId: "porteroapp-aeddd",
  storageBucket: "porteroapp-aeddd.firebasestorage.app",
  messagingSenderId: "9051228902",
  appId: "1:9051228902:web:932d412053c27bcd06c927",
  measurementId: "G-5V2V9H6XK0"
};

// Inicializar Firebase y exportar Firestore
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

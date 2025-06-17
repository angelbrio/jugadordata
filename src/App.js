// src/App.js
import React from "react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

function App() {
  const registrarParada = async () => {
    try {
      await addDoc(collection(db, "eventos"), {
        tipo: "parada",
        porteroId: "portero123",
        partidoId: "partido456",
        minuto: 17,
        timestamp: new Date().toISOString()
      });
      alert("✅ Parada registrada correctamente");
    } catch (error) {
      console.error(" Error registrando parada:", error);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>📊 Registro de Portero</h1>
      <button onClick={registrarParada}>🧤 Registrar Parada</button>
    </div>
  );
}

export default App;


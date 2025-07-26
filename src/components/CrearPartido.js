// components/CrearPartido.jsx
import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";

function CrearPartido({ portero }) {
  const [equipo, setEquipo] = useState("");
  const navigate = useNavigate();

  const crearPartido = async () => {
    if (!equipo.trim()) {
      alert("⚠️ Ingresa el nombre del equipo rival");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "partidos"), {
        porteroId: portero.id,
        porteroNombre: portero.nombre, // ✅ se guarda el nombre del portero
        equipo: equipo.trim(),
        fecha: new Date().toISOString(),
        minuto: 0,
        segundo: 0
      });

      navigate(`/partido/${docRef.id}`);
    } catch (error) {
      console.error("❌ Error al crear partido:", error);
      alert("Hubo un error al crear el partido.");
    }
  };

  if (!portero) {
    return <p>⚠️ Selecciona un portero primero.</p>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>🎮 Crear nuevo partido para {portero.nombre}</h2>

      <input
        type="text"
        placeholder="Nombre del equipo rival"
        value={equipo}
        onChange={(e) => setEquipo(e.target.value)}
        style={{ marginRight: "1rem" }}
      />

      <button onClick={crearPartido}>✅ Crear partido</button>
    </div>
  );
}

export default CrearPartido;

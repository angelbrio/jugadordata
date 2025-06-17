import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

function CrearPortero({ onPorteroCreado }) {
  const [nombre, setNombre] = useState("");

  const crearPortero = async () => {
    if (!nombre) return;
    const docRef = await addDoc(collection(db, "porteros"), {
      nombre: nombre
    });
    setNombre("");
    onPorteroCreado(); // para recargar la lista si se quiere
    alert(`✅ Portero creado con ID: ${docRef.id}`);
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre del portero"
      />
      <button onClick={crearPortero}>Crear portero</button>
    </div>
  );
}

export default CrearPortero;

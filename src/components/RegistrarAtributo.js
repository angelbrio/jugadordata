// components/RegistrarAtributo.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const atributosPorTipo = {
  defensivo: [
    "Blocaje frontal", "Blocaje frontal raso", "Blocaje lateral raso",
    "Blocaje lateral 1/2 altura", "Blocaje aéreo", "Desvío lateral raso",
    "Desvío lateral 1/2 altura", "Prolongación", "Despeje de puños",
    "Cobertura zona", "Despeje cabeza", "1vs1 pie", "1vs1 mano",
    "Error no forzado", "Gol"
  ],
  ofensivo: [
    "Saque de puerta corto", "Saque de puerta largo", "Saque de volea",
    "Saque de mano", "Pase pie corto", "Pase pie largo", "Despeje"
  ],
  oc: ["Derecha", "Centro", "Izquierda"],
  tiros: ["A portería", "Fuera", "Derecha", "Centro", "Izquierda"],
  finalizaciones: [
    "Tiro lejano", "TCD", "Tiro cercano", "CL", "CLR",
    "Pase atrás", "Penalti", "Falta directa", "Falta lateral", "Corner"
  ],
};

function RegistrarAtributo() {
  const { partidoId, tipo } = useParams();
  const navigate = useNavigate();
  const [porteroId, setPorteroId] = useState(null);

  useEffect(() => {
    const obtenerPortero = async () => {
      try {
        const snap = await getDoc(doc(db, "partidos", partidoId));
        if (snap.exists()) {
          setPorteroId(snap.data().porteroId);
        } else {
          alert("❌ No se encontró el partido.");
          navigate("/");
        }
      } catch (error) {
        console.error("Error al obtener portero:", error);
      }
    };

    obtenerPortero();
  }, [partidoId, navigate]);

  const registrar = async (accion) => {
    if (!porteroId) {
      alert("❌ No se ha cargado el portero.");
      return;
    }

    try {
      const partidoSnap = await getDoc(doc(db, "partidos", partidoId));
      const data = partidoSnap.data();
      const minuto = data?.minuto ?? 0;
      const segundo = data?.segundo ?? 0;

      await addDoc(collection(db, "eventos"), {
        partidoId,
        porteroId,
        tipo,
        accion,
        minuto: minuto === 0 ? 1 : minuto,
        segundo,
        timestamp: new Date().toISOString(),
        parte: minuto >= 45 ? 2 : 1
      });

      // Si es gol, redirigir a registrar posición
      if (accion === "Gol") {
        navigate(`/registrar-gol/${partidoId}/${minuto === 0 ? 1 : minuto}`);
      } else {
        navigate(`/partido/${partidoId}`);
      }
    } catch (err) {
      console.error("❌ Error al registrar acción:", err);
      alert("Error al registrar acción");
    }
  };

  const atributos = atributosPorTipo[tipo] || [];

  return (
    <div style={{ padding: "2rem" }}>
      <h2>➕ Acción: {tipo.toUpperCase()}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {atributos.map((atributo) => (
          <button key={atributo} onClick={() => registrar(atributo)}>
            {atributo}
          </button>
        ))}
      </div>
    </div>
  );
}

export default RegistrarAtributo;

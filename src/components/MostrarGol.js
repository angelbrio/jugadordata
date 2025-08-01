import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const MostrarGol = () => {
  const { eventoId } = useParams();
  const [evento, setEvento] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const snap = await getDoc(doc(db, "eventos", eventoId));
        if (snap.exists()) {
          setEvento(snap.data());
        } else {
          console.warn("Evento no encontrado");
        }
      } catch (error) {
        console.error("Error cargando el evento:", error);
      }
    };
    cargar();
  }, [eventoId]);

  const dotStyle = (x, y) => ({
    position: "absolute",
    top: `${y * 100}%`,
    left: `${x * 100}%`,
    transform: "translate(-50%, -50%)",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    backgroundColor: "red",
    border: "2px solid white"
  });

  if (!evento) return <p>🔄 Cargando...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h3>🎯 Gol registrado</h3>
      <div style={{ display: "flex", gap: "2rem" }}>
        <div style={{ position: "relative", width: 800, height: 533 }}>
          <img
            src="/assets/Field.png"
            alt="Campo"
            style={{ width: "100%", height: "100%" }}
          />
          {evento.golCampo && (
            <div style={dotStyle(evento.golCampo.x, evento.golCampo.y)} />
          )}
        </div>
        <div style={{ position: "relative", width: 700, height: 280 }}>
          <img
            src="/assets/goal.png"
            alt="Portería"
            style={{ width: "100%", height: "100%" }}
          />
          {evento.golPorteria && (
            <div style={dotStyle(evento.golPorteria.x, evento.golPorteria.y)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MostrarGol;

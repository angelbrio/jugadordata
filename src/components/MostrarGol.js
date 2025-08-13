import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const MostrarGol = () => {
  const { eventoId } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const snap = await getDoc(doc(db, "eventos", eventoId));
        if (snap.exists()) {
          const data = snap.data();
          // Normaliza nombres de campos por compatibilidad
          const posCampo = data.posCampo || data.golCampo || null;
          const posPorteria = data.posPorteria || data.golPorteria || null;
          setEvento({ ...data, posCampo, posPorteria });
        } else {
          console.warn("Evento no encontrado");
        }
      } catch (error) {
        console.error("Error cargando el evento:", error);
      } finally {
        setLoading(false);
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
    border: "2px solid white",
    pointerEvents: "none"
  });

  const box = {
    position: "relative",
    width: 800,
    maxWidth: "100%"
  };

  const img = {
    display: "block",
    width: "100%",
    height: "auto",
    objectFit: "contain"
  };

  if (loading) return <p style={{ padding: "2rem" }}>🔄 Cargando...</p>;
  if (!evento) return <p style={{ padding: "2rem" }}>❌ Evento no encontrado</p>;

  const parte = typeof evento.minuto === "number" && evento.minuto >= 45 ? "segunda" : "primera";

  return (
    <div style={{ padding: "2rem" }}>
      <button onClick={() => navigate(`/partido/${evento.partidoId}`, { state: { parte } })}>
        ⬅️ Volver al partido
      </button>
      <h3>🎯 Gol — min {evento.minuto ?? "?"}</h3>

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        {/* Campo */}
        <div style={box}>
          <img
            src="/assets/Field.png"
            alt="Campo"
            style={img}
          />
          {evento.posCampo && (
            <div style={dotStyle(evento.posCampo.x, evento.posCampo.y)} />
          )}
        </div>

        {/* Portería (sin cortes) */}
        <div style={{ ...box, width: 700 }}>
          <img
            src="/assets/goal.png"
            alt="Portería"
            style={img}
          />
          {evento.posPorteria && (
            <div style={dotStyle(evento.posPorteria.x, evento.posPorteria.y)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MostrarGol;

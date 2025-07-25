import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDocs, collection, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const RegistrarGol = () => {
  const { partidoId, minuto } = useParams();
  const navigate = useNavigate();
  const [campoPos, setCampoPos] = useState(null);
  const [porteriaPos, setPorteriaPos] = useState(null);
  const [eventoId, setEventoId] = useState(null);

  // Buscar el evento existente
  useEffect(() => {
    const cargarEvento = async () => {
      const snap = await getDocs(collection(db, "eventos"));
      const eventos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const evento = eventos.find(e =>
        e.partidoId === partidoId &&
        e.accion === "Gol" &&
        e.minuto === parseInt(minuto)
      );

      if (evento) {
        setEventoId(evento.id);
      } else {
        alert("❌ No se encontró el evento de gol.");
        navigate(`/partido/${partidoId}`);
      }
    };

    cargarEvento();
  }, [partidoId, minuto, navigate]);

  const handleClick = (e, tipo) => {
    const rect = e.target.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const point = { x: parseFloat(x.toFixed(4)), y: parseFloat(y.toFixed(4)) };

    if (tipo === "campo") setCampoPos(point);
    else setPorteriaPos(point);
  };

  const guardar = async () => {
    if (!campoPos || !porteriaPos || !eventoId) {
      alert("⚠️ Debes seleccionar ambos puntos.");
      return;
    }

    await updateDoc(doc(db, "eventos", eventoId), {
      golCampo: campoPos,
      golPorteria: porteriaPos
    });

    alert("✅ Gol actualizado con coordenadas");
    navigate(`/partido/${partidoId}`);
  };

  const dotStyle = (x, y) => ({
    position: "absolute",
    top: `${y * 100}%`,
    left: `${x * 100}%`,
    transform: "translate(-50%, -50%)",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    backgroundColor: "red",
  });

  return (
    <div style={{ padding: "2rem" }}>
      <h3>📍 Haz clic en ambas imágenes para registrar el gol</h3>
      <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
        {/* Campo */}
        <div style={{ position: "relative", width: 300, height: 200 }}>
          <img
            src="/assets/Field.png"
            alt="Campo"
            style={{ width: "100%", height: "100%", cursor: "crosshair" }}
            onClick={(e) => handleClick(e, "campo")}
          />
          {campoPos && <div style={dotStyle(campoPos.x, campoPos.y)} />}
        </div>

        {/* Portería */}
        <div style={{ position: "relative", width: 200, height: 200 }}>
          <img
            src="/assets/goal.png"
            alt="Portería"
            style={{ width: "100%", height: "100%", cursor: "crosshair" }}
            onClick={(e) => handleClick(e, "porteria")}
          />
          {porteriaPos && <div style={dotStyle(porteriaPos.x, porteriaPos.y)} />}
        </div>
      </div>

      <button onClick={guardar} disabled={!campoPos || !porteriaPos}>
        💾 Guardar Gol
      </button>
    </div>
  );
};

export default RegistrarGol;

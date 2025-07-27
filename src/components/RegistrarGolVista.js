import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

const RegistrarGol = () => {
  const { partidoId, minuto } = useParams();
  const navigate = useNavigate();
  const [campoPos, setCampoPos] = useState(null);
  const [porteriaPos, setPorteriaPos] = useState(null);

  const handleClick = (e, tipo) => {
    const rect = e.target.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const point = { x: parseFloat(x.toFixed(4)), y: parseFloat(y.toFixed(4)) };

    if (tipo === "campo") setCampoPos(point);
    else setPorteriaPos(point);
  };

  const guardar = async () => {
    if (!campoPos || !porteriaPos) return alert("Selecciona ambos puntos");

    await addDoc(collection(db, "eventos"), {
      partidoId,
      accion: "Gol",
      minuto: parseInt(minuto),
      posCampo: campoPos,
      posPorteria: porteriaPos
    });

    alert("✅ Gol registrado con posiciones");
    navigate(`/partido/${partidoId}`);
  };

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

  return (
    <div style={{ padding: "2rem" }}>
      <h3>📍 Haz clic en ambas imágenes para registrar el gol</h3>
      <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
        <div style={{ position: "relative", width: 800, height: 533 }}>
          <img
            src="/assets/Field.png"
            alt="Campo"
            style={{ width: "100%", height: "100%", cursor: "crosshair" }}
            onClick={(e) => handleClick(e, "campo")}
          />
          {campoPos && <div style={dotStyle(campoPos.x, campoPos.y)} />}
        </div>
        <div style={{ position: "relative", width: 700, height: 280 }}>
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

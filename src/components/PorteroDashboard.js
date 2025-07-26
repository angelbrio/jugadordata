// components/PorteroDashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

function PorteroDashboard({ portero }) {
  const navigate = useNavigate();

  if (!portero) return <p>⚠️ Selecciona un portero primero.</p>;

  return (
    <div style={{ padding: "2rem" }}>
      {/* Botón para volver a la selección de porteros */}
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            backgroundColor: "#eee",
            padding: "0.5rem 1rem",
            border: "1px solid #ccc",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          🔙 Ver porteros
        </button>
      </div>

      <h2>🧤 Portero seleccionado: {portero.nombre}</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "2rem" }}>
        <button onClick={() => navigate("/crear-partido", { state: { portero } })}>
          🎮 Crear nuevo partido
        </button>

        <button onClick={() => navigate("/lista-partidos", { state: { portero } })}>
          📋 Ver partidos guardados
        </button>
      </div>
    </div>
  );
}

export default PorteroDashboard;

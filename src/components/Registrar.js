// components/Registrar.jsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const tipos = ["defensivo", "ofensivo", "oc", "tiros", "finalizaciones"];

function Registrar() {
  const navigate = useNavigate();
  const { partidoId } = useParams(); // 👈 capturamos el ID desde la URL

  return (
    <div style={{ padding: "2rem" }}>
      <h2>➕ Registrar acción</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {tipos.map((tipo) => (
          <button key={tipo} onClick={() => navigate(`/registrar/${partidoId}/${tipo}`)}>
            {tipo.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Registrar;

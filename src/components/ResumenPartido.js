// components/ResumenPartido.jsx
import React, { useState, useEffect } from "react";

function ContadorEditable({ label, value, onIncrement }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <strong>{label}:</strong>
      <span>{value}</span>
      <button onClick={onIncrement}>➕</button>
    </div>
  );
}

function ResumenPartido({ portero, equipo, eventos, totalPartidos }) {
  const [campo, setCampo] = useState("");
  const [resultado, setResultado] = useState("");
  const [editableCampo, setEditableCampo] = useState(false);
  const [editableResultado, setEditableResultado] = useState(false);

  // Estadísticas automáticas
  const totalAcciones = eventos.length;
  const ofensivas = eventos.filter(e => e.tipo === "ofensivo").length;
  const defensivas = eventos.filter(e => e.tipo === "defensivo").length;

  // Estadísticas manuales
  const [tirosFuera, setTirosFuera] = useState(0);
  const [tirosPorteria, setTirosPorteria] = useState(0);
  const [ataqueDrch, setAtaqueDrch] = useState(0);
  const [ataqueCentro, setAtaqueCentro] = useState(0);
  const [ataqueIzq, setAtaqueIzq] = useState(0);
  const [tirosDrch, setTirosDrch] = useState(0);
  const [tirosIzq, setTirosIzq] = useState(0);
  const [tirosCentro, setTirosCentro] = useState(0);
  const [paradas, setParadas] = useState(0);
  const [goles, setGoles] = useState(0);
  const [totalTiros, setTotalTiros] = useState(0);
  const [totalLlegadas, setTotalLlegadas] = useState(0);

  return (
    <div style={{ marginBottom: "2rem", border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>
      <h3>📋 Información del Partido</h3>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", marginBottom: "1rem" }}>
        <div><strong>Portero:</strong> {portero?.nombre}</div>
        <div><strong>Rival:</strong> {equipo}</div>
        <div><strong>Jornada:</strong> {totalPartidos}</div>

        <div>
          <strong>Campo:</strong>{" "}
          {editableCampo ? (
            <input
              value={campo}
              onChange={(e) => setCampo(e.target.value)}
              onBlur={() => setEditableCampo(false)}
              autoFocus
            />
          ) : (
            <span onClick={() => setEditableCampo(true)} style={{ borderBottom: "1px dashed #000", cursor: "pointer" }}>
              {campo || "________"}
            </span>
          )}
        </div>

        <div>
          <strong>Resultado:</strong>{" "}
          {editableResultado ? (
            <input
              value={resultado}
              onChange={(e) => setResultado(e.target.value)}
              onBlur={() => setEditableResultado(false)}
              autoFocus
            />
          ) : (
            <span onClick={() => setEditableResultado(true)} style={{ borderBottom: "1px dashed #000", cursor: "pointer" }}>
              {resultado || "________"}
            </span>
          )}
        </div>

        <div><strong>Acciones total:</strong> {totalAcciones}</div>
        <div><strong>Acciones Ofen:</strong> {ofensivas}</div>
        <div><strong>Acciones Defen:</strong> {defensivas}</div>
      </div>

      <hr />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
        <ContadorEditable label="Tiros fuera" value={tirosFuera} onIncrement={() => setTirosFuera(v => v + 1)} />
        <ContadorEditable label="Tiros portería" value={tirosPorteria} onIncrement={() => setTirosPorteria(v => v + 1)} />
        <ContadorEditable label="Ataque DRCHA" value={ataqueDrch} onIncrement={() => setAtaqueDrch(v => v + 1)} />
        <ContadorEditable label="Ataque centro" value={ataqueCentro} onIncrement={() => setAtaqueCentro(v => v + 1)} />
        <ContadorEditable label="Ataque IZQ" value={ataqueIzq} onIncrement={() => setAtaqueIzq(v => v + 1)} />
        <ContadorEditable label="Tiros DRCH" value={tirosDrch} onIncrement={() => setTirosDrch(v => v + 1)} />
        <ContadorEditable label="Tiros IZQ" value={tirosIzq} onIncrement={() => setTirosIzq(v => v + 1)} />
        <ContadorEditable label="Tiros centro" value={tirosCentro} onIncrement={() => setTirosCentro(v => v + 1)} />
        <ContadorEditable label="Paradas" value={paradas} onIncrement={() => setParadas(v => v + 1)} />
        <ContadorEditable label="Goles" value={goles} onIncrement={() => setGoles(v => v + 1)} />
        <ContadorEditable label="Total tiros" value={totalTiros} onIncrement={() => setTotalTiros(v => v + 1)} />
        <ContadorEditable label="Total llegadas" value={totalLlegadas} onIncrement={() => setTotalLlegadas(v => v + 1)} />
      </div>
    </div>
  );
}

export default ResumenPartido;

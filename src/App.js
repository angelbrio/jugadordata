import React, { useState } from "react";
import CrearPortero from "./components/Crearportero";
import ListaPorteros from "./components/listaPorteros";
import Partido from "./components/Partido";

function App() {
  const [porteroActivo, setPorteroActivo] = useState(null);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>⚽ Registro de Porteros</h1>

      <CrearPortero onPorteroCreado={() => {}} />
      <ListaPorteros onSeleccionar={setPorteroActivo} />

      {porteroActivo && (
        <div style={{ marginTop: "1rem" }}>
          <h2>🧤 Portero seleccionado: {porteroActivo.nombre}</h2>
          <Partido portero={porteroActivo} />
        </div>
      )}
    </div>
  );
}

export default App;


import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import CrearPortero from "./components/CrearPortero";
import ListaPorteros from "./components/listaPorteros";
import VistaPartido from "./components/VistaPartido";
import Registrar from "./components/Registrar";
import RegistrarAtributo from "./components/RegistrarAtributo";
import RegistrarGolVista from "./components/RegistrarGolVista";
import MostrarGol from "./components/MostrarGol";

// Wrappers y nuevos componentes
import PorteroDashboardWrapper from "./components/PorteroDashboardWrapper";
import CrearPartidoWrapper from "./components/CrearPartidoWrapper";
import ListaPartidosWrapper from "./components/ListaPartidosWrapper";
import RegistrarGol from "./components/RegistrarGol"; // ✅ NUEVO

function App() {
  return (
    <Router>
      <div style={{ padding: "2rem" }}>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <CrearPortero onPorteroCreado={() => {}} />
                <ListaPorteros />
              </>
            }
          />

          {/* NUEVA ruta para volver desde "ListaPartidos" */}
          <Route path="/dashboard" element={<PorteroDashboardWrapper />} />

          <Route path="/portero" element={<PorteroDashboardWrapper />} />
          <Route path="/crear-partido" element={<CrearPartidoWrapper />} />
          <Route path="/lista-partidos" element={<ListaPartidosWrapper />} />
          <Route path="/partido/:id" element={<VistaPartido />} />
          <Route path="/registrar/:id" element={<Registrar />} />
          <Route path="/registrar/:partidoId/:tipo" element={<RegistrarAtributo />} />
          <Route path="/gol/:eventoId" element={<MostrarGol />} />
          <Route path="/registrar-gol/:partidoId/:minuto" element={<RegistrarGol />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

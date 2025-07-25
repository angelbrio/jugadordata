// App.js
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
        {/* Página principal con selección/creación de portero */}
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

          {/* Dashboard del portero con opciones de acción */}
          <Route path="/portero" element={<PorteroDashboardWrapper />} />

          {/* Crear partido con portero seleccionado */}
          <Route path="/crear-partido" element={<CrearPartidoWrapper />} />

          {/* Ver lista de partidos guardados del portero */}
          <Route path="/lista-partidos" element={<ListaPartidosWrapper />} />

          {/* Vista principal del partido con cronómetro */}
          <Route path="/partido/:id" element={<VistaPartido />} />

          {/* Registro de acción (menú de tipos) */}
          <Route path="/registrar/:id" element={<Registrar />} />

          {/* Registro de atributo de acción específica */}
          <Route path="/registrar/:partidoId/:tipo" element={<RegistrarAtributo />} />

          <Route path="/gol/:eventoId" element={<MostrarGol />} />

          {/* Registrar posición del GOL en campo y portería */}
          <Route path="/registrar-gol/:partidoId/:minuto" element={<RegistrarGol />} /> {/* ✅ NUEVA RUTA */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;

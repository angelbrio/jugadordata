import React from "react";
import { useLocation } from "react-router-dom";
import CrearPartido from "./CrearPartido";

function CrearPartidoWrapper() {
  const { state } = useLocation();
  const portero = state?.portero || null;
  return <CrearPartido portero={portero} />;
}

export default CrearPartidoWrapper;

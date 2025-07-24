import React from "react";
import { useLocation } from "react-router-dom";
import ListaPartidos from "./ListaPartidos";

function ListaPartidosWrapper() {
  const { state } = useLocation();
  const portero = state?.portero || null;
  return <ListaPartidos portero={portero} />;
}

export default ListaPartidosWrapper;

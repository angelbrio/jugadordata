import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

function ListaPorteros() {
  const [porteros, setPorteros] = useState([]);
  const [mostrar, setMostrar] = useState(false);
  const navigate = useNavigate();

  const cargarPorteros = async () => {
    const snapshot = await getDocs(collection(db, "porteros"));
    const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPorteros(lista);
  };

  const toggleMostrar = () => {
    if (!mostrar) cargarPorteros();
    setMostrar(!mostrar);
  };

  const seleccionarPortero = (portero) => {
    navigate("/portero", { state: { portero } }); // ✅ redirigir correctamente
  };

  return (
    <div>
      <button onClick={toggleMostrar}>
        {mostrar ? "Ocultar porteros" : "Mostrar porteros"}
      </button>
      {mostrar && (
        <ul>
          {porteros.map(portero => (
            <li key={portero.id}>
              <button onClick={() => seleccionarPortero(portero)}>
                {portero.nombre}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ListaPorteros;

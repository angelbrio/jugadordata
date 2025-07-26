import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
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
    navigate("/portero", { state: { portero } });
  };

  const eliminarPortero = async (id) => {
    const confirmacion = window.confirm("¿Estás seguro de eliminar este portero?");
    if (!confirmacion) return;

    await deleteDoc(doc(db, "porteros", id));
    setPorteros(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div>
      <button onClick={toggleMostrar}>
        {mostrar ? "Ocultar porteros" : "Mostrar porteros"}
      </button>

      {mostrar && (
        <ul>
          {porteros.map(portero => (
            <li key={portero.id} style={{ marginBottom: "0.5rem" }}>
              <button onClick={() => seleccionarPortero(portero)}>
                {portero.nombre}
              </button>
              <button
                onClick={() => eliminarPortero(portero.id)}
                style={{ marginLeft: "0.5rem", color: "red" }}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ListaPorteros;

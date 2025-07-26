import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate, useLocation } from "react-router-dom";

function ListaPartidos() {
  const [partidos, setPartidos] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const portero = location.state?.portero;

  useEffect(() => {
    const fetchPartidos = async () => {
      if (!portero?.id) return;

      const q = query(collection(db, "partidos"), where("porteroId", "==", portero.id));
      const snap = await getDocs(q);
      const lista = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPartidos(lista);
    };

    fetchPartidos();
  }, [portero]);

  const eliminarPartido = async (idPartido) => {
    if (window.confirm("¿Estás seguro de eliminar este partido?")) {
      await deleteDoc(doc(db, "partidos", idPartido));
      setPartidos(prev => prev.filter(p => p.id !== idPartido));
    }
  };

  const volverAlPortero = () => {
    navigate("/portero", { state: { portero } });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <button onClick={volverAlPortero}>🔙 Volver al portero</button>
        <button onClick={() => navigate("/")}>👤 Volver al inicio</button>
      </div>

      <h2>📋 Partidos guardados</h2>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {partidos.length === 0 ? (
          <p>No hay partidos registrados para este portero.</p>
        ) : (
          partidos.map((p) => (
            <li key={p.id} style={{ marginBottom: "1rem" }}>
              <strong>🆚 {p.equipo}</strong> ({p.fecha?.split("T")[0] || "sin fecha"})
              <button onClick={() => navigate(`/partido/${p.id}`)} style={{ marginLeft: "1rem" }}>
                Ver
              </button>
              <button
                onClick={() => eliminarPartido(p.id)}
                style={{ marginLeft: "0.5rem", color: "red" }}
              >
                Eliminar
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default ListaPartidos;

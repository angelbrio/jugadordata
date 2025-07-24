import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

function ListaPartidos({ portero }) {
  const [partidos, setPartidos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPartidos = async () => {
      if (!portero?.id) return;

      const q = query(
        collection(db, "partidos"),
        where("porteroId", "==", portero.id)
      );
      const snap = await getDocs(q);
      const lista = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPartidos(lista);
    };

    fetchPartidos();
  }, [portero]);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📋 Partidos guardados</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {partidos.map((p) => (
          <li key={p.id} style={{ marginBottom: "1rem" }}>
            <strong>🆚 {p.equipo}</strong> ({p.fecha?.split("T")[0]})
            <button
              onClick={() => navigate(`/partido/${p.id}`)}
              style={{ marginLeft: "1rem" }}
            >
              Ver
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListaPartidos;

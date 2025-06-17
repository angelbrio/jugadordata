import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

function Partido({ portero }) {
  const [partidoId, setPartidoId] = useState(null);
  const [equipo, setEquipo] = useState("");
  const [minuto, setMinuto] = useState(0);
  const [segundo, setSegundo] = useState(0);
  const [estado, setEstado] = useState("");
  const [activo, setActivo] = useState(false);
  const intervaloRef = useRef(null);
  const yaPreguntado = useRef(false); // ⚠️ para evitar doble confirmación

  // Buscar partido activo
  useEffect(() => {
    const buscarPartidoDelDia = async () => {
      const q = query(collection(db, "partidos"), where("porteroId", "==", portero.id));
      const snapshot = await getDocs(q);
      const hoy = new Date().toISOString().split("T")[0];

      const partidoHoy = snapshot.docs.find((doc) => {
        const fecha = doc.data().fecha.split("T")[0];
        return fecha === hoy && doc.data().estado !== "finalizado";
      });

      if (partidoHoy) {
        const data = partidoHoy.data();
        setPartidoId(partidoHoy.id);
        setEquipo(data.equipo);
        setEstado(data.estado);
        setMinuto(data.minuto || 0);
        setSegundo(data.segundo || 0);

        if (!yaPreguntado.current) {
          yaPreguntado.current = true;
          const continuar = window.confirm("Hay un partido en curso. ¿Quieres reanudar el cronómetro?");
          if (continuar) iniciarContador(partidoHoy.id, data.estado, data.minuto, data.segundo);
        }
      }
    };

    buscarPartidoDelDia();
  }, [portero]);

  const iniciarContador = (id = partidoId, estadoPartido = estado, mInit = minuto, sInit = segundo) => {
    if (activo || intervaloRef.current) return;

    let m = mInit;
    let s = sInit;
    setActivo(true);

    intervaloRef.current = setInterval(async () => {
      s++;
      if (s >= 60) {
        s = 0;
        m++;
      }

      if (estadoPartido === "en_juego" && m === 45) {
        detenerContador();
        await cambiarEstado("descanso", m, s);
        return;
      } else if (estadoPartido === "segundo_tiempo" && m === 90) {
        detenerContador();
        await cambiarEstado("finalizado", m, s);
        return;
      }

      setMinuto(m);
      setSegundo(s);

      await updateDoc(doc(db, "partidos", id), {
        minuto: m,
        segundo: s,
      });
    }, 1000);
  };

  const detenerContador = () => {
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
      intervaloRef.current = null;
      setActivo(false);
    }
  };

  const cambiarEstado = async (nuevoEstado, m = minuto, s = segundo) => {
    if (!partidoId) return;
    await updateDoc(doc(db, "partidos", partidoId), {
      estado: nuevoEstado,
      minuto: m,
      segundo: s,
    });
    setEstado(nuevoEstado);
    setMinuto(m);
    setSegundo(s);
  };

  const crearPartido = async () => {
    if (!equipo.trim()) {
      alert("Ingresa el nombre del equipo rival");
      return;
    }

    const docRef = await addDoc(collection(db, "partidos"), {
      porteroId: portero.id,
      equipo: equipo.trim(),
      fecha: new Date().toISOString(),
      estado: "en_juego",
      minuto: 0,
      segundo: 0,
    });

    setPartidoId(docRef.id);
    setEstado("en_juego");
    iniciarContador(docRef.id, "en_juego", 0, 0);
  };

  const empezarSegundoTiempo = () => {
    cambiarEstado("segundo_tiempo");
    iniciarContador(partidoId, "segundo_tiempo", minuto, segundo);
  };

  const registrarParada = async () => {
    await addDoc(collection(db, "eventos"), {
      porteroId: portero.id,
      partidoId,
      tipo: "parada",
      minuto,
      segundo,
      tiempo: estado,
      timestamp: new Date().toISOString(),
    });
    alert(`🧤 Parada registrada en minuto ${minuto}, segundo ${segundo}`);
  };

  useEffect(() => {
    return () => detenerContador(); // limpiar cuando se desmonta
  }, []);

  return (
    <div style={{ marginTop: "2rem" }}>
      {!partidoId && (
        <>
          <input
            placeholder="Equipo rival"
            value={equipo}
            onChange={(e) => setEquipo(e.target.value)}
            style={{ marginRight: "0.5rem" }}
          />
          <button onClick={crearPartido}>🎮 Nuevo partido</button>
        </>
      )}

      {partidoId && (
        <>
          <h3>🏷️ Rival: {equipo}</h3>
          <h3>⏱ Minuto: {minuto} | Segundo: {segundo}</h3>
          <p>
            {estado === "en_juego" && "🟢 Partido en curso"}
            {estado === "descanso" && "⏸ Descanso"}
            {estado === "segundo_tiempo" && "🟢 Segundo tiempo"}
            {estado === "finalizado" && "🏁 Partido finalizado"}
          </p>

          {(estado === "en_juego" || estado === "segundo_tiempo") && activo && (
            <button onClick={detenerContador}>⏸️ Parar tiempo</button>
          )}

          {(estado === "en_juego" || estado === "segundo_tiempo") && !activo && (
            <button onClick={() => iniciarContador(partidoId, estado, minuto, segundo)}>
              ▶️ Reanudar tiempo
            </button>
          )}

          {estado === "descanso" && (
            <button onClick={empezarSegundoTiempo}>▶️ Iniciar segundo tiempo</button>
          )}

          {(estado === "en_juego" || estado === "segundo_tiempo") && (
            <button onClick={registrarParada}>🧤 Registrar parada</button>
          )}
        </>
      )}
    </div>
  );
}

export default Partido;

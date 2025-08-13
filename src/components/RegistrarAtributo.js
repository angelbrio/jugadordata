// src/components/RegistrarAtributo.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addDoc, collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const atributosPorTipo = {
  defensivo: [
    "Blocaje frontal", "Blocaje frontal raso", "Blocaje lateral raso",
    "Blocaje lateral 1/2 altura", "Blocaje aéreo", "Desvío lateral raso",
    "Desvío lateral 1/2 altura", "Prolongación", "Despeje de puños",
    "Cobertura zona", "Despeje cabeza", "1vs1 pie", "1vs1 mano",
    "Error no forzado", "Gol"
  ],
  ofensivo: [
    "Saque de puerta corto", "Saque de puerta largo", "Saque de volea",
    "Saque de mano", "Pase pie corto", "Pase pie largo", "Despeje"
  ],
  oc: ["Derecha", "Centro", "Izquierda"],
  tiros: ["A portería", "Fuera", "Derecha", "Centro", "Izquierda"],
  finalizaciones: [
    "Tiro lejano", "TCD", "Tiro cercano", "CL", "CLR",
    "Pase atrás", "Penalti", "Falta directa", "Falta lateral", "Corner"
  ],
};

function RegistrarAtributo() {
  const { partidoId, tipo } = useParams();
  const navigate = useNavigate();
  const [porteroId, setPorteroId] = useState(null);

  useEffect(() => {
    const obtenerPortero = async () => {
      try {
        const snap = await getDoc(doc(db, "partidos", partidoId));
        if (snap.exists()) {
          setPorteroId(snap.data().porteroId);
        } else {
          alert("❌ No se encontró el partido.");
          navigate("/");
        }
      } catch (error) {
        console.error("Error al obtener portero:", error);
      }
    };

    obtenerPortero();
  }, [partidoId, navigate]);

  // Para goles en descanso/90': coloca 45+1/2/3 o 90+1/2/3 sin colisiones
  const obtenerMinutoExtendido = async (fase, accion) => {
    const snap = await getDocs(collection(db, "eventos"));
    const eventos = snap.docs.map(d => d.data()).filter(e => e.partidoId === partidoId && e.accion === accion);

    const base = fase === "descanso" ? 45 : 90;
    const posibles = [base, base + 1, base + 2, base + 3];
    const usados = eventos.map(e => e.minuto).filter(m => posibles.includes(m));

    for (let m of posibles) {
      if (!usados.includes(m)) return m;
    }

    return posibles[posibles.length - 1]; // fallback
  };

  const registrar = async (accion) => {
    if (!porteroId) {
      alert("❌ No se ha cargado el portero.");
      return;
    }

    try {
      const partidoSnap = await getDoc(doc(db, "partidos", partidoId));
      if (!partidoSnap.exists()) {
        alert("❌ Partido no encontrado.");
        return;
      }
      const data = partidoSnap.data();

      const fase = data.fase; // "inicio" | "primera" | "descanso" | "segunda" | "final"
      const inicioMs = data?.inicioMs;
      const tiempoAcumulado = data?.tiempoAcumulado || 0;
      const ahora = Date.now();

      let minuto = 0;
      let segundo = 0;
      let parte = "primera";

      // --- CASO 1: DESCANSO ---
      // Aquí aún NO se ha iniciado la segunda parte; todo va a 45 (o 45+X si es Gol).
      if (fase === "descanso") {
        if (accion === "Gol") {
          minuto = await obtenerMinutoExtendido("descanso", accion); // 45, 46(=+1), 47(=+2), 48(=+3)
        } else {
          minuto = 45;
        }
        segundo = 0;
        parte = "primera";
      }
      // --- CASO 2: SEGUNDA PARTE EN MARCHA ---
      else if (fase === "segunda" && inicioMs) {
        const transcurrido = ahora - inicioMs; // ms desde que le diste a "Iniciar segundo tiempo"
        const totalSegundos = Math.floor(transcurrido / 1000) + tiempoAcumulado; // incluye los 45' acumulados
        const m = Math.floor(totalSegundos / 60);
        const s = totalSegundos % 60;

        // Capar a 90'
        if (totalSegundos >= 90 * 60) {
          minuto = 90;
          segundo = 0;
        } else {
          // ⚠️ Reglas pedidas:
          // - A 45:00 exactos sigue siendo 45
          // - A partir de 45:01 ya es 46
          // - Luego 47, 48... como en la primera parte
          if (m < 45) {
            // Esto realmente no debería ocurrir al tener 45' ya acumulados,
            // pero por seguridad lo tratamos como 45.
            minuto = 45;
          } else if (m === 45) {
            minuto = s > 0 ? 46 : 45;
          } else {
            // m >= 46
            minuto = m;
          }
          segundo = s;
        }
        parte = "segunda";
      }
      // --- CASO 3: PRIMERA PARTE EN MARCHA ---
      else if (fase === "primera" && inicioMs) {
        const transcurrido = ahora - inicioMs;
        const totalSegundos = Math.floor(transcurrido / 1000) + tiempoAcumulado; // normalmente 0 acumulado
        const m = Math.floor(totalSegundos / 60);
        const s = totalSegundos % 60;

        // Capar a 45' si por cualquier motivo se sobrepasa
        if (totalSegundos >= 45 * 60) {
          minuto = 45;
          segundo = 0;
        } else {
          // En tu app, el 1' corresponde a 0:01–0:59 (m===0 y s>0 -> 1)
          // Después usas el propio m como minuto (2' ~ m=2, etc.), manteniendo tu mapeo actual.
          if (m === 0 && s > 0) {
            minuto = 1;
          } else {
            minuto = m;
          }
          segundo = s;
        }
        parte = "primera";
      }
      // --- CASO 4: SEGUNDA PARTE DETENIDA EN 90' O ESTADOS RAROS ---
      else if (fase === "segunda" && (!inicioMs || tiempoAcumulado >= 90 * 60)) {
        // Si ya acabó el tiempo efectivo, fija en 90 o usa extendido para Gol
        if (accion === "Gol") {
          minuto = await obtenerMinutoExtendido("segunda", accion); // 90, 91, 92, 93
        } else {
          minuto = 90;
        }
        segundo = 0;
        parte = "segunda";
      }
      // --- CASO 5: CUALQUIER OTRO ESTADO (inicio/final) ---
      else {
        // Por seguridad; normalmente no se debería registrar nada aquí.
        minuto = fase === "final" ? 90 : 0;
        segundo = 0;
        parte = minuto >= 45 ? "segunda" : "primera";
      }

      await addDoc(collection(db, "eventos"), {
        partidoId,
        porteroId,
        tipo,
        accion,
        minuto,
        segundo,
        timestamp: new Date().toISOString(),
        parte: parte === "segunda" ? 2 : 1
      });

      if (accion === "Gol") {
        // Registras los puntos del gol por minuto+partido
        navigate(`/registrar-gol/${partidoId}/${minuto}`);
      } else {
        navigate(`/partido/${partidoId}`, { state: { parte } });
      }
    } catch (err) {
      console.error("❌ Error al registrar acción:", err);
      alert("Error al registrar acción");
    }
  };

  const atributos = atributosPorTipo[tipo] || [];

  return (
    <div style={{ padding: "2rem" }}>
      <h2>➕ Acción: {tipo.toUpperCase()}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {atributos.map((atributo) => (
          <button key={atributo} onClick={() => registrar(atributo)}>
            {atributo}
          </button>
        ))}
      </div>
    </div>
  );
}

export default RegistrarAtributo;

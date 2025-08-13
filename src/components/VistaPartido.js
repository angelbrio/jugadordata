// src/components/VistaPartido.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import ResumenPartido from "./ResumenPartido";

const tipos = ["defensivo", "ofensivo", "oc", "tiros", "finalizaciones"];

const acciones = {
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

function VistaPartido() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [partido, setPartido] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [minuto, setMinuto] = useState(0);
  const [segundo, setSegundo] = useState(0);
  const [fase, setFase] = useState("inicio");
  const [tablaFase, setTablaFase] = useState(location.state?.parte || "primera");
  const [golesPortero, setGolesPortero] = useState(0);
  const [golesRival, setGolesRival] = useState(0);
  const [tiempoAcumulado, setTiempoAcumulado] = useState(0);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredCol, setHoveredCol] = useState(null);

  const intervalRef = useRef(null);

  // Cargar datos iniciales del partido y eventos
  useEffect(() => {
    const cargar = async () => {
      const snap = await getDoc(doc(db, "partidos", id));
      if (snap.exists()) {
        const data = snap.data();
        setPartido(data);
        setGolesPortero(data.golesPortero || 0);
        setGolesRival(data.golesRival || 0);
        setTiempoAcumulado(data.tiempoAcumulado || 0);

        if (data.fase === "primera" || data.fase === "segunda") {
          const ahora = Date.now();
          const base = data.inicioMs || ahora;
          const ms = ahora - base;
          const totalSegundos = Math.max(0, Math.floor(ms / 1000)) + (data.tiempoAcumulado || 0);
          const m = Math.floor(totalSegundos / 60);
          const s = totalSegundos % 60;
          setMinuto(m);
          setSegundo(s);
          setFase(data.fase);
        } else {
          const ta = data.tiempoAcumulado || 0;
          setMinuto(Math.floor(ta / 60));
          setSegundo(ta % 60);
          setFase(data.fase || "inicio");
        }
      }

      const eventosSnap = await getDocs(collection(db, "eventos"));
      const lista = eventosSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        .filter(ev => ev.partidoId === id);
      setEventos(lista);
    };

    cargar();
  }, [id]);

  // Gestionar cronómetro
  useEffect(() => {
    // Limpia intervalo previo
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!partido) return;

    // Solo cronometrar en primera/segunda con inicioMs definido
    if ((partido.fase === "primera" || partido.fase === "segunda") && partido.inicioMs) {
      intervalRef.current = setInterval(async () => {
        const ahora = Date.now();
        const ms = ahora - partido.inicioMs;
        const totalSegundos = Math.floor(ms / 1000) + (partido.tiempoAcumulado || 0);
        let m = Math.floor(totalSegundos / 60);
        let s = totalSegundos % 60;

        // Fin primera → descanso en 45:00
        if (partido.fase === "primera" && m >= 45) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;

          setMinuto(45);
          setSegundo(0);
          setFase("descanso");

          await updateDoc(doc(db, "partidos", id), {
            fase: "descanso",
            tiempoAcumulado: 45 * 60,
            inicioMs: null
          });

          setPartido(prev => ({
            ...prev,
            fase: "descanso",
            tiempoAcumulado: 45 * 60,
            inicioMs: null
          }));
          return;
        }

        // En segunda, parar exacto en 90:00 pero mantener fase="segunda"
        if (partido.fase === "segunda" && m >= 90) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;

          m = 90;
          s = 0;
          setMinuto(m);
          setSegundo(s);

          await updateDoc(doc(db, "partidos", id), {
            // OJO: no cambiamos fase aquí; la dejamos en "segunda"
            tiempoAcumulado: 90 * 60,
            inicioMs: null
          });

          setPartido(prev => ({
            ...prev,
            tiempoAcumulado: 90 * 60,
            inicioMs: null
          }));
          return;
        }

        // Actualización normal
        setMinuto(m);
        setSegundo(s);
      }, 1000);
    }

    // Limpieza
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [id, partido]);

  const finalizarPartido = async () => {
    await updateDoc(doc(db, "partidos", id), {
      fase: "final",
      // dejamos tiempoAcumulado como esté (normalmente 90*60)
      inicioMs: null
    });
    setFase("final");
    setPartido(prev => ({ ...prev, fase: "final", inicioMs: null }));
  };

  const renderTabla = () => {
    const inicio = tablaFase === "segunda" ? 46 : 1;
    const columnasExtras = ["+1", "+2", "+3"];

    return (
      <table border="1" cellPadding={3} style={{ width: "100%", fontSize: "0.75rem" }}>
        <thead>
          <tr>
            <th>Acción</th>
            {Array.from({ length: 45 }, (_, i) => (
              <th
                key={i}
                onMouseEnter={() => setHoveredCol(i)}
                onMouseLeave={() => setHoveredCol(null)}
                style={{ backgroundColor: hoveredCol === i ? "#cce4ff" : undefined }}
              >
                {inicio + i}
              </th>
            ))}
            {columnasExtras.map((col, index) => (
              <th key={`extra-${index}`}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(acciones).map(([grupo, lista]) => (
            <React.Fragment key={grupo}>
              <tr><td colSpan="50" style={{ fontWeight: "bold" }}>{grupo.toUpperCase()}</td></tr>
              {lista.map(accion => (
                <tr
                  key={accion}
                  onMouseEnter={() => setHoveredRow(accion)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td>{accion}</td>
                  {Array.from({ length: 45 }, (_, i) => {
                    const minutoCol = inicio + i;
                    const coincidencias = eventos.filter(e => e.accion === accion && e.minuto === minutoCol);
                    const count = coincidencias.length;
                    const evento = coincidencias[0];
                    return (
                      <td
                        key={i}
                        onMouseEnter={() => setHoveredCol(i)}
                        onMouseLeave={() => setHoveredCol(null)}
                        style={{
                          textAlign: "center",
                          cursor: evento ? "pointer" : "default",
                          backgroundColor: hoveredRow === accion || hoveredCol === i ? "#e0f0ff" : "transparent"
                        }}
                      >
                        {evento && accion === "Gol" ? (
                          <span
                            onClick={() => navigate(`/gol/${evento.id}`)}
                            style={{ color: "red", fontWeight: "bold" }}
                            title="Ver o registrar ubicación del gol"
                          >
                            {count > 1 ? count : "X"}
                          </span>
                        ) : evento ? (count > 1 ? count : "X") : ""}
                      </td>
                    );
                  })}
                  {["+1", "+2", "+3"].map((extra, idx) => {
                    const base = inicio === 46 ? 90 : 45;
                    const minutoExtra = base + (idx + 1);
                    const coincidencias = eventos.filter(e => e.accion === accion && e.minuto === minutoExtra);
                    const count = coincidencias.length;
                    const evento = coincidencias[0];
                    return (
                      <td key={`extra-${idx}`} style={{ textAlign: "center" }}>
                        {evento && accion === "Gol" ? (
                          <span
                            onClick={() => navigate(`/gol/${evento.id}`)}
                            style={{ color: "red", fontWeight: "bold" }}
                            title="Ver o registrar ubicación del gol"
                          >
                            {count > 1 ? count : "X"}
                          </span>
                        ) : evento ? (count > 1 ? count : "X") : ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    );
  };

  const puedeFinalizar =
    fase === "segunda" &&
    // tiempo parado en 90 o más (por seguridad)
    ((tiempoAcumulado >= 90 * 60) || (minuto >= 90)) &&
    // sin inicioMs para asegurar que está parado
    (!partido?.inicioMs);

  return (
    <div>
      <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}>
        <button
          onClick={() => {
            navigate("/lista-partidos", {
              state: {
                portero: {
                  id: partido?.porteroId,
                  nombre: partido?.porteroNombre || "Portero"
                }
              }
            });
          }}
        >
          📋 Ver partidos guardados
        </button>

        <button
          onClick={() => {
            navigate("/crear-partido", {
              state: {
                portero: {
                  id: partido?.porteroId,
                  nombre: partido?.porteroNombre || "Portero"
                }
              }
            });
          }}
        >
          ➕ Crear nuevo partido
        </button>
      </div>

      <ResumenPartido
        portero={{ nombre: partido?.porteroNombre || "Portero" }}
        equipo={partido?.equipo}
        eventos={eventos}
        totalPartidos={1}
        golesPortero={golesPortero}
        golesRival={golesRival}
        onGolPortero={() => {}}
        onGolRival={() => {}}
      />

      <p>⏱ Minuto: {minuto} | Segundo: {segundo}</p>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {fase === "inicio" && (
          <button onClick={async () => {
            const ahora = Date.now();
            await updateDoc(doc(db, "partidos", id), {
              inicioMs: ahora,
              fase: "primera",
              tiempoAcumulado: 0
            });
            setFase("primera");
            setTiempoAcumulado(0);
            setPartido(prev => ({ ...prev, inicioMs: ahora, fase: "primera", tiempoAcumulado: 0 }));
          }}>
            ▶️ Iniciar primer tiempo
          </button>
        )}

        {fase === "descanso" && (
          <button onClick={async () => {
            const ahora = Date.now();
            await updateDoc(doc(db, "partidos", id), {
              inicioMs: ahora,
              fase: "segunda",
              tiempoAcumulado: 45 * 60
            });
            setFase("segunda");
            setTiempoAcumulado(45 * 60);
            setPartido(prev => ({ ...prev, inicioMs: ahora, fase: "segunda", tiempoAcumulado: 45 * 60 }));
          }}>
            ▶️ Iniciar segundo tiempo
          </button>
        )}

        {/* Botón de finalizar visible cuando el tiempo está detenido en 90:00 */}
        {puedeFinalizar && (
          <button
            onClick={finalizarPartido}
            style={{
              backgroundColor: "red",
              color: "white",
              padding: "0.5rem 1rem",
              fontWeight: "bold",
              fontSize: "1rem",
              borderRadius: "8px"
            }}
          >
            🛑 Finalizar Partido
          </button>
        )}

        {fase === "final" && <button disabled>🏁 Partido finalizado</button>}
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => setTablaFase(tablaFase === "primera" ? "segunda" : "primera")}>
          👁️ Ver {tablaFase === "primera" ? "segunda" : "primera"} parte
        </button>
      </div>

      {/* Oculta los botones de registrar cuando el partido está finalizado */}
      {fase !== "final" && (
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          {tipos.map(tipo => (
            <button key={tipo} onClick={() => navigate(`/registrar/${id}/${tipo}`)}>
              {tipo.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {renderTabla()}
    </div>
  );
}

export default VistaPartido;

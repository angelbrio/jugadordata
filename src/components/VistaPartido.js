import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const [partido, setPartido] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [minuto, setMinuto] = useState(0);
  const [segundo, setSegundo] = useState(0);
  const [fase, setFase] = useState("inicio");
  const [tablaFase, setTablaFase] = useState("primera");
  const [golesPortero, setGolesPortero] = useState(0);
  const [golesRival, setGolesRival] = useState(0);

  useEffect(() => {
    const cargar = async () => {
      const snap = await getDoc(doc(db, "partidos", id));
      if (snap.exists()) {
        const data = snap.data();
        setPartido(data);

        setGolesPortero(data.golesPortero || 0);
        setGolesRival(data.golesRival || 0);

        if (data.fase === "primera" || data.fase === "segunda") {
          const ahora = Date.now();
          const ms = ahora - data.inicioMs;
          const totalSegundos = Math.floor(ms / 1000);
          const m = Math.floor(totalSegundos / 60);
          const s = totalSegundos % 60;

          setMinuto(m);
          setSegundo(s);

          if (data.fase === "primera" && m >= 45) {
            setFase("descanso");
          } else if (data.fase === "segunda" && m >= 90) {
            setFase("final");
          } else {
            setFase(data.fase);
          }
        } else {
          setMinuto(0);
          setSegundo(0);
          setFase("inicio");
        }
      }

      const eventosSnap = await getDocs(collection(db, "eventos"));
      const lista = eventosSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        .filter(ev => ev.partidoId === id);
      setEventos(lista);
    };

    cargar();

    const intervalo = setInterval(() => {
      if (!partido || !partido.inicioMs) return;

      const ahora = Date.now();
      const ms = ahora - partido.inicioMs;
      const totalSegundos = Math.floor(ms / 1000);
      const m = Math.floor(totalSegundos / 60);
      const s = totalSegundos % 60;

      setMinuto(m);
      setSegundo(s);

      if (partido.fase === "primera" && m >= 45) {
        setFase("descanso");
      } else if (partido.fase === "segunda" && m >= 90) {
        setFase("final");
      }
    }, 1000);

    return () => clearInterval(intervalo);
  }, [id, partido]);

  const iniciarPrimeraParte = async () => {
    const ahora = Date.now();
    await updateDoc(doc(db, "partidos", id), {
      inicioMs: ahora,
      fase: "primera"
    });
    setFase("primera");
  };

  const iniciarSegundaParte = async () => {
    const ahora = Date.now();
    await updateDoc(doc(db, "partidos", id), {
      inicioMs: ahora,
      fase: "segunda"
    });
    setFase("segunda");
  };

  const actualizarMarcador = async (equipo) => {
    const campo = equipo === "portero" ? "golesPortero" : "golesRival";
    const nuevoValor = equipo === "portero" ? golesPortero + 1 : golesRival + 1;

    await updateDoc(doc(db, "partidos", id), {
      [campo]: nuevoValor
    });

    if (equipo === "portero") setGolesPortero(nuevoValor);
    else setGolesRival(nuevoValor);
  };

  const renderBotonInicio = () => {
    if (fase === "inicio") {
      return <button onClick={iniciarPrimeraParte}>▶️ Iniciar primer tiempo</button>;
    } else if (fase === "descanso") {
      return <button onClick={iniciarSegundaParte}>▶️ Iniciar segundo tiempo</button>;
    } else if (fase === "final") {
      return <button disabled>🏁 Partido finalizado</button>;
    }
    return null;
  };

  const renderBotonesTipo = () => {
    if (fase === "final") return null;

    return (
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {tipos.map(tipo => (
          <button key={tipo} onClick={() => navigate(`/registrar/${id}/${tipo}`)}>
            {tipo.toUpperCase()}
          </button>
        ))}
      </div>
    );
  };

  const renderTabla = () => {
    const eventosParte = eventos.filter(e =>
      tablaFase === "segunda" ? e.minuto > 45 : e.minuto <= 45
    );

    return (
      <table border="1" cellPadding={3} style={{ width: "100%", fontSize: "0.75rem" }}>
        <thead>
          <tr>
            <th>Acción</th>
            {[...Array(45)].map((_, i) => (
              <th key={i}>{i + 1 + (tablaFase === "segunda" ? 45 : 0)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(acciones).map(([grupo, lista]) => (
            <React.Fragment key={grupo}>
              <tr><td colSpan="46" style={{ fontWeight: "bold" }}>{grupo.toUpperCase()}</td></tr>
              {lista.map(accion => (
                <tr key={accion}>
                  <td>{accion}</td>
                  {[...Array(45)].map((_, i) => {
                    const minutoCol = i + 1 + (tablaFase === "segunda" ? 45 : 0);
                    const evento = eventosParte.find(e =>
                      e.accion === accion &&
                      (e.minuto === minutoCol || (e.minuto === 0 && minutoCol === 1))
                    );
                    return (
                      <td key={i} style={{ textAlign: "center", cursor: evento ? "pointer" : "default" }}>
                        {evento && accion === "Gol" ? (
                          <span
                            onClick={() => {
                              if (evento.golCampo && evento.golPorteria) {
                                navigate(`/gol/${evento.id}`);
                              } else {
                                navigate(`/registrar-gol/${id}/${minutoCol}`);
                              }
                            }}
                            style={{ color: "red", fontWeight: "bold" }}
                            title="Ver o registrar ubicación del gol"
                          >
                            X
                          </span>
                        ) : evento ? "X" : ""}
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

  if (!partido) return <p>Cargando partido...</p>;

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => {
            navigate("/lista-partidos", {
              state: {
                portero: {
                  id: partido.porteroId,
                  nombre: partido.porteroNombre || "Portero"
                }
              }
            });
          }}
        >
          🔙 Ver partidos
        </button>
      </div>

      <ResumenPartido
        portero={{ nombre: partido.porteroNombre || "Portero" }}
        equipo={partido.equipo}
        eventos={eventos}
        totalPartidos={1}
        golesPortero={golesPortero}
        golesRival={golesRival}
        onGolPortero={() => actualizarMarcador("portero")}
        onGolRival={() => actualizarMarcador("rival")}
      />

      <p>⏱ Minuto: {minuto} | Segundo: {segundo}</p>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        {renderBotonInicio()}
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => setTablaFase(tablaFase === "primera" ? "segunda" : "primera")}>
          👁️ Ver {tablaFase === "primera" ? "segunda" : "primera"} parte
        </button>
      </div>

      {renderBotonesTipo()}
      {renderTabla()}
    </div>
  );
}

export default VistaPartido;

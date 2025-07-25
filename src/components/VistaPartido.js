import React, { useEffect, useState, useRef } from "react";
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

  const intervaloRef = useRef(null);

  useEffect(() => {
    const cargar = async () => {
      const snap = await getDoc(doc(db, "partidos", id));
      if (snap.exists()) {
        const data = snap.data();
        setPartido(data);
        setMinuto(data.minuto || 0);
        setSegundo(data.segundo || 0);

        if (data.minuto >= 90) setFase("final");
        else if (data.minuto >= 46) {
          setFase("segunda");
          iniciarCronometro();
        } else if (data.minuto >= 1) {
          setFase("primera");
          iniciarCronometro();
        } else {
          setFase("inicio");
        }
      }

      const eventosSnap = await getDocs(collection(db, "eventos"));
      const lista = eventosSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        .filter(ev => ev.partidoId === id);
      setEventos(lista);
    };

    cargar();
  }, [id]);

  const iniciarCronometro = () => {
    if (intervaloRef.current) return;

    intervaloRef.current = setInterval(() => {
      setSegundo(prev => {
        if (prev + 1 >= 60) {
          setMinuto(m => {
            const nuevoMinuto = m + 1;

            updateDoc(doc(db, "partidos", id), {
              minuto: nuevoMinuto,
              segundo: 0,
            });

            if (nuevoMinuto === 45) {
              clearInterval(intervaloRef.current);
              intervaloRef.current = null;
              setFase("descanso");
            } else if (nuevoMinuto === 90) {
              clearInterval(intervaloRef.current);
              intervaloRef.current = null;
              setFase("final");
            }

            return nuevoMinuto;
          });
          return 0;
        }

        const nuevoSegundo = prev + 1;
        updateDoc(doc(db, "partidos", id), {
          segundo: nuevoSegundo,
        });

        return nuevoSegundo;
      });
    }, 1000);
  };

  const reiniciar = async () => {
    clearInterval(intervaloRef.current);
    intervaloRef.current = null;
    setMinuto(0);
    setSegundo(0);
    setFase("inicio");

    await updateDoc(doc(db, "partidos", id), {
      minuto: 0,
      segundo: 0,
    });
  };

  const renderBotonesTipo = () => (
    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
      {tipos.map(tipo => (
        <button key={tipo} onClick={() => navigate(`/registrar/${id}/${tipo}`)}>
          {tipo.toUpperCase()}
        </button>
      ))}
    </div>
  );

  const renderTabla = () => {
    const eventosParte = eventos.filter(e =>
      fase === "segunda" ? e.minuto > 45 : e.minuto <= 45
    );

    return (
      <table border="1" cellPadding={3} style={{ width: "100%", fontSize: "0.75rem" }}>
        <thead>
          <tr>
            <th>Acción</th>
            {[...Array(45)].map((_, i) => (
              <th key={i}>{i + 1 + (fase === "segunda" ? 45 : 0)}</th>
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
                    const minutoCol = i + 1 + (fase === "segunda" ? 45 : 0);
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

  const renderBotonInicio = () => {
    if (fase === "inicio") {
      return <button onClick={() => { setFase("primera"); iniciarCronometro(); }}>▶️ Iniciar primer tiempo</button>;
    } else if (fase === "descanso") {
      return <button onClick={() => { setFase("segunda"); iniciarCronometro(); }}>▶️ Iniciar segundo tiempo</button>;
    }
    return null;
  };

  if (!partido) return <p>Cargando partido...</p>;

  return (
    <div>
      <ResumenPartido
        portero={{ nombre: partido.porteroNombre || "Portero" }}
        equipo={partido.equipo}
        eventos={eventos}
        totalPartidos={1}
      />

      <p>⏱ Minuto: {minuto} | Segundo: {segundo}</p>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        {renderBotonInicio()}
        <button onClick={reiniciar}>🔁 Reiniciar</button>
      </div>

      {renderBotonesTipo()}
      {renderTabla()}
    </div>
  );
}

export default VistaPartido;

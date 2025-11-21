import { useState, useRef, useEffect } from "react";
import "../estilos/Casos.css";

export default function CasosBasicos({ backendUrl }) {
  const cleanBackendUrl = backendUrl?.trim().replace(/\/+$/, "");

  const [sistemaSeleccionado, setSistemaSeleccionado] = useState(null);
  const [caso, setCaso] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [pregunta, setPregunta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);
  const [mostrarPistas, setMostrarPistas] = useState(false);
  const inputRef = useRef(null);

  const [fase, setFase] = useState("anamnesis");
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [diagnosticoInput, setDiagnosticoInput] = useState("");
  const [tratamientoInput, setTratamientoInput] = useState("");
  const [diagnosticosUsuario, setDiagnosticosUsuario] = useState([]);
  const [estudiosSolicitados, setEstudiosSolicitados] = useState([]);
  const [resultadosEstudios, setResultadosEstudios] = useState([]);
  const chatContainerRef = useRef(null);
  const casoChatRef = useRef(null);

  const sistemas = [
    { id: "todos", nombre: "Todos los sistemas" },
    { id: "cardiovascular", nombre: "Cardiovascular" },
    { id: "respiratorio", nombre: "Respiratorio" },
    { id: "digestivo", nombre: "Digestivo" },
    { id: "renal", nombre: "Renal" },
    { id: "endocrino", nombre: "Endocrino" },
    { id: "nervioso", nombre: "Nervioso" },
  ];

  // Función para toggle de pantalla completa
  const togglePantallaCompleta = () => {
    if (!pantallaCompleta) {
      if (casoChatRef.current) {
        if (casoChatRef.current.requestFullscreen) {
          casoChatRef.current.requestFullscreen();
        } else if (casoChatRef.current.webkitRequestFullscreen) {
          casoChatRef.current.webkitRequestFullscreen();
        } else if (casoChatRef.current.msRequestFullscreen) {
          casoChatRef.current.msRequestFullscreen();
        }
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // Detectar cambios en pantalla completa
  useEffect(() => {
    const handleFullscreenChange = () => {
      setPantallaCompleta(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const seleccionarSistema = async (sistema) => {
    setSistemaSeleccionado(sistema);
    setMensajes([]);
    setPregunta("");
    setCaso(null);
    setCargando(true);
    setFase("anamnesis");
    setShowEvaluation(false);
    setEvaluationResult(null);
    setDiagnosticosUsuario([]);
    setEstudiosSolicitados([]);
    setResultadosEstudios([]);
    setMostrarPistas(false);

    try {
      const res = await fetch(`${cleanBackendUrl}/api/caso?system=${sistema.id}`);
      const data = await res.json();
      if (res.ok && data.presentacion) {
        setCaso(data);
        setMensajes([
          { 
            texto: data.presentacion, 
            emisor: "bot",
            tipo: "presentacion"
          },
          { 
            texto: "¡Hola doctor/a!", 
            emisor: "bot" 
          }
        ]);
      } else {
        throw new Error("No se pudo cargar el caso");
      }
    } catch (err) {
      console.error(err);
      setMensajes([{ 
        texto: "❌ Error al cargar el caso clínico. Intente nuevamente.", 
        emisor: "bot" 
      }]);
      setSistemaSeleccionado(null);
    } finally {
      setCargando(false);
    }
  };

  // Obtener preguntas ya realizadas por el usuario
  const getPreguntasRealizadas = () => {
    return mensajes
      .filter(m => m.emisor === "usuario")
      .map(m => m.texto.toLowerCase());
  };

  // Generar pistas inteligentes que no incluyan preguntas ya realizadas
  const getPistasInteligentes = () => {
    const preguntasRealizadas = getPreguntasRealizadas();
    const pistasBase = {
      anamnesis: [
        "¿Cuándo empezó el dolor?",
        "¿Dónde localiza el dolor?",
        "¿Qué intensidad tiene el dolor?",
        "¿El dolor se irradia a algún lado?",
        "¿Qué estaba haciendo cuando empezó?",
        "¿Qué factores alivian el dolor?",
        "¿Qué factores empeoran el dolor?",
        "¿Tiene falta de aire?",
        "¿Tiene náuseas o vómitos?",
        "¿Está sudando?",
        "¿Tiene antecedentes médicos?",
        "¿Toma alguna medicación?",
        "¿Es fumador?",
        "¿Hay antecedentes familiares importantes?"
      ],
      examen: [
        "Auscultación cardíaca",
        "Auscultación pulmonar",
        "Palpación abdominal",
        "Tomar signos vitales",
        "Examen de miembros inferiores",
        "Buscar edemas",
        "Evaluar estado de conciencia",
        "Examen neurológico básico"
      ],
      presuntivos: [
        "infarto agudo de miocardio, angina inestable",
        "pericarditis aguda, disección aórtica",
        "neumonía, embolia pulmonar",
        "reflujo gastroesofágico, espasmo esofágico",
        "colecistitis aguda, pancreatitis aguda"
      ],
      complementarios: [
        "electrocardiograma",
        "radiografía de tórax",
        "análisis de sangre completo",
        "troponinas cardíacas",
        "ecocardiograma",
        "tomografía computada",
        "enzimas hepáticas",
        "gasometría arterial"
      ]
    };

    const pistasFase = pistasBase[fase] || [];
    
    // Filtrar pistas que no coincidan con preguntas ya realizadas
    return pistasFase.filter(pista => {
      const pistaLower = pista.toLowerCase();
      return !preguntasRealizadas.some(pregunta => 
        pregunta.includes(pistaLower) || pistaLower.includes(pregunta)
      );
    }).slice(0, 6); // Limitar a 6 pistas máximo
  };

  const insertarPista = (pista) => {
    setPregunta(pista);
    setMostrarPistas(false);
    inputRef.current?.focus();
  };

  const togglePistas = () => {
    setMostrarPistas(!mostrarPistas);
  };

  const enviarMensaje = async () => {
    if (!pregunta.trim()) return;

    const nuevoMensaje = { texto: pregunta, emisor: "usuario" };
    setMensajes((prev) => [...prev, nuevoMensaje]);
    setPregunta("");
    setMostrarPistas(false);

    // Lógica de diagnósticos presuntivos
    if (fase === "presuntivos" && pregunta.includes(",")) {
      const diagnosticosIngresados = pregunta
        .split(",")
        .map(d => d.trim())
        .filter(d => d.length > 0);

      setDiagnosticosUsuario(diagnosticosIngresados);

      if (caso?.evaluacion?.diagnostico_presuntivo) {
        const esperados = caso.evaluacion.diagnostico_presuntivo.map(d => 
          d.toLowerCase().trim()
        );
        
        const ingresados = diagnosticosIngresados.map(d => d.toLowerCase().trim());
        
        let aciertos = 0;
        const diagnosticosCorrectos = [];
        
        ingresados.forEach(dx => {
          if (esperados.some(e => e.includes(dx) || dx.includes(e))) {
            aciertos++;
            diagnosticosCorrectos.push(dx);
          }
        });

        const porcentaje = esperados.length ? (aciertos / esperados.length) * 100 : 0;
        
        let feedback = "";
        if (porcentaje >= 70) {
          feedback = "🎉 ¡Excelente! Tus diagnósticos presuntivos son muy acertados. Puedes avanzar a estudios complementarios.";
        } else if (porcentaje >= 50) {
          feedback = "✅ Buen trabajo. Coincides con varios diagnósticos importantes. ¿Quieres reconsiderar algún otro diagnóstico antes de avanzar?";
        } else if (porcentaje >= 30) {
          feedback = "⚠️ Tienes algunos diagnósticos correctos, pero podrías considerar otras posibilidades. Revisa los síntomas principales.";
        } else {
          feedback = "❌ Los diagnósticos no coinciden con el cuadro clínico. Te sugiero repasar la anamnesis y examen físico.";
        }

        setMensajes((prev) => [
          ...prev,
          {
            texto: `📊 **Resultado de diagnósticos:**\n${feedback}`,
            emisor: "bot",
            tipo: porcentaje >= 70 ? "excelente" : porcentaje >= 50 ? "bueno" : "regular"
          }
        ]);

        if (porcentaje < 70 && diagnosticosCorrectos.length > 0) {
          setTimeout(() => {
            setMensajes(prev => [...prev, {
              texto: `💡 **Diagnósticos correctos que identificaste:** ${diagnosticosCorrectos.join(", ")}`,
              emisor: "bot",
              tipo: "pista"
            }]);
          }, 1500);
        }
      }
      return; // IMPORTANTE: return aquí para evitar el flujo normal
    }

    // Lógica de estudios complementarios
    if (fase === "complementarios") {
      const estudioSolicitado = pregunta
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

      const estudioKey = Object.keys(caso.respuestas).find((key) => {
        const keyNorm = key
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();

        const variaciones = (caso.respuestas[key].variantes || []).map(v =>
          v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
        );

        return (
          estudioSolicitado.includes(keyNorm) ||
          keyNorm.includes(estudioSolicitado) ||
          variaciones.some(v => estudioSolicitado.includes(v))
        );
      });

      if (!estudioKey) {
        setMensajes(prev => [
          ...prev,
          {
            texto: "❌ No tengo resultados para ese estudio específico. ¿Podrías ser más específico?\n💡 *Ejemplos:* 'electrocardiograma', 'radiografía de tórax', 'análisis de sangre'",
            emisor: "bot",
            tipo: "advertencia",
          },
        ]);
        return; // IMPORTANTE: return aquí
      }

      // Evitar estudios repetidos
      if (estudiosSolicitados.includes(estudioKey)) {
        setMensajes(prev => [
          ...prev,
          {
            texto: `⚠️ Ya solicitaste **${estudioKey}**. ¿Querés pedir otro estudio?`,
            emisor: "bot",
            tipo: "ayuda",
          },
        ]);
        return; // IMPORTANTE: return aquí
      }

      const resultadoTexto = caso.respuestas[estudioKey].respuesta;

      setEstudiosSolicitados(prev => [...prev, estudioKey]);

      setResultadosEstudios(prev => [
        ...prev,
        { estudio: estudioKey, resultado: resultadoTexto },
      ]);

      setMensajes(prev => [
        ...prev,
        {
          texto: `🔎 **${estudioKey.toUpperCase()}:**\n${resultadoTexto}`,
          emisor: "bot",
          tipo: "resultado-estudio",
        },
      ]);

      return; // IMPORTANTE: return aquí para evitar el flujo normal
    }

    // Flujo normal de chat
    setEnviando(true);

    try {
      const res = await fetch(`${cleanBackendUrl}/casos/basicos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta }),
      });

      if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
      const data = await res.json();

      if (data.respuesta) {
        setMensajes((prev) => [...prev, { 
          texto: data.respuesta, 
          emisor: "bot" 
        }]);
      } else {
        setMensajes((prev) => [
          ...prev,
          { 
            texto: "No entendí tu pregunta, ¿podés decirlo de otra manera?\n\n💡 **Sugerencia:** Formula preguntas más específicas sobre síntomas, antecedentes o examen físico.", 
            emisor: "bot",
            tipo: "ayuda"
          },
        ]);
      }
    } catch (error) {
      console.error(error);
      setMensajes((prev) => [
        ...prev,
        { 
          texto: "Error de conexión con el servidor. Verifica tu conexión a internet.", 
          emisor: "bot",
          tipo: "error"
        },
      ]);
    } finally {
      setEnviando(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const manejarEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  const avanzarFase = (nuevaFase) => {
    const mensajesTransicion = {
      anamnesis: {
        titulo: "🩺 ANAMNESIS",
        mensaje: "Fase de anamnesis. Describe los síntomas del paciente, antecedentes médicos y la historia de la enfermedad actual..."
      },
      examen: {
        titulo: "🔍 EXAMEN FÍSICO", 
        mensaje: "Fase de examen físico. Describe las maniobras que realizarías (ej: auscultación cardíaca, palpación abdominal, inspección general)..."
      },
      presuntivos: {
        titulo: "💭 DIAGNÓSTICOS PRESUNTIVOS",
        mensaje: "Fase de diagnósticos presuntivos. Ingresa tus diagnósticos diferenciales separados por comas (ej: infarto agudo de miocardio, angina inestable, pericarditis)..."
      },
      complementarios: {
        titulo: "📊 ESTUDIOS COMPLEMENTARIOS",
        mensaje: "Fase de estudios complementarios. Solicita los estudios que consideres necesarios (ej: electrocardiograma, radiografía de tórax, análisis de laboratorio)..."
      },
      evaluacion: {
        titulo: "📝 EVALUACIÓN FINAL",
        mensaje: "Finalizando caso. Basándote en toda la información recabada, completa tu evaluación final y plan de tratamiento..."
      }
    };

    setFase(nuevaFase);
    setMensajes((prev) => [
      ...prev,
      { 
        texto: `## ${mensajesTransicion[nuevaFase].titulo}\n${mensajesTransicion[nuevaFase].mensaje}`,
        emisor: "bot",
        tipo: "transicion"
      }
    ]);
    setMostrarPistas(false);
  };

  // FUNCIÓN HANDLE_EVALUATION CORREGIDA (SIMPLE)
  const handleEvaluation = async () => {
    if (!diagnosticoInput.trim() || !tratamientoInput.trim()) {
      setMensajes(prev => [...prev, {
        texto: "⚠️ **Completa ambos campos:**\n- Diagnóstico definitivo\n- Tratamiento inicial\n\nAmbos son necesarios para la evaluación.",
        emisor: "bot",
        tipo: "advertencia"
      }]);
      return;
    }

    try {
      console.log("📤 Enviando evaluación al backend...");
      
      const res = await fetch(`${cleanBackendUrl}/api/evaluar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diagnostico: diagnosticoInput,
          tratamiento: tratamientoInput
        }),
      });

      if (!res.ok) {
        throw new Error(`Error HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("📥 Respuesta del backend:", data);
      
      setEvaluationResult(data);

    } catch (err) {
      console.error("❌ Error en evaluación:", err);
      setMensajes(prev => [...prev, {
        texto: `❌ Error al conectar con el servidor: ${err.message}. Intenta nuevamente.`,
        emisor: "bot",
        tipo: "error"
      }]);
    }
  };

  // Scroll mejorado
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [mensajes]);

  return (
    <div className={`seccion casos-basicos ${pantallaCompleta ? 'pantalla-completa' : ''}`}>
      <div className="card" ref={casoChatRef}>
        <div className="header-con-controles">
          <div className="header-texto">
            <h2 className="titulo-seccion">CASOS BÁSICOS</h2>
          </div>
          
          {sistemaSeleccionado && caso && !cargando && (
            <div className="controles-pantalla">
              <button 
                className="btn-pistas"
                onClick={togglePistas}
                title="Mostrar pistas"
              >
                💡 Pistas
              </button>
              <button 
                className="btn-pantalla-completa"
                onClick={togglePantallaCompleta}
                title={pantallaCompleta ? "Salir de pantalla completa" : "Pantalla completa"}
              >
                {pantallaCompleta ? "📱" : "🖥️"}
                {pantallaCompleta ? " Salir pantalla completa" : " Pantalla completa"}
              </button>
            </div>
          )}
        </div>

        {!sistemaSeleccionado && !cargando && (
          <div className="sistemas-container">
            <h3>🎯 Seleccioná un sistema:</h3>
            <div className="botones-sistemas">
              {sistemas.map((s) => (
                <button key={s.id} className="boton-sistema" onClick={() => seleccionarSistema(s)}>
                  {s.nombre}
                </button>
              ))}
            </div>
          </div>
        )}

        {cargando && (
          <div className="cargando-caso">
            <div className="spinner"></div>
            <p>⏳ Preparando caso clínico...</p>
            <small>Esto puede tomar unos segundos</small>
          </div>
        )}

        {sistemaSeleccionado && caso && !cargando && (
          <div className="caso-chat-container">
            {/* Header informativo */}
            <div className="caso-header">
              {/* IZQUIERDA — Sistema */}
              <div className="info-caso">
                <h3>{sistemaSeleccionado.nombre}</h3>
              </div>

              {/* CENTRO — Fase + Pantalla completa */}
              <div className="barra-centro">
                <span className="fase-actual">📋 {fase.toUpperCase()}</span>

                <button 
                  className="btn-pantalla-completa"
                  onClick={togglePantallaCompleta}
                >
                  ⛶ Pantalla
                </button>
              </div>

              {/* DERECHA — Pistas */}
              <div className="barra-derecha">
                <button 
                  className="btn-pistas"
                  onClick={togglePistas}
                >
                  💡 Pistas
                </button>
              </div>
            </div>

            <div className="chat-area">
              <div className="chat-mensajes" ref={chatContainerRef}>
                {mensajes.map((msg, i) => (
                  <div
                    key={i}
                    className={
                      msg.tipo === "presentacion" ? "mensaje-presentacion" :
                      msg.tipo === "transicion" ? "mensaje-transicion" :
                      msg.tipo === "excelente" ? "mensaje-excelente" :
                      msg.tipo === "bueno" ? "mensaje-bueno" :
                      msg.tipo === "regular" ? "mensaje-regular" :
                      msg.tipo === "bajo" ? "mensaje-bajo" :
                      msg.tipo === "pista" ? "mensaje-pista" :
                      msg.tipo === "resultado-estudio" ? "mensaje-resultado-estudio" :
                      msg.tipo === "ayuda" ? "mensaje-ayuda" :
                      msg.tipo === "error" ? "mensaje-error" :
                      msg.tipo === "advertencia" ? "mensaje-advertencia" :
                      `mensaje ${msg.emisor === "usuario" ? "mensaje-usuario" : "mensaje-bot"}`
                    }
                  >
                    {msg.texto.split('\n').map((line, index) => (
                      <div key={index}>
                        {line.startsWith('## ') ? (
                          <strong>{line.replace('## ', '')}</strong>
                        ) : line.startsWith('**') && line.endsWith('**') ? (
                          <strong>{line.slice(2, -2)}</strong>
                        ) : (
                          line
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Panel de pistas */}
              {mostrarPistas && (
                <div className="pistas-section">
                  {getPistasInteligentes().length > 0 ? (
                    <div className="pistas-container">
                      <div className="pistas-header">
                        <h4>💡 Pistas Sugeridas</h4>
                        <small>Selecciona una pista para insertarla</small>
                      </div>
                      <div className="botones-pistas">
                        {getPistasInteligentes().map((pista, index) => (
                          <button
                            key={index}
                            className="boton-pista"
                            onClick={() => insertarPista(pista)}
                          >
                            {pista}
                          </button>
                        ))}
                      </div>
                      <button 
                        className="btn-cerrar-pistas"
                        onClick={() => setMostrarPistas(false)}
                      >
                        Cerrar pistas
                      </button>
                    </div>
                  ) : (
                    <div className="pistas-container">
                      <div className="pistas-header">
                        <h4>💡 Pistas</h4>
                        <small>¡Ya has cubierto todas las preguntas importantes de esta fase!</small>
                      </div>
                      <button 
                        className="btn-cerrar-pistas"
                        onClick={() => setMostrarPistas(false)}
                      >
                        Cerrar pistas
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Input y controles */}
              <div className="chat-controls">
                {!showEvaluation && !evaluationResult && (
                  <div className="chat-input-container">
                    <div className="chat-input">
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder={
                          fase === "anamnesis" ? "Hazle una pregunta al paciente sobre sus síntomas..." :
                          fase === "examen" ? "Describe la maniobra de examen físico a realizar..." :
                          fase === "presuntivos" ? "Ingresa diagnósticos separados por comas..." :
                          "Solicita un estudio complementario específico..."
                        }
                        value={pregunta}
                        onChange={(e) => setPregunta(e.target.value)}
                        onKeyDown={manejarEnter}
                        disabled={enviando}
                      />
                      <button 
                        onClick={enviarMensaje} 
                        disabled={enviando || !pregunta.trim()}
                        className={enviando ? "enviando" : ""}
                      >
                        {enviando ? "⏳" : "📤"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Botones de navegación entre fases */}
                {!showEvaluation && !evaluationResult && (
                  <div className="fase-buttons">
                    {fase === "anamnesis" && (
                      <button 
                        className="btn-avanzar"
                        onClick={() => avanzarFase("examen")}
                      >
                        🩺 Avanzar a Examen Físico
                      </button>
                    )}

                    {fase === "examen" && (
                      <button 
                        className="btn-avanzar"
                        onClick={() => avanzarFase("presuntivos")}
                      >
                        🔍 Avanzar a Diagnósticos
                      </button>
                    )}

                    {fase === "presuntivos" && diagnosticosUsuario.length > 0 && (
                      <button 
                        className="btn-avanzar"
                        onClick={() => avanzarFase("complementarios")}
                      >
                        📊 Avanzar a Estudios
                      </button>
                    )}

                    {fase === "complementarios" && resultadosEstudios.length > 0 && (
                      <button 
                        className="btn-finalizar"
                        onClick={() => setShowEvaluation(true)}
                      >
                        📝 Finalizar Caso
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {showEvaluation && !evaluationResult && (
              <div className="evaluacion-form">
                <h3>🎯 Evaluación Final</h3>
                <p className="instrucciones-evaluacion">
                  Basándote en toda la información recabada, completa tu evaluación:
                </p>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleEvaluation();
                }}>
                  <div className="campo-evaluacion">
                    <label>🩺 Diagnóstico Definitivo:</label>
                    <input
                      type="text"
                      value={diagnosticoInput}
                      onChange={(e) => setDiagnosticoInput(e.target.value)}
                      placeholder="Ej: Infarto agudo de miocardio con supradesnivel del ST"
                    />
                  </div>

                  <div className="campo-evaluacion">
                    <label>💊 Tratamiento Inicial (básico):</label>
                    <textarea
                      rows="4"
                      value={tratamientoInput}
                      onChange={(e) => setTratamientoInput(e.target.value)}
                      placeholder="Ej: Aspirina 300 mg, oxígeno suplementario, monitoreo cardíaco, derivación a unidad coronaria..."
                    />
                  </div>

                  <button type="submit" className="btn-evaluar">
                    📊 Enviar Evaluación
                  </button>
                </form>
              </div>
            )}

            {evaluationResult && (
              <div className="evaluacion-resultado">
                <div className="header-resultado">
                  <h3>📊 Resultados de tu Evaluación</h3>
                  <div className="resumen-evaluacion">
                    <span className="puntaje">Puntuación: {evaluationResult.puntaje || 0}%</span>
                  </div>
                </div>

                <div className="grid-resultados">
                  <div className="resultado-seccion diagnostico">
                    <h4>🩺 Diagnóstico</h4>
                    {evaluationResult.diagnosticoOk ? (
                      <p className="correcto">
                        ✅ Correcto
                      </p>
                    ) : (
                      <p className="incorrecto">
                        ❌ Incorrecto  
                        <br />
                        <strong>Diagnóstico correcto:</strong> {evaluationResult.diagnosticoCorrecto}
                      </p>
                    )}
                  </div>

                  <div className="resultado-seccion tratamiento">
                    <h4>💊 Tratamiento</h4>
                    <div className="tratamiento-detalle">
                      {evaluationResult.correctos?.length > 0 && (
                        <div className="correcto">
                          <strong>Correctos ({evaluationResult.correctos.length}):</strong> 
                          {evaluationResult.correctos.join(", ")}
                        </div>
                      )}
                      {evaluationResult.faltantes?.length > 0 && (
                        <div className="faltante">
                          <strong>Faltaron ({evaluationResult.faltantes.length}):</strong> 
                          {evaluationResult.faltantes.join(", ")}
                        </div>
                      )}
                      {evaluationResult.incorrectos?.length > 0 && (
                        <div className="incorrecto">
                          <strong>Incorrectos ({evaluationResult.incorrectos.length}):</strong> 
                          {evaluationResult.incorrectos.join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="resultado-seccion proceso">
                  <h4>📈 Proceso Clínico</h4>
                  <div className="metricas-proceso">
                    <div className="metrica">
                      <span className="label">Anamnesis:</span>
                      <span className="valor">{evaluationResult.feedback?.anamnesis}</span>
                    </div>
                    <div className="metrica">
                      <span className="label">Examen físico:</span>
                      <span className="valor">{evaluationResult.feedback?.examen}</span>
                    </div>
                    <div className="metrica">
                      <span className="label">Estudios:</span>
                      <span className="valor">{evaluationResult.feedback?.estudios}</span>
                    </div>
                  </div>
                </div>

                {evaluationResult.fortalezas && evaluationResult.fortalezas.length > 0 && (
                  <div className="resultado-seccion fortalezas">
                    <h4>🌟 Fortalezas</h4>
                    <ul>
                      {evaluationResult.fortalezas.map((fortaleza, index) => (
                        <li key={index}>✅ {fortaleza}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {evaluationResult.debilidades && evaluationResult.debilidades.length > 0 && (
                  <div className="resultado-seccion debilidades">
                    <h4>💡 Áreas de mejora</h4>
                    <ul>
                      {evaluationResult.debilidades.map((debilidad, index) => (
                        <li key={index}>📝 {debilidad}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="acciones-resultado">
                  <button 
                    className="btn-volver"
                    onClick={() => {
                      if (pantallaCompleta) {
                        togglePantallaCompleta();
                      }
                      setSistemaSeleccionado(null);
                    }}
                  >
                    🔄 Nuevo Caso
                  </button>
                  <button 
                    className="btn-revisar"
                    onClick={() => {
                      setShowEvaluation(false);
                      setEvaluationResult(null);
                      chatContainerRef.current?.scrollTo(0, 0);
                    }}
                  >
                    📖 Revisar Caso
                  </button>
                </div>
              </div>
            )}

            {!showEvaluation && (
              <button
                className="volver-btn"
                onClick={() => {
                  if (window.confirm("¿Estás seguro de que quieres salir? Se perderá el progreso del caso actual.")) {
                    if (pantallaCompleta) {
                      togglePantallaCompleta();
                    }
                    setSistemaSeleccionado(null);
                    setCaso(null);
                  }
                }}
              >
                ← Volver a sistemas
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
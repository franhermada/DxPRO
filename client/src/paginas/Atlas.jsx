import React, { useState } from "react";
import "../estilos/Secciones.css";

const BASE_URL = "/atlas_semiologico";

const Atlas = () => {
  const [sistemaActivo, setSistemaActivo] = useState(null);
  const [temaActivo, setTemaActivo] = useState(null);
  const [maniobraActiva, setManiobraActiva] = useState(null); // NUEVO

  const atlasData = {
    /* =========================================================================
       MANIOBRAS CON SUBDIVISIONES 
    ========================================================================= */
    maniobras: {
      nombre: "Maniobras",
      color: "#c77dff",
      temas: [
        {
          subtipo: "sistema",
          titulo: "Cardiovascular",
          maniobras: [
            {
              titulo: "Inspección precordial",
              tipo: "Técnica básica",
              objetivo:
                "Observar movimientos visibles del área precordial que orienten a sobrecarga, dilatación o alteraciones del movimiento cardíaco.",
              tecnica:
                "1) Paciente en decúbito con cabecera a 30–45°. 2) Buena iluminación. 3) Observar ápex, paraesternal, supraesternal y epigastrio. 4) Evaluar latidos, abombamientos y movimientos anormales.",
              errores:
                "Mala iluminación, no observar desde diferentes ángulos, no destapar bien el tórax, no elevar correctamente la cabecera.",
              normalidad:
                "En adultos sanos no suelen observarse latidos visibles. Puede verse un choque de punta leve en personas delgadas.",
              video: `${BASE_URL}/maniobras/cardiovascular/videos/inspeccion_precordial.mp4`,
            },
            {
              titulo: "Palpación: choque de punta y frémito",
              tipo: "Técnica básica",
              objetivo:
                "Localizar y caracterizar el choque de punta, identificar frémitos y detectar impulsos anómalos.",
              tecnica:
                "1) Palpación general del precordio con mano plana. 2) Localizar choque de punta en 5° EIC línea medio-clavicular. 3) Evaluar intensidad, extensión y duración. 4) Buscar frémitos en focos valvulares.",
              errores:
                "Presionar demasiado, palpar solo el ápex, no registrar ubicación precisa, olvidar paraesternal y base.",
              normalidad:
                "Choque de punta breve, pequeño y localizado. Sin frémitos palpables.",
              video: `${BASE_URL}/maniobras/cardiovascular/videos/palpacion_choque_punta.mp4`,
            },
            {
              titulo: "Auscultación de los 5 focos cardíacos",
              tipo: "Técnica básica",
              objetivo:
                "Evaluar los ruidos cardíacos normales (R1 y R2), su intensidad, ritmo y relación con el ciclo cardíaco.",
              tecnica:
                "1) Ambiente silencioso. 2) Auscultar en orden: Aórtico, Pulmonar, Tricuspídeo, Mitral y Erb. 3) Identificar R1 y R2. 4) Variar posición: decúbito lateral y sentado inclinado.",
              errores:
                "Auscultar solo el ápex, no usar campana, no sincronizar con pulso carotídeo, presionar demasiado.",
              normalidad:
                "Ritmo regular. R1 más intenso en ápex. R2 más intenso en base. Desdoblamiento fisiológico en inspiración.",
              video: `${BASE_URL}/maniobras/cardiovascular/videos/auscultacion_focos.mp4`,
              audio: `${BASE_URL}/cardiovascular/audios/ruidos_normales_r1_r2.mp3`,
              imagen: `${BASE_URL}/cardiovascular/imagenes/diagrama_ruidos_normales.png`,
              imagen: `${BASE_URL}/cardiovascular/imagenes/focos_auscultacion.png`,
            },
            {
              titulo: "Pulso carotídeo",
              tipo: "Técnica básica",
              objetivo:
                "Evaluar frecuencia, ritmo, amplitud y ascenso del pulso carotídeo y correlacionarlo con S1.",
              tecnica:
                "1) Palpar con dos dedos entre tráquea y ECM. 2) Nunca palpar ambos lados. 3) Evaluar frecuencia, ritmo, amplitud y ascenso.",
              errores:
                "Palpar ambas carótidas, usar pulgar, presionar demasiado, palpar muy alto.",
              normalidad:
                "Pulso bien palpable, ritmo regular, amplitud moderada, ascenso y descenso suaves.",
              video: `${BASE_URL}/maniobras/cardiovascular/videos/pulso_carotideo.mp4`,
            },
            {
              titulo: "Prueba de Rivero Carvallo",
              tipo: "Maniobra semiológica",
              objetivo:
                "Diferenciar soplos del corazón derecho aumentando el retorno venoso durante la inspiración profunda.",
              tecnica:
                "1) Estetoscopio en foco tricuspídeo. 2) Escuchar en respiración normal. 3) Pedir inspiración profunda sostenida. 4) Comparar intensidad del soplo.",
              errores:
                "No ubicar bien el foco, no coordinar con inspiración profunda, interpretar variaciones mínimas.",
              normalidad:
                "En sujetos sanos no se observan cambios significativos. Soplos derechos aumentan con inspiración.",
              video: `${BASE_URL}/maniobras/cardiovascular/videos/rivero_carvallo.mp4`,
            },
          ],
        },

        { subtipo: "sistema", titulo: "Respiratorio", maniobras: [] },
        { subtipo: "sistema", titulo: "Abdomen", maniobras: [] },
        { subtipo: "sistema", titulo: "Neurológico", maniobras: [] },
      ],
    },

    cardiovascular: { nombre: "Cardiovascular", color: "#007b5e", temas: [] },
    respiratorio: { nombre: "Respiratorio", color: "#0072B2", temas: [] },
    abdomen: { nombre: "Abdomen", color: "#ff8800", temas: [] },
    neurologico: { nombre: "Neurológico", color: "#1a73e8", temas: [] },
  };

  const sistemas = Object.keys(atlasData);

  return (
    <div className="seccion atlas">
      <div className="card">
        <h1>ATLAS SEMIOLÓGICO</h1>
        <h3>Seleccioná un sistema para explorar sus signos y sonidos clínicos.</h3>

        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeeba",
            borderRadius: "8px",
            color: "#856404",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          ⚠️ Sección en desarrollo. Próximamente disponible.
        </div>

        {/* BOTONES DE SISTEMA */}
        <div className="botones-sistemas">
          {sistemas.map((sistema) => (
            <button
              key={sistema}
              className={`boton-sistema ${
                sistemaActivo === sistema ? "activo" : ""
              }`}
              style={{ borderColor: atlasData[sistema].color }}
              onClick={() =>
                setSistemaActivo(sistema === sistemaActivo ? null : sistema)
              }
            >
              {atlasData[sistema].nombre}
            </button>
          ))}
        </div>

        {/* CONTENIDO DEL SISTEMA */}
        {sistemaActivo && (
          <div className="temas">
            <h2>{atlasData[sistemaActivo].nombre}</h2>

            {atlasData[sistemaActivo].temas.map((tema, index) => (
              <div
                key={index}
                className={`tema ${temaActivo === index ? "activo" : ""}`}
                onClick={() =>
                  setTemaActivo(temaActivo === index ? null : index)
                }
              >
                <h3>{tema.titulo}</h3>

                {temaActivo === index && (
                  <div className="contenido-tema">

                    {/* SUBDIVISIÓN DE MANIOBRAS POR SISTEMA */}
                    {tema.subtipo === "sistema" && (
                      <div>
                        {tema.maniobras.map((m, i) => (
                          <div
                            key={i}
                            style={{
                              marginBottom: "12px",
                              border: "1px solid #ddd",
                              borderRadius: "8px",
                              overflow: "hidden",
                              background: "#fff",
                            }}
                          >
                            {/* ENCABEZADO */}
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setManiobraActiva(
                                  maniobraActiva === i ? null : i
                                );
                              }}
                              style={{
                                padding: "12px 16px",
                                cursor: "pointer",
                                background: "#f5f5f5",
                                fontWeight: "bold",
                                borderBottom:
                                  maniobraActiva === i
                                    ? "1px solid #ddd"
                                    : "none",
                              }}
                            >
                              {m.titulo}
                            </div>

                            {/* CONTENIDO */}
                            {maniobraActiva === i && (
                              <div style={{ padding: "16px" }}>
                                <p><strong>Tipo:</strong> {m.tipo}</p>

                                {m.objetivo && (
                                  <p><strong>Objetivo:</strong> {m.objetivo}</p>
                                )}

                                {m.tecnica && (
                                  <p><strong>Técnica:</strong> {m.tecnica}</p>
                                )}

                                {m.errores && (
                                  <p><strong>Errores frecuentes:</strong> {m.errores}</p>
                                )}

                                {m.normalidad && (
                                  <p><strong>Normalidad:</strong> {m.normalidad}</p>
                                )}

                                {m.imagen && (
                                  <img
                                    src={m.imagen}
                                    alt={m.titulo}
                                    style={{
                                      width: "100%",
                                      marginTop: "10px",
                                      borderRadius: "6px",
                                    }}
                                  />
                                )}

                                {m.video && (
                                  <video
                                    controls
                                    width="100%"
                                    style={{ marginTop: "10px" }}
                                  >
                                    <source src={m.video} type="video/mp4" />
                                    Tu navegador no soporta video.
                                  </video>
                                )}

                                {m.audio && (
                                  <audio
                                    controls
                                    src={m.audio}
                                    style={{ marginTop: "10px" }}
                                  >
                                    Tu navegador no soporta audio.
                                  </audio>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Atlas;

import "../estilos/Secciones.css";

export default function CasosAvanzados() {
  return (
    <div className="seccion casos-avanzados">
      <div className="card">
        <h2>Casos Avanzados</h2>
        <p>
          Casos clínicos de mayor complejidad que requieren interpretación directa de estudios
          (imágenes, audios, registros). En esta sección no se muestran resultados explicativos:
          el usuario debe analizarlos por sí mismo, simulando una práctica clínica real.
        </p>

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
      </div>
    </div>
  );
}

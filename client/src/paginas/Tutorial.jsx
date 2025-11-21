import "../estilos/Secciones.css";

export default function Tutorial() {
  return (
    <div className="seccion tutorial">
      <div className="card">
        <h2>Tutorial</h2>
       <ol className="tutorial-lista">
        <li>
              Se le presentará un paciente con un motivo de consulta inicial. 
              El primer paso será realizar una anamnesis completa, formulando preguntas que considere relevantes. 
              Cuando crea que la anamnesis está finalizada, deberá pulsar el botón <b>"Avanzar a Examen Físico"</b>.
            </li>
            <li>
              En la fase de examen físico, podrá indicar qué maniobras desea realizar 
              (ejemplo: auscultación cardíaca, palpación abdominal). 
              Una vez completada, deberá pulsar el botón <b>"Avanzar a Diagnósticos Diferenciales"</b>.
            </li>
            <li>
              En la etapa de diagnósticos diferenciales, deberá proponer las posibles causas del cuadro clínico en base a la información recogida. 
              Al enviar su listado, el sistema le dará feedback (positivo si acertó la mayoría, o una invitación a pensar otras posibilidades si faltaron diagnósticos). 
              Luego deberá pulsar <b>"Avanzar a Estudios Complementarios"</b>.
            </li>
            <li>
              En la fase de estudios complementarios, podrá solicitar los estudios que correspondan a cada diagnóstico diferencial. 
              En los casos básicos, el sistema mostrará directamente el resultado textual de cada estudio. 
              En los casos avanzados, el sistema devolverá únicamente el material (imagen, audio, etc.) y será el usuario quien deba interpretarlo. 
              Cuando finalice, deberá pulsar <b>"Finalizar caso"</b>.
            </li>
            <li>
              Finalmente, en la etapa de evaluación, podrá ingresar su diagnóstico principal y el tratamiento inicial que considere adecuado, 
              tras lo cual recibirá una retroalimentación formativa.
            </li>
      </ol>
      </div>
    </div>
  );
}

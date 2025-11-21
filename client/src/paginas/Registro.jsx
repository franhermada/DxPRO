import { useState } from "react";
import "../estilos/Secciones.css";
import { toast } from "react-toastify";

export default function Registro({ backendUrl, setSeccion }) {
  const [universidad, setUniversidad] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  const registrarUsuario = async (e) => {
    e.preventDefault();

    if (!aceptaTerminos) {
      toast.warning("⚠️ Debes aceptar los términos y condiciones para registrarte.");
      return;
    }

    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(`${backendUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("✅ Registro exitoso. Ya puedes iniciar sesión.");
        setSeccion("login");
      } else {
        toast.warning(data.error || "Error al registrarse");
      }
    } catch {
      toast.error("⚠️ No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="seccion auth-bg">
      <div className="card auth-container">
        <h2 className="auth-title">CREAR CUENTA</h2>

        <form className="auth-form" onSubmit={registrarUsuario}>
          <label>Nombre completo</label>
          <input name="fullName" placeholder="Juan Pérez" required />

          <label>Correo electrónico</label>
          <input type="email" name="email" placeholder="usuario@correo.com" required />

          <label>Contraseña</label>
          <input type="password" name="password" placeholder="********" required />

          <label>DNI</label>
          <input name="dni" placeholder="12345678" required />

          <label>Universidad</label>
          <select
            name="universidad"
            required
            value={universidad}
            onChange={(e) => setUniversidad(e.target.value)}
          >
            <option value="">Seleccionar...</option>
            <option value="UNCPBA">Facultad de Ciencias de la Salud - UNCPBA</option>
            <option value="OTRA">Otra</option>
          </select>

          <div className="auth-extra">
            {universidad === "UNCPBA" && (
              <>
                <label>Certificado de alumno regular (PDF)</label>
                <input type="file" name="certificado" accept="application/pdf" required />
                <p className="auth-info">💸 Precio mensual: <b>$0</b> (convenio con UNCPBA)</p>
              </>
            )}
            {universidad === "OTRA" && (
              <p className="auth-info">💸 Precio mensual: <b>$3000</b></p>
            )}
          </div>

          {/* Checkbox de términos y condiciones */}
          <div className="auth-terminos">
            <label>
              <input
                type="checkbox"
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
                required
              />
              {" "}He leído y acepto los{" "}
              <button
                type="button"
                className="link-btn"
                onClick={() => setMostrarModal(true)}
              >
                Términos y Condiciones
              </button>{" "}
              de uso de la plataforma.
            </label>
          </div>

          <button type="submit" className="auth-btn">Registrarme</button>
        </form>

        <p className="auth-switch">
          ¿Ya tienes una cuenta?{" "}
          <button className="link-btn" onClick={() => setSeccion("login")}>
            Inicia sesión aquí
          </button>
        </p>
      </div>

      {/* Modal de Términos y Condiciones */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Términos y Condiciones</h3>
            <div className="modal-text">
              <p>
            DxPRO es un proyecto educativo diseñado para brindar herramientas de
            aprendizaje clínico. Nos comprometemos a proteger la privacidad de las
            personas usuarias y a manejar la información de manera responsable,
            transparente y segura, conforme a la{" "}
  <a
    href="https://www.argentina.gob.ar/normativa/nacional/ley-25326-64790/texto"
    target="_blank"
    rel="noopener noreferrer"
    className="link-legal"
  >
    Ley 25.326 de Protección de los Datos Personales
  </a>
  .
</p>
              <p>
                Los datos se utilizarán exclusivamente para el funcionamiento de la
                plataforma y la mejora de sus herramientas educativas. En ningún caso se
                compartirán con terceros.
              </p>
              <p>
                El usuario podrá ejercer sus derechos de acceso, rectificación o
                eliminación contactando a{" "}
                <b>dxproes@gmail.com</b>.
              </p>
              <p>
                Para más información, consulta la versión completa de nuestra política de
                privacidad disponible en la sección “Aspectos legales” de DxPRO.
              </p>
            </div>

            <button
              className="modal-close-btn"
              onClick={() => setMostrarModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

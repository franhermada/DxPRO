import { useState } from "react";

export default function FormulariosAuth({ backendUrl, setUsuario, setSeccion }) {
  const [modo, setModo] = useState("login"); // "login" o "registro"
  const [universidad, setUniversidad] = useState("");

  const manejarSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const datos = Object.fromEntries(form.entries());

    const endpoint = modo === "login" ? "/auth/login" : "/auth/register";

    try {
      const res = await fetch(`${backendUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      const data = await res.json();

      if (res.ok) {
        if (modo === "login") {
          localStorage.setItem("usuario", JSON.stringify(data));
          setUsuario(data);
          setSeccion("inicio");
          alert(`✅ Bienvenido ${data.fullName}`);
        } else {
          alert("✅ Registro exitoso. Ya puedes iniciar sesión.");
          setModo("login");
        }
      } else {
        alert(`⚠️ ${data.error || "Error en la solicitud"}`);
      }
    } catch {
      alert("⚠️ Error al conectar con el servidor.");
    }
  };

  return (
    <div className="auth-contenedor card">
      <h2>{modo === "login" ? "Iniciar sesión" : "Crear cuenta"}</h2>

      <form className="auth-form" onSubmit={manejarSubmit}>
        {modo === "registro" && (
          <>
            <label>Nombre completo:</label>
            <input name="fullName" required />

            <label>DNI:</label>
            <input name="dni" required />

            <label>Universidad:</label>
            <select
              name="universidad"
              required
              value={universidad}
              onChange={(e) => setUniversidad(e.target.value)}
            >
              <option value="">Seleccionar...</option>
              <option value="UNCPBA">UNCPBA</option>
              <option value="OTRA">Otra</option>
            </select>

            {universidad === "UNCPBA" ? (
              <>
                <label>Certificado de alumno regular (PDF):</label>
                <input type="file" name="certificado" accept="application/pdf" required />
                <p>💸 Precio: <b>$0</b> (convenio UNCPBA)</p>
              </>
            ) : universidad === "OTRA" ? (
              <p>💸 Precio mensual: <b>$3000</b></p>
            ) : null}
          </>
        )}

        <label>Correo electrónico:</label>
        <input type="email" name="email" required />

        <label>Contraseña:</label>
        <input type="password" name="password" required />

        <button type="submit">
          {modo === "login" ? "Ingresar" : "Registrarme"}
        </button>
      </form>

      <div className="auth-switch">
        {modo === "login" ? (
          <p>
            ¿No tienes cuenta?{" "}
            <button onClick={() => setModo("registro")} className="link-btn">
              Regístrate aquí
            </button>
          </p>
        ) : (
          <p>
            ¿Ya tienes una cuenta?{" "}
            <button onClick={() => setModo("login")} className="link-btn">
              Inicia sesión
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

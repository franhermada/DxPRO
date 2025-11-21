import "../estilos/Inicio.css";

export default function Inicio() {
  return (
    <div className="inicio-seccion">
      <div className="inicio-card">
        <h1>BIENVENIDO A DXPRO</h1>
        <p>
          "DxPro es un simulador virtual de casos clínicos diseñado para que puedas poner en práctica y fortalecer tus habilidades clínicas en un entorno interactivo. Forma parte de un proyecto de investigación sobre el uso de herramientas digitales —incluyendo inteligencia artificial— en la formación académica de estudiantes de Medicina y Enfermería. El desarrollo se lleva adelante en la Facultad de Ciencias de la Salud perteneciente a la Universidad Nacional del Centro de la Provincia de Buenos Aires."
        </p>

        <div className="logos-inicio">
          <img
            src="/otros/DxPro.png"
            alt="DxPro Logo"
            className="logo-principal"
            loading="lazy"
          />
          <img
            src="/otros/logo facultad inicio.png"
            alt="Facultad Logo"
            className="logo-facultad"
            loading="lazy"
          />
          <img
            src="/otros/unicen logo.png"
            alt="Universidad Logo"
            className="logo-universidad"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}

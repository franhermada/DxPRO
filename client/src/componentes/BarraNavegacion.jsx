import "../estilos/BarraNavegacion.css";

export default function BarraNavegacion({ seccion, setSeccion, usuario, setUsuario }) {
  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    setUsuario(null);
    setSeccion("inicio");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src="/otros/DxPro.png" alt="DxPro Logo" className="nav-logo" />
      </div>

      <div className="navbar-center">
        <button className="nav-btn" onClick={() => setSeccion("inicio")}>Inicio</button>
        <button className="nav-btn" onClick={() => setSeccion("tutorial")}>Tutorial</button>
        <button className="nav-btn" onClick={() => setSeccion("casos-basicos")}>Casos Básicos</button>
        <button className="nav-btn" onClick={() => setSeccion("casos-avanzados")}>Casos Avanzados</button>
        <button className="nav-btn" onClick={() => setSeccion("atlas")}>Atlas Semiologico</button>
        <button className="nav-btn" onClick={() => setSeccion("sobre-dxpro")}>Sobre DxPro</button>
      </div>

      <div className="navbar-right">
        {usuario ? (
          <>
            <span className="user-info">👤 {usuario.fullName?.split(" ")[0]}</span>
            <button className="logout-btn" onClick={cerrarSesion}>Cerrar sesión</button>
          </>
        ) : (
          <button className="ingresar-btn" onClick={() => setSeccion("login")}>Ingresar</button>
        )}
      </div>
    </nav>
  );
}

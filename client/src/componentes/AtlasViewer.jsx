import { useEffect, useState } from "react";

export default function AtlasViewer({ system, searchQuery, backendUrl }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/atlas?system=${system}`);
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Error al cargar el atlas:", err);
      }
    };
    if (system) loadData();
  }, [system, backendUrl]);

  const filtered = items.filter((i) =>
    i.titulo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="atlas-viewer">
      {filtered.length === 0 ? (
        <p>No se encontraron resultados.</p>
      ) : (
        filtered.map((item, i) => (
          <div key={i} className="atlas-item">
            <h3>{item.titulo}</h3>
            <p>{item.descripcion}</p>
            {item.audio && (
              <audio controls src={`${backendUrl}/${item.audio}`} />
            )}
            {item.imagen && (
              <img
                src={`${backendUrl}/${item.imagen}`}
                alt={item.titulo}
                className="atlas-img"
              />
            )}
          </div>
        ))
      )}
    </div>
  );
}
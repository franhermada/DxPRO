import { useState, useRef, useEffect } from "react";

export default function ChatCaso({ backendUrl, caseId, onNuevaPregunta }) {
  const [input, setInput] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const chatEndRef = useRef(null);

  // Auto-scroll al final
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const enviarMensaje = async () => {
    if (!input.trim()) return;

    const mensajeUsuario = { autor: "usuario", texto: input };
    setMensajes((prev) => [...prev, mensajeUsuario]);

    const pregunta = input;
    setInput("");

    try {
      const res = await fetch(`${backendUrl}/api/preguntar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta, caseId }),
      });

      const data = await res.json();
      const respuestas = Array.isArray(data.respuestas)
        ? data.respuestas
        : [data.respuesta || "⚠️ Sin respuesta del servidor."];

      setMensajes((prev) => [
        ...prev,
        ...respuestas.map((r) => ({ autor: "bot", texto: r })),
      ]);

      if (onNuevaPregunta) onNuevaPregunta(pregunta, respuestas);
    } catch {
      setMensajes((prev) => [
        ...prev,
        { autor: "bot", texto: "⚠️ Error al conectar con el servidor." },
      ]);
    }
  };

  return (
    <div className="chat-caso">
      <div className="chat-box">
        {mensajes.map((m, i) => (
          <div key={i} className={`mensaje ${m.autor}`}>
            {m.texto}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribí tu pregunta al paciente..."
          onKeyDown={(e) => e.key === "Enter" && enviarMensaje()}
        />
        <button onClick={enviarMensaje}>Enviar</button>
      </div>
    </div>
  );
}

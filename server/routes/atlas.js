import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

// 🔹 Ruta base absoluta al atlas
const atlasBasePath = path.resolve("atlas_semiologico");

// ✅ Obtener lista de temas según sistema
router.get("/:sistema", (req, res) => {
  const sistema = req.params.sistema.toLowerCase();
  const sistemaPath = path.join(atlasBasePath, sistema);

  if (!fs.existsSync(sistemaPath)) {
    return res.status(404).json({ error: "Sistema no encontrado" });
  }

  // Listar solo los archivos .json del sistema (ignorar carpetas)
  const archivos = fs.readdirSync(sistemaPath)
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.replace(".json", "")); // quitar extensión

  res.json({ temas: archivos });
});

// ✅ Obtener el contenido de un tema
router.get("/:sistema/:tema", (req, res) => {
  const { sistema, tema } = req.params;
  const archivo = path.join(atlasBasePath, sistema.toLowerCase(), `${tema}.json`);

  if (!fs.existsSync(archivo)) {
    return res.status(404).json({ error: "Tema no encontrado" });
  }

  const data = JSON.parse(fs.readFileSync(archivo, "utf-8"));
  res.json(data);
});

export default router;

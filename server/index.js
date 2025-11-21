// ========================================================
//  DXPRO — BACKEND COMPLETO REESCRITO
// ========================================================

import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Fuse from "fuse.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";

dotenv.config();

// ========================================================
//  🔵 CONFIGURACIÓN INICIAL
// ========================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ Falta MONGO_URI en variables de entorno");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => {
    console.error("❌ Error MongoDB:", err);
    process.exit(1);
  });

const app = express();
const PORT = process.env.PORT || 5000;

// ========================================================
//  🟩 CORS GLOBAL (FIJO PARA PRODUCCIÓN)
// ========================================================
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================================
//  🟢 HEALTHCHECK
// ========================================================
app.get("/ping", (req, res) => {
  res.json({ ok: true, status: "Backend operativo" });
});

// ========================================================
//  🔐 RUTAS DE AUTENTICACIÓN
// ========================================================
app.use("/auth", authRoutes);

// ========================================================
//  🔧 UTILIDADES DE NLP
// ========================================================
const STOPWORDS_ES = new Set([
  "el","la","los","las","un","una","unos","unas","de","del","al","a",
  "ante","bajo","cabe","con","contra","desde","durante","en","entre",
  "hacia","hasta","para","por","segun","sin","sobre","tras","y","o",
  "que","qué","como","cómo","cual","cuál","cuando","donde","quien",
  "yo","tu","vos","usted","ustedes","mi","mis","su","sus","es","son",
  "esta","está","estan","soy","eres","somos","hay","tener","hace"
]);

const normalize = (txt) =>
  String(txt || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (txt) =>
  normalize(txt)
    .split(" ")
    .filter((t) => t.length >= 3 && !STOPWORDS_ES.has(t));

// ========================================================
//   📦 CARGA DE CASOS Y SISTEMA SEMÁNTICO
// ========================================================
const BASE_CASES_PATH = path.join(__dirname, "casos_basicos");
const loadedCases = {};

function buildIndexesForCase(caseData) {
  const variantMapExact = new Map();
  const variantIndex = [];
  const fuseList = [];

  const respuestas = caseData.respuestas || {};

  for (const [intent, obj] of Object.entries(respuestas)) {
    const variantes = Array.isArray(obj.variantes) ? obj.variantes : [];

    // MATCH EXACTO
    for (const v of variantes) {
      const norm = normalize(v);
      variantMapExact.set(norm, { intent, respuesta: obj.respuesta });

      variantIndex.push({
        intent,
        variante: v,
        tokens: tokenize(v),
        respuesta: obj.respuesta
      });
    }

    // FUSE NORMALIZADO
    fuseList.push({
      intent,
      variantes: variantes.map((x) => normalize(x)),
      respuesta: obj.respuesta
    });
  }

  // Configuración Fuse.js
  const fuse = new Fuse(fuseList, {
    keys: ["variantes"],
    includeScore: true,
    threshold: 0.34,
    ignoreLocation: true,
    minMatchCharLength: 3
  });

  return { variantMapExact, variantIndex, fuse };
}

function loadCase(caseId, casePath) {
  if (loadedCases[caseId]) return loadedCases[caseId];

  const raw = fs.readFileSync(casePath, "utf-8");
  const data = JSON.parse(raw);

  const idx = buildIndexesForCase(data);
  const cached = { data, ...idx, casePath };

  loadedCases[caseId] = cached;

  console.log(`📦 Caso cargado: ${caseId}`);
  return cached;
}

// ========================================================
//   🟦 ENDPOINT: OBTENER UN CASO
// ========================================================
app.get("/api/caso", (req, res) => {
  try {
    const system = (req.query.system || "all").toLowerCase();

    if (!fs.existsSync(BASE_CASES_PATH))
      return res.status(500).json({ error: "No existe carpeta de casos." });

    let casos = [];

    if (system === "all" || system === "todos") {
      const dirs = fs.readdirSync(BASE_CASES_PATH, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);

      for (const dir of dirs) {
        const files = fs
          .readdirSync(path.join(BASE_CASES_PATH, dir))
          .filter((f) => f.endsWith(".json"));

        for (const f of files) {
          casos.push({
            caseId: `${dir}/${f}`,
            casePath: path.join(BASE_CASES_PATH, dir, f)
          });
        }
      }
    } else {
      const sysPath = path.join(BASE_CASES_PATH, system);
      if (!fs.existsSync(sysPath))
        return res.status(400).json({ error: "Sistema no encontrado." });

      casos = fs
        .readdirSync(sysPath)
        .filter((f) => f.endsWith(".json"))
        .map((f) => ({
          caseId: `${system}/${f}`,
          casePath: path.join(sysPath, f)
        }));
    }

    if (!casos.length)
      return res.status(404).json({ error: "No hay casos disponibles." });

    const elegido = casos[Math.floor(Math.random() * casos.length)];
    const loaded = loadCase(elegido.caseId, elegido.casePath);

    res.json({
      casoId: elegido.caseId,
      presentacion: loaded.data.presentacion,
      respuestas: loaded.data.respuestas,
      evaluacion: loaded.data.evaluacion,
      desconocido: loaded.data.desconocido || "No entendí tu pregunta."
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cargar caso." });
  }
});

// ========================================================
//   🗨️ ENDPOINT: CHAT DEL CASO
// ========================================================
app.post("/casos/basicos", (req, res) => {
  try {
    const pregunta = normalize(req.body.pregunta || "");

    if (!pregunta)
      return res.json({ respuesta: "No entendí tu pregunta." });

    const lastCaseKey = Object.keys(loadedCases).pop();
    if (!lastCaseKey)
      return res.json({ respuesta: "No hay un caso cargado." });

    const c = loadedCases[lastCaseKey];

    // MATCH EXACTO
    if (c.variantMapExact.has(pregunta)) {
      return res.json({ respuesta: c.variantMapExact.get(pregunta).respuesta });
    }

    // FUSE
    const fuzzy = c.fuse.search(pregunta);
    if (fuzzy.length > 0 && fuzzy[0].score < 0.4) {
      return res.json({ respuesta: fuzzy[0].item.respuesta });
    }

    // TOKENS
    const tokens = tokenize(pregunta);
    for (const v of c.variantIndex) {
      if (v.tokens.some((t) => tokens.includes(t))) {
        return res.json({ respuesta: v.respuesta });
      }
    }

    return res.json({
      respuesta: c.data.desconocido || "No entendí tu pregunta."
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ respuesta: "Error interno." });
  }
});

// ========================================================
//   🧠 ENDPOINT: EVALUACIÓN FINAL
// ========================================================
app.post("/api/evaluar", (req, res) => {
  try {
    console.log("📥 Evaluación recibida:", req.body);
    
    const { diagnostico, tratamiento } = req.body || {};
    console.log("🔍 Diagnóstico:", diagnostico, "Tratamiento:", tratamiento);

    const lastCaseKey = Object.keys(loadedCases).pop();
    console.log("📂 Caso cargado:", lastCaseKey);
    
    if (!lastCaseKey)
      return res.status(400).json({ error: "No hay un caso cargado." });

    const caseLoaded = loadedCases[lastCaseKey];
    const evalData = caseLoaded.data.evaluacion || {};

    console.log("📊 Datos de evaluación:", evalData);

    // ---------------------------
    // DIAGNÓSTICO FLEXIBLE
    // ---------------------------
    const diagUser = normalize(diagnostico);
    const def = evalData.diagnostico_definitivo;

    let diagEsperado = [];

    if (Array.isArray(def)) {
      diagEsperado = def.map(normalize);
    } else if (def && typeof def === "object") {
      const principal = normalize(def.principal || "");
      const variantes = (def.variantes || []).map(normalize);
      diagEsperado = [principal, ...variantes];
    }

    console.log("🎯 Diagnóstico esperado:", diagEsperado);
    console.log("👤 Diagnóstico usuario:", diagUser);

    const diagnosticoOk = diagEsperado.some(
      (d) => diagUser.includes(d) || d.includes(diagUser)
    );

    console.log("✅ Diagnóstico OK:", diagnosticoOk);

    // ---------------------------
    // TRATAMIENTO FLEXIBLE
    // ---------------------------
    const tratEsperado = evalData.tratamiento_inicial_esperado || [];
    const tratUsuario = String(tratamiento || "")
      .split(",")
      .map((t) => normalize(t))
      .filter(Boolean);

    console.log("💊 Tratamiento esperado:", tratEsperado);
    console.log("👤 Tratamiento usuario:", tratUsuario);

    const tokEsperado = tratEsperado.map(tokenize);
    const tokUser = tratUsuario.map(tokenize);

    const correctos = [];
    const incorrectos = [];
    const faltantes = [];

    for (let i = 0; i < tokUser.length; i++) {
      const tU = tokUser[i];
      let match = false;

      for (let j = 0; j < tokEsperado.length; j++) {
        const tE = tokEsperado[j];
        const inter = tU.filter((x) => tE.includes(x)).length;

        if (inter >= Math.ceil(tU.length * 0.5)) {
          correctos.push(tratUsuario[i]);
          match = true;
          break;
        }
      }

      if (!match) incorrectos.push(tratUsuario[i]);
    }

    for (let j = 0; j < tokEsperado.length; j++) {
      const tE = tokEsperado[j];

      const found = tokUser.some((tU) => {
        const inter = tU.filter((x) => tE.includes(x)).length;
        return inter >= Math.ceil(tU.length * 0.5);
      });

      if (!found) faltantes.push(tratEsperado[j]);
    }

    const total = correctos.length + incorrectos.length + faltantes.length;
    const puntaje = total ? Math.round((correctos.length / total) * 100) : 0;

    const fortalezas = [];
    const debilidades = [];

    if (diagnosticoOk) fortalezas.push("Diagnóstico adecuado");
    else debilidades.push("El diagnóstico no coincide con el cuadro clínico");

    if (correctos.length >= faltantes.length)
      fortalezas.push("Buen abordaje terapéutico inicial");
    else
      debilidades.push("Faltaron tratamientos importantes");

    if (incorrectos.length > 0)
      debilidades.push("Se indicaron tratamientos no recomendados");

    console.log("📈 Resultado evaluación:", {
      diagnosticoOk,
      correctos,
      incorrectos,
      faltantes,
      puntaje,
      fortalezas,
      debilidades
    });

    return res.json({
      diagnosticoOk,
      diagnosticoCorrecto: diagEsperado[0],
      correctos,
      incorrectos,
      faltantes,
      puntaje,
      fortalezas,
      debilidades
    });

  } catch (err) {
    console.error("❌ Error en evaluación:", err);
    res.status(500).json({ error: "Error interno en evaluación." });
  }
});

// ========================================================
//  🚀 INICIAR SERVIDOR
// ========================================================
app.listen(PORT, () => {
  console.log(`🚀 DxPro backend activo en puerto ${PORT}`);
});
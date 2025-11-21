import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, dni, universidad } = req.body;
    if (!fullName || !email || !password || !dni || !universidad)
      return res.status(400).json({ error: "Faltan campos" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "El correo ya está registrado" });

    const isPremium = universidad === "UNCPBA";
    const user = new User({ fullName, email, password, dni, universidad, isPremium });
    await user.save();
    res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error interno" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Faltan campos" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: "Contraseña incorrecta" });

    res.json({
      message: "Inicio de sesión exitoso",
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
      isPremium: user.isPremium
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error interno" });
  }
});

export default router;

const express = require("express");
const {requireAuth} = require("../middlewares/clerkAuth")
const Design = require("../models/design")

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const items = await Design.find({ userId: req.auth.userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("Error al obtener diseños:", err);
    res.status(500).json({ 
      error: "Error al obtener historial",
      details: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
});

router.post("/", requireAuth, async (req, res) => {
  const {
    imageUrl,
    originalImage,
    description,
    config,
  } = req.body;
  const userId = req.auth.userId;

  if (!userId || !imageUrl || !originalImage) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }
  const result = await Design.create({
    userId,
    imageUrl,
    originalImage,
    description,
    config,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  res.json({ success: true, id: result._id });
});


router.put("/:id", requireAuth, async (req, res) => {

  try {
    const { id } = req.params;
    const userId = req.auth.userId;

    const design = await Design.findOne({ _id: id, userId });
    if (!design) {
      return res.status(404).json({ error: "Diseño no encontrado o no autorizado" });
    }

    const updated = await Design.findByIdAndUpdate(
      id,
      {
        ...req.body,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Diseño no encontrado" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Error al actualizar diseño:", err);
    res.status(500).json({ error: "Error al editar diseño" });
  }
});


router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await Design.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Error al borrar diseño" });
  }
});

router.get("/test", async (req, res) => {
  res.json({ message: "Ruta de prueba funciona" });
});

module.exports = router;
const path = require("path");
const express = require('express');
const multer = require('multer');
const { requireAuth } = require("../middlewares/clerkAuth");
const pngToIco = require("png-to-ico");
const cors = require('cors');

const router = express.Router();

const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://faviconmaker.netlify.app',
      'http://localhost:5173',
      'https://faviconmaker-backend.onrender.com'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

const storage = multer.memoryStorage(); 
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, 
    files: 4 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PNG'), false);
    }
  }
});

router.options("/generate-ico", cors(corsOptions), (req, res) => {
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).end();
});

router.post("/generate-ico", 
  cors(corsOptions),
  requireAuth, 
  upload.array("images"), 
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ 
          success: false,
          error: 'No se recibieron imágenes' 
        });
      }

      const sortedImages = req.files.map(file => {
        const sizeMatch = file.originalname.match(/(\d+)x\d+\.png$/);
        const size = sizeMatch ? parseInt(sizeMatch[1]) : 0;
        return { buffer: file.buffer, size };
      }).sort((a, b) => a.size - b.size);

      const icoBuffer = await pngToIco(sortedImages.map(img => img.buffer));

      res.set({
        'Content-Type': 'image/x-icon',
        'Content-Disposition': 'attachment; filename=favicon.ico',
        'Access-Control-Allow-Origin': req.headers.origin, 
        'Access-Control-Allow-Credentials': 'true' 
      });

      res.send(icoBuffer);

    } catch (error) {
      console.error('Error detallado en /generate-ico:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al generar el ICO',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

module.exports = router;
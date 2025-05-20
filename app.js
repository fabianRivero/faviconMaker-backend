require("dotenv/config");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const icoGenerator = require('./routes/icoGenerator.js');
const aiFaviconGenerator = require('./routes/aiFaviconGenerator.js');
const designsRoutes = require("./routes/designsRoutes.js");
const payloadTooLargeError = require("./middlewares/payloadTooLargeError.js");

const app = express();
const DB_URL = process.env.MONGODB_URI === "test"
? "mongodb://localhost:27017/faviconApp"
: process.env.MONGODB_URI || "mongodb://localhost:27017/faviconApp";

mongoose.connect(DB_URL)
.then(() => console.log(`conected to ${DB_URL}`))
.catch(err => console.error("Failed to conect to MongoDB", err));

const corsOptions = {
  origin: [
    'https://faviconmaker.netlify.app',
    'http://localhost:3000',
    'https://faviconmaker-backend.onrender.com'
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204 
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/debug', (req, res) => {
  res.json({
    expressVersion: require('express').version,
    pathToRegexp: require('path-to-regexp').version,
    nodeVersion: process.version
  });
});

app.use('/api/designs', designsRoutes);  
app.use('/api/ico', icoGenerator);      
app.use('/api/ai', aiFaviconGenerator); 

app.use(payloadTooLargeError)

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});


module.export= app;
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
  .then(() => console.log(`connected to ${DB_URL}`))
  .catch(err => console.error("Failed to connect to MongoDB", err));

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://faviconmaker.netlify.app',
      'http://localhost:3000'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept'
  ],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 200
};

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});

app.options('*', cors(corsOptions));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl} Origin: ${req.headers.origin}`);
  next();
});

app.use(require('./middlewares/corsFix'));
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/designs', designsRoutes);  
app.use('/api/ico', icoGenerator);      
app.use('/api/ai', aiFaviconGenerator); 

app.use(payloadTooLargeError);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;

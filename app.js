import "dotenv/config";
import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import icoGenerator from './routes/icoGenerator.js';
import aiFaviconGenerator from './routes/aiFaviconGenerator.js';
import designsRoutes from "./routes/designsRoutes.js";
import payloadTooLargeError from "./middlewares/payloadTooLargeError.js";

const app = express();
const DB_URL = process.env.MONGODB_URI === "test"
? "mongodb://localhost:27017/api-blog-test"
: process.env.MONGODB_URI || "mongodb://localhost:27017/api-blog";

mongoose.connect(DB_URL)
.then(() => console.log(`conected to ${DB_URL}`))
.catch(err => console.error("Failed to conect to MongoDB", err));

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/designs', designsRoutes);  
app.use('/api/ico', icoGenerator);      
app.use('/api/ai', aiFaviconGenerator); 

app.use(payloadTooLargeError)

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});


export default app;
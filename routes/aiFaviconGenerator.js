const express = require("express");
const pngToIco = require("png-to-ico"); 
const fetch = require("node-fetch").default;
const path = require("path");
const fs = require("fs/promises");
const { requireAuth } = require("../middlewares/clerkAuth");
require('dotenv').config();

const router = express.Router();

const uploadPath = path.join(__dirname, 'uploads');
const ACCOUNT_ID = process.env.ACCOUNT_ID;
const API_TOKEN = process.env.TOKEN;

const ensureUploadsDir = async () => {
  try {
    await fs.access(uploadPath);
  } catch {
    await fs.mkdir(uploadPath, { recursive: true });
  }
};

router.post("/generate-ai-favicon", requireAuth, async (req, res) => {
  await ensureUploadsDir();
  
  const timestamp = Date.now();
  const imagePath = path.join(uploadPath, `ai-favicon-${timestamp}.png`);
  const icoPath = path.join(uploadPath, `ai-favicon-${timestamp}.ico`);

  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ error: "Prompt is required and must be a non-empty string" });
    }

    console.log(`Generating AI favicon with prompt: "${prompt}"`);

    const aiResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: `${prompt}, favicon style, simple, recognizable at small sizes, transparent background`,
          num_steps: 20
        })
      }
    );

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json().catch(() => ({}));
      console.error('Cloudflare AI Error:', errorData);
      throw new Error(errorData.message || "Failed to generate image with Cloudflare AI");
    }

    const arrayBuffer = await aiResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fs.writeFile(imagePath, buffer);
    console.log(`Temporary PNG saved at: ${imagePath}`);

    const icoBuffer = await pngToIco(buffer);
    await fs.writeFile(icoPath, icoBuffer);
    console.log(`ICO file generated at: ${icoPath}`);

    res.set({
      'Content-Type': 'image/x-icon',
      'Content-Disposition': 'attachment; filename=ai-favicon.ico',
      'Cache-Control': 'no-store',
      'Access-Control-Expose-Headers': 'Content-Disposition' 
    });

    res.sendFile(icoPath, async (err) => {
      try {
        await fs.unlink(imagePath);
        await fs.unlink(icoPath);
        if (err) {
          console.error('Error sending file:', err);
          res.set({
            'Access-Control-Allow-Origin': req.headers.origin || '*',
            'Access-Control-Allow-Credentials': 'true'
          });
        }
      } catch (cleanupError) {
        console.error('Error cleaning up files:', cleanupError);
      }
    });

  } catch (err) {
    console.error('Error in AI generation pipeline:', err);
    
    try {
      await fs.unlink(imagePath).catch(() => {});
      await fs.unlink(icoPath).catch(() => {});
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }

    res.status(500).json({ 
      error: "Error generating AI favicon",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;
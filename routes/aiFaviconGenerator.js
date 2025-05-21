router.post("/generate-ai-favicon", requireAuth, async (req, res) => {
  await ensureUploadsDir();
  const timestamp = Date.now();
  const imageName = `ai-favicon-${timestamp}`;
  const imagePath = path.join(uploadPath, `${imageName}.png`);
  const icoPath = path.join(uploadPath, `${imageName}.ico`);

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

    res.status(200).json({
      urls: {
        png: `/uploads/${imageName}.png`,
        ico: `/uploads/${imageName}.ico`
      }
    });

  } catch (err) {
    console.error('Error in AI generation pipeline:', err);
    res.status(500).json({ error: "Error generating AI favicon" });
  }
});

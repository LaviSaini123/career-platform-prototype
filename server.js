// Hugging Face AI backend for your prototype
// Run with:  node server.js

const express = require("express");
const app = express();

app.use(express.json());

// Allow the front-end (index.html) to talk to this backend
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// IMPORTANT: real key should be in an environment variable
// For GitHub, leave "YOUR_HF_TOKEN_HERE" in the file.
// Locally, set HF_API_KEY before running:  set HF_API_KEY=hf_xxx  (Windows CMD)
// or in PowerShell:  $env:HF_API_KEY="hf_xxx"
const HF_API_KEY = process.env.HF_API_KEY || "YOUR_HF_TOKEN_HERE";

// Hugging Face router chat-completions endpoint + model
const HF_CHAT_URL = "https://router.huggingface.co/v1/chat/completions";
// This is a small, HF-hosted model that works with hf-inference
const HF_MODEL = "HuggingFaceTB/SmolLM3-3B:hf-inference";

// POST /api/ai  { systemPrompt, userPrompt }
app.post("/api/ai", async (req, res) => {
  const { systemPrompt, userPrompt } = req.body || {};

  if (!systemPrompt || !userPrompt) {
    return res.status(400).json({ error: "Missing prompts" });
  }

  if (!HF_API_KEY || HF_API_KEY === "YOUR_HF_TOKEN_HERE") {
    // This is what will happen on the public GitHub version
    return res.status(500).json({
      error: "HF API key not configured",
      details: "Set HF_API_KEY in your environment before running server.js."
    });
  }

  try {
    const body = {
      model: HF_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 300,
      temperature: 0.6,
      stream: false
    };

    const hfRes = await fetch(HF_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + HF_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const json = await hfRes.json();

    if (!hfRes.ok) {
      console.error("HF HTTP error:", hfRes.status, json);
      return res
        .status(hfRes.status)
        .json({ error: "HF error " + hfRes.status, details: json });
    }

    const text =
      json.choices?.[0]?.message?.content ||
      "HF response had no message content.";

    res.json({ text });
  } catch (err) {
    console.error("Server error calling HF:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log("AI backend running on http://localhost:" + PORT);
});

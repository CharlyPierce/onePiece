import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { CHARACTERS, GENERAL_DIALECT_GUIDELINE } from "./src/data";
import { GenerationRequest } from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy GoogleGenAI client builder
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("La clave secreta GEMINI_API_KEY no está configurada. Por favor, añádela en la sección Settings > Secrets de la interfaz de AI Studio.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// AI Generation endpoint
app.post("/api/generate", async (req, res) => {
  try {
    const { characterId, moodType, situation, relationshipLevel, giftId } = req.body as GenerationRequest;

    // Find the character
    const char = CHARACTERS.find(c => c.id === characterId);
    if (!char) {
      res.status(400).json({ error: `Personaje no encontrado: ${characterId}` });
      return;
    }

    const levelName = char.traits[relationshipLevel] || char.traits[0];
    const isGifted = giftId ? char.gifts.find(g => g.id === giftId) : null;

    // Build the Prompt
    let promptInstructions = `
${char.basePrompt}

=== CONTEXTO DE LA INTERACCIÓN ===
- Estás hablando con un usuario que tiene el siguiente nivel de relación contigo: "${levelName}" (Nivel ${relationshipLevel} de 2). Adapta tu trato, cariño u hostilidad acorde a esto.
- Tipo de respuesta solicitada: ${moodType === 'motivation' ? 'MOTIVACIÓN (animar, energizar, inspirar al usuario según tu estilo único)' : 'DESMOTIVACIÓN (decirle la cruda realidad, desanimarlo, regañarlo o dar un baño de agua fría realista/cómico)'}.
`;

    if (situation && situation.trim().length > 0) {
      promptInstructions += `- El usuario te plantea la siguiente situación personal: "${situation}". Habla directamente sobre esto. Sé específico con sus palabras, no hables de generalidades abstractas. Aplica tu humor o rudeza directamente sobre su dilema.\n`;
    } else {
      promptInstructions += `- El usuario no ha indicado un dilema específico, simplemente te pide una frase de ${moodType === 'motivation' ? 'fuerza y aliento' : 'reproche y desprecio, o un comentario de mal augurio'}. dásela directamente.\n`;
    }

    if (isGifted) {
      promptInstructions += `\n=== ACCIÓN ESPECIAL: REGALO ===\n${isGifted.reactionPrompt}\n`;
    }

    promptInstructions += `\n=== INSTRUCCIÓN FINAL DE FORMATO ===\n${GENERAL_DIALECT_GUIDELINE}`;

    // Get Gemini SDK and call it
    const aiInstance = getGenAI();
    const response = await aiInstance.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptInstructions,
      config: {
        temperature: 1.0,
        responseMimeType: "application/json"
      }
    });

    const rawText = response.text || "";
    
    // Clean JSON response (sometimes Gemini returns ```json ... ``` formatting)
    let cleanedText = rawText.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.substring(7);
    }
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.substring(3);
    }
    if (cleanedText.endsWith("```")) {
      cleanedText = cleanedText.substring(0, cleanedText.length - 3);
    }
    cleanedText = cleanedText.trim();

    try {
      const parsed = JSON.parse(cleanedText);
      res.json(parsed);
    } catch (parseError) {
      console.error("Failed to parse JSON from Gemini. Raw text was:", rawText);
      // Fallback response with beautiful markdown strip attempts
      res.json({
        text: rawText,
        expression: moodType === 'motivation' ? 'happy' : 'dry'
      });
    }

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    res.status(500).json({ 
      error: error.message || "Error interno generando la respuesta de la IA.",
      text: "¡Rayos! Parece que el Den Den Mushi de comunicación está fallando... ¡Asegúrate de que tu GEMINI_API_KEY esté configurada en Secrets!",
      expression: "angry"
    });
  }
});

// Serve frontend assets and listen
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Critical server failure:", err);
});

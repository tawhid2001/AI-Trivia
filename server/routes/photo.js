import express from "express";
import { sendGeminiError } from "../geminiError.js";
import { MODEL, ai } from "../gemini.js";

const router = express.Router();

const PROMPT = `You are a trivia question writer.
Look at the image and write ONE fun multiple-choice question about what is in it.
Reply as JSON with this exact shape:
{ "question": string, "options": [string, string, string, string], "answer": string }
The "answer" must be exactly one of the four options. No preamble, no markdown.
`;

router.post("/", async (req, res) => {
  try {
    const { image, mimeType } = req.body;

    const interaction = await ai.interactions.create({
      model: MODEL,
      input: [
        { type: "image", data: image, mime_type: mimeType },
        { type: "text", text: "Write a trivia question about this image." },
      ],
      system_instruction: PROMPT,
      generation_config: { temperature: 0.9 },
      response_format: { type: "text", mime_type: "application/json" },
    });

    console.log(interaction.output_text);

    const quiz = JSON.parse(interaction.output_text);
    return res.json(quiz);
  } catch (error) {
    return sendGeminiError(res, error);
  }
});

export default router;

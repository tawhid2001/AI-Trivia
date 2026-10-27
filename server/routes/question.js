import express from "express";
import { MODEL, ai } from "../gemini.js";

const router = express.Router();

const PROMPT = `You are a sharp, witty trivia host writing questions for a fast-paced game played by curious adults - fun, not academic.
Given a topic, write ONE multiple-choice question about it: four options, exactly one correct answer, and a one-line fun fact about the correct answer. Avoid trivia so obscure only a specialist would know it.
Keep the question to a single sentence. Make the three wrong options plausible, not silly.
Reply as JSON with this exact shape, and nothing else:
{ "question": string, "options": [string, string, string, string], "answer": string, "funFact": string }
The "answer" must be exactly one of the four options. No preamble, no markdown.

Example - 
Topic: Space
{ "question": "Which planet has the most moons?", "options": ["Earth", "Mars", "Saturn", "Venus"], "answer": "Saturn", "funFact": "Saturn's rings are made mostly of ice and rock." }
`;

router.post("/", async (req, res) => {
  const { topic } = req.body;

  const interaction = await ai.interactions.create({
    model: MODEL,
    input: `Topic: ${topic}`,
    system_instruction: PROMPT,
    generation_config: { temperature: 0.9 },
  });

  console.log(interaction.output_text);

  const quiz = JSON.parse(interaction.output_text);
  res.json(quiz);
});

export default router;

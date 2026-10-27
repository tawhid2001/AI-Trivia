import express from "express";
import { MODEL, ai } from "../gemini.js";

const router = express.Router();

const PROMPT = `You are a trivia host helping a player who is stuck.
Given a trivia question, provide exactly one short hint that nudges the player toward figuring out the answer.
Do not state the answer, name any answer option, or give away the answer with an overly specific clue.
Reply with the hint only, without preamble or quotation marks.`;

router.post("/", async (req, res) => {
  const { question } = req.body ?? {};

  if (typeof question !== "string" || !question.trim()) {
    return res.status(400).json({ error: "A non-empty question is required." });
  }

  const interaction = await ai.interactions.create({
    model: MODEL,
    input: question.trim(),
    system_instruction: PROMPT,
    generation_config: { temperature: 0.7 },
  });

  res.json({ hint: interaction.output_text });
});

export default router;

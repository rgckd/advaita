import type { Express } from "express";
import { Server } from "http";
import { storage } from "./storage";
import { insertReflectionSchema, insertDiscussionSchema, insertQuizResultSchema } from "@shared/schema";

export async function registerRoutes(httpServer: Server, app: Express) {
  // Reflections
  app.get("/api/reflections", async (_req, res) => {
    res.json(await storage.getReflections());
  });
  app.post("/api/reflections", async (req, res) => {
    const parsed = insertReflectionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    res.json(await storage.addReflection(parsed.data));
  });

  // Discussions
  app.get("/api/discussions", async (_req, res) => {
    res.json(await storage.getDiscussions());
  });
  app.post("/api/discussions", async (req, res) => {
    const parsed = insertDiscussionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    res.json(await storage.addDiscussion(parsed.data));
  });
  app.post("/api/discussions/:id/like", async (req, res) => {
    try {
      res.json(await storage.likeDiscussion(Number(req.params.id)));
    } catch {
      res.status(404).json({ error: "Not found" });
    }
  });

  // Quiz results
  app.get("/api/quiz-results", async (_req, res) => {
    res.json(await storage.getQuizResults());
  });
  app.post("/api/quiz-results", async (req, res) => {
    const parsed = insertQuizResultSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    res.json(await storage.addQuizResult(parsed.data));
  });

  // AI companion (simulated responses)
  app.post("/api/ai/chat", async (req, res) => {
    const { message, concept } = req.body;
    const responses = aiResponses(concept, message);
    res.json({ reply: responses });
  });
}

function aiResponses(concept: string, message: string): string {
  const lc = message.toLowerCase();
  const conceptResponses: Record<string, string[]> = {
    "Maya": [
      "Maya is a profound teaching — it does not say the world is unreal like a dream, but that we misidentify it. The rope is real; mistaking it for a snake is the error. What specifically feels most puzzling to you about this distinction?",
      "Shankara uses the analogy of superimposition (Adhyasa) — we project our ideas onto Brahman just as we see a snake where only a rope exists. Have you noticed moments in your own experience where you superimposed a story onto something neutral?",
      "The three levels of reality in Advaita — Paramarthika (absolute), Vyavaharika (conventional), and Pratibhasika (apparent) — help clarify Maya. The world is not absolutely unreal; it is relatively real. Does this three-tier framework resonate with how you experience reality?",
    ],
    "Atman": [
      "The Atman is described as Sat-Chit-Ananda: pure existence, pure consciousness, pure bliss. Not something to be achieved — it is what you already are. Notice the one who is asking about Atman — that noticing itself, is that not already the Atman?",
      "Shankara's key insight is that the Atman is not an object of experience — it is the very subject of experience, the witness. You cannot see it because it is what sees. Does that paradox point to anything in your direct experience?",
      "The Kena Upanishad says: 'It is not known by those who know it; it is known by those who do not know it.' This is the mystery of the Atman. What does self-inquiry (Atma Vichara) feel like when you sit quietly?",
    ],
    "Brahman": [
      "Brahman is not a God separate from you — it is the ground of all being itself. Nirguna Brahman (without attributes) is beyond all description. Saguna Brahman (with attributes) is how it appears in relation to creation. Does this distinction change how you think of the divine?",
      "The Mahavakyas — 'Tat Tvam Asi' (That thou art), 'Aham Brahmasmi' (I am Brahman) — are not philosophical statements to be believed, but pointers to be realized. What happens when you contemplate 'I am Brahman' in meditation?",
    ],
    "Avidya": [
      "Avidya is not ignorance of facts — it is the primal not-knowing of our own nature as Brahman. It is self-concealment. The interesting question is: if Brahman is all, who is ignorant? This is the paradox that Advaita sits with.",
      "Avidya has two powers according to Shankara: Avarana (veiling) and Vikshepa (projection). First it hides the true nature, then it projects a false one. Recognizing these two movements in your own mind can be a powerful practice.",
    ],
  };
  const defaultResponses = [
    "That is a rich inquiry. In Advaita, we often begin not by seeking new knowledge, but by questioning the one who seeks. Who is it that wants to understand this? What is the nature of that 'who'?",
    "The tradition suggests that all philosophical concepts are ultimately fingers pointing at the moon — not the moon itself. What direct experience does this idea point you toward?",
    "Shankara taught that the guru, scripture, and direct inquiry together form the path. You are engaging in that inquiry right now. What has been your experience with meditation or silent sitting alongside this study?",
  ];

  const pool = conceptResponses[concept] || defaultResponses;
  return pool[Math.floor(Math.random() * pool.length)];
}

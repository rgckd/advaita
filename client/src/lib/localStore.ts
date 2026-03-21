// In-memory store replacing the backend entirely
import type { Reflection, Discussion, QuizResult } from "@shared/schema";

// ─── Seeker Level ─────────────────────────────────────────────────────────────
export type SeekerLevel = "jijnasu" | "sadhaka" | "mumukshu";

export interface LevelInfo {
  id: SeekerLevel;
  label: string;       // Sanskrit label
  roman: string;       // Romanised with diacritics
  description: string;
  // Vedanta Students course mapping
  texts: string[];
  assessmentThreshold: number; // min % score to reach this level
}

export const LEVELS: LevelInfo[] = [
  {
    id: "jijnasu",
    label: "जिज्ञासु",
    roman: "Jijñāsu",
    description: "The curious seeker — exploring what Vedanta is, the six darshanas, key concepts and texts at an introductory level.",
    texts: ["Introductory Vedanta", "Sad Darshanas (Six Schools)", "Bhagavad Gita overview", "Key concepts: Maya, Atman, Brahman, Karma, Moksha"],
    assessmentThreshold: 0,
  },
  {
    id: "sadhaka",
    label: "साधक",
    roman: "Sādhaka",
    description: "The disciplined practitioner — engaging with primary texts and Shankara's commentaries through systematic study.",
    texts: ["Bhaja Govindam", "Tattva Bodha", "Atma Bodha", "Vivekachudamani", "Bhagavad Gita with Shankara Bhashya", "Panchadasi", "Upadesa Sara", "Upanishads with Bhashya (Taittiriya, Kena, Mandukya, Prashna, Aitareya, Katha, Isha)"],
    assessmentThreshold: 40,
  },
  {
    id: "mumukshu",
    label: "मुमुक्षु",
    roman: "Mumukṣu",
    description: "The ardent seeker of liberation — immersed in advanced prakarana granthas and the Brahma Sutras.",
    texts: ["Brahma Sutras (all four adhyayas)", "Naishkarmya Siddhi", "Vichara Sagara", "Sruti Sara Samudharana", "Upadesa Sahasri", "Ashtavakra Gita", "Drk Drishya Viveka", "Aparoksanubhuti"],
    assessmentThreshold: 75,
  },
];

// ─── Attachment ────────────────────────────────────────────────────────────────
export interface FileAttachment {
  name: string;
  size: number;
  dataUrl: string;
  mimeType: string;
}

/** @deprecated use FileAttachment */
export interface NoteAttachment extends FileAttachment {}

// ─── User Upload (Self-study) ──────────────────────────────────────────────────
export interface UserUpload {
  id: number;
  name: string;
  type: "pdf" | "text" | "video-link";
  dataUrl?: string;       // for pdf/text
  url?: string;           // for video links
  size?: number;
  concept?: string;       // optional concept tag
  level: SeekerLevel;
  createdAt: string;
}

// ─── Note ─────────────────────────────────────────────────────────────────────
export interface Note {
  id: number;
  content: string;
  context: string;
  createdAt: string;
  attachment?: FileAttachment;
  isPublic?: boolean;
  uploadId?: number;      // if note is linked to a user upload
}

// ─── Augmented types ──────────────────────────────────────────────────────────
export type ReflectionWithAttachment = Reflection & {
  attachment?: FileAttachment;
  isPublic?: boolean;
};
export type DiscussionWithAttachment = Discussion & {
  attachment?: FileAttachment;
  level?: SeekerLevel;
};

// ─── Seed data ────────────────────────────────────────────────────────────────
let seekerLevel: SeekerLevel = "jijnasu";

let reflections: ReflectionWithAttachment[] = [
  { id: 1, userId: 1, concept: "Maya", content: "Maya is not mere illusion in the simple sense — it is the creative power of Brahman that makes the One appear as many. The world is not false, but its independent reality is what is illusory.", createdAt: "2026-03-15T08:00:00Z" },
  { id: 2, userId: 1, concept: "Atman", content: "The Atman is not the mind, not the body, not even the ego that says 'I think'. It is the witness behind all thought — pure consciousness itself.", createdAt: "2026-03-17T10:30:00Z" },
];

let discussions: DiscussionWithAttachment[] = [
  { id: 1, topic: "Is Ajata Vada compatible with Shankara's Vivartavada?", author: "Ramesh S.", content: "Ajata Vada (non-origination) as taught in Mandukya Karika seems to deny creation entirely, while Shankara's Vivartavada accepts the world as Brahman appearing differently. Can these be reconciled?", likes: 12, createdAt: "2026-03-16T14:00:00Z", level: "sadhaka" },
  { id: 2, topic: "Practical implications of Neti Neti in daily meditation", author: "Priya M.", content: "I have been practicing Neti Neti — 'not this, not this' — and find it creates a peculiar detachment from both external events and internal emotional reactions. Has anyone explored this as an active inquiry rather than passive negation?", likes: 8, createdAt: "2026-03-17T09:00:00Z", level: "jijnasu" },
  { id: 3, topic: "The role of Viveka (discrimination) in Advaita practice", author: "Arun K.", content: "Shankara insists Viveka — discrimination between the eternal and non-eternal — is the first qualification for serious inquiry. Yet in our daily lives, how do we cultivate this without becoming world-denying?", likes: 15, createdAt: "2026-03-18T07:00:00Z", level: "jijnasu" },
];

let quizResults: QuizResult[] = [];
let notes: Note[] = [];
let uploads: UserUpload[] = [];
let nextId = { r: 3, d: 4, q: 1, n: 1, u: 1 };

// ─── Reactivity ───────────────────────────────────────────────────────────────
type Listener = () => void;
const listeners: Set<Listener> = new Set();
export function subscribe(fn: Listener) { listeners.add(fn); return () => listeners.delete(fn); }
function notify() { listeners.forEach(fn => fn()); }

// ─── Store ────────────────────────────────────────────────────────────────────
export const store = {
  // Level
  getLevel: (): SeekerLevel => seekerLevel,
  getLevelInfo: (): LevelInfo => LEVELS.find(l => l.id === seekerLevel)!,
  setLevel: (l: SeekerLevel) => { seekerLevel = l; notify(); },

  // Reflections
  getReflections: () => [...reflections].reverse() as ReflectionWithAttachment[],
  addReflection: (r: Omit<Reflection, "id">, attachment?: FileAttachment, isPublic?: boolean) => {
    const item: ReflectionWithAttachment = { ...r, id: nextId.r++, attachment, isPublic };
    reflections.push(item);
    notify();
    return item;
  },

  // Discussions
  getDiscussions: () => [...discussions] as DiscussionWithAttachment[],
  addDiscussion: (d: Omit<Discussion, "id" | "likes">, attachment?: FileAttachment) => {
    const item: DiscussionWithAttachment = { ...d, id: nextId.d++, likes: 0, attachment, level: seekerLevel };
    discussions.push(item);
    notify();
    return item;
  },
  likeDiscussion: (id: number) => {
    const d = discussions.find(x => x.id === id);
    if (d) { d.likes++; notify(); }
    return d;
  },

  // Quiz
  getQuizResults: () => [...quizResults],
  addQuizResult: (q: Omit<QuizResult, "id">) => {
    const item: QuizResult = { ...q, id: nextId.q++ };
    quizResults.push(item);
    notify();
    return item;
  },
  // After a quiz, recalculate level based on cumulative performance
  recalcLevelFromQuiz: (score: number, total: number) => {
    const pct = Math.round((score / total) * 100);
    // Promote if the score merits higher level
    if (pct >= 75 && seekerLevel !== "mumukshu") {
      seekerLevel = "mumukshu";
      notify();
    } else if (pct >= 40 && seekerLevel === "jijnasu") {
      seekerLevel = "sadhaka";
      notify();
    }
    return seekerLevel;
  },

  // Notes
  getNotes: () => [...notes].reverse(),
  addNote: (content: string, context: string, attachment?: FileAttachment, uploadId?: number) => {
    const item: Note = { id: nextId.n++, content, context, createdAt: new Date().toISOString(), attachment, uploadId };
    notes.push(item);
    notify();
    return item;
  },
  deleteNote: (id: number) => { notes = notes.filter(n => n.id !== id); notify(); },
  updateNote: (id: number, content: string) => {
    const n = notes.find(x => x.id === id);
    if (n) { n.content = content; notify(); }
  },
  toggleNotePublic: (id: number) => {
    const n = notes.find(x => x.id === id);
    if (n) { n.isPublic = !n.isPublic; notify(); }
  },

  // User Uploads (Self-study)
  getUploads: () => [...uploads].reverse() as UserUpload[],
  addUpload: (u: Omit<UserUpload, "id" | "createdAt" | "level">) => {
    const item: UserUpload = { ...u, id: nextId.u++, level: seekerLevel, createdAt: new Date().toISOString() };
    uploads.push(item);
    notify();
    return item;
  },
  deleteUpload: (id: number) => { uploads = uploads.filter(u => u.id !== id); notify(); },

  // AI chat (simulated)
  aiChat: (concept: string, _message: string): Promise<string> => {
    const level = seekerLevel;
    const responses: Record<string, string[]> = {
      "Maya": [
        "Maya is anirvacaniya — inexplicable — neither absolutely real nor absolutely unreal. It is Brahman's own creative and concealing power. What specifically puzzles you about this distinction?",
        "Shankara uses the rope-snake analogy: we project a snake where only a rope exists. This superimposition (Adhyasa) is the mechanism of Maya. Have you noticed moments in your own experience where you superimposed a story onto something neutral?",
        level === "mumukshu"
          ? "In the Mandukya Karika, Gaudapada goes further than Shankara's Vivartavada — asserting Ajata Vada, non-origination. If nothing was ever born, Maya itself is never real even as an explanatory device. How does this sit with you?"
          : "The three levels of reality in Advaita — Paramarthika (absolute), Vyavaharika (conventional), Pratibhasika (apparent) — help clarify Maya. The world is not absolutely unreal; it is relatively real. Does this resonate?",
      ],
      "Atman": [
        "The Atman is described as Sat-Chit-Ananda: pure existence, pure consciousness, pure bliss. Not something to be achieved — it is what you already are. Notice the one who is asking about Atman — that noticing itself, is that not already the Atman?",
        level !== "jijnasu"
          ? "Shankara's Adhyasa Bhashya opens with a rigorous analysis: all worldly transactions presuppose the superimposition of the not-Self on the Self. The entire Brahma Sutra commentary is built on resolving this. Where do you find this superimposition operating in your own inquiry?"
          : "Shankara's key insight: the Atman is not an object of experience — it is the very subject of experience. You cannot see it because it is what sees. Does that paradox point to anything in your direct experience?",
      ],
      "Brahman": [
        "Brahman is not a God separate from you — it is the ground of all being itself. The Mahavakyas — 'Tat Tvam Asi', 'Aham Brahmasmi' — are not beliefs to hold but pointers to be realized. What happens when you contemplate 'I am Brahman' in meditation?",
      ],
    };
    const pool = responses[concept] || [
      "That is a rich inquiry. In Advaita, we often begin not by seeking new knowledge, but by questioning the one who seeks. Who is it that wants to understand this?",
      "The tradition suggests all philosophical concepts are fingers pointing at the moon — not the moon itself. What direct experience does this idea point you toward?",
    ];
    const reply = pool[Math.floor(Math.random() * pool.length)];
    return new Promise(resolve => setTimeout(() => resolve(reply), 900));
  },

  // AI diary assist (simulated)
  aiDiaryPrompt: (concept: string, draftSoFar: string): Promise<string> => {
    const prompts = [
      `You wrote about ${concept}. Can you go deeper — what does this mean for how you see yourself right now?`,
      `What question is still unresolved for you after today's study of ${concept}?`,
      `How does ${concept} show up not as a concept but as a direct observation in your experience?`,
      draftSoFar.length > 50
        ? `You mentioned "${draftSoFar.slice(0, 60)}…" — what underlying assumption is this pointing to?`
        : `What drew you to ${concept} today? Was it a question, a doubt, or a recognition?`,
    ];
    const reply = prompts[Math.floor(Math.random() * prompts.length)];
    return new Promise(resolve => setTimeout(() => resolve(reply), 700));
  },
};

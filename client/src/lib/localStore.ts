// In-memory store replacing the backend entirely
import type { Reflection, Discussion, QuizResult } from "@shared/schema";

export interface NoteAttachment {
  name: string;      // original filename
  size: number;      // bytes
  dataUrl: string;   // base64 data URL for display/download
  mimeType: string;
}

export interface Note {
  id: number;
  content: string;
  context: string; // page/concept the note was taken on
  createdAt: string;
  attachment?: NoteAttachment;
}

let reflections: Reflection[] = [
  { id: 1, userId: 1, concept: "Maya", content: "Maya is not mere illusion in the simple sense — it is the creative power of Brahman that makes the One appear as many. The world is not false, but its independent reality is what is illusory.", createdAt: "2026-03-15T08:00:00Z" },
  { id: 2, userId: 1, concept: "Atman", content: "The Atman is not the mind, not the body, not even the ego that says 'I think'. It is the witness behind all thought — pure consciousness itself.", createdAt: "2026-03-17T10:30:00Z" },
];

let discussions: Discussion[] = [
  { id: 1, topic: "Is Ajata Vada compatible with Shankara's Vivartavada?", author: "Ramesh S.", content: "Ajata Vada (non-origination) as taught in Mandukya Karika seems to deny creation entirely, while Shankara's Vivartavada accepts the world as Brahman appearing differently. Can these be reconciled?", likes: 12, createdAt: "2026-03-16T14:00:00Z" },
  { id: 2, topic: "Practical implications of Neti Neti in daily meditation", author: "Priya M.", content: "I have been practicing Neti Neti — 'not this, not this' — and find it creates a peculiar detachment from both external events and internal emotional reactions. Has anyone explored this as an active inquiry rather than passive negation?", likes: 8, createdAt: "2026-03-17T09:00:00Z" },
  { id: 3, topic: "The role of Viveka (discrimination) in Advaita practice", author: "Arun K.", content: "Shankara insists Viveka — discrimination between the eternal and non-eternal — is the first qualification for serious inquiry. Yet in our daily lives, how do we cultivate this without becoming world-denying?", likes: 15, createdAt: "2026-03-18T07:00:00Z" },
];

let quizResults: QuizResult[] = [];
let notes: Note[] = [];
let nextId = { r: 3, d: 4, q: 1, n: 1 };

// Listeners for reactivity
type Listener = () => void;
const listeners: Set<Listener> = new Set();
export function subscribe(fn: Listener) { listeners.add(fn); return () => listeners.delete(fn); }
function notify() { listeners.forEach(fn => fn()); }

export const store = {
  getReflections: () => [...reflections].reverse(),
  addReflection: (r: Omit<Reflection, "id">) => {
    const item: Reflection = { ...r, id: nextId.r++ };
    reflections.push(item);
    notify();
    return item;
  },
  getDiscussions: () => [...discussions],
  addDiscussion: (d: Omit<Discussion, "id" | "likes">) => {
    const item: Discussion = { ...d, id: nextId.d++, likes: 0 };
    discussions.push(item);
    notify();
    return item;
  },
  likeDiscussion: (id: number) => {
    const d = discussions.find(x => x.id === id);
    if (d) { d.likes++; notify(); }
    return d;
  },
  getQuizResults: () => [...quizResults],
  addQuizResult: (q: Omit<QuizResult, "id">) => {
    const item: QuizResult = { ...q, id: nextId.q++ };
    quizResults.push(item);
    notify();
    return item;
  },
  getNotes: () => [...notes].reverse(),
  addNote: (content: string, context: string, attachment?: NoteAttachment) => {
    const item: Note = { id: nextId.n++, content, context, createdAt: new Date().toISOString(), attachment };
    notes.push(item);
    notify();
    return item;
  },
  deleteNote: (id: number) => {
    notes = notes.filter(n => n.id !== id);
    notify();
  },
  updateNote: (id: number, content: string) => {
    const n = notes.find(x => x.id === id);
    if (n) { n.content = content; notify(); }
  },
  aiChat: (concept: string, _message: string): Promise<string> => {
    const responses: Record<string, string[]> = {
      "Maya": [
        "Maya is anirvacaniya — inexplicable — neither absolutely real nor absolutely unreal. It is Brahman's own creative and concealing power. What specifically puzzles you about this distinction?",
        "Shankara uses the rope-snake analogy: we project a snake where only a rope exists. This superimposition (Adhyasa) is the mechanism of Maya. Have you noticed moments in your own experience where you superimposed a story onto something neutral?",
        "The three levels of reality in Advaita — Paramarthika (absolute), Vyavaharika (conventional), Pratibhasika (apparent) — help clarify Maya. The world is not absolutely unreal; it is relatively real. Does this resonate?",
      ],
      "Atman": [
        "The Atman is described as Sat-Chit-Ananda: pure existence, pure consciousness, pure bliss. Not something to be achieved — it is what you already are. Notice the one who is asking about Atman — that noticing itself, is that not already the Atman?",
        "Shankara's key insight: the Atman is not an object of experience — it is the very subject of experience. You cannot see it because it is what sees. Does that paradox point to anything in your direct experience?",
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
};

import {
  Reflection, InsertReflection,
  Discussion, InsertDiscussion,
  QuizResult, InsertQuizResult,
} from "@shared/schema";

export interface IStorage {
  getReflections(): Promise<Reflection[]>;
  addReflection(r: InsertReflection): Promise<Reflection>;
  getDiscussions(): Promise<Discussion[]>;
  addDiscussion(d: InsertDiscussion): Promise<Discussion>;
  likeDiscussion(id: number): Promise<Discussion>;
  addQuizResult(q: InsertQuizResult): Promise<QuizResult>;
  getQuizResults(): Promise<QuizResult[]>;
}

export class MemStorage implements IStorage {
  private reflections: Reflection[] = [
    { id: 1, userId: 1, concept: "Maya", content: "Maya is not mere illusion in the simple sense — it is the creative power of Brahman that makes the One appear as many. The world is not false, but its independent reality is what is illusory.", createdAt: "2026-03-15T08:00:00Z" },
    { id: 2, userId: 1, concept: "Atman", content: "The Atman is not the mind, not the body, not even the ego that says 'I think'. It is the witness behind all thought — pure consciousness itself.", createdAt: "2026-03-17T10:30:00Z" },
  ];
  private discussions: Discussion[] = [
    { id: 1, topic: "Is Ajata Vada compatible with Shankara's Vivartavada?", author: "Ramesh S.", content: "Ajata Vada (non-origination) as taught in Mandukya Karika seems to deny creation entirely, while Shankara's Vivartavada (apparent transformation) accepts the world as Brahman appearing differently. Can these be reconciled?", likes: 12, createdAt: "2026-03-16T14:00:00Z" },
    { id: 2, topic: "Practical implications of Neti Neti in daily meditation", author: "Priya M.", content: "I have been practicing Neti Neti — 'not this, not this' — and find it creates a peculiar detachment from both external events and internal emotional reactions. Has anyone explored this as an active inquiry rather than passive negation?", likes: 8, createdAt: "2026-03-17T09:00:00Z" },
    { id: 3, topic: "The role of Viveka (discrimination) in Advaita practice", author: "Arun K.", content: "Shankara insists Viveka — discrimination between the eternal and non-eternal — is the first qualification for serious inquiry. Yet in our daily lives, how do we cultivate this discrimination without becoming world-denying?", likes: 15, createdAt: "2026-03-18T07:00:00Z" },
  ];
  private quizResults: QuizResult[] = [];
  private nextId = { r: 3, d: 4, q: 1 };

  async getReflections() { return [...this.reflections].reverse(); }
  async addReflection(r: InsertReflection): Promise<Reflection> {
    const item: Reflection = { id: this.nextId.r++, userId: r.userId ?? 1, concept: r.concept, content: r.content, createdAt: r.createdAt };
    this.reflections.push(item);
    return item;
  }
  async getDiscussions() { return [...this.discussions]; }
  async addDiscussion(d: InsertDiscussion): Promise<Discussion> {
    const item: Discussion = { id: this.nextId.d++, topic: d.topic, author: d.author, content: d.content, likes: 0, createdAt: d.createdAt };
    this.discussions.push(item);
    return item;
  }
  async likeDiscussion(id: number): Promise<Discussion> {
    const d = this.discussions.find(x => x.id === id);
    if (!d) throw new Error("Not found");
    d.likes++;
    return d;
  }
  async addQuizResult(q: InsertQuizResult): Promise<QuizResult> {
    const item: QuizResult = { id: this.nextId.q++, userId: q.userId ?? 1, concept: q.concept, score: q.score, total: q.total, createdAt: q.createdAt };
    this.quizResults.push(item);
    return item;
  }
  async getQuizResults() { return [...this.quizResults]; }
}

export const storage = new MemStorage();

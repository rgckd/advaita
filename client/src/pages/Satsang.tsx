import { useState, useEffect } from "react";
import { store, subscribe, type DiscussionWithAttachment, type FileAttachment } from "@/lib/localStore";
import { Link } from "wouter";
import { AttachmentPicker, AttachmentDisplay } from "@/components/AttachmentPicker";

export default function Satsang() {
  const [discussions, setDiscussions] = useState<DiscussionWithAttachment[]>(store.getDiscussions());
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("Anonymous Seeker");
  const [attachment, setAttachment] = useState<FileAttachment | null>(null);
  const [isPublicPost, setIsPublicPost] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  useEffect(() => subscribe(() => setDiscussions(store.getDiscussions())), []);

  const post = () => {
    if (!topic.trim() || !content.trim()) return;
    store.addDiscussion(
      { topic, author, content, createdAt: new Date().toISOString(), ...(isPublicPost ? {} : { isPrivate: true }) } as any,
      attachment ?? undefined
    );
    setTopic(""); setContent(""); setAttachment(null); setShowForm(false);
  };

  const like = (id: number) => { store.likeDiscussion(id); };

  const summarize = (d: DiscussionWithAttachment) => {
    setAiSummary(`This thread explores "${d.topic}". The central tension raised is between ${
      d.topic.includes("Ajata") ? "Gaudapada's radical non-origination and Shankara's Vivartavada — both are valid pointers: one as ultimate truth (Paramartha), the other as practical instruction (Vyavahara)." :
      d.topic.includes("Neti") ? "negation as a spiritual practice versus mere intellectualism. The tradition suggests Neti Neti works when it loosens false identification, not when it becomes another concept to hold." :
      "theory and lived practice. Without Viveka (discrimination), even correct philosophical understanding remains a concept rather than a realization."
    } Key concepts: Advaita, Brahman, Maya, Atman.`);
  };

  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" }); }
    catch { return iso; }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground mb-1">Satsang</h1>
          <p className="text-sm text-muted-foreground">Philosophical discussions with fellow seekers.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity"
          data-testid="button-new-discussion">
          + New Thread
        </button>
      </div>

      {aiSummary && (
        <div className="mb-6 ai-bubble rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-primary flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> AI Summary</span>
            <button onClick={() => setAiSummary(null)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{aiSummary}</p>
        </div>
      )}

      {showForm && (
        <div className="mb-6 bg-card border border-border rounded-xl p-5 space-y-3">
          <h2 className="font-serif text-sm font-semibold text-foreground">Start a new inquiry</h2>
          <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Your name"
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Discussion topic"
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Share your perspective..." rows={4}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />

          {/* Attachment */}
          <AttachmentPicker value={attachment} onChange={setAttachment} />

          {/* Public / Private toggle — clear visual distinction */}
          <div className="rounded-xl border border-border overflow-hidden">
            <p className="px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/30 border-b border-border">Who can see this post?</p>
            <div className="flex">
              <button
                type="button"
                onClick={() => setIsPublicPost(true)}
                className={`flex-1 flex flex-col items-center gap-1 px-4 py-3 text-xs transition-colors border-r border-border ${
                  isPublicPost ? "bg-primary/10 text-primary font-medium" : "bg-card text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <span className="text-lg">🌐</span>
                <span className="font-semibold">Public Satsang</span>
                <span className="text-[10px] opacity-70">Visible to all seekers. Others can like and comment.</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPublicPost(false)}
                className={`flex-1 flex flex-col items-center gap-1 px-4 py-3 text-xs transition-colors ${
                  !isPublicPost ? "bg-primary/10 text-primary font-medium" : "bg-card text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <span className="text-lg">🔒</span>
                <span className="font-semibold">Private note</span>
                <span className="text-[10px] opacity-70">Only visible to you. Not shared with the community.</span>
              </button>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button onClick={() => { setShowForm(false); setAttachment(null); }} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm">Cancel</button>
            <button onClick={post} disabled={!topic.trim() || !content.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm disabled:opacity-50 hover:opacity-90"
              data-testid="button-post-discussion">Post to Satsang</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {discussions.map(d => (
          <div key={d.id} className="bg-card border border-border rounded-xl overflow-hidden" data-testid={`discussion-${d.id}`}>
            <div className="px-5 py-4">
              <h2 className="font-serif text-sm font-semibold text-foreground mb-1 leading-snug">{d.topic}</h2>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">{d.author[0]}</div>
                <span className="text-xs text-muted-foreground">{d.author}</span>
                <span className="text-xs text-muted-foreground">· {formatDate(d.createdAt)}</span>
                {/* Public/private badge */}
                <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 ${
                  (d as any).isPrivate
                    ? "bg-muted text-muted-foreground border-border"
                    : "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800/40"
                }`}>
                  {(d as any).isPrivate ? "🔒 Private" : "🌐 Public"}
                </span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{d.content}</p>
              {d.attachment && <AttachmentDisplay attachment={d.attachment} />}
            </div>
            <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center gap-3">
              <button onClick={() => like(d.id)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                🙏 {d.likes}
              </button>
              <button onClick={() => summarize(d)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                ✨ AI Summary
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-between items-center pt-6 border-t border-border">
        <p className="text-sm text-muted-foreground">See patterns across your journey?</p>
        <Link href="/insights">
          <button className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90">View Insights →</button>
        </Link>
      </div>
    </div>
  );
}

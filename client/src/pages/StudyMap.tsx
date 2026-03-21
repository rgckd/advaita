/**
 * Study Maps — topic-based knowledge graphs.
 * Each map represents a key Advaita teaching cluster (e.g. "Three Realities",
 * "Five Sheaths"). Maps contain concepts at different seeker levels — the level
 * tag on each node indicates what depth of understanding is required for that
 * concept, not which map it belongs to.
 */
import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { CONCEPTS } from "./Explore";
import { store, subscribe, type SavedStudyMap } from "@/lib/localStore";

type Node = { id: string; label: string; x: number; y: number; level: string; explored: boolean };
type Edge = { from: string; to: string };

const NODE_COLORS: Record<string, string> = {
  Foundation:   "#E86A17",
  Intermediate: "#C89B3C",
  Advanced:     "#8B3A2A",
  Practice:     "#2F5D3A",
};

const LEVEL_LABEL: Record<string, string> = {
  Foundation: "Jijñāsu", Intermediate: "Sādhaka", Advanced: "Mumukṣu", Practice: "Practice",
};

// ── Topic-based preset maps ──────────────────────────────────────────────────
// Each map is a coherent teaching cluster. Nodes are tagged with the level
// of understanding required — a single map spans multiple levels.
const TOPIC_MAPS: Record<string, {
  name: string;
  subtitle: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
}> = {
  "three-realities": {
    name: "Three Realities",
    subtitle: "Tri-vidha Sattā — the three orders of existence",
    description: "Paramarthika (absolute), Vyavaharika (conventional), Pratibhasika (apparent). How Shankara reconciles the reality of the world with the non-dual teaching.",
    nodes: [
      { id: "brahman",   label: "Brahman",      x: 300, y: 120, level: "Foundation",   explored: true  },
      { id: "maya",      label: "Maya",          x: 450, y: 230, level: "Foundation",   explored: true  },
      { id: "avidya",    label: "Avidya",        x: 150, y: 230, level: "Foundation",   explored: false },
      { id: "adhyasa",   label: "Adhyasa",       x: 200, y: 360, level: "Intermediate", explored: false },
      { id: "jiva",      label: "Jiva",          x: 400, y: 360, level: "Foundation",   explored: false },
      { id: "ajata-vada",label: "Ajata Vada",    x: 520, y: 140, level: "Advanced",     explored: false },
    ],
    edges: [
      { from: "brahman",   to: "maya"      },
      { from: "maya",      to: "avidya"    },
      { from: "avidya",    to: "adhyasa"   },
      { from: "brahman",   to: "jiva"      },
      { from: "brahman",   to: "ajata-vada"},
      { from: "maya",      to: "jiva"      },
    ],
  },
  "five-sheaths": {
    name: "Five Sheaths",
    subtitle: "Pancha Kosha — the layers veiling the Atman",
    description: "Annamaya, Pranamaya, Manomaya, Vijnanamaya, Anandamaya — the five sheaths that appear to cover the Atman. A systematic method for inquiry into who you are not.",
    nodes: [
      { id: "atman",    label: "Atman",       x: 300, y: 130, level: "Foundation",   explored: true  },
      { id: "brahman",  label: "Brahman",      x: 480, y: 130, level: "Foundation",   explored: true  },
      { id: "jiva",     label: "Jiva",         x: 300, y: 260, level: "Foundation",   explored: false },
      { id: "avidya",   label: "Avidya",       x: 150, y: 260, level: "Foundation",   explored: false },
      { id: "adhyasa",  label: "Adhyasa",      x: 200, y: 380, level: "Intermediate", explored: false },
      { id: "viveka",   label: "Viveka",       x: 450, y: 380, level: "Practice",     explored: false },
    ],
    edges: [
      { from: "atman",   to: "brahman"  },
      { from: "jiva",    to: "atman"    },
      { from: "avidya",  to: "jiva"     },
      { from: "adhyasa", to: "avidya"   },
      { from: "viveka",  to: "adhyasa"  },
      { from: "atman",   to: "viveka"   },
    ],
  },
  "states-of-consciousness": {
    name: "States of Consciousness",
    subtitle: "Avastha Traya — Jagrat, Svapna, Sushupti, Turiya",
    description: "The three states (waking, dream, deep sleep) and the fourth — Turiya. Gaudapada's Mandukya Karika uses these to establish Brahman as the unchanging witness behind all experience.",
    nodes: [
      { id: "atman",     label: "Atman",       x: 300, y: 130, level: "Foundation",   explored: true  },
      { id: "turiya",    label: "Turiya",       x: 300, y: 260, level: "Intermediate", explored: false },
      { id: "brahman",   label: "Brahman",      x: 480, y: 200, level: "Foundation",   explored: true  },
      { id: "maya",      label: "Maya",         x: 130, y: 200, level: "Foundation",   explored: false },
      { id: "ajata-vada",label: "Ajata Vada",   x: 300, y: 390, level: "Advanced",     explored: false },
    ],
    edges: [
      { from: "atman",    to: "turiya"     },
      { from: "turiya",   to: "ajata-vada" },
      { from: "atman",    to: "brahman"    },
      { from: "maya",     to: "atman"      },
      { from: "brahman",  to: "ajata-vada" },
    ],
  },
  "path-of-inquiry": {
    name: "Path of Inquiry",
    subtitle: "Jnana Marga — the qualifications and method",
    description: "Sadhana Chatushtaya (fourfold qualification), Shravana–Manana–Nididhyasana (hearing, reflection, contemplation). The complete methodology of Advaita inquiry.",
    nodes: [
      { id: "viveka",   label: "Viveka",      x: 130, y: 150, level: "Practice",     explored: false },
      { id: "atman",    label: "Atman",        x: 300, y: 130, level: "Foundation",   explored: true  },
      { id: "avidya",   label: "Avidya",       x: 480, y: 150, level: "Foundation",   explored: false },
      { id: "adhyasa",  label: "Adhyasa",      x: 480, y: 310, level: "Intermediate", explored: false },
      { id: "brahman",  label: "Brahman",      x: 300, y: 380, level: "Foundation",   explored: true  },
      { id: "maya",     label: "Maya",         x: 130, y: 310, level: "Foundation",   explored: false },
    ],
    edges: [
      { from: "viveka",  to: "atman"    },
      { from: "atman",   to: "brahman"  },
      { from: "avidya",  to: "adhyasa"  },
      { from: "maya",    to: "avidya"   },
      { from: "brahman", to: "maya"     },
      { from: "adhyasa", to: "atman"    },
    ],
  },
};

// AI custom map generator (simulated)
function generateCustomMap(request: string): { nodes: Node[]; edges: Edge[] } {
  const req = request.toLowerCase();
  if (req.includes("consciousness") || req.includes("turiya") || req.includes("awareness") || req.includes("states")) {
    return { nodes: TOPIC_MAPS["states-of-consciousness"].nodes, edges: TOPIC_MAPS["states-of-consciousness"].edges };
  } else if (req.includes("sheath") || req.includes("kosha") || req.includes("body") || req.includes("who am i")) {
    return { nodes: TOPIC_MAPS["five-sheaths"].nodes, edges: TOPIC_MAPS["five-sheaths"].edges };
  } else if (req.includes("maya") || req.includes("illusion") || req.includes("real") || req.includes("world")) {
    return { nodes: TOPIC_MAPS["three-realities"].nodes, edges: TOPIC_MAPS["three-realities"].edges };
  } else if (req.includes("path") || req.includes("inquiry") || req.includes("practice") || req.includes("viveka")) {
    return { nodes: TOPIC_MAPS["path-of-inquiry"].nodes, edges: TOPIC_MAPS["path-of-inquiry"].edges };
  }
  return { nodes: TOPIC_MAPS["three-realities"].nodes, edges: TOPIC_MAPS["three-realities"].edges };
}

export default function StudyMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [activeMapId, setActiveMapId] = useState<string>("three-realities");
  const [nodes, setNodes] = useState<Node[]>(TOPIC_MAPS["three-realities"].nodes);
  const [edges, setEdges] = useState<Edge[]>(TOPIC_MAPS["three-realities"].edges);
  const [customMapName, setCustomMapName] = useState<string | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customRequest, setCustomRequest] = useState("");
  const [customLoading, setCustomLoading] = useState(false);
  const [savedMaps, setSavedMaps] = useState<SavedStudyMap[]>(store.getSavedMaps());
  const [savedMapId, setSavedMapId] = useState<number | null>(null);

  useEffect(() => subscribe(() => setSavedMaps(store.getSavedMaps())), []);

  const selectedNode = nodes.find(n => n.id === selected);
  const concept = selectedNode ? CONCEPTS.find(c => c.id === selectedNode.id) : null;
  const exploredCount = nodes.filter(n => n.explored).length;
  const activeMap = activeMapId !== "custom" ? TOPIC_MAPS[activeMapId] : null;

  function switchMap(mapId: string) {
    setActiveMapId(mapId);
    setNodes(TOPIC_MAPS[mapId].nodes);
    setEdges(TOPIC_MAPS[mapId].edges);
    setSelected(null);
    setCustomMapName(null);
    setSavedMapId(null);
  }

  function toggleExplored(id: string) {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, explored: !n.explored } : n));
  }

  function loadSavedMap(map: SavedStudyMap) {
    setNodes(map.nodes);
    setEdges(map.edges);
    setCustomMapName(map.name);
    setActiveMapId("custom");
    setSavedMapId(map.id);
    setSelected(null);
  }

  function handleCustomRequest() {
    if (!customRequest.trim()) return;
    setCustomLoading(true);
    setTimeout(() => {
      const { nodes: newNodes, edges: newEdges } = generateCustomMap(customRequest);
      const mapName = `Custom: "${customRequest.slice(0, 28)}${customRequest.length > 28 ? "…" : ""}"`;
      setNodes(newNodes);
      setEdges(newEdges);
      setCustomMapName(mapName);
      setActiveMapId("custom");
      const saved = store.saveStudyMap(mapName, customRequest, newNodes, newEdges);
      setSavedMapId(saved.id);
      setCustomRequest("");
      setShowCustomForm(false);
      setCustomLoading(false);
      setSelected(null);
    }, 1200);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground mb-1">Study Maps</h1>
          <p className="text-sm text-muted-foreground">
            {activeMap?.subtitle || customMapName || "Select a map below"} — {exploredCount}/{nodes.length} concepts explored
          </p>
        </div>
        {/* Level legend */}
        <div className="flex gap-1.5 flex-wrap">
          {Object.entries(NODE_COLORS).map(([level, color]) => (
            <span key={level} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-card border border-border text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full" style={{ background: color }} />
              {LEVEL_LABEL[level] || level}
            </span>
          ))}
        </div>
      </div>

      {/* Topic map selector */}
      <div className="mb-3 flex gap-2 flex-wrap">
        {Object.entries(TOPIC_MAPS).map(([id, map]) => (
          <button
            key={id}
            onClick={() => switchMap(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              activeMapId === id && savedMapId === null
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/40"
            }`}
          >
            {map.name}
          </button>
        ))}
        <button
          onClick={() => setShowCustomForm(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            activeMapId === "custom" && savedMapId !== null
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/40"
          }`}
        >
          + Custom
        </button>
      </div>

      {/* Saved custom maps */}
      {savedMaps.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap items-center">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Saved:</span>
          {savedMaps.map(m => (
            <div key={m.id} className={`flex items-center gap-1 pl-3 pr-1 py-1 rounded-lg text-xs border transition-colors ${
              savedMapId === m.id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/40"
            }`}>
              <button onClick={() => loadSavedMap(m)} className="truncate max-w-[140px]">{m.name}</button>
              <button onClick={() => {
                store.deleteStudyMap(m.id);
                if (savedMapId === m.id) { switchMap("three-realities"); }
              }} className="ml-1 text-muted-foreground hover:text-destructive p-0.5 rounded" title="Delete">✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Active map description */}
      {activeMap && (
        <div className="mb-4 px-4 py-3 bg-card border border-border/60 rounded-xl">
          <p className="text-xs text-muted-foreground leading-relaxed">{activeMap.description}</p>
        </div>
      )}

      {/* Custom map form */}
      {showCustomForm && (
        <div className="mb-5 bg-card border border-border rounded-xl p-5 space-y-3">
          <div>
            <p className="font-serif text-sm font-semibold text-foreground mb-1">Request a custom study map</p>
            <p className="text-xs text-muted-foreground">Describe a theme, question, or cluster of concepts to explore.</p>
          </div>
          <textarea
            value={customRequest}
            onChange={e => setCustomRequest(e.target.value)}
            placeholder="e.g. 'Show me how the states of consciousness relate to Brahman' or 'Five sheaths and the nature of the self'"
            rows={3}
            className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowCustomForm(false)} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm">Cancel</button>
            <button onClick={handleCustomRequest} disabled={!customRequest.trim() || customLoading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm disabled:opacity-50 hover:opacity-90">
              {customLoading ? "Generating…" : "Generate Map"}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <svg ref={svgRef} viewBox="0 0 620 480" className="w-full h-80 sm:h-96"
            style={{ background: "radial-gradient(circle at 50% 50%, hsl(25 82% 49% / 0.03) 0%, transparent 70%)" }}>
            {edges.map(e => {
              const from = nodes.find(n => n.id === e.from);
              const to = nodes.find(n => n.id === e.to);
              if (!from || !to) return null;
              return <line key={`${e.from}-${e.to}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke="hsl(25 82% 49% / 0.3)" strokeWidth="1.5"
                strokeDasharray={from.explored && to.explored ? "none" : "4 4"} />;
            })}
            {nodes.map(node => (
              <g key={node.id} onClick={() => setSelected(node.id === selected ? null : node.id)}
                style={{ cursor: "pointer" }} data-testid={`node-${node.id}`}>
                <circle cx={node.x} cy={node.y} r={node.explored ? 22 : 18}
                  fill={NODE_COLORS[node.level]} opacity={node.explored ? 0.9 : 0.4}
                  stroke={selected === node.id ? "white" : "transparent"} strokeWidth={2} />
                {node.explored && <circle cx={node.x + 14} cy={node.y - 14} r={5} fill="#4ade80" />}
                <text x={node.x} y={node.y + 35} textAnchor="middle" fontSize="11"
                  fill="currentColor" fontFamily="Playfair Display, serif">{node.label}</text>
              </g>
            ))}
          </svg>
          <div className="px-4 py-3 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Click a concept to explore. Green dot = explored.</span>
              <span>{Math.round(exploredCount / nodes.length * 100)}% complete</span>
            </div>
            <div className="mt-2 bg-muted rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(exploredCount / nodes.length) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Detail panel */}
        <div className="space-y-4">
          {selectedNode ? (
            <>
              <div className={`p-4 border-2 rounded-xl ${concept?.color || "bg-card border-border"}`}>
                <div className="flex items-start justify-between mb-1">
                  <h2 className={`font-serif text-lg font-bold ${concept?.accent || "text-foreground"}`}>{selectedNode.label}</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-background/60 border border-border text-muted-foreground">
                    {LEVEL_LABEL[selectedNode.level] || selectedNode.level}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground italic mb-2">{concept?.tagline}</p>
                <p className="text-xs text-foreground leading-relaxed line-clamp-4">{concept?.summary}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Link href={`/explore/${selectedNode.id}`}>
                  <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity">
                    Explore this concept →
                  </button>
                </Link>
                <Link href={`/self-study/${selectedNode.id}`}>
                  <button className="w-full px-4 py-2 bg-card border border-border text-foreground rounded-lg text-sm hover:bg-muted transition-colors">
                    📜 Study texts & videos
                  </button>
                </Link>
                <button onClick={() => toggleExplored(selectedNode.id)}
                  className="w-full px-4 py-2 bg-card border border-border text-foreground rounded-lg text-sm hover:bg-muted transition-colors">
                  {selectedNode.explored ? "✓ Mark as unexplored" : "Mark as explored"}
                </button>
              </div>
            </>
          ) : (
            /* Maps worked on summary */
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="font-serif text-sm font-semibold text-foreground mb-3">Maps worked on</p>
              <div className="space-y-3">
                {Object.entries(TOPIC_MAPS).map(([id, map]) => {
                  const exp = map.nodes.filter(n => n.explored).length;
                  const tot = map.nodes.length;
                  const pct = Math.round((exp / tot) * 100);
                  return (
                    <div key={id}>
                      <div className="flex items-center justify-between mb-1">
                        <button onClick={() => switchMap(id)}
                          className={`text-xs font-medium hover:text-primary transition-colors ${activeMapId === id && !savedMapId ? "text-primary" : "text-foreground"}`}>
                          {map.name}
                        </button>
                        <span className="text-[10px] text-muted-foreground">{exp}/{tot} · {pct}%</span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary/60 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                {savedMaps.length > 0 && (
                  <>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide pt-1">Custom maps</p>
                    {savedMaps.map(m => {
                      const exp = m.nodes.filter(n => n.explored).length;
                      const pct = Math.round((exp / m.nodes.length) * 100);
                      return (
                        <div key={m.id}>
                          <div className="flex items-center justify-between mb-1">
                            <button onClick={() => loadSavedMap(m)}
                              className={`text-xs font-medium truncate max-w-[160px] hover:text-primary transition-colors ${savedMapId === m.id ? "text-primary" : "text-foreground"}`}>
                              {m.name}
                            </button>
                            <span className="text-[10px] text-muted-foreground">{exp}/{m.nodes.length} · {pct}%</span>
                          </div>
                          <div className="h-1 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary/60 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-3">Click a concept node to explore its details.</p>
            </div>
          )}

          {/* Concept list */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-serif text-sm font-semibold mb-3 text-foreground">Concepts in this map</h3>
            <div className="space-y-1.5">
              {nodes.map(n => (
                <button key={n.id} onClick={() => setSelected(n.id)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-left transition-colors ${selected === n.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: NODE_COLORS[n.level], opacity: n.explored ? 1 : 0.4 }} />
                  {n.label}
                  <span className="text-[10px] text-muted-foreground">{LEVEL_LABEL[n.level] || n.level}</span>
                  {n.explored && <span className="ml-auto text-green-500">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

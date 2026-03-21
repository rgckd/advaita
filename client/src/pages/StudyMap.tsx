import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { CONCEPTS } from "./Explore";
import { store, subscribe, type SeekerLevel, type SavedStudyMap } from "@/lib/localStore";

type Node = { id: string; label: string; x: number; y: number; level: string; explored: boolean };
type Edge = { from: string; to: string };

const NODE_COLORS: Record<string, string> = {
  Foundation:   "#E86A17",
  Intermediate: "#C89B3C",
  Advanced:     "#8B3A2A",
  Practice:     "#2F5D3A",
};

// ── Preset maps per seeker level ─────────────────────────────────────────────
const PRESET_MAPS: Record<string, { name: string; subtitle: string; nodes: Node[]; edges: Edge[] }> = {
  jijnasu: {
    name: "Jijñāsu Map",
    subtitle: "Foundation concepts — entry point into Advaita",
    nodes: [
      { id: "brahman",   label: "Brahman",  x: 300, y: 180, level: "Foundation",   explored: true  },
      { id: "atman",     label: "Atman",    x: 150, y: 290, level: "Foundation",   explored: true  },
      { id: "maya",      label: "Maya",     x: 450, y: 290, level: "Foundation",   explored: true  },
      { id: "avidya",    label: "Avidya",   x: 380, y: 400, level: "Intermediate", explored: false },
      { id: "adhyasa",   label: "Adhyasa",  x: 180, y: 400, level: "Intermediate", explored: false },
      { id: "jiva",      label: "Jiva",     x: 250, y: 370, level: "Foundation",   explored: false },
    ],
    edges: [
      { from: "brahman", to: "atman"   },
      { from: "brahman", to: "maya"    },
      { from: "maya",    to: "avidya"  },
      { from: "avidya",  to: "adhyasa" },
      { from: "atman",   to: "jiva"    },
      { from: "jiva",    to: "adhyasa" },
    ],
  },
  sadhaka: {
    name: "Sādhaka Map",
    subtitle: "Texts and methodology — Bhashya and Upanishads",
    nodes: [
      { id: "brahman",     label: "Brahman",    x: 300, y: 150, level: "Foundation",   explored: true  },
      { id: "atman",       label: "Atman",      x: 150, y: 260, level: "Foundation",   explored: true  },
      { id: "maya",        label: "Maya",       x: 450, y: 260, level: "Foundation",   explored: true  },
      { id: "adhyasa",     label: "Adhyasa",    x: 200, y: 380, level: "Intermediate", explored: true  },
      { id: "avidya",      label: "Avidya",     x: 380, y: 380, level: "Intermediate", explored: false },
      { id: "viveka",      label: "Viveka",     x: 80,  y: 180, level: "Practice",     explored: false },
      { id: "turiya",      label: "Turiya",     x: 100, y: 340, level: "Intermediate", explored: false },
      { id: "ajata-vada",  label: "Ajata Vada", x: 520, y: 160, level: "Advanced",     explored: false },
    ],
    edges: [
      { from: "brahman",   to: "atman"     },
      { from: "brahman",   to: "maya"      },
      { from: "brahman",   to: "ajata-vada"},
      { from: "maya",      to: "avidya"    },
      { from: "avidya",    to: "adhyasa"   },
      { from: "atman",     to: "turiya"    },
      { from: "viveka",    to: "atman"     },
    ],
  },
  mumukshu: {
    name: "Mumukṣu Map",
    subtitle: "Advanced texts — Brahma Sutras and beyond",
    nodes: [
      { id: "brahman",     label: "Brahman",       x: 300, y: 140, level: "Foundation",   explored: true  },
      { id: "atman",       label: "Atman",         x: 150, y: 240, level: "Foundation",   explored: true  },
      { id: "ajata-vada",  label: "Ajata Vada",    x: 480, y: 200, level: "Advanced",     explored: false },
      { id: "adhyasa",     label: "Adhyasa",       x: 200, y: 360, level: "Intermediate", explored: false },
      { id: "turiya",      label: "Turiya",        x: 100, y: 320, level: "Intermediate", explored: false },
      { id: "viveka",      label: "Viveka",        x: 80,  y: 160, level: "Practice",     explored: false },
      { id: "maya",        label: "Maya",          x: 420, y: 320, level: "Foundation",   explored: true  },
    ],
    edges: [
      { from: "brahman",   to: "atman"      },
      { from: "brahman",   to: "ajata-vada" },
      { from: "brahman",   to: "maya"       },
      { from: "atman",     to: "adhyasa"    },
      { from: "atman",     to: "turiya"     },
      { from: "viveka",    to: "atman"      },
      { from: "maya",      to: "ajata-vada" },
    ],
  },
};

// Simulated AI custom map response
function generateCustomMap(request: string): { nodes: Node[]; edges: Edge[] } {
  // In a full implementation, this would call the AI. For the prototype,
  // we create a focused map based on keywords in the request.
  const req = request.toLowerCase();
  let nodes: Node[] = [];
  let edges: Edge[] = [];

  if (req.includes("consciousness") || req.includes("turiya") || req.includes("awareness")) {
    nodes = [
      { id: "atman",  label: "Atman",  x: 300, y: 200, level: "Foundation",   explored: false },
      { id: "turiya", label: "Turiya", x: 300, y: 330, level: "Intermediate", explored: false },
      { id: "brahman",label: "Brahman",x: 150, y: 200, level: "Foundation",   explored: false },
      { id: "maya",   label: "Maya",   x: 450, y: 200, level: "Foundation",   explored: false },
    ];
    edges = [{ from: "brahman", to: "atman" }, { from: "atman", to: "turiya" }, { from: "maya", to: "atman" }];
  } else if (req.includes("maya") || req.includes("illusion") || req.includes("creation")) {
    nodes = [
      { id: "maya",   label: "Maya",   x: 300, y: 180, level: "Foundation",   explored: false },
      { id: "avidya", label: "Avidya", x: 180, y: 310, level: "Intermediate", explored: false },
      { id: "adhyasa",label: "Adhyasa",x: 420, y: 310, level: "Intermediate", explored: false },
      { id: "brahman",label: "Brahman",x: 300, y: 380, level: "Foundation",   explored: false },
    ];
    edges = [{ from: "maya", to: "avidya" }, { from: "avidya", to: "adhyasa" }, { from: "brahman", to: "maya" }];
  } else {
    // Default: return the jijnasu foundation map
    return { nodes: PRESET_MAPS.jijnasu.nodes, edges: PRESET_MAPS.jijnasu.edges };
  }
  return { nodes, edges };
}

export default function StudyMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [activeMapId, setActiveMapId] = useState<string>("jijnasu");
  const [nodes, setNodes] = useState<Node[]>(PRESET_MAPS.jijnasu.nodes);
  const [edges, setEdges] = useState<Edge[]>(PRESET_MAPS.jijnasu.edges);
  const [customMapName, setCustomMapName] = useState<string | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customRequest, setCustomRequest] = useState("");
  const [customLoading, setCustomLoading] = useState(false);
  const [seekerLevel, setSeekerLevel] = useState(store.getLevel());
  const [savedMaps, setSavedMaps] = useState<SavedStudyMap[]>(store.getSavedMaps());
  const [savedMapId, setSavedMapId] = useState<number | null>(null); // which saved map is active

  useEffect(() => subscribe(() => {
    setSeekerLevel(store.getLevel());
    setSavedMaps(store.getSavedMaps());
  }), []);

  const selectedNode = nodes.find(n => n.id === selected);
  const concept = selectedNode ? CONCEPTS.find(c => c.id === selectedNode.id) : null;
  const exploredCount = nodes.filter(n => n.explored).length;

  function switchMap(mapId: string) {
    setActiveMapId(mapId);
    setNodes(PRESET_MAPS[mapId].nodes);
    setEdges(PRESET_MAPS[mapId].edges);
    setSelected(null);
    setCustomMapName(null);
  }

  function toggleExplored(id: string) {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, explored: !n.explored } : n));
  }

  function handleCustomRequest() {
    if (!customRequest.trim()) return;
    setCustomLoading(true);
    // Simulate AI delay
    setTimeout(() => {
      const { nodes: newNodes, edges: newEdges } = generateCustomMap(customRequest);
      const mapName = `Custom: "${customRequest.slice(0, 28)}${customRequest.length > 28 ? "…" : ""}"`;
      setNodes(newNodes);
      setEdges(newEdges);
      setCustomMapName(mapName);
      setActiveMapId("custom");
      // Auto-save the generated map
      const saved = store.saveStudyMap(mapName, customRequest, newNodes, newEdges);
      setSavedMapId(saved.id);
      setCustomRequest("");
      setShowCustomForm(false);
      setCustomLoading(false);
      setSelected(null);
    }, 1200);
  }

  function loadSavedMap(map: SavedStudyMap) {
    setNodes(map.nodes);
    setEdges(map.edges);
    setCustomMapName(map.name);
    setActiveMapId("custom");
    setSavedMapId(map.id);
    setSelected(null);
  }

  const mapTabs = [
    { id: "jijnasu",  label: "Jijñāsu",  active: seekerLevel === "jijnasu"  },
    { id: "sadhaka",  label: "Sādhaka",  active: seekerLevel === "sadhaka"  },
    { id: "mumukshu", label: "Mumukṣu",  active: seekerLevel === "mumukshu" },
    { id: "custom",   label: customMapName ? "Custom ✓" : "+ Custom", active: false },
  ];

  const activePreset = activeMapId !== "custom" ? PRESET_MAPS[activeMapId] : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-5 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground mb-1">Study Maps</h1>
          <p className="text-sm text-muted-foreground">
            {savedMapId ? (savedMaps.find(m => m.id === savedMapId)?.name || customMapName) : (activePreset?.subtitle || "Your personal Advaita knowledge graph")} — {exploredCount}/{nodes.length} concepts explored
          </p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {Object.entries(NODE_COLORS).map(([level, color]) => {
            const label = { "Foundation": "Jijñāsu", "Intermediate": "Sādhaka", "Advanced": "Mumukṣu", "Practice": "Practice" }[level] || level;
            return (
              <span key={level} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-card border border-border text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />{label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Map selector tabs */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {mapTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => tab.id === "custom" ? setShowCustomForm(true) : switchMap(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              activeMapId === tab.id && savedMapId === null
                ? "bg-primary text-primary-foreground border-primary"
                : tab.active
                ? "bg-primary/10 text-primary border-primary/40"
                : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/40"
            }`}
          >
            {tab.label}
            {tab.active && activeMapId !== tab.id && <span className="ml-1.5 text-[10px] opacity-70">(your level)</span>}
          </button>
        ))}
      </div>

      {/* Saved custom maps row */}
      {savedMaps.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap items-center">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Saved:</span>
          {savedMaps.map(m => (
            <div key={m.id} className={`flex items-center gap-1 pl-3 pr-1 py-1 rounded-lg text-xs border transition-colors ${
              savedMapId === m.id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/40"
            }`}>
              <button onClick={() => loadSavedMap(m)} className="truncate max-w-[140px]">{m.name}</button>
              <button onClick={() => { store.deleteStudyMap(m.id); if (savedMapId === m.id) { setActiveMapId("jijnasu"); setNodes(PRESET_MAPS.jijnasu.nodes); setEdges(PRESET_MAPS.jijnasu.edges); setCustomMapName(null); setSavedMapId(null); } }}
                className="ml-1 text-muted-foreground hover:text-destructive p-0.5 rounded" title="Delete map">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Custom map request form */}
      {showCustomForm && (
        <div className="mb-5 bg-card border border-border rounded-xl p-5 space-y-3">
          <div>
            <p className="font-serif text-sm font-semibold text-foreground mb-1">Request a custom study map</p>
            <p className="text-xs text-muted-foreground">Describe what you want to explore — a specific theme, question, or cluster of concepts. The AI will generate a focused map for you.</p>
          </div>
          <textarea
            value={customRequest}
            onChange={e => setCustomRequest(e.target.value)}
            placeholder="e.g. 'I want to understand consciousness and the states of awareness' or 'Show me how Maya connects to suffering and liberation'"
            rows={3}
            className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowCustomForm(false)} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm">Cancel</button>
            <button
              onClick={handleCustomRequest}
              disabled={!customRequest.trim() || customLoading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm disabled:opacity-50 hover:opacity-90"
            >
              {customLoading ? "Generating…" : "Generate Map"}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <svg
            ref={svgRef}
            viewBox="0 0 620 480"
            className="w-full h-80 sm:h-96"
            style={{ background: "radial-gradient(circle at 50% 50%, hsl(25 82% 49% / 0.03) 0%, transparent 70%)" }}
          >
            {edges.map(e => {
              const from = nodes.find(n => n.id === e.from);
              const to = nodes.find(n => n.id === e.to);
              if (!from || !to) return null;
              return (
                <line
                  key={`${e.from}-${e.to}`}
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke="hsl(25 82% 49% / 0.3)" strokeWidth="1.5"
                  strokeDasharray={from.explored && to.explored ? "none" : "4 4"}
                />
              );
            })}
            {nodes.map(node => (
              <g key={node.id} className="concept-node" onClick={() => setSelected(node.id === selected ? null : node.id)} data-testid={`node-${node.id}`} style={{ cursor: "pointer" }}>
                <circle cx={node.x} cy={node.y} r={node.explored ? 22 : 18}
                  fill={NODE_COLORS[node.level]} opacity={node.explored ? 0.9 : 0.4}
                  stroke={selected === node.id ? "white" : "transparent"} strokeWidth={2} />
                {node.explored && <circle cx={node.x + 14} cy={node.y - 14} r={5} fill="#4ade80" />}
                <text x={node.x} y={node.y + 35} textAnchor="middle" fontSize="11"
                  fill="currentColor" className="text-foreground" fontFamily="Playfair Display, serif">
                  {node.label}
                </text>
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
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-background/60 border border-border text-muted-foreground">{{
                    "Foundation": "Jijñāsu",
                    "Intermediate": "Sādhaka",
                    "Advanced": "Mumukṣu",
                    "Practice": "Practice"
                  }[selectedNode.level] || selectedNode.level}</span>
                </div>
                <p className="text-xs text-muted-foreground italic mb-2">{concept?.tagline}</p>
                <p className="text-xs text-foreground leading-relaxed line-clamp-4">{concept?.summary}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Link href={`/explore/${selectedNode.id}`}>
                  <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity" data-testid="button-explore-concept">
                    Explore this concept →
                  </button>
                </Link>
                <Link href={`/self-study/${selectedNode.id}`}>
                  <button className="w-full px-4 py-2 bg-card border border-border text-foreground rounded-lg text-sm hover:bg-muted transition-colors">
                    📚 Study texts & videos
                  </button>
                </Link>
                <button onClick={() => toggleExplored(selectedNode.id)}
                  className="w-full px-4 py-2 bg-card border border-border text-foreground rounded-lg text-sm hover:bg-muted transition-colors"
                  data-testid="button-mark-explored">
                  {selectedNode.explored ? "✓ Mark as unexplored" : "Mark as explored"}
                </button>
              </div>
            </>
          ) : (
            <div className="p-6 bg-card border border-border rounded-xl text-center">
              {/* Network/graph icon — more appropriate than world map */}
              <svg className="w-12 h-12 mx-auto mb-3 text-primary/60" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="24" cy="10" r="4" fill="currentColor" opacity="0.7"/>
                <circle cx="10" cy="34" r="4" fill="currentColor" opacity="0.7"/>
                <circle cx="38" cy="34" r="4" fill="currentColor" opacity="0.7"/>
                <circle cx="24" cy="28" r="3" fill="currentColor" opacity="0.4"/>
                <line x1="24" y1="14" x2="24" y2="25"/>
                <line x1="24" y1="25" x2="13" y2="31"/>
                <line x1="24" y1="25" x2="35" y2="31"/>
                <line x1="13" y1="31" x2="35" y2="31" strokeDasharray="3 3" opacity="0.4"/>
              </svg>
              <p className="font-serif text-sm font-medium text-foreground mb-1">Your Knowledge Graph</p>
              <p className="text-xs text-muted-foreground">Click any concept node to explore its details and connections.</p>
            </div>
          )}

          {/* Concept list */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-serif text-sm font-semibold mb-3 text-foreground">Concepts in this map</h3>
            <div className="space-y-1.5">
              {nodes.map(n => (
                <button key={n.id} onClick={() => setSelected(n.id)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-left transition-colors ${selected === n.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}
                  data-testid={`list-node-${n.id}`}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: NODE_COLORS[n.level], opacity: n.explored ? 1 : 0.4 }} />
                  {n.label}
                  <span className="text-[10px] text-muted-foreground">{{
                    "Foundation": "Jijñāsu",
                    "Intermediate": "Sādhaka",
                    "Advanced": "Mumukṣu",
                    "Practice": "Practice"
                  }[n.level] || n.level}</span>
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

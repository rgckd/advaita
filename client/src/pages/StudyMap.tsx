import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { CONCEPTS } from "./Explore";

type Node = { id: string; label: string; x: number; y: number; level: string; explored: boolean };
type Edge = { from: string; to: string };

const NODES: Node[] = [
  { id: "brahman", label: "Brahman", x: 300, y: 200, level: "Foundation", explored: true },
  { id: "atman", label: "Atman", x: 160, y: 300, level: "Foundation", explored: true },
  { id: "maya", label: "Maya", x: 440, y: 300, level: "Foundation", explored: true },
  { id: "avidya", label: "Avidya", x: 360, y: 400, level: "Intermediate", explored: false },
  { id: "adhyasa", label: "Adhyasa", x: 180, y: 420, level: "Intermediate", explored: false },
  { id: "ajata-vada", label: "Ajata Vada", x: 520, y: 180, level: "Advanced", explored: false },
  { id: "viveka", label: "Viveka", x: 80, y: 200, level: "Practice", explored: false },
  { id: "turiya", label: "Turiya", x: 100, y: 360, level: "Intermediate", explored: false },
  { id: "jiva", label: "Jiva", x: 240, y: 380, level: "Foundation", explored: false },
];

const EDGES: Edge[] = [
  { from: "brahman", to: "atman" },
  { from: "brahman", to: "maya" },
  { from: "brahman", to: "ajata-vada" },
  { from: "maya", to: "avidya" },
  { from: "avidya", to: "adhyasa" },
  { from: "atman", to: "jiva" },
  { from: "atman", to: "turiya" },
  { from: "viveka", to: "atman" },
  { from: "jiva", to: "adhyasa" },
];

const NODE_COLORS: Record<string, string> = {
  Foundation: "#E86A17",
  Intermediate: "#C89B3C",
  Advanced: "#8B3A2A",
  Practice: "#2F5D3A",
};

export default function StudyMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Node[]>(NODES);

  const selectedNode = nodes.find(n => n.id === selected);
  const concept = selectedNode ? CONCEPTS.find(c => c.id === selectedNode.id) : null;

  const toggleExplored = (id: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, explored: !n.explored } : n));
  };

  const exploredCount = nodes.filter(n => n.explored).length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground mb-1">Study Map</h1>
          <p className="text-sm text-muted-foreground">Your personal Advaita knowledge graph — {exploredCount}/{nodes.length} concepts explored</p>
        </div>
        <div className="flex gap-2 text-xs">
          {Object.entries(NODE_COLORS).map(([level, color]) => (
            <span key={level} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-card border border-border text-muted-foreground">
              <span className="w-2 h-2 rounded-full" style={{ background: color }} />
              {level}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <svg
            ref={svgRef}
            viewBox="0 0 620 520"
            className="w-full h-96"
            style={{ background: "radial-gradient(circle at 50% 50%, hsl(25 82% 49% / 0.03) 0%, transparent 70%)" }}
          >
            {/* Edges */}
            {EDGES.map(e => {
              const from = nodes.find(n => n.id === e.from)!;
              const to = nodes.find(n => n.id === e.to)!;
              return (
                <line
                  key={`${e.from}-${e.to}`}
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke="hsl(25 82% 49% / 0.3)"
                  strokeWidth="1.5"
                  strokeDasharray={from.explored && to.explored ? "none" : "4 4"}
                />
              );
            })}
            {/* Nodes */}
            {nodes.map(node => (
              <g
                key={node.id}
                className="concept-node"
                onClick={() => setSelected(node.id === selected ? null : node.id)}
                data-testid={`node-${node.id}`}
              >
                <circle
                  cx={node.x} cy={node.y} r={node.explored ? 22 : 18}
                  fill={NODE_COLORS[node.level]}
                  opacity={node.explored ? 0.9 : 0.4}
                  stroke={selected === node.id ? "white" : "transparent"}
                  strokeWidth={2}
                />
                {node.explored && (
                  <circle cx={node.x + 14} cy={node.y - 14} r={5} fill="#4ade80" />
                )}
                <text
                  x={node.x} y={node.y + 35}
                  textAnchor="middle"
                  fontSize="11"
                  fill="currentColor"
                  className="text-foreground"
                  fontFamily="Playfair Display, serif"
                >
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
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(exploredCount / nodes.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Detail panel */}
        <div className="space-y-4">
          {selectedNode ? (
            <>
              <div className={`p-4 border-2 rounded-xl ${concept?.color || "bg-card border-border"}`}>
                <h2 className={`font-serif text-lg font-bold mb-1 ${concept?.accent || "text-foreground"}`}>{selectedNode.label}</h2>
                <p className="text-xs text-muted-foreground italic mb-2">{concept?.tagline}</p>
                <p className="text-xs text-foreground leading-relaxed line-clamp-4">{concept?.summary}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Link href={`/explore/${selectedNode.id}`}>
                  <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity" data-testid="button-explore-concept">
                    Explore this concept →
                  </button>
                </Link>
                <button
                  onClick={() => toggleExplored(selectedNode.id)}
                  className="w-full px-4 py-2 bg-card border border-border text-foreground rounded-lg text-sm hover:bg-muted transition-colors"
                  data-testid="button-mark-explored"
                >
                  {selectedNode.explored ? "✓ Mark as unexplored" : "Mark as explored"}
                </button>
              </div>
            </>
          ) : (
            <div className="p-6 bg-card border border-border rounded-xl text-center">
              <p className="text-4xl mb-3">🗺</p>
              <p className="font-serif text-sm font-medium text-foreground mb-1">Your Knowledge Graph</p>
              <p className="text-xs text-muted-foreground">Click any concept node to explore its details and connections.</p>
            </div>
          )}

          {/* Concept list */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-serif text-sm font-semibold mb-3 text-foreground">All Concepts</h3>
            <div className="space-y-1.5">
              {nodes.map(n => (
                <button
                  key={n.id}
                  onClick={() => setSelected(n.id)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-left transition-colors ${selected === n.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}
                  data-testid={`list-node-${n.id}`}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: NODE_COLORS[n.level], opacity: n.explored ? 1 : 0.4 }} />
                  {n.label}
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

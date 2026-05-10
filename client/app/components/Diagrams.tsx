"use client";
import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Stylized inline SVG diagrams for the Red-Black Trees lecture.
 * Self-contained, no external image deps. Each diagram exposes a 16:9-ish
 * canvas designed to fill the parent Frame.
 */

type DiagramKind =
  | "bst"
  | "balance"
  | "rbtree"
  | "black-height"
  | "operations"
  | "rotation"
  | "complexity";

const PAPER = "#f5f4f0";
const PAPER_MUTED = "rgba(245, 244, 240, 0.55)";
const PAPER_SUBTLE = "rgba(245, 244, 240, 0.28)";
const VIOLET = "#9f03fe";
const VIOLET_SOFT = "#c700e7";
const RED = "#ef3458";
const BLACK = "#0e0e0f";

function DiagramFrame({
  children,
  caption,
}: {
  children: ReactNode;
  caption?: string;
}) {
  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="relative flex-1 min-h-0 flex items-center justify-center">
        {children}
      </div>
      {caption && (
        <div className="shrink-0 pt-2 font-mono text-[9px] tracking-widest uppercase text-paper-subtle text-center">
          {caption}
        </div>
      )}
    </div>
  );
}

function Node({
  cx,
  cy,
  r = 18,
  color,
  label,
  delay = 0,
}: {
  cx: number;
  cy: number;
  r?: number;
  color: "red" | "black" | "outline";
  label?: string | number;
  delay?: number;
}) {
  const fill = color === "red" ? RED : color === "black" ? BLACK : "transparent";
  const stroke =
    color === "red" ? RED : color === "black" ? PAPER : PAPER_MUTED;
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
    >
      <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={1.5} />
      {label !== undefined && (
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="11"
          fill={color === "red" || color === "black" ? PAPER : PAPER_MUTED}
        >
          {label}
        </text>
      )}
    </motion.g>
  );
}

function Edge({
  x1,
  y1,
  x2,
  y2,
  delay = 0,
  highlight = false,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay?: number;
  highlight?: boolean;
}) {
  return (
    <motion.line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={highlight ? VIOLET : PAPER_SUBTLE}
      strokeWidth={highlight ? 1.5 : 1}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
    />
  );
}

/* --- Diagram bodies --- */

function BSTDiagram() {
  // 7-node BST with 8 at root
  const nodes: { x: number; y: number; v: number }[] = [
    { x: 240, y: 50, v: 8 },
    { x: 140, y: 130, v: 3 },
    { x: 340, y: 130, v: 12 },
    { x: 80, y: 210, v: 1 },
    { x: 200, y: 210, v: 6 },
    { x: 290, y: 210, v: 10 },
    { x: 400, y: 210, v: 14 },
  ];
  const edges = [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 5],
    [2, 6],
  ];
  return (
    <svg viewBox="0 0 480 260" className="w-full h-full max-h-full">
      {edges.map(([a, b], i) => (
        <Edge
          key={i}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          delay={0.1 + i * 0.05}
        />
      ))}
      {nodes.map((n, i) => (
        <Node
          key={i}
          cx={n.x}
          cy={n.y}
          color="outline"
          label={n.v}
          delay={0.2 + i * 0.04}
        />
      ))}
    </svg>
  );
}

function BalanceDiagram() {
  return (
    <svg viewBox="0 0 480 260" className="w-full h-full max-h-full">
      {/* Unbalanced (linked-list) on left */}
      <text x="100" y="20" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill={PAPER_MUTED} letterSpacing="2">
        UNBALANCED
      </text>
      {[0, 1, 2, 3, 4].map((i) => {
        const x = 60 + i * 22;
        const y = 50 + i * 36;
        return (
          <g key={`u${i}`}>
            {i > 0 && (
              <Edge
                x1={x - 22}
                y1={y - 36}
                x2={x}
                y2={y}
                delay={0.05 * i}
              />
            )}
            <Node cx={x} cy={y} r={11} color="outline" delay={0.1 + 0.05 * i} />
          </g>
        );
      })}

      {/* Balanced on right */}
      <text x="380" y="20" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill={PAPER_MUTED} letterSpacing="2">
        BALANCED
      </text>
      {(() => {
        const nodes = [
          { x: 380, y: 60 },
          { x: 320, y: 120 },
          { x: 440, y: 120 },
          { x: 290, y: 180 },
          { x: 350, y: 180 },
          { x: 410, y: 180 },
          { x: 470, y: 180 },
        ];
        const edges = [
          [0, 1],
          [0, 2],
          [1, 3],
          [1, 4],
          [2, 5],
          [2, 6],
        ];
        return (
          <>
            {edges.map(([a, b], i) => (
              <Edge
                key={i}
                x1={nodes[a].x}
                y1={nodes[a].y}
                x2={nodes[b].x}
                y2={nodes[b].y}
                delay={0.1 + i * 0.04}
              />
            ))}
            {nodes.map((n, i) => (
              <Node
                key={i}
                cx={n.x}
                cy={n.y}
                r={11}
                color="outline"
                delay={0.15 + i * 0.04}
              />
            ))}
          </>
        );
      })()}
    </svg>
  );
}

function RBTreeDiagram() {
  // Red-Black tree: 13 root, with red/black coloring per invariants
  const nodes: { x: number; y: number; v: number; c: "red" | "black" }[] = [
    { x: 240, y: 40, v: 13, c: "black" },
    { x: 140, y: 110, v: 8, c: "red" },
    { x: 340, y: 110, v: 17, c: "red" },
    { x: 80, y: 180, v: 1, c: "black" },
    { x: 200, y: 180, v: 11, c: "black" },
    { x: 290, y: 180, v: 15, c: "black" },
    { x: 400, y: 180, v: 25, c: "black" },
    { x: 50, y: 240, v: 6, c: "red" },
    { x: 430, y: 240, v: 27, c: "red" },
  ];
  const edges = [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 5],
    [2, 6],
    [3, 7],
    [6, 8],
  ];
  return (
    <svg viewBox="0 0 480 280" className="w-full h-full max-h-full">
      {edges.map(([a, b], i) => (
        <Edge
          key={i}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          delay={0.05 + i * 0.04}
        />
      ))}
      {nodes.map((n, i) => (
        <Node
          key={i}
          cx={n.x}
          cy={n.y}
          color={n.c}
          label={n.v}
          delay={0.2 + i * 0.05}
        />
      ))}
    </svg>
  );
}

function BlackHeightDiagram() {
  const nodes: { x: number; y: number; v: number; c: "red" | "black"; highlight?: boolean }[] = [
    { x: 240, y: 40, v: 10, c: "black", highlight: true },
    { x: 140, y: 110, v: 5, c: "red" },
    { x: 340, y: 110, v: 15, c: "red", highlight: true },
    { x: 80, y: 180, v: 2, c: "black" },
    { x: 200, y: 180, v: 7, c: "black" },
    { x: 290, y: 180, v: 12, c: "black", highlight: true },
    { x: 400, y: 180, v: 18, c: "black" },
  ];
  const edges = [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 5],
    [2, 6],
  ];
  const highlightPath = [
    [0, 2],
    [2, 5],
  ];
  return (
    <svg viewBox="0 0 480 210" className="w-full h-full max-h-full">
      {edges.map(([a, b], i) => {
        const isHighlight = highlightPath.some(
          ([ha, hb]) => ha === a && hb === b
        );
        return (
          <Edge
            key={i}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            highlight={isHighlight}
            delay={0.05 + i * 0.04}
          />
        );
      })}
      {nodes.map((n, i) => (
        <g key={i}>
          {n.highlight && (
            <motion.circle
              cx={n.x}
              cy={n.y}
              r={26}
              fill="none"
              stroke={VIOLET}
              strokeWidth={1}
              strokeDasharray="3 3"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 0.7, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.05, duration: 0.4 }}
            />
          )}
          <Node
            cx={n.x}
            cy={n.y}
            color={n.c}
            label={n.v}
            delay={0.2 + i * 0.05}
          />
        </g>
      ))}
    </svg>
  );
}

function OperationsDiagram() {
  return (
    <svg viewBox="0 0 480 240" className="w-full h-full max-h-full">
      {/* Search path */}
      <text x="80" y="22" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill={PAPER_MUTED} letterSpacing="2">
        SEARCH
      </text>
      {(() => {
        const ns = [
          { x: 80, y: 50, v: 8 },
          { x: 50, y: 110, v: 4 },
          { x: 110, y: 110, v: 12, hl: true },
          { x: 80, y: 170, v: 10, hl: true },
          { x: 140, y: 170, v: 14 },
        ];
        const es = [
          [0, 1],
          [0, 2, true],
          [2, 3, true],
          [2, 4],
        ];
        return (
          <>
            {es.map(([a, b, hl], i) => (
              <Edge
                key={i}
                x1={ns[a as number].x}
                y1={ns[a as number].y}
                x2={ns[b as number].x}
                y2={ns[b as number].y}
                highlight={!!hl}
                delay={0.05 * i}
              />
            ))}
            {ns.map((n, i) => (
              <Node
                key={i}
                cx={n.x}
                cy={n.y}
                r={14}
                color={n.hl ? "red" : "outline"}
                label={n.v}
                delay={0.1 + i * 0.04}
              />
            ))}
          </>
        );
      })()}

      {/* Arrow */}
      <motion.path
        d="M 180 110 L 220 110"
        stroke={PAPER_MUTED}
        strokeWidth={1}
        markerEnd="url(#arrow)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.6 }}
      />
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill={PAPER_MUTED} />
        </marker>
      </defs>

      {/* Insert + recolor */}
      <text x="320" y="22" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill={PAPER_MUTED} letterSpacing="2">
        INSERT + RECOLOR
      </text>
      {(() => {
        const ns = [
          { x: 320, y: 50, v: 8, c: "black" as const },
          { x: 280, y: 110, v: 4, c: "red" as const },
          { x: 360, y: 110, v: 12, c: "red" as const },
          { x: 250, y: 170, v: 2, c: "black" as const },
          { x: 310, y: 170, v: 6, c: "black" as const },
          { x: 340, y: 170, v: 10, c: "black" as const },
          { x: 400, y: 170, v: 14, c: "black" as const },
          { x: 230, y: 220, v: 1, c: "red" as const },
        ];
        const es = [
          [0, 1],
          [0, 2],
          [1, 3],
          [1, 4],
          [2, 5],
          [2, 6],
          [3, 7],
        ];
        return (
          <>
            {es.map(([a, b], i) => (
              <Edge
                key={i}
                x1={ns[a].x}
                y1={ns[a].y}
                x2={ns[b].x}
                y2={ns[b].y}
                delay={0.05 * i + 0.4}
              />
            ))}
            {ns.map((n, i) => (
              <Node
                key={i}
                cx={n.x}
                cy={n.y}
                r={12}
                color={n.c}
                label={n.v}
                delay={0.5 + i * 0.04}
              />
            ))}
          </>
        );
      })()}
    </svg>
  );
}

function RotationDiagram() {
  return (
    <svg viewBox="0 0 480 240" className="w-full h-full max-h-full">
      {/* Before */}
      <text x="120" y="22" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill={PAPER_MUTED} letterSpacing="2">
        BEFORE
      </text>
      {(() => {
        const ns = [
          { x: 120, y: 50, v: "Q", c: "black" as const },
          { x: 80, y: 120, v: "P", c: "red" as const },
          { x: 160, y: 120, v: "C", c: "outline" as const },
          { x: 50, y: 190, v: "A", c: "outline" as const },
          { x: 110, y: 190, v: "B", c: "outline" as const },
        ];
        const es = [
          [0, 1],
          [0, 2],
          [1, 3],
          [1, 4],
        ];
        return (
          <>
            {es.map(([a, b], i) => (
              <Edge
                key={i}
                x1={ns[a].x}
                y1={ns[a].y}
                x2={ns[b].x}
                y2={ns[b].y}
                delay={0.05 * i}
              />
            ))}
            {ns.map((n, i) => (
              <Node
                key={i}
                cx={n.x}
                cy={n.y}
                r={14}
                color={n.c}
                label={n.v}
                delay={0.1 + i * 0.04}
              />
            ))}
          </>
        );
      })()}

      {/* Arrow */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <path d="M 220 120 L 260 120" stroke={VIOLET} strokeWidth={1.5} markerEnd="url(#rotarr)" />
        <text x="240" y="105" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill={VIOLET_SOFT} letterSpacing="2">
          RIGHT ROTATE
        </text>
      </motion.g>
      <defs>
        <marker id="rotarr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill={VIOLET} />
        </marker>
      </defs>

      {/* After */}
      <text x="360" y="22" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill={PAPER_MUTED} letterSpacing="2">
        AFTER
      </text>
      {(() => {
        const ns = [
          { x: 360, y: 50, v: "P", c: "black" as const },
          { x: 320, y: 120, v: "A", c: "outline" as const },
          { x: 400, y: 120, v: "Q", c: "red" as const },
          { x: 370, y: 190, v: "B", c: "outline" as const },
          { x: 430, y: 190, v: "C", c: "outline" as const },
        ];
        const es = [
          [0, 1],
          [0, 2],
          [2, 3],
          [2, 4],
        ];
        return (
          <>
            {es.map(([a, b], i) => (
              <Edge
                key={i}
                x1={ns[a].x}
                y1={ns[a].y}
                x2={ns[b].x}
                y2={ns[b].y}
                delay={0.7 + 0.05 * i}
              />
            ))}
            {ns.map((n, i) => (
              <Node
                key={i}
                cx={n.x}
                cy={n.y}
                r={14}
                color={n.c}
                label={n.v}
                delay={0.8 + i * 0.04}
              />
            ))}
          </>
        );
      })()}
    </svg>
  );
}

function ComplexityDiagram() {
  const rows: { name: string; ops: string; ordered: boolean; highlight?: boolean }[] = [
    { name: "Hash map", ops: "O(1)", ordered: false },
    { name: "Sorted array", ops: "O(n) insert", ordered: true },
    { name: "Linked list", ops: "O(n) search", ordered: false },
    { name: "Red-black tree", ops: "O(log n) all", ordered: true, highlight: true },
  ];
  return (
    <div className="w-full h-full flex items-center justify-center px-2">
      <div className="w-full max-w-[260px]">
        <div className="grid grid-cols-[1fr_auto] gap-3 pb-1.5 border-b border-rule font-mono text-[8px] tracking-widest uppercase text-paper-subtle">
          <div>Structure</div>
          <div className="text-right">Worst case</div>
        </div>
        {rows.map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className={`grid grid-cols-[1fr_auto] gap-3 py-1.5 border-b border-rule/60 ${
              r.highlight ? "bg-violet-core/15 -mx-2 px-2 border-rule/0" : ""
            }`}
          >
            <div className={`text-xs ${r.highlight ? "font-display italic text-paper" : "text-paper-muted"}`}>
              {r.name}
            </div>
            <div
              className={`text-right font-mono text-[10px] tabular-nums ${
                r.highlight ? "text-violet-soft" : "text-paper-subtle"
              }`}
            >
              {r.ops}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const diagramMap: Record<DiagramKind, () => ReactNode> = {
  bst: BSTDiagram,
  balance: BalanceDiagram,
  rbtree: RBTreeDiagram,
  "black-height": BlackHeightDiagram,
  operations: OperationsDiagram,
  rotation: RotationDiagram,
  complexity: ComplexityDiagram,
};

const captionMap: Partial<Record<DiagramKind, string>> = {
  bst: "Binary search tree · ordered keys",
  balance: "Linked-list degeneracy vs. balanced height",
  rbtree: "Red-Black tree honoring all 5 invariants",
  "black-height": "Black height = 2 along every path",
  operations: "Search, then insert with recolor",
  rotation: "A right rotation, color-preserving",
  complexity: "Where Red-Black trees earn their keep",
};

export default function SlideDiagram({ kind }: { kind: DiagramKind }) {
  const Diagram = diagramMap[kind];
  if (!Diagram) return null;
  return <DiagramFrame caption={captionMap[kind]}>{Diagram()}</DiagramFrame>;
}

export type { DiagramKind };

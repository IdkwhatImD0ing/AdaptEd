"use client";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import type { TranscriptEntry } from "../lib/types";

export default function Sidebar({ messages }: { messages: TranscriptEntry[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <aside className="flex flex-col h-full bg-ink-surface border-l border-rule">
      <div className="px-6 py-5 border-b border-rule flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] tracking-widest uppercase text-paper-subtle">
            Transcript
          </div>
          <div className="font-display italic text-xl tracking-tighter text-paper">
            Live
          </div>
        </div>
        <div className="font-mono text-[10px] tracking-widest text-violet-core">
          ●&nbsp;REC
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {messages.length === 0 ? (
          <div className="font-mono text-[10px] tracking-widest uppercase text-paper-subtle">
            Press the mic to begin
          </div>
        ) : (
          messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-1.5"
            >
              <div className="font-mono text-[9px] tracking-widest uppercase text-paper-subtle flex items-center gap-2">
                <span
                  className={
                    m.role === "agent"
                      ? "text-violet-core"
                      : "text-cream"
                  }
                >
                  {m.role === "agent" ? "Lecturer" : "You"}
                </span>
                <span className="opacity-50">
                  {new Date(m.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
              <div
                className={
                  m.role === "agent"
                    ? "font-sans text-[15px] leading-relaxed text-paper text-pretty"
                    : "font-sans text-[15px] leading-relaxed text-paper-muted italic text-pretty"
                }
              >
                {m.content}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="px-6 py-4 border-t border-rule font-mono text-[9px] tracking-widest uppercase text-paper-subtle">
        {messages.length} {messages.length === 1 ? "exchange" : "exchanges"}
      </div>
    </aside>
  );
}

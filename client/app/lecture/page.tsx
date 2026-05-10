"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import Slideshow from "../components/Slideshow";
import MockVoice from "../components/MockVoice";
import Sidebar from "../components/Sidebar";
import { mockLecture } from "../lib/mockLecture";
import type { Lecture, TranscriptEntry } from "../lib/types";
import type { ScriptedPrompt } from "../lib/mockTranscript";

export default function LecturePage() {
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

  // Hydrate from localStorage (written by /research) or fall back to canned
  useEffect(() => {
    let parsed: Lecture | null = null;
    try {
      const raw = localStorage.getItem("lecture");
      if (raw) parsed = JSON.parse(raw) as Lecture;
    } catch {
      parsed = null;
    }
    setLecture(parsed ?? mockLecture);
  }, []);

  const total = lecture?.slides.length ?? 0;
  const slide = lecture?.slides[currentSlide];
  const speakerNotes = slide?.speaker_notes ?? slide?.title ?? "";

  const next = useCallback(() => {
    setCurrentSlide((i) => Math.min(i + 1, total - 1));
  }, [total]);
  const prev = useCallback(() => {
    setCurrentSlide((i) => Math.max(i - 1, 0));
  }, []);
  const goto = useCallback(
    (idx: number) => setCurrentSlide(Math.max(0, Math.min(idx, total - 1))),
    [total]
  );

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  const onAction = useCallback(
    (action: ScriptedPrompt["action"]) => {
      if (!action) return;
      if (action.name === "next_slide") next();
      else if (action.name === "prev_slide") prev();
      else if (action.name === "goto_slide" && typeof action.slideIndex === "number") {
        goto(action.slideIndex);
      }
    },
    [next, prev, goto]
  );

  const appendTranscript = useCallback((entries: TranscriptEntry[]) => {
    setTranscript((prev) => [...prev, ...entries]);
  }, []);

  if (!lecture || !slide) {
    return (
      <main className="min-h-screen mesh grain flex items-center justify-center text-paper">
        <div className="font-mono text-[11px] tracking-widest uppercase text-paper-subtle">
          Loading lecture…
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen w-screen overflow-hidden bg-ink text-paper">
      <div className="grid h-full" style={{ gridTemplateColumns: "1fr 360px" }}>
        {/* Stage column */}
        <div className="flex flex-col h-full min-h-0">
          {/* Stage header */}
          <header className="px-8 py-5 border-b border-rule flex items-center justify-between">
            <div className="flex items-center gap-5 min-w-0">
              <Link
                href="/"
                className="font-mono text-[10px] tracking-widest uppercase text-paper-subtle hover:text-paper transition-colors flex items-center gap-2"
              >
                <Home className="w-3.5 h-3.5" /> AdaptEd
              </Link>
              <span className="text-paper-subtle">/</span>
              <div className="min-w-0">
                <div className="font-mono text-[9px] tracking-widest uppercase text-paper-subtle">
                  Now lecturing
                </div>
                <div className="font-display italic text-xl tracking-tighter text-paper truncate">
                  {lecture.title}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="font-mono text-[10px] tracking-widest uppercase text-paper-subtle hidden md:block">
                {String(currentSlide + 1).padStart(2, "0")} of{" "}
                {String(total).padStart(2, "0")}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Previous slide"
                  onClick={prev}
                  disabled={currentSlide === 0}
                  className="w-9 h-9 rounded-full border border-rule flex items-center justify-center text-paper-muted hover:text-paper hover:border-violet-core/40 disabled:opacity-30 disabled:hover:border-rule transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next slide"
                  onClick={next}
                  disabled={currentSlide === total - 1}
                  className="w-9 h-9 rounded-full border border-rule flex items-center justify-center text-paper-muted hover:text-paper hover:border-violet-core/40 disabled:opacity-30 disabled:hover:border-rule transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          {/* Stage canvas */}
          <div className="flex-1 min-h-0 p-8">
            <div className="w-full h-full max-w-[1600px] mx-auto">
              <Slideshow lecture={lecture} currentIndex={currentSlide} />
            </div>
          </div>

          {/* Voice dock */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="border-t border-rule px-8 py-6 bg-ink-surface/60 backdrop-blur-sm"
          >
            <MockVoice
              speakerNotes={speakerNotes}
              slideIndex={currentSlide}
              totalSlides={total}
              onAutoAdvance={next}
              onAction={onAction}
              onTranscript={appendTranscript}
            />
          </motion.section>

          {/* Slide rail */}
          <div className="border-t border-rule px-8 py-4 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              {lecture.slides.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goto(i)}
                  aria-label={`Go to slide ${i + 1}: ${s.title}`}
                  className={`flex flex-col items-start gap-1 px-3 py-2 rounded-md border transition-all max-w-[200px] ${
                    i === currentSlide
                      ? "border-violet-core/60 bg-violet-core/10"
                      : "border-transparent hover:border-rule"
                  }`}
                >
                  <span
                    className={`font-mono text-[9px] tracking-widest uppercase ${
                      i === currentSlide ? "text-violet-core" : "text-paper-subtle"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`font-sans text-xs truncate w-full text-left ${
                      i === currentSlide ? "text-paper" : "text-paper-muted"
                    }`}
                  >
                    {s.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transcript column */}
        <Sidebar messages={transcript} />
      </div>
    </main>
  );
}

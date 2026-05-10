"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Home, PanelRightClose, PanelRightOpen } from "lucide-react";
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const stageRef = useRef<HTMLDivElement>(null);

  // Hydrate from localStorage (written by /research) or fall back to canned.
  // We also reject any cached lecture whose slides don't have an `audio` URL
  // — that means it was persisted before the ElevenLabs narration shipped,
  // and using it would leave the voice dock silent.
  useEffect(() => {
    let parsed: Lecture | null = null;
    try {
      const raw = localStorage.getItem("lecture");
      if (raw) {
        const candidate = JSON.parse(raw) as Lecture;
        const hasAudio = candidate.slides?.every((s) => typeof s.audio === "string");
        if (hasAudio) {
          parsed = candidate;
        } else {
          // Replace the stale cache with the up-to-date version so future
          // visits don't keep falling through this branch.
          try {
            localStorage.setItem("lecture", JSON.stringify(mockLecture));
          } catch {
            // best-effort
          }
        }
      }
    } catch {
      parsed = null;
    }
    setLecture(parsed ?? mockLecture);
  }, []);

  const total = lecture?.slides.length ?? 0;
  const slide = lecture?.slides[currentSlide];
  const speakerNotes = slide?.speaker_notes ?? slide?.title ?? "";
  const audioSrc = slide?.audio;

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
      const target = e.target as HTMLElement | null;
      const isFormField =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (isFormField) return;
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        next();
      }
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
    setTranscript((p) => [...p, ...entries]);
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

  const progress = total > 0 ? (currentSlide + 1) / total : 0;

  return (
    <main
      className="h-screen w-screen overflow-hidden bg-ink text-paper grid"
      style={{
        gridTemplateColumns: sidebarOpen ? "minmax(0, 1fr) 340px" : "minmax(0, 1fr)",
        // Pin the grid row to exactly the viewport height. Without this the
        // implicit `auto` row will grow if any descendant's intrinsic
        // min-height exceeds the viewport, which silently pushes the voice
        // dock below the fold.
        gridTemplateRows: "100vh",
      }}
    >
      {/* Stage column */}
      <div className="relative flex flex-col h-full min-h-0 min-w-0">
        {/* Header */}
        <header className="shrink-0 px-6 py-3.5 border-b border-rule flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href="/"
              className="font-mono text-[10px] tracking-widest uppercase text-paper-subtle hover:text-paper transition-colors flex items-center gap-2 shrink-0"
            >
              <Home className="w-3.5 h-3.5" /> AdaptEd
            </Link>
            <span className="text-paper-subtle/40">/</span>
            <div className="min-w-0 hidden sm:block">
              <div className="font-mono text-[9px] tracking-widest uppercase text-paper-subtle leading-none mb-1">
                Now lecturing
              </div>
              <div className="font-display italic text-base tracking-tighter text-paper truncate leading-none">
                {lecture.title}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <span className="hidden md:inline-flex items-center gap-3 font-mono text-[10px] tracking-widest uppercase text-paper-subtle">
              <span className="tabular-nums text-paper">
                {String(currentSlide + 1).padStart(2, "0")}
              </span>
              <span className="opacity-50">/</span>
              <span className="tabular-nums">{String(total).padStart(2, "0")}</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Previous slide"
                onClick={prev}
                disabled={currentSlide === 0}
                className="w-8 h-8 rounded-full border border-rule flex items-center justify-center text-paper-muted hover:text-paper hover:border-violet-core/50 disabled:opacity-25 disabled:hover:text-paper-muted disabled:hover:border-rule transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={next}
                disabled={currentSlide === total - 1}
                className="w-8 h-8 rounded-full border border-rule flex items-center justify-center text-paper-muted hover:text-paper hover:border-violet-core/50 disabled:opacity-25 disabled:hover:text-paper-muted disabled:hover:border-rule transition-all"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              type="button"
              aria-label={sidebarOpen ? "Hide transcript" : "Show transcript"}
              onClick={() => setSidebarOpen((o) => !o)}
              className="w-8 h-8 rounded-full border border-rule flex items-center justify-center text-paper-muted hover:text-paper hover:border-violet-core/50 transition-all"
              title={sidebarOpen ? "Hide transcript" : "Show transcript"}
            >
              {sidebarOpen ? (
                <PanelRightClose className="w-3.5 h-3.5" />
              ) : (
                <PanelRightOpen className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </header>

        {/* Progress hairline */}
        <div className="shrink-0 h-px bg-rule relative overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-violet-soft to-violet-deep transition-[width] duration-500 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* Stage */}
        <div
          ref={stageRef}
          className="flex-1 min-h-0 min-w-0 p-4 md:p-6 lg:p-8 grid place-items-center overflow-hidden"
          style={{ containerType: "size" }}
        >
          <div
            className="relative max-w-[1500px] overflow-hidden"
            style={{
              // Fit a 16:9 box inside the stage container, scaling to whichever
              // dimension is binding. Uses container query units so it adapts
              // when the sidebar toggles. `overflow: hidden` is critical here:
              // CSS `aspect-ratio` is a hint that content can override, so
              // without clipping a tall slide can push this box to grow and
              // shove the voice dock below the viewport.
              width: "min(100cqw, calc(100cqh * 16 / 9))",
              aspectRatio: "16 / 9",
            }}
          >
            <Slideshow lecture={lecture} currentIndex={currentSlide} />
          </div>
        </div>

        {/* Voice dock */}
        <section className="shrink-0 border-t border-rule px-6 py-3.5 bg-ink-surface/60 backdrop-blur-sm">
          <MockVoice
            speakerNotes={speakerNotes}
            audioSrc={audioSrc}
            slideIndex={currentSlide}
            totalSlides={total}
            onAutoAdvance={next}
            onAction={onAction}
            onTranscript={appendTranscript}
          />
        </section>
      </div>

      {/* Transcript column */}
      {sidebarOpen && <Sidebar messages={transcript} />}
    </main>
  );
}

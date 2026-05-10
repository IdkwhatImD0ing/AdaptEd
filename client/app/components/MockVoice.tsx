"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Pause, Play } from "lucide-react";
import { motion } from "motion/react";
import { scriptedPrompts, type ScriptedPrompt } from "../lib/mockTranscript";
import type { TranscriptEntry } from "../lib/types";

type Props = {
  /** The text the agent should narrate for the current slide. */
  speakerNotes: string;
  /** Pre-rendered ElevenLabs narration for the current slide. */
  audioSrc?: string;
  /** Slide index to keep the speech keyed by (so changing slides re-narrates). */
  slideIndex: number;
  /** Total slides — auto-advance is disabled on the last slide. */
  totalSlides: number;
  /** Called when the agent finishes narrating and wants to advance. */
  onAutoAdvance: () => void;
  /** Imperative slide control invoked by scripted prompt actions. */
  onAction: (action: ScriptedPrompt["action"]) => void;
  /** Append entries to the running transcript. */
  onTranscript: (entries: TranscriptEntry[]) => void;
};

type Status = "idle" | "speaking" | "paused" | "listening";

/**
 * Plays the pre-generated ElevenLabs narration that ships with the app
 * under `/public/audio`. Replaces the original `window.speechSynthesis`
 * mock so the showcase has a consistent, broadcast-grade voice on every
 * device. The component still owns slide auto-advance, scripted prompt
 * interrupts, and pause/mute, just driven by an HTMLAudioElement.
 */
export default function MockVoice({
  speakerNotes,
  audioSrc,
  slideIndex,
  totalSlides,
  onAutoAdvance,
  onAction,
  onTranscript,
}: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [muted, setMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSpokenSlide = useRef<number>(-1);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Bumped on every play() call so racing 'ended' / 'error' callbacks from
  // an aborted clip can't fire onEnd against the wrong slide.
  const playTokenRef = useRef(0);

  const cancelPendingAdvance = () => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  };

  // SSR-safe: Audio is a browser-only constructor.
  const supported = useMemo(() => typeof window !== "undefined" && "Audio" in window, []);

  // Lazy-construct one shared <audio> element. Reusing the same element
  // across clips means the browser keeps a single decoder warm and avoids
  // the "first play needs user gesture" gotcha after the initial start.
  const ensureAudio = (): HTMLAudioElement | null => {
    if (!supported) return null;
    if (!audioRef.current) {
      const a = new Audio();
      a.preload = "auto";
      audioRef.current = a;
    }
    return audioRef.current;
  };

  const stopCurrent = () => {
    cancelPendingAdvance();
    const a = audioRef.current;
    if (a) {
      a.onended = null;
      a.onerror = null;
      a.onpause = null;
      a.onplay = null;
      try {
        a.pause();
      } catch {
        // ignore — pause() can throw if the element is in a teardown state
      }
      a.removeAttribute("src");
      a.load();
    }
    // Invalidate any in-flight onEnd from the previous play call.
    playTokenRef.current += 1;
  };

  const play = (src: string | undefined, opts?: { onEnd?: () => void }) => {
    cancelPendingAdvance();
    const a = ensureAudio();
    // No audio element (SSR) or muted → fall through to the onEnd contract
    // immediately so callers (auto-advance, scripted-prompt actions) still
    // resolve. We schedule it in a microtask to mirror the async shape of
    // a real ended event.
    if (!a || muted || !src) {
      const token = ++playTokenRef.current;
      Promise.resolve().then(() => {
        if (playTokenRef.current === token) opts?.onEnd?.();
      });
      return;
    }
    // Detach handlers from any previous clip before we point at a new src,
    // otherwise a stale 'ended' from the prior play resolves twice.
    a.onended = null;
    a.onerror = null;
    a.onpause = null;
    a.onplay = null;

    const token = ++playTokenRef.current;
    a.src = src;
    a.currentTime = 0;
    a.muted = muted;
    a.onplay = () => {
      if (playTokenRef.current !== token) return;
      setStatus("speaking");
    };
    a.onpause = () => {
      // Distinguish a user-initiated pause (mid-clip) from natural end:
      // if the clip is still loaded and not yet ended, treat as paused.
      if (playTokenRef.current !== token) return;
      if (!a.ended) setStatus("paused");
    };
    const finish = () => {
      if (playTokenRef.current !== token) return;
      setStatus("idle");
      opts?.onEnd?.();
    };
    a.onended = finish;
    a.onerror = finish;
    const p = a.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        // Autoplay can be blocked until a user gesture has happened. The
        // first interaction is the explicit start button so this rarely
        // hits, but if it does we still need to honor the onEnd contract
        // so the slide-show doesn't hang.
        finish();
      });
    }
  };

  // Re-narrate when the slide changes, only after the user has clicked start.
  useEffect(() => {
    if (!hasStarted) return;
    if (lastSpokenSlide.current === slideIndex) return;
    lastSpokenSlide.current = slideIndex;
    if (!speakerNotes) return;

    onTranscript([
      { role: "agent", content: speakerNotes, timestamp: Date.now() },
    ]);

    // Keep each slide on screen for a beat even if narration finishes early
    // (e.g. user is muted, or the audio file failed to load).
    const startedAt = Date.now();
    const MIN_DWELL_MS = 4000;

    play(audioSrc, {
      onEnd: () => {
        if (slideIndex + 1 < totalSlides) {
          const elapsed = Date.now() - startedAt;
          const wait = Math.max(800, MIN_DWELL_MS - elapsed);
          advanceTimerRef.current = setTimeout(() => {
            advanceTimerRef.current = null;
            onAutoAdvance();
          }, wait);
        }
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideIndex, hasStarted, speakerNotes, audioSrc]);

  useEffect(() => {
    return () => {
      stopCurrent();
    };
  }, []);

  // Reflect the mute toggle on the live element if a clip is mid-play.
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  const handleStart = () => {
    if (!hasStarted) {
      // Reset the dedupe ref so the slide-change effect picks up slide 0
      // and handles narration + transcript appending. This avoids a duplicate
      // entry that previously came from doing the work in two places.
      lastSpokenSlide.current = -1;
      setHasStarted(true);
      // Touch the audio element under a user gesture so subsequent plays
      // don't run into autoplay restrictions on Safari/Chrome.
      ensureAudio();
      return;
    }
    const a = audioRef.current;
    if (status === "speaking" && a) {
      a.pause();
      // status flips to 'paused' via the onpause handler.
    } else if (status === "paused" && a) {
      a.play().catch(() => setStatus("idle"));
      setStatus("speaking");
    } else {
      // Idle → re-narrate the current slide without re-appending to transcript.
      if (audioSrc) play(audioSrc);
    }
  };

  const handlePrompt = (p: ScriptedPrompt) => {
    if (!supported) return;
    // Tear down any in-flight narration so its callbacks can't race the
    // user's interrupt: cancel audio, clear pending advance, invalidate
    // play token so the abandoned onEnd never fires.
    stopCurrent();
    onTranscript([
      { role: "user", content: p.user, timestamp: Date.now() },
    ]);
    setStatus("listening");
    setTimeout(() => {
      onTranscript([
        { role: "agent", content: p.agent, timestamp: Date.now() },
      ]);
      play(p.audio, {
        onEnd: () => {
          if (p.action) onAction(p.action);
        },
      });
    }, 500);
  };

  const ringActive = status === "speaking" || status === "listening";

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Mic + state + scripted chips, all on one row */}
      <div className="flex items-center gap-4 flex-wrap">
        <button
          type="button"
          onClick={handleStart}
          aria-label={hasStarted ? "Toggle narration" : "Start narration"}
          className="relative w-12 h-12 shrink-0 rounded-full flex items-center justify-center group"
        >
          {ringActive && (
            <>
              <span className="absolute inset-0 rounded-full border border-violet-core animate-pulse-ring" />
              <span
                className="absolute inset-0 rounded-full border border-violet-soft animate-pulse-ring"
                style={{ animationDelay: "0.6s" }}
              />
              <span
                className="absolute inset-0 rounded-full border border-violet-deep animate-pulse-ring"
                style={{ animationDelay: "1.2s" }}
              />
            </>
          )}
          <span
            className="relative z-10 w-full h-full rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, #c700e7 0%, #6303ff 100%)",
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.18) inset, 0 10px 24px -8px rgba(159,3,254,0.55)",
            }}
          >
            {!hasStarted ? (
              <Play className="w-4 h-4 text-paper translate-x-[1px]" strokeWidth={1.8} fill="currentColor" />
            ) : status === "speaking" ? (
              <Pause className="w-4 h-4 text-paper" strokeWidth={1.8} />
            ) : (
              <Mic className="w-4 h-4 text-paper" strokeWidth={1.8} />
            )}
          </span>
        </button>

        <div className="min-w-0 mr-auto">
          <div className="font-mono text-[9px] tracking-widest uppercase text-paper-subtle leading-none mb-1">
            {!hasStarted
              ? "Tap to start the lecture"
              : status === "speaking"
              ? "Lecturer speaking"
              : status === "paused"
              ? "Paused"
              : status === "listening"
              ? "Listening"
              : "Idle — interrupt anytime"}
          </div>
          <div className="font-display italic text-base md:text-lg tracking-tighter text-paper truncate leading-tight">
            {hasStarted ? "AdaptEd Voice" : "Press to begin"}
          </div>
        </div>

        {/* Inline scripted chips when active — uses short labels */}
        {hasStarted && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="hidden xl:flex items-center gap-1.5 shrink-0"
          >
            {scriptedPrompts.slice(0, 3).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePrompt(p)}
                className="text-xs font-sans text-paper-muted hover:text-paper bg-ink-elevated/60 hover:bg-ink-elevated border border-rule hover:border-violet-core/40 rounded-full px-3 py-1.5 transition-all whitespace-nowrap"
              >
                {p.label}
              </button>
            ))}
          </motion.div>
        )}

        <button
          type="button"
          onClick={() => {
            setMuted((m) => {
              const next = !m;
              if (audioRef.current) audioRef.current.muted = next;
              return next;
            });
          }}
          className="text-[10px] font-mono tracking-widest uppercase text-paper-subtle hover:text-paper px-3 py-1.5 border border-rule hover:border-violet-core/40 rounded-full transition-all"
          title={muted ? "Unmute narration" : "Mute narration"}
        >
          {muted ? "Sound off" : "Sound on"}
        </button>
      </div>

      {/* Below xl: chips on second row using short labels for compactness */}
      {hasStarted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="xl:hidden flex flex-wrap gap-1.5"
        >
          {scriptedPrompts.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePrompt(p)}
              title={p.user}
              className="text-xs font-sans text-paper-muted hover:text-paper bg-ink-elevated/60 hover:bg-ink-elevated border border-rule hover:border-violet-core/40 rounded-full px-2.5 py-1 transition-all whitespace-nowrap"
            >
              {p.label}
            </button>
          ))}
        </motion.div>
      )}

      {!supported && (
        <div className="font-mono text-[10px] text-paper-subtle">
          Note: this browser does not support HTMLAudioElement. Narration is silent.
        </div>
      )}
    </div>
  );
}

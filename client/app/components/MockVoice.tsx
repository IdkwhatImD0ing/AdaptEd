"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Pause, Play } from "lucide-react";
import { motion } from "motion/react";
import { scriptedPrompts, type ScriptedPrompt } from "../lib/mockTranscript";
import type { TranscriptEntry } from "../lib/types";

type Props = {
  /** The text the agent should narrate for the current slide. */
  speakerNotes: string;
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
 * Browser-only stand-in for the Retell + GPT-3.5 voice loop the original
 * LA Hacks build used. We use the Web Speech Synthesis API to read the
 * slide's speaker notes aloud, then auto-advance. Scripted prompt chips
 * simulate the conversational interrupt feature.
 */
export default function MockVoice({
  speakerNotes,
  slideIndex,
  totalSlides,
  onAutoAdvance,
  onAction,
  onTranscript,
}: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [muted, setMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastSpokenSlide = useRef<number>(-1);

  const supported = useMemo(
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    []
  );

  /** Pick a non-default English voice if available — Apple's "Samantha" or
   *  Google's "UK English Female" sound less robotic than the default. */
  const pickVoice = (): SpeechSynthesisVoice | null => {
    if (!supported) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    const preferred = [
      /Samantha/i,
      /Google UK English Female/i,
      /Microsoft Aria/i,
      /Karen/i,
      /Moira/i,
      /en-GB/i,
    ];
    for (const re of preferred) {
      const v = voices.find((v) => re.test(v.name) || re.test(v.lang));
      if (v) return v;
    }
    return voices.find((v) => v.lang.startsWith("en")) ?? voices[0];
  };

  const speak = (text: string, opts?: { onEnd?: () => void; isAgent?: boolean }) => {
    if (!supported || muted) {
      opts?.onEnd?.();
      return;
    }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    const voice = pickVoice();
    if (voice) utt.voice = voice;
    utt.rate = 0.98;
    utt.pitch = 1.05;
    utt.volume = 0.9;
    utt.onstart = () => setStatus("speaking");
    utt.onend = () => {
      setStatus("idle");
      opts?.onEnd?.();
    };
    utt.onerror = () => {
      setStatus("idle");
      opts?.onEnd?.();
    };
    utteranceRef.current = utt;
    window.speechSynthesis.speak(utt);
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

    speak(speakerNotes, {
      isAgent: true,
      onEnd: () => {
        if (slideIndex + 1 < totalSlides) {
          // Small breath between slides
          setTimeout(() => onAutoAdvance(), 800);
        }
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideIndex, hasStarted, speakerNotes]);

  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  const handleStart = () => {
    if (!hasStarted) {
      setHasStarted(true);
      // Force re-trigger of the speak effect
      lastSpokenSlide.current = -1;
      // Defer one tick so React re-renders
      setTimeout(() => {
        onTranscript([
          { role: "agent", content: speakerNotes, timestamp: Date.now() },
        ]);
        speak(speakerNotes, {
          isAgent: true,
          onEnd: () => {
            if (slideIndex + 1 < totalSlides) {
              setTimeout(() => onAutoAdvance(), 800);
            }
          },
        });
      }, 50);
      return;
    }
    if (status === "speaking") {
      window.speechSynthesis.pause();
      setStatus("paused");
    } else if (status === "paused") {
      window.speechSynthesis.resume();
      setStatus("speaking");
    } else {
      // re-narrate current slide
      if (speakerNotes) speak(speakerNotes);
    }
  };

  const handlePrompt = (p: ScriptedPrompt) => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    onTranscript([
      { role: "user", content: p.user, timestamp: Date.now() },
    ]);
    setStatus("listening");
    setTimeout(() => {
      onTranscript([
        { role: "agent", content: p.agent, timestamp: Date.now() },
      ]);
      speak(p.agent, {
        isAgent: true,
        onEnd: () => {
          if (p.action) onAction(p.action);
        },
      });
    }, 500);
  };

  const ringActive = status === "speaking" || status === "listening";

  return (
    <div className="w-full">
      {/* Mic + state */}
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={handleStart}
          aria-label={hasStarted ? "Toggle narration" : "Start narration"}
          className="relative w-16 h-16 shrink-0 rounded-full flex items-center justify-center group"
        >
          {/* pulse rings */}
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
                "0 0 0 1px rgba(255,255,255,0.18) inset, 0 12px 32px -8px rgba(159,3,254,0.6)",
            }}
          >
            {!hasStarted ? (
              <Play className="w-5 h-5 text-paper" strokeWidth={1.6} />
            ) : status === "speaking" ? (
              <Pause className="w-5 h-5 text-paper" strokeWidth={1.6} />
            ) : (
              <Mic className="w-5 h-5 text-paper" strokeWidth={1.6} />
            )}
          </span>
        </button>

        <div className="flex-1 min-w-0">
          <div className="font-mono text-[10px] tracking-widest uppercase text-paper-subtle mb-1">
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
          <div className="font-display italic text-xl md:text-2xl tracking-tighter text-paper truncate">
            {hasStarted ? "AdaptEd Voice" : "Press to begin"}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (supported) window.speechSynthesis.cancel();
            setMuted((m) => !m);
            setStatus("idle");
          }}
          className="btn-ghost text-xs"
          title={muted ? "Unmute narration" : "Mute narration"}
        >
          {muted ? "Sound off" : "Sound on"}
        </button>
      </div>

      {/* Scripted prompt chips */}
      {hasStarted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <div className="font-mono text-[10px] tracking-widest uppercase text-paper-subtle mb-3">
            Or interrupt with —
          </div>
          <div className="flex flex-wrap gap-2">
            {scriptedPrompts.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePrompt(p)}
                className="text-left text-sm font-sans text-paper-muted hover:text-paper bg-ink-elevated/60 hover:bg-ink-elevated border border-rule hover:border-violet-core/40 rounded-full px-3.5 py-2 transition-all"
              >
                <span className="text-paper-subtle">"</span>
                {p.user}
                <span className="text-paper-subtle">"</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {!supported && (
        <div className="mt-4 font-mono text-[10px] text-paper-subtle">
          Note: this browser does not support the Web Speech API. Narration is silent.
        </div>
      )}
    </div>
  );
}

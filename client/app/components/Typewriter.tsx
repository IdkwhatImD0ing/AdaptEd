"use client";
import { useEffect, useState } from "react";

/**
 * Tiny replacement for react-type-animation. Cycles through a list of phrases,
 * typing each one, holding for `holdMs`, then deleting and moving on.
 */
export default function Typewriter({
  phrases,
  typeSpeedMs = 55,
  deleteSpeedMs = 30,
  holdMs = 2200,
  className,
}: {
  phrases: string[];
  typeSpeedMs?: number;
  deleteSpeedMs?: number;
  holdMs?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "hold" | "deleting">("typing");

  useEffect(() => {
    const phrase = phrases[index];
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (text.length < phrase.length) {
        timeout = setTimeout(() => setText(phrase.slice(0, text.length + 1)), typeSpeedMs);
      } else {
        timeout = setTimeout(() => setPhase("hold"), holdMs);
      }
    } else if (phase === "hold") {
      timeout = setTimeout(() => setPhase("deleting"), 100);
    } else {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(phrase.slice(0, text.length - 1)), deleteSpeedMs);
      } else {
        setIndex((i) => (i + 1) % phrases.length);
        setPhase("typing");
      }
    }

    return () => clearTimeout(timeout);
  }, [text, phase, index, phrases, typeSpeedMs, deleteSpeedMs, holdMs]);

  return (
    <span className={className}>
      {text}
      <span
        aria-hidden
        className="inline-block w-[2px] h-[0.85em] bg-current ml-1 align-middle animate-pulse"
      />
    </span>
  );
}

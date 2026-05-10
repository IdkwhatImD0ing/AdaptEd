"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import NavBar from "../components/NavBar";
import { mockLecture } from "../lib/mockLecture";

type Task = {
  id: string;
  label: string;
  source: string;
  durationMs: number;
};

const TASKS: Task[] = [
  {
    id: "wiki",
    label: "Reading Wikipedia",
    source: "en.wikipedia.org",
    durationMs: 1100,
  },
  {
    id: "yt",
    label: "Watching a YouTube lecture",
    source: "youtube.com — Abdul Bari · 2hr 31m",
    durationMs: 1400,
  },
  {
    id: "img",
    label: "Selecting visuals",
    source: "Serper image search · GPT-4o descriptions",
    durationMs: 1100,
  },
  {
    id: "draft",
    label: "Drafting the slide deck",
    source: "Gemini 1.5 Pro · 8 slide aggregator prompt",
    durationMs: 1500,
  },
];

function ResearchInner() {
  const router = useRouter();
  const search = useSearchParams();
  const topic = search.get("topic") ?? "Red-Black Trees";
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let idx = 0;

    function tick() {
      if (cancelled) return;
      if (idx >= TASKS.length) {
        // Persist the canned lecture and route to viewer
        try {
          localStorage.setItem("lecture", JSON.stringify(mockLecture));
          localStorage.setItem("topic", topic);
        } catch {
          // ignore — we still have a fallback in the lecture page
        }
        router.push("/lecture");
        return;
      }
      setActiveIndex(idx);
      const t = TASKS[idx];
      idx += 1;
      setTimeout(tick, t.durationMs);
    }

    const start = setTimeout(tick, 400);
    return () => {
      cancelled = true;
      clearTimeout(start);
    };
  }, [router, topic]);

  return (
    <main className="min-h-screen mesh-soft grain text-paper relative">
      <NavBar variant="minimal" />

      <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-20 pt-28 pb-16">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-12 gap-10 items-start">
          <div className="col-span-12 md:col-span-5 sticky md:top-32">
            <div className="chip mb-6">
              <span className="text-violet-core">●</span> Researching
            </div>
            <h1
              className="font-display leading-[0.92] text-balance"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.25rem)", letterSpacing: "-0.04em" }}
            >
              Gathering everything we can find on{" "}
              <span
                className="font-display italic text-violet-gradient"
                style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 100" }}
              >
                {topic}
              </span>
              .
            </h1>
            <p className="mt-6 font-sans text-paper-muted text-base md:text-lg leading-relaxed text-pretty max-w-md">
              The lecturer is reading, watching, and looking — pulling from
              several sources at once and stitching them into a single deck.
              This usually takes about thirty seconds.
            </p>

            <div className="mt-10 font-mono text-[10px] tracking-widest uppercase text-paper-subtle">
              Step 02 / 03
            </div>
          </div>

          <div className="col-span-12 md:col-span-7">
            <ol className="relative border-l border-rule pl-8 space-y-10">
              {TASKS.map((t, i) => {
                const status =
                  i < activeIndex ? "done" : i === activeIndex ? "active" : "pending";
                return (
                  <li key={t.id} className="relative">
                    {/* Marker */}
                    <span
                      className={`absolute -left-[2.6rem] top-1.5 w-4 h-4 rounded-full border ${
                        status === "active"
                          ? "border-violet-core bg-violet-core/20"
                          : status === "done"
                          ? "border-violet-deep bg-violet-deep/40"
                          : "border-rule bg-ink-surface"
                      }`}
                    >
                      {status === "active" && (
                        <span className="absolute inset-0 rounded-full border border-violet-core animate-pulse-ring" />
                      )}
                    </span>

                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="marker-num text-2xl">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3
                        className={`font-display tracking-tighter text-2xl md:text-3xl transition-colors duration-300 ${
                          status === "active"
                            ? "text-paper"
                            : status === "done"
                            ? "text-paper-muted"
                            : "text-paper-subtle"
                        }`}
                      >
                        {t.label}
                      </h3>
                    </div>
                    <div className="font-mono text-[10px] tracking-widest uppercase text-paper-subtle">
                      {t.source}
                    </div>

                    <AnimatePresence>
                      {status === "active" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4 }}
                          className="mt-4 overflow-hidden"
                        >
                          <div className="h-[2px] w-full bg-rule overflow-hidden">
                            <motion.div
                              initial={{ width: "0%" }}
                              animate={{ width: "100%" }}
                              transition={{
                                duration: t.durationMs / 1000,
                                ease: "easeInOut",
                              }}
                              className="h-full bg-gradient-to-r from-violet-soft to-violet-deep"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function ResearchPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-ink" />}>
      <ResearchInner />
    </Suspense>
  );
}

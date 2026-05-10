"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Sparkles, ArrowRight } from "lucide-react";
import NavBar from "../components/NavBar";

const SUGGESTED = [
  "Red-Black Trees",
  "Transformer attention",
  "The Krebs cycle",
  "Phenomenology",
  "CRDTs",
  "Bayesian priors",
];

export default function InputPage() {
  const [topic, setTopic] = useState("Red-Black Trees");
  const router = useRouter();

  const submit = () => {
    const t = topic.trim() || "Red-Black Trees";
    router.push(`/research?topic=${encodeURIComponent(t)}`);
  };

  return (
    <main className="min-h-screen mesh grain text-paper relative overflow-hidden">
      <NavBar variant="minimal" />

      <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-20 pt-32 pb-16">
        <div className="max-w-5xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-10"
          >
            <span className="chip">
              <span className="text-violet-core">●</span> Topic
            </span>
            <span className="font-mono text-[10px] tracking-widest uppercase text-paper-subtle">
              Step 01 / 03
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-display leading-[0.92] text-balance"
            style={{
              fontSize: "clamp(2.75rem, 7.5vw, 7rem)",
              letterSpacing: "-0.045em",
            }}
          >
            <span className="text-paper">Teach me </span>
            <span
              className="font-display italic text-violet-gradient"
              style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 100" }}
            >
              about—
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
            className="mt-12 group"
          >
            <div className="relative border-b border-rule focus-within:border-violet-core transition-colors duration-300">
              <input
                autoFocus
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="anything you want to learn"
                className="w-full bg-transparent font-display text-paper placeholder:text-paper-subtle outline-none py-6 text-3xl md:text-5xl lg:text-6xl tracking-tighter italic"
                style={{ fontVariationSettings: "'opsz' 96, 'SOFT' 80" }}
                aria-label="Lecture topic"
              />
              <button
                type="button"
                onClick={submit}
                aria-label="Generate lecture"
                className="absolute right-0 bottom-4 md:bottom-6 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                style={{
                  background: "radial-gradient(circle at 30% 30%, #c700e7 0%, #6303ff 100%)",
                  boxShadow:
                    "0 0 0 1px rgba(255,255,255,0.18) inset, 0 14px 32px -8px rgba(159,3,254,0.6)",
                }}
              >
                <ArrowRight className="w-5 h-5 text-paper" strokeWidth={1.6} />
              </button>
            </div>
            <div className="mt-3 font-mono text-[10px] tracking-widest uppercase text-paper-subtle">
              ↵ Press enter to begin
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-16"
          >
            <div className="font-mono text-[10px] tracking-widest uppercase text-paper-subtle mb-4">
              Or start with a suggestion
            </div>
            <div className="flex flex-wrap gap-2.5">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setTopic(s);
                  }}
                  className={`text-sm font-sans rounded-full px-4 py-2 border transition-all ${
                    topic === s
                      ? "border-violet-core text-paper bg-violet-core/10"
                      : "border-rule text-paper-muted hover:text-paper hover:border-violet-core/40"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-20 max-w-xl"
          >
            <div className="border-l-2 border-violet-core/40 pl-5">
              <div className="font-mono text-[10px] tracking-widest uppercase text-violet-core mb-2">
                Heads up — mocked demo
              </div>
              <p className="font-sans text-paper-muted text-sm leading-relaxed text-pretty">
                The original AdaptEd called Gemini, Retell, and Serper to
                research any topic in real time. This frontend showcase routes
                every topic to the same canned <span className="text-paper">Red-Black Trees</span> lecture
                — typing something else still works, the loading screen will
                play through, but the slides are pre-baked.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

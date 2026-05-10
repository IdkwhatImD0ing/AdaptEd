import Link from "next/link";
import { ArrowUpRight, Sparkles, Mic, MessagesSquare, Eye } from "lucide-react";
import NavBar from "./components/NavBar";
import Typewriter from "./components/Typewriter";
import YouTubeEmbed from "./components/YouTubeEmbed";

export default function Home() {
  return (
    <main className="min-h-screen mesh grain text-paper relative overflow-x-hidden">
      <NavBar variant="landing" />

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col justify-end pt-32 pb-24 px-6 md:px-12 lg:px-20">
        {/* Decorative giant numeral in the back */}
        <div
          aria-hidden
          className="absolute -top-24 -right-12 md:right-8 select-none pointer-events-none"
        >
          <span
            className="font-display italic font-thin block"
            style={{
              fontSize: "clamp(18rem, 32vw, 36rem)",
              lineHeight: 0.85,
              fontVariationSettings: "'opsz' 144, 'SOFT' 100",
              background:
                "linear-gradient(160deg, rgba(199,0,231,0.16) 0%, rgba(99,3,255,0.08) 50%, transparent 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: "-0.06em",
            }}
          >
            01
          </span>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-10 reveal">
            <span className="chip">
              <Sparkles className="w-3 h-3" /> Conversational learning
            </span>
            <span className="font-mono text-[10px] tracking-widest uppercase text-paper-subtle hidden md:inline">
              ⌗ LA Hacks 2024 — Google sponsor track
            </span>
          </div>

          <h1
            className="font-display text-paper leading-[0.88] text-balance reveal"
            style={{
              fontSize: "clamp(3.5rem, 9vw, 9rem)",
              animationDelay: "0.15s",
              letterSpacing: "-0.045em",
            }}
          >
            <span className="text-gradient">Lectures that</span>
            <br />
            <span className="font-display italic" style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 100" }}>
              talk back.
            </span>
          </h1>

          <div
            className="mt-10 max-w-2xl text-paper-muted text-pretty text-lg md:text-xl leading-relaxed reveal"
            style={{ animationDelay: "0.4s" }}
          >
            AdaptEd turns static teaching into a real-time conversation with an
            AI lecturer. The slides change as you ask. The pace bends to you.
            Not&nbsp;
            <Typewriter
              phrases={["textbooks.", "lectures.", "articles.", "slide decks."]}
              className="text-paper italic font-display"
            />
          </div>

          <div
            className="mt-12 flex flex-wrap items-center gap-4 reveal"
            style={{ animationDelay: "0.6s" }}
          >
            <Link href="/input" className="btn-primary">
              <Sparkles className="w-4 h-4" /> Try the mocked demo
            </Link>
            <a href="#demo" className="btn-ghost">
              Watch the original
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          {/* Marker rule */}
          <div
            className="mt-24 grid grid-cols-12 gap-4 items-end reveal"
            style={{ animationDelay: "0.9s" }}
          >
            <div className="col-span-12 md:col-span-5">
              <div className="font-mono text-[10px] tracking-widest uppercase text-paper-subtle">
                A note from the team
              </div>
              <div className="font-display italic text-2xl tracking-tighter text-paper-muted mt-2 text-pretty">
                "Instead of students adapting to the system,
                <br className="hidden md:inline" /> our AI lecturer adapts to students."
              </div>
            </div>
            <div className="hidden md:block col-span-7 border-t border-rule pb-2" />
          </div>
        </div>
      </section>

      {/* DEMO */}
      <section
        id="demo"
        className="relative px-6 md:px-12 lg:px-20 py-32 md:py-40 border-t border-rule"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-6 mb-10">
            <div className="col-span-12 md:col-span-2 marker-num text-7xl">02</div>
            <div className="col-span-12 md:col-span-7">
              <div className="chip mb-6">
                <span className="text-violet-core">●</span> Demo reel — 02:14
              </div>
              <h2
                className="font-display leading-[0.95] text-balance"
                style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", letterSpacing: "-0.04em" }}
              >
                The original cut, recorded the morning after we won.
              </h2>
            </div>
            <div className="hidden md:block col-span-3" />
          </div>

          <YouTubeEmbed videoId="8o1YJUFBcAw" title="AdaptEd — LA Hacks 2024 demo" />

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-[11px] tracking-widest uppercase text-paper-subtle">
            <div>
              <span className="text-paper">Stack</span> — Next.js · FastAPI · Gemini 1.5 Pro · Retell AI
            </div>
            <div>
              <span className="text-paper">Sponsor</span> — Google First Place
            </div>
            <div>
              <span className="text-paper">Built in</span> — 36 hours, Pauley Pavilion
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how"
        className="relative px-6 md:px-12 lg:px-20 py-32 md:py-40 border-t border-rule"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-6 mb-16">
            <div className="col-span-12 md:col-span-2 marker-num text-7xl">03</div>
            <div className="col-span-12 md:col-span-7">
              <div className="chip mb-6">Three things at once</div>
              <h2
                className="font-display leading-[0.95] text-balance"
                style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", letterSpacing: "-0.04em" }}
              >
                Listens, draws, watches.
              </h2>
              <p className="font-sans text-paper-muted text-lg md:text-xl mt-6 max-w-xl text-pretty">
                Three loops running in parallel. Each one was a different
                sponsor's sandbox. Together they made the lecturer feel alive.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <Feature
              num="i"
              icon={<Mic className="w-4 h-4" />}
              title="Responsive AI"
              kicker="Retell AI · Custom LLM URL"
              body="Real-time voice with end-of-turn detection. The lecturer can be interrupted at any point — it loses the thread gracefully and picks back up."
            />
            <Feature
              num="ii"
              icon={<MessagesSquare className="w-4 h-4" />}
              title="Dynamic content"
              kicker="Gemini 1.5 Pro · multi-source RAG"
              body="Slides and whiteboard regenerate in response to verbal cues. Wikipedia, YouTube transcripts, and image search feed the same context window."
            />
            <Feature
              num="iii"
              icon={<Eye className="w-4 h-4" />}
              title="Emotion detection"
              kicker="Hume · Intel Developer Cloud"
              body="A side channel watches attention and confusion. The lecturer pauses, slows down, or backtracks based on what it sees on your face."
            />
          </div>
        </div>
      </section>

      {/* ORIGIN */}
      <section
        id="origin"
        className="relative px-6 md:px-12 lg:px-20 py-32 md:py-40 border-t border-rule"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-2 marker-num text-7xl">04</div>
            <div className="col-span-12 md:col-span-7">
              <div className="chip mb-6">Origin</div>
              <h2
                className="font-display leading-[0.95] text-balance"
                style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)", letterSpacing: "-0.04em" }}
              >
                Built in 36 hours under the rafters of Pauley Pavilion.
              </h2>

              <div className="mt-10 space-y-6 font-sans text-paper-muted text-lg leading-relaxed text-pretty max-w-2xl">
                <p>
                  AdaptEd shipped at <span className="text-paper">LA Hacks 2024</span>{" "}
                  — UCLA's annual hackathon, the largest collegiate event in
                  Southern California. April 19–21, 705 hackers, sponsored by
                  Google, Intel, Retell AI, Fetch.ai, MongoDB, and a dozen more.
                </p>
                <p>
                  The original team won the{" "}
                  <span className="text-paper">Google First Place</span> sponsor
                  track. The thesis: of 16 million U.S. university students,
                  half are falling behind on static lectures while fewer than
                  three percent have access to a real tutor. So they built one
                  that talks back.
                </p>
                <p>
                  This page is a <span className="text-paper">frontend
                  showcase</span> of that build — the original FastAPI backend
                  is preserved in this repo as a historical artifact. The voice
                  loop in the demo here is mocked client-side via the Web
                  Speech API, but everything you see in the demo reel above is
                  real footage from the night of.
                </p>
              </div>

              <div className="mt-12 flex flex-wrap gap-4">
                <a
                  href="https://devpost.com/software/teachme-3p7bw1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                >
                  Read the Devpost <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://github.com/IdkwhatImD0ing/AdaptEd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                >
                  Original repo <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://la-hacks-2024.devpost.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                >
                  LA Hacks 2024 <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="col-span-12 md:col-span-3 md:col-start-10">
              <div className="border border-rule p-6 bg-ink-elevated/50 backdrop-blur-sm">
                <div className="font-mono text-[9px] tracking-widest uppercase text-paper-subtle mb-4">
                  Spec sheet
                </div>
                <SpecRow k="Event" v="LA Hacks 2024" />
                <SpecRow k="Dates" v="Apr 19–21, 2024" />
                <SpecRow k="Venue" v="Pauley Pavilion, UCLA" />
                <SpecRow k="Hackers" v="705" />
                <SpecRow k="Award" v="Google 1st Place" />
                <SpecRow k="Team size" v="6" />
                <SpecRow k="Sleep" v="≈ 4 hrs" />
              </div>

              <div className="mt-6 font-mono text-[10px] tracking-widest uppercase text-paper-subtle leading-relaxed">
                Originally branded "TeachMe" during the build, renamed to
                AdaptEd for submission.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 md:px-12 lg:px-20 py-16 border-t border-rule">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display italic text-3xl tracking-tighter">Adapt</span>
              <span className="font-display italic text-3xl tracking-tighter text-violet-gradient">Ed</span>
            </div>
            <div className="font-mono text-[10px] tracking-widest uppercase text-paper-subtle mt-2">
              MIT licensed · Built by 6 hackers, archived by one
            </div>
          </div>
          <Link href="/input" className="btn-primary">
            Try the demo <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </footer>
    </main>
  );
}

function Feature({
  num,
  icon,
  title,
  kicker,
  body,
}: {
  num: string;
  icon: React.ReactNode;
  title: string;
  kicker: string;
  body: string;
}) {
  return (
    <article className="col-span-12 md:col-span-4 group relative">
      <div className="border border-rule p-8 h-full bg-ink-surface/50 hover:bg-ink-surface transition-colors duration-500 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-20 -right-12 marker-num text-[10rem] opacity-50 group-hover:opacity-90 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-700"
        >
          {num}
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 text-violet-core mb-8">
            {icon}
            <span className="font-mono text-[9px] tracking-widest uppercase text-paper-subtle">
              {kicker}
            </span>
          </div>
          <h3 className="font-display text-paper text-3xl md:text-4xl tracking-tighter leading-tight mb-4">
            {title}
          </h3>
          <p className="font-sans text-paper-muted text-base leading-relaxed text-pretty">
            {body}
          </p>
        </div>
      </div>
    </article>
  );
}

function SpecRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-rule py-2.5 last:border-b-0">
      <span className="font-mono text-[10px] tracking-widest uppercase text-paper-subtle">
        {k}
      </span>
      <span className="font-sans text-sm text-paper">{v}</span>
    </div>
  );
}

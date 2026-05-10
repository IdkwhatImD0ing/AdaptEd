"use client";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import type { Lecture, Slide } from "../lib/types";
import SlideDiagram from "./Diagrams";

const enter = {
  initial: { opacity: 0, y: 14, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -10, filter: "blur(6px)" },
  transition: { duration: 0.5, ease: [0.22, 0.61, 0.36, 1] },
};

function SlideFrame({
  children,
  number,
  total,
}: {
  children: React.ReactNode;
  number: number;
  total: number;
}) {
  return (
    <motion.div
      key={`slide-${number}`}
      {...enter}
      // `absolute inset-0` instead of relative so an exiting slide can't
      // briefly stack on top of the entering one and push the layout taller
      // — the symptom shows up after a couple of auto-advances as the voice
      // dock sliding below the viewport.
      className="absolute inset-0 grain crop-marks bg-ink-surface scanlines flex flex-col"
    >
      <div className="absolute top-4 left-5 right-5 flex items-center justify-between font-mono text-[9px] tracking-widest uppercase text-paper-subtle z-20">
        <span>
          Slide {String(number).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <span className="text-violet-core">REC ●</span>
      </div>
      <div className="relative z-10 w-full h-full flex flex-col px-7 md:px-10 lg:px-12 pt-12 pb-9 md:pb-10 min-h-0">
        {children}
      </div>
    </motion.div>
  );
}

function SlideEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] tracking-widest uppercase text-violet-core mb-4 shrink-0">
      {children}
    </div>
  );
}

function SlideTitle({ children, size = "lg" }: { children: React.ReactNode; size?: "lg" | "xl" | "xxl" }) {
  const sizeStyle =
    size === "xxl"
      ? "clamp(2.25rem, 6vw, 5.25rem)"
      : size === "xl"
      ? "clamp(2rem, 4.4vw, 3.75rem)"
      : "clamp(1.5rem, 3vw, 2.75rem)";
  return (
    <h2
      className="font-display text-paper text-balance leading-[0.98] tracking-tighter"
      style={{ fontSize: sizeStyle }}
    >
      {children}
    </h2>
  );
}

function BulletText({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 mt-4">
      {items.map((t, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 + i * 0.07, duration: 0.35 }}
          className="flex gap-3 items-baseline"
        >
          <span className="font-mono text-[10px] text-paper-subtle tracking-widest pt-1 shrink-0">
            0{i + 1}
          </span>
          <span
            className="font-sans text-paper text-pretty leading-snug"
            style={{ fontSize: "clamp(0.85rem, 1vw, 1.05rem)" }}
          >
            {t}
          </span>
        </motion.li>
      ))}
    </ul>
  );
}

function Frame({
  slide,
  className,
}: {
  slide: Slide;
  className?: string;
}) {
  const showDiagram = !!slide.diagram;
  const img = !showDiagram ? slide.images?.[0] : undefined;
  return (
    <div
      className={`relative overflow-hidden border border-rule bg-ink-elevated ${className ?? ""}`}
    >
      <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.06] bg-[radial-gradient(ellipse_at_center,rgba(199,0,231,0.6),transparent_70%)]" />
      {/* Faint grid */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="g" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#g)" />
      </svg>
      <div className="relative z-10 w-full h-full p-4 md:p-5">
        {showDiagram ? (
          <SlideDiagram kind={slide.diagram!} />
        ) : img ? (
          <Image
            src={img.src}
            alt={img.description}
            fill
            className="object-contain p-3"
            unoptimized
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : null}
      </div>
    </div>
  );
}

function renderSlide(slide: Slide, eyebrow: string) {
  const t = slide.template_id;

  // TITLE slide
  if (t === 4) {
    return (
      <div className="flex-1 flex flex-col items-start justify-center min-h-0">
        <SlideEyebrow>{eyebrow}</SlideEyebrow>
        <h2
          className="font-display italic text-paper leading-[0.92] tracking-tighter text-balance"
          style={{
            fontSize: "clamp(2.75rem, 7vw, 6.5rem)",
            fontVariationSettings: "'opsz' 144, 'SOFT' 100",
          }}
        >
          {slide.title}
        </h2>
        <div className="mt-6 w-24 h-[2px] bg-gradient-to-r from-violet-soft to-violet-deep" />
        {slide.texts && (
          <div className="mt-6 max-w-xl font-sans text-paper-muted text-base md:text-lg text-pretty">
            {slide.texts[0]}
          </div>
        )}
      </div>
    );
  }

  const hasVisual = !!slide.diagram || !!slide.images?.[0];

  // Two column: text left, visual right
  if (t === 0) {
    return (
      <div className="flex-1 grid grid-cols-12 gap-8 items-center min-h-0">
        <div className="col-span-12 md:col-span-7 min-w-0">
          <SlideEyebrow>{eyebrow}</SlideEyebrow>
          <SlideTitle size="lg">{slide.title}</SlideTitle>
          {slide.texts && <BulletText items={slide.texts.slice(0, 3)} />}
        </div>
        {hasVisual && (
          <div className="col-span-12 md:col-span-5 h-full min-h-0">
            <Frame slide={slide} className="w-full h-full" />
          </div>
        )}
      </div>
    );
  }

  // Two column: visual left, text right
  if (t === 1) {
    return (
      <div className="flex-1 grid grid-cols-12 gap-8 items-center min-h-0">
        {hasVisual && (
          <div className="col-span-12 md:col-span-5 order-2 md:order-1 h-full min-h-0">
            <Frame slide={slide} className="w-full h-full" />
          </div>
        )}
        <div className="col-span-12 md:col-span-7 order-1 md:order-2 min-w-0">
          <SlideEyebrow>{eyebrow}</SlideEyebrow>
          <SlideTitle size="lg">{slide.title}</SlideTitle>
          {slide.texts && <BulletText items={slide.texts.slice(0, 3)} />}
        </div>
      </div>
    );
  }

  // Centered single point
  if (t === 2) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-3xl mx-auto min-h-0">
        <SlideEyebrow>{eyebrow}</SlideEyebrow>
        <SlideTitle size="xl">{slide.title}</SlideTitle>
        {slide.texts && (
          <ul className="mt-6 space-y-1.5 text-paper-muted text-base">
            {slide.texts.slice(0, 3).map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        )}
        {hasVisual && (
          <div className="mt-8 w-full max-w-lg aspect-[16/9]">
            <Frame slide={slide} className="w-full h-full" />
          </div>
        )}
      </div>
    );
  }

  // Title + wide visual underneath
  if (t === 8 && hasVisual) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <SlideEyebrow>{eyebrow}</SlideEyebrow>
        <SlideTitle size="lg">{slide.title}</SlideTitle>
        <div className="mt-5 flex-1 min-h-0">
          <Frame slide={slide} className="w-full h-full" />
        </div>
      </div>
    );
  }

  // Two column: visual left, bullets right
  if (t === 9 && hasVisual) {
    return (
      <div className="flex-1 grid grid-cols-12 gap-8 items-stretch min-h-0">
        <div className="col-span-12 md:col-span-6 min-h-0">
          <Frame slide={slide} className="w-full h-full" />
        </div>
        <div className="col-span-12 md:col-span-6 flex flex-col justify-center min-w-0">
          <SlideEyebrow>{eyebrow}</SlideEyebrow>
          <SlideTitle size="lg">{slide.title}</SlideTitle>
          {slide.texts && <BulletText items={slide.texts.slice(0, 5)} />}
        </div>
      </div>
    );
  }

  // Full bleed
  if (t === 11 && slide.images?.[0]) {
    return (
      <div className="absolute inset-0">
        <Image
          src={slide.images[0].src}
          alt={slide.images[0].description}
          fill
          unoptimized
          className="object-cover"
        />
      </div>
    );
  }

  // Fallback
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <SlideEyebrow>{eyebrow}</SlideEyebrow>
      <SlideTitle size="lg">{slide.title}</SlideTitle>
      {slide.texts && <BulletText items={slide.texts} />}
    </div>
  );
}

export default function Slideshow({
  lecture,
  currentIndex,
}: {
  lecture: Lecture;
  currentIndex: number;
}) {
  const slide = lecture.slides[currentIndex];
  const total = lecture.slides.length;
  if (!slide) return null;

  return (
    <div className="relative w-full h-full overflow-hidden border border-rule bg-ink-surface">
      <AnimatePresence mode="wait">
        <SlideFrame key={currentIndex} number={currentIndex + 1} total={total}>
          {renderSlide(slide, lecture.title)}
        </SlideFrame>
      </AnimatePresence>
    </div>
  );
}

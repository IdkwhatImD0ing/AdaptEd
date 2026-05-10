"use client";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import type { Lecture, Slide } from "../lib/types";

const enter = {
  initial: { opacity: 0, y: 16, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -16, filter: "blur(8px)" },
  transition: { duration: 0.55, ease: [0.22, 0.61, 0.36, 1] },
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
      className="relative w-full h-full grain crop-marks bg-ink-surface scanlines"
    >
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between font-mono text-[10px] tracking-widest uppercase text-paper-subtle z-20">
        <span>Slide {String(number).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
        <span className="text-violet-core">REC ●</span>
      </div>
      <div className="relative z-10 w-full h-full px-12 md:px-16 py-20 flex flex-col">
        {children}
      </div>
    </motion.div>
  );
}

function SlideTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-paper text-balance leading-[0.95] text-5xl md:text-6xl lg:text-7xl tracking-tighter">
      {children}
    </h2>
  );
}

function SlideEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] tracking-widest uppercase text-violet-core mb-5">
      {children}
    </div>
  );
}

function BulletText({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3 mt-6">
      {items.map((t, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
          className="flex gap-4 items-baseline"
        >
          <span className="font-mono text-[10px] text-paper-subtle tracking-widest pt-1">
            0{i + 1}
          </span>
          <span className="font-sans text-lg md:text-xl text-paper text-pretty leading-snug">
            {t}
          </span>
        </motion.li>
      ))}
    </ul>
  );
}

function Frame({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden border border-rule bg-ink-elevated ${className ?? ""}`}>
      <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.06] bg-[radial-gradient(ellipse_at_center,rgba(199,0,231,0.6),transparent_70%)]" />
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain p-4"
        unoptimized
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  );
}

function renderSlide(slide: Slide, eyebrow: string) {
  const t = slide.template_id;

  if (t === 4) {
    return (
      <div className="flex-1 flex flex-col items-start justify-end">
        <SlideEyebrow>{eyebrow}</SlideEyebrow>
        <h2 className="font-display italic text-paper leading-[0.92] text-7xl md:text-8xl lg:text-[9rem] tracking-tighter">
          {slide.title}
        </h2>
        <div className="mt-10 w-32 h-[2px] bg-gradient-to-r from-violet-soft to-violet-deep" />
      </div>
    );
  }

  if (t === 0) {
    return (
      <div className="flex-1 grid grid-cols-12 gap-10 items-center">
        <div className="col-span-12 md:col-span-7">
          <SlideEyebrow>{eyebrow}</SlideEyebrow>
          <SlideTitle>{slide.title}</SlideTitle>
          {slide.texts && <BulletText items={slide.texts.slice(0, 3)} />}
        </div>
        {slide.images?.[0] && (
          <div className="col-span-12 md:col-span-5">
            <Frame src={slide.images[0].src} alt={slide.images[0].description} className="aspect-[4/3]" />
          </div>
        )}
      </div>
    );
  }

  if (t === 1) {
    return (
      <div className="flex-1 grid grid-cols-12 gap-10 items-center">
        {slide.images?.[0] && (
          <div className="col-span-12 md:col-span-5 order-2 md:order-1">
            <Frame src={slide.images[0].src} alt={slide.images[0].description} className="aspect-[4/3]" />
          </div>
        )}
        <div className="col-span-12 md:col-span-7 order-1 md:order-2">
          <SlideEyebrow>{eyebrow}</SlideEyebrow>
          <SlideTitle>{slide.title}</SlideTitle>
          {slide.texts && <BulletText items={slide.texts.slice(0, 3)} />}
        </div>
      </div>
    );
  }

  if (t === 2) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
        <SlideEyebrow>{eyebrow}</SlideEyebrow>
        <h2 className="font-display text-paper text-balance leading-[0.96] text-5xl md:text-6xl tracking-tighter">
          {slide.title}
        </h2>
        {slide.texts && (
          <ul className="mt-8 space-y-2 text-paper-muted text-lg">
            {slide.texts.slice(0, 3).map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        )}
        {slide.images?.[0] && (
          <Frame
            src={slide.images[0].src}
            alt={slide.images[0].description}
            className="mt-10 w-full max-w-xl aspect-[16/9]"
          />
        )}
      </div>
    );
  }

  if (t === 8 && slide.images?.[0]) {
    return (
      <div className="flex-1 flex flex-col">
        <SlideEyebrow>{eyebrow}</SlideEyebrow>
        <SlideTitle>{slide.title}</SlideTitle>
        <Frame
          src={slide.images[0].src}
          alt={slide.images[0].description}
          className="mt-10 flex-1 w-full"
        />
      </div>
    );
  }

  if (t === 9 && slide.images?.[0]) {
    return (
      <div className="flex-1 grid grid-cols-12 gap-10 items-stretch">
        <div className="col-span-12 md:col-span-5">
          <Frame src={slide.images[0].src} alt={slide.images[0].description} className="h-full min-h-[60vh]" />
        </div>
        <div className="col-span-12 md:col-span-7 flex flex-col justify-center">
          <SlideEyebrow>{eyebrow}</SlideEyebrow>
          <SlideTitle>{slide.title}</SlideTitle>
          {slide.texts && <BulletText items={slide.texts.slice(0, 4)} />}
        </div>
      </div>
    );
  }

  if (t === 10) {
    return (
      <div className="flex-1 grid grid-cols-12 gap-6 items-stretch">
        {slide.images?.[0] && (
          <div className="col-span-12 md:col-span-8">
            <Frame src={slide.images[0].src} alt={slide.images[0].description} className="h-full min-h-[60vh]" />
          </div>
        )}
        <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
          {slide.images?.[1] && (
            <Frame src={slide.images[1].src} alt={slide.images[1].description} className="flex-1" />
          )}
          {slide.images?.[2] && (
            <Frame src={slide.images[2].src} alt={slide.images[2].description} className="flex-1" />
          )}
        </div>
      </div>
    );
  }

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

  return (
    <div className="flex-1 flex flex-col">
      <SlideEyebrow>{eyebrow}</SlideEyebrow>
      <SlideTitle>{slide.title}</SlideTitle>
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

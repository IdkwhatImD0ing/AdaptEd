"use client";
import Link from "next/link";
import { motion } from "motion/react";
import clsx from "clsx";

type Variant = "landing" | "minimal";

export default function NavBar({ variant = "landing" }: { variant?: Variant }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 0.61, 0.36, 1] }}
      className={clsx(
        "fixed top-0 left-0 right-0 z-50",
        "px-6 md:px-10 lg:px-14 py-5",
        "flex items-center justify-between",
        "backdrop-blur-md bg-[rgba(14,14,15,0.55)]",
        "border-b border-rule"
      )}
    >
      <Link href="/" className="flex items-baseline gap-2 group">
        <span className="font-display italic text-2xl tracking-tighter text-paper">
          Adapt
        </span>
        <span className="font-display italic text-2xl tracking-tighter text-violet-gradient">
          Ed
        </span>
        <span className="hidden md:inline-block ml-3 font-mono text-[10px] tracking-widest uppercase text-paper-subtle">
          v.2026
        </span>
      </Link>

      {variant === "landing" ? (
        <nav className="hidden md:flex items-center gap-9 font-mono text-[11px] tracking-widest uppercase text-paper-muted">
          <a href="#demo" className="underline-link hover:text-paper transition-colors">
            Demo
          </a>
          <a href="#how" className="underline-link hover:text-paper transition-colors">
            How it works
          </a>
          <a href="#origin" className="underline-link hover:text-paper transition-colors">
            Origin
          </a>
        </nav>
      ) : (
        <nav className="hidden md:flex items-center gap-6 font-mono text-[11px] tracking-widest uppercase text-paper-subtle">
          <span className="text-violet-core">●</span>
          <span>Mocked demo session</span>
        </nav>
      )}

      <Link
        href="/input"
        className="btn-ghost group"
        aria-label="Open the demo"
      >
        <span className="hidden sm:inline">Try it</span>
        <span className="font-mono text-[10px] tracking-widest text-paper-subtle group-hover:text-violet-core transition-colors">
          ↗
        </span>
      </Link>
    </motion.header>
  );
}

#!/usr/bin/env node
/**
 * Pre-generate MP3 narration with ElevenLabs for the showcase.
 *
 * Why this exists: the demo used to lean on `window.speechSynthesis`, which
 * gives a robotic, OS-dependent voice. We swap that out for a professional
 * cloned voice — but generating it in the browser at runtime would leak the
 * API key. So we render every line ahead of time and ship the MP3s as
 * static assets under `public/audio/`.
 *
 * Usage:
 *   ELEVENLABS_API_KEY=xxx node scripts/generate-audio.mjs
 *   ELEVENLABS_API_KEY=xxx node scripts/generate-audio.mjs --force
 *
 * Outputs:
 *   client/public/audio/slide-{N}.mp3       speaker_notes for each slide
 *   client/public/audio/prompt-{id}.mp3     each scripted prompt response
 *   client/public/audio/manifest.json       generation metadata
 */
import { mkdir, writeFile, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(HERE, "..", "public", "audio");

// "Sarah" — clean, warm, professional American female narrator. The voice
// IDs are stable ElevenLabs library voices; swap this if the brand voice
// shifts. Model `eleven_multilingual_v2` is the highest-fidelity option
// for English narration that doesn't require the v3 alpha access tier.
const VOICE_ID = "EXAVITQu4vr4xnSDxMaL";
const MODEL_ID = "eleven_multilingual_v2";
// 128 kbps mp3 is the highest format the free/starter ElevenLabs tier allows
// and is still indistinguishable from higher bitrates for spoken narration.
const OUTPUT_FORMAT = "mp3_44100_128";
const VOICE_SETTINGS = {
  stability: 0.45,
  similarity_boost: 0.75,
  style: 0.25,
  use_speaker_boost: true,
};

// Source of truth lives in mockLecture.ts / mockTranscript.ts. We mirror
// the exact strings here (rather than importing TS at runtime) so this
// script stays a zero-dependency Node module. If you change a line in the
// .ts files you must also update it here and re-run.
const SLIDES = [
  {
    id: "slide-0",
    text:
      "Welcome. Today we'll walk through red-black trees — a self-balancing binary search tree that powers most ordered maps in standard libraries. Interrupt me anytime if something needs a second pass.",
  },
  {
    id: "slide-1",
    text:
      "Binary search trees keep order among their elements. Each node has at most two children, with smaller values in the left subtree and larger values in the right. That order is what makes search, insert, and delete fast on average.",
  },
  {
    id: "slide-2",
    text:
      "An unbalanced binary search tree can degenerate into a linked list — searching becomes linear. Balanced trees fix that by guaranteeing logarithmic height, so search, insert, and delete stay efficient even in the worst case.",
  },
  {
    id: "slide-3",
    text:
      "Red-black trees keep balance through five color invariants. Every node is either red or black. The root is black, and so are the null leaves. Red nodes can only have black children, which means red nodes never appear back-to-back. And finally, every path from a node down to a leaf contains the same number of black nodes — that's the property that bounds height.",
  },
  {
    id: "slide-4",
    text:
      "We call the count of black nodes on any root-to-leaf path the black height. Because red nodes can't be adjacent, the longest possible path can be at most twice the shortest — and that's how we get the O(log n) guarantee for free.",
  },
  {
    id: "slide-5",
    text:
      "Search is identical to an ordinary binary search tree. Insert and delete are where the work happens — after the structural change we may need to recolor or rotate to restore the invariants. Despite that, all three operations stay logarithmic.",
  },
  {
    id: "slide-6",
    text:
      "Rotations are the surgical tool of balanced trees. They rearrange three nodes locally — without ever violating the binary search tree property — and they're the mechanism we use to repair a red-black tree after a violation.",
  },
  {
    id: "slide-7",
    text:
      "You'll find red-black trees inside std::map in C++, TreeMap in Java, the Linux completely fair scheduler, and many filesystem indexes. Anywhere a hash map's worst-case is unacceptable and you need ordered iteration, this is the structure to reach for.",
  },
];

const PROMPTS = [
  {
    id: "prompt-again",
    text:
      "Of course. The key idea is that red and black are bookkeeping colors — they don't store data, they constrain shape. As long as no two reds are adjacent and every path has the same black count, the tree's height is bounded.",
  },
  {
    id: "prompt-example",
    text:
      "Sure. Picture a red-black tree of 1023 nodes. The black height is at most 10, and because red nodes can't be adjacent, the actual height tops out at around 20. So a search visits 20 nodes at the absolute worst.",
  },
  {
    id: "prompt-skip",
    text: "Got it — jumping to the operations slide.",
  },
  {
    id: "prompt-pause",
    text:
      "No problem. Tap the mic again whenever you're ready to continue.",
  },
];

const ALL = [...SLIDES, ...PROMPTS];

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error(
    "ELEVENLABS_API_KEY is not set. Run with: ELEVENLABS_API_KEY=... node scripts/generate-audio.mjs"
  );
  process.exit(1);
}

const force = process.argv.includes("--force");

async function fileExists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function synthesize(entry) {
  const dest = resolve(OUT_DIR, `${entry.id}.mp3`);
  if (!force && (await fileExists(dest))) {
    console.log(`  · skip   ${entry.id}.mp3 (exists)`);
    return { id: entry.id, skipped: true };
  }
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=${OUTPUT_FORMAT}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: entry.text,
      model_id: MODEL_ID,
      voice_settings: VOICE_SETTINGS,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `ElevenLabs ${res.status} for ${entry.id}: ${detail.slice(0, 200)}`
    );
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  console.log(`  · wrote  ${entry.id}.mp3 (${buf.length.toLocaleString()} bytes)`);
  return { id: entry.id, bytes: buf.length };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`Synthesizing ${ALL.length} clips → ${OUT_DIR}`);
  console.log(`Voice ${VOICE_ID} · model ${MODEL_ID} · ${force ? "force" : "skip-existing"}`);
  const results = [];
  for (const entry of ALL) {
    // Sequential — ElevenLabs free/standard tiers throttle concurrent
    // synthesis aggressively, and we're only making ~12 calls.
    try {
      results.push(await synthesize(entry));
    } catch (err) {
      console.error(`  ! fail   ${entry.id}: ${err.message}`);
      results.push({ id: entry.id, error: err.message });
    }
  }
  const manifest = {
    generated_at: new Date().toISOString(),
    voice_id: VOICE_ID,
    model_id: MODEL_ID,
    output_format: OUTPUT_FORMAT,
    voice_settings: VOICE_SETTINGS,
    items: ALL.map((e) => ({ id: e.id, file: `/audio/${e.id}.mp3` })),
  };
  await writeFile(
    resolve(OUT_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );
  const failed = results.filter((r) => r.error);
  if (failed.length) {
    console.error(`\nFinished with ${failed.length} failure(s).`);
    process.exit(1);
  }
  console.log(`\nDone. Manifest: ${resolve(OUT_DIR, "manifest.json")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

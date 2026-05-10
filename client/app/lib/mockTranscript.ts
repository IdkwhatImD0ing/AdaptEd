/**
 * Canned conversational replies the mock voice controller uses when the
 * viewer clicks one of the scripted prompt chips. The original LA Hacks
 * build had GPT-3.5 + Retell powering this — here we just simulate it.
 * Each prompt has a pre-rendered ElevenLabs MP3 (see `scripts/generate-audio.mjs`).
 */
export type ScriptedPrompt = {
  id: string;
  /** Short label used as the inline chip label */
  label: string;
  /** The simulated user utterance written into the transcript */
  user: string;
  /** The agent's spoken response */
  agent: string;
  /** Path under /public to the pre-rendered ElevenLabs MP3 for `agent`. */
  audio: string;
  /** Optional follow-up action the agent "decides" to take */
  action?: { name: "next_slide" | "prev_slide" | "goto_slide"; slideIndex?: number };
};

export const scriptedPrompts: ScriptedPrompt[] = [
  {
    id: "again",
    label: "Explain that again",
    user: "Wait, can you explain that one more time?",
    agent:
      "Of course. The key idea is that red and black are bookkeeping colors — they don't store data, they constrain shape. As long as no two reds are adjacent and every path has the same black count, the tree's height is bounded.",
    audio: "/audio/prompt-again.mp3",
  },
  {
    id: "example",
    label: "Give an example",
    user: "Can you give a concrete example?",
    agent:
      "Sure. Picture a red-black tree of 1023 nodes. The black height is at most 10, and because red nodes can't be adjacent, the actual height tops out at around 20. So a search visits 20 nodes at the absolute worst.",
    audio: "/audio/prompt-example.mp3",
  },
  {
    id: "skip",
    label: "Skip to operations",
    user: "Skip ahead to operations.",
    agent: "Got it — jumping to the operations slide.",
    audio: "/audio/prompt-skip.mp3",
    action: { name: "goto_slide", slideIndex: 5 },
  },
  {
    id: "pause",
    label: "Pause",
    user: "Pause for a sec.",
    agent: "No problem. Tap the mic again whenever you're ready to continue.",
    audio: "/audio/prompt-pause.mp3",
  },
];

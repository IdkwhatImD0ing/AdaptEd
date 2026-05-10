/**
 * Canned conversational replies the mock voice controller uses when the
 * viewer clicks one of the scripted prompt chips. The original LA Hacks
 * build had GPT-3.5 + Retell powering this — here we just simulate it.
 */
export type ScriptedPrompt = {
  id: string;
  user: string;
  agent: string;
  /** Optional follow-up action the agent "decides" to take */
  action?: { name: "next_slide" | "prev_slide" | "goto_slide"; slideIndex?: number };
};

export const scriptedPrompts: ScriptedPrompt[] = [
  {
    id: "again",
    user: "Wait, can you explain that one more time?",
    agent:
      "Of course. The key idea is that red and black are bookkeeping colors — they don't store data, they constrain shape. As long as no two reds are adjacent and every path has the same black count, the tree's height is bounded.",
  },
  {
    id: "example",
    user: "Can you give a concrete example?",
    agent:
      "Sure. Picture a red-black tree of 1023 nodes. The black height is at most 10, and because red nodes can't be adjacent, the actual height tops out at around 20. So a search visits 20 nodes at the absolute worst.",
  },
  {
    id: "skip",
    user: "Skip ahead to operations.",
    agent: "Got it — jumping to the operations slide.",
    action: { name: "goto_slide", slideIndex: 5 },
  },
  {
    id: "pause",
    user: "Pause for a sec.",
    agent: "No problem. Tap the mic again whenever you're ready to continue.",
  },
];

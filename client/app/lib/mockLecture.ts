import type { Lecture } from "./types";

/**
 * Canned lecture used by the mocked showcase. Mirrors the original demo
 * the LA Hacks 2024 team showed off (Red-Black Trees), structured against
 * the same template_id taxonomy as `server/templates.py`. Visuals are
 * rendered as inline SVG via `diagram` so the showcase has zero external
 * image dependencies. Each `audio` path points to a pre-rendered ElevenLabs
 * narration written by `scripts/generate-audio.mjs`.
 */
export const mockLecture: Lecture = {
  title: "Red-Black Trees",
  description:
    "A guided tour through balanced search trees and the invariants that keep them honest.",
  slides: [
    {
      title: "Red-Black Trees",
      template_id: 4,
      images: [],
      texts: [
        "A guided tour through balanced search trees — and the invariants that keep them honest.",
      ],
      speaker_notes:
        "Welcome. Today we'll walk through red-black trees — a self-balancing binary search tree that powers most ordered maps in standard libraries. Interrupt me anytime if something needs a second pass.",
      audio: "/audio/slide-0.mp3",
    },
    {
      title: "Binary Search Trees",
      template_id: 0,
      images: [],
      diagram: "bst",
      texts: [
        "Ordered binary trees",
        "Smaller items live to the left",
        "Larger items live to the right",
      ],
      speaker_notes:
        "Binary search trees keep order among their elements. Each node has at most two children, with smaller values in the left subtree and larger values in the right. That order is what makes search, insert, and delete fast on average.",
      audio: "/audio/slide-1.mp3",
    },
    {
      title: "Why Balance Matters",
      template_id: 9,
      images: [],
      diagram: "balance",
      texts: [
        "Worst-case BSTs degrade to a linked list",
        "Balanced trees guarantee O(log n) height",
        "Red-black is one of several balancing schemes",
      ],
      speaker_notes:
        "An unbalanced binary search tree can degenerate into a linked list — searching becomes linear. Balanced trees fix that by guaranteeing logarithmic height, so search, insert, and delete stay efficient even in the worst case.",
      audio: "/audio/slide-2.mp3",
    },
    {
      title: "The Five Invariants",
      template_id: 9,
      images: [],
      diagram: "rbtree",
      texts: [
        "Every node is red or black",
        "The root is black",
        "Every NIL leaf is black",
        "Red nodes have only black children",
        "Equal black nodes on every path",
      ],
      speaker_notes:
        "Red-black trees keep balance through five color invariants. Every node is either red or black. The root is black, and so are the null leaves. Red nodes can only have black children, which means red nodes never appear back-to-back. And finally, every path from a node down to a leaf contains the same number of black nodes — that's the property that bounds height.",
      audio: "/audio/slide-3.mp3",
    },
    {
      title: "Black Height",
      template_id: 1,
      images: [],
      diagram: "black-height",
      texts: [
        "Number of black nodes on a path",
        "Excluding the starting node",
        "Bounds the longest path to twice the shortest",
      ],
      speaker_notes:
        "We call the count of black nodes on any root-to-leaf path the black height. Because red nodes can't be adjacent, the longest possible path can be at most twice the shortest — and that's how we get the O(log n) guarantee for free.",
      audio: "/audio/slide-4.mp3",
    },
    {
      title: "Operations",
      template_id: 0,
      images: [],
      diagram: "operations",
      texts: [
        "Search behaves exactly like a BST",
        "Insert and delete may need rotations",
        "All three stay O(log n)",
      ],
      speaker_notes:
        "Search is identical to an ordinary binary search tree. Insert and delete are where the work happens — after the structural change we may need to recolor or rotate to restore the invariants. Despite that, all three operations stay logarithmic.",
      audio: "/audio/slide-5.mp3",
    },
    {
      title: "Rotations",
      template_id: 8,
      images: [],
      diagram: "rotation",
      texts: ["Local restructuring without breaking order"],
      speaker_notes:
        "Rotations are the surgical tool of balanced trees. They rearrange three nodes locally — without ever violating the binary search tree property — and they're the mechanism we use to repair a red-black tree after a violation.",
      audio: "/audio/slide-6.mp3",
    },
    {
      title: "When to Reach for Them",
      template_id: 9,
      images: [],
      diagram: "complexity",
      texts: [
        "Standard library ordered maps and sets",
        "Linux scheduler and kernel data structures",
        "Anywhere predictable worst-case latency matters",
      ],
      speaker_notes:
        "You'll find red-black trees inside std::map in C++, TreeMap in Java, the Linux completely fair scheduler, and many filesystem indexes. Anywhere a hash map's worst-case is unacceptable and you need ordered iteration, this is the structure to reach for.",
      audio: "/audio/slide-7.mp3",
    },
  ],
};

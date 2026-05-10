import type { Lecture } from "./types";

/**
 * Canned lecture used by the mocked showcase. Mirrors the original demo
 * the LA Hacks 2024 team showed off (Red-Black Trees), structured against
 * the same template_id taxonomy as `server/templates.py`.
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
      speaker_notes:
        "Welcome. Today we'll walk through red-black trees — a self-balancing binary search tree that powers most ordered maps in standard libraries. Interrupt me anytime if something needs a second pass.",
    },
    {
      title: "Binary Search Trees",
      template_id: 0,
      texts: [
        "Ordered binary trees",
        "Smaller items live to the left",
        "Larger items live to the right",
      ],
      speaker_notes:
        "Binary search trees keep order among their elements. Each node has at most two children, with smaller values in the left subtree and larger values in the right. That order is what makes search, insert, and delete fast on average.",
      images: [
        {
          src: "https://media.geeksforgeeks.org/wp-content/cdn-uploads/20221215114732/bst-21.png",
          description: "A binary search tree with 8 at the root.",
        },
      ],
    },
    {
      title: "Why Balance Matters",
      template_id: 2,
      texts: [
        "Worst-case BSTs degrade to a linked list",
        "Balanced trees guarantee O(log n) height",
        "Red-black is one of several balancing schemes",
      ],
      speaker_notes:
        "An unbalanced binary search tree can degenerate into a linked list — searching becomes linear. Balanced trees fix that by guaranteeing logarithmic height, so search, insert, and delete stay efficient even in the worst case.",
      images: [
        {
          src: "https://media.geeksforgeeks.org/wp-content/uploads/20221221160923/UntitledDiagramdrawio-660x371.png",
          description: "Balanced and unbalanced binary trees side by side.",
        },
      ],
    },
    {
      title: "The Five Invariants",
      template_id: 9,
      texts: [
        "Every node is red or black",
        "The root and all leaves are black",
        "Red nodes only have black children",
        "Every root-to-leaf path has equal black nodes",
      ],
      speaker_notes:
        "Red-black trees keep balance through five color invariants. Every node is either red or black. The root is black, and so are the null leaves. Red nodes can only have black children, which means red nodes never appear back-to-back. And finally, every path from a node down to a leaf contains the same number of black nodes — that's the property that bounds height.",
      images: [
        {
          src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Red-black_tree_example.svg/512px-Red-black_tree_example.svg.png",
          description: "A canonical red-black tree with colored nodes.",
        },
      ],
    },
    {
      title: "Black Height",
      template_id: 1,
      texts: [
        "Number of black nodes on a path",
        "Excluding the starting node",
        "Bounds the longest path to twice the shortest",
      ],
      speaker_notes:
        "We call the count of black nodes on any root-to-leaf path the black height. Because red nodes can't be adjacent, the longest possible path can be at most twice the shortest — and that's how we get the O(log n) guarantee for free.",
      images: [
        {
          src: "https://media.geeksforgeeks.org/wp-content/uploads/20200427100650/red-black-tree.png",
          description: "Black height annotated along a path.",
        },
      ],
    },
    {
      title: "Operations",
      template_id: 0,
      texts: [
        "Search behaves exactly like a BST",
        "Insert and delete may need rotations",
        "All three stay O(log n)",
      ],
      speaker_notes:
        "Search is identical to an ordinary binary search tree. Insert and delete are where the work happens — after the structural change we may need to recolor or rotate to restore the invariants. Despite that, all three operations stay logarithmic.",
      images: [
        {
          src: "https://media.geeksforgeeks.org/wp-content/uploads/20200506190350/output244.png",
          description: "Insertion fixup with a right rotation and recolor.",
        },
      ],
    },
    {
      title: "Rotations",
      template_id: 8,
      texts: ["Local restructuring without breaking order"],
      speaker_notes:
        "Rotations are the surgical tool of balanced trees. They rearrange three nodes locally — without ever violating the binary search tree property — and they're the mechanism we use to repair a red-black tree after a violation.",
      images: [
        {
          src: "https://www.geeksforgeeks.org/wp-content/uploads/20220914143442/Red-Black-Tree-Rotations.png",
          description: "Left and right rotations, side by side.",
        },
      ],
    },
    {
      title: "When to Reach for Them",
      template_id: 2,
      texts: [
        "Standard library ordered maps and sets",
        "Linux scheduler and kernel data structures",
        "Anywhere predictable worst-case latency matters",
      ],
      speaker_notes:
        "You'll find red-black trees inside std::map in C++, TreeMap in Java, the Linux completely fair scheduler, and many filesystem indexes. Anywhere a hash map's worst-case is unacceptable and you need ordered iteration, this is the structure to reach for.",
      images: [
        {
          src: "https://cdn.hackr.io/uploads/posts/attachments/1650358110m7fPqMdxs5.png",
          description: "Data structure complexity comparison table.",
        },
      ],
    },
  ],
};

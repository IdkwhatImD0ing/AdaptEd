"use client";

import Voice from "./components/Voice";
import Slideshow, { skipToSlide } from "./components/Slideshow";
import { useContext } from "react";
import { DeckContext } from "spectacle";

export default function Home() {
  const testLecture = {
    title: "Depth First Search",
    description: "Explains the data structures and algorithms behind DFS",
    slides: [
      {
        title: "Two Column Layout",
        subtitle: "Left: Heading, Right: Image",
        template_id: 1,
        images: [
          {
            source:
              "https://sb.kaleidousercontent.com/67418/658x756/361846cee7/all-pages-2.png",
            description: "Example image 1",
          },
        ],
        texts: [],
      },
      {
        title: "Two Column Layout",
        subtitle: "Left: Image, Right: Heading",
        template_id: 2,
        images: [
          {
            source:
              "https://sb.kaleidousercontent.com/67418/658x756/361846cee7/all-pages-2.png",
            description: "Example image 1",
          },
        ],
        texts: [],
      },
      {
        title: "Center Layout",
        subtitle: "Subheading",
        template_id: 3,
        images: [
          {
            source:
              "https://sb.kaleidousercontent.com/67418/658x756/361846cee7/all-pages-2.png",
            description: "Example image 1",
          },
        ],
        texts: ["Example text 1", "Example text 2"],
      },
      {
        title: "List Layout",
        subtitle: "",
        template_id: 4,
        images: [],
        texts: ["List item 1", "List item 2", "List item 3"],
      },
      {
        title: "Section Layout",
        subtitle: "Subheading",
        template_id: 5,
        images: [],
        texts: ["Section text 1", "Section text 2"],
      },
      {
        title: "Statement Layout",
        subtitle: "Subheading",
        template_id: 6,
        images: [],
        texts: ["Statement text"],
      },
      {
        title: "Big Fact Layout",
        subtitle: "Subheading",
        template_id: 7,
        images: [],
        texts: ["Big fact text"],
      },
      {
        title: "Quote Layout",
        subtitle: "",
        template_id: 8,
        images: [],
        texts: ["Quote text", "Attribution"],
      },
      {
        title: "Horizontal Image Layout",
        subtitle: "Image description",
        template_id: 9,
        images: [
          {
            source:
              "https://sb.kaleidousercontent.com/67418/658x756/361846cee7/all-pages-2.png",
            description: "Example image 1",
          },
        ],
        texts: [],
      },
      {
        title: "Vertical Image Layout",
        subtitle: "",
        template_id: 10,
        images: [
          {
            source:
              "https://sb.kaleidousercontent.com/67418/658x756/361846cee7/all-pages-2.png",
            description: "Example image 1",
          },
        ],
        texts: ["List item 1", "List item 2"],
      },
      {
        title: "Three Up Image Layout",
        subtitle: "",
        template_id: 11,
        images: [
          {
            source:
              "https://sb.kaleidousercontent.com/67418/658x756/361846cee7/all-pages-2.png",
            description: "Example image 1",
          },
          {
            source:
              "https://sb.kaleidousercontent.com/67418/658x756/361846cee7/all-pages-2.png",
            description: "Example image 1",
          },
          {
            source:
              "https://sb.kaleidousercontent.com/67418/658x756/361846cee7/all-pages-2.png",
            description: "Example image 1",
          },
        ],
        texts: [],
      },
      {
        title: "Full Bleed Image Layout",
        subtitle: "",
        template_id: 12,
        images: [
          {
            source:
              "https://sb.kaleidousercontent.com/67418/658x756/361846cee7/all-pages-2.png",
            description: "Example image 1",
          },
        ],
        texts: [],
      },
    ],
  };

  const handleFuncCallResult = (result: FunctionCall) => {
    const { searchParams } = new URL(window.location.href);
    const slide_index = searchParams.get("slideIndex");
    const slide_number = slide_index ? parseInt(slide_index) : 0;
    switch (result.name) {
      case "next_slide":
        skipToSlide(slide_number + 1);
        break;
      case "prev_slide":
        skipToSlide(slide_number - 1);
        break;
      case "goto_slide":
        console.log(result.arguments);
        skipToSlide(result.arguments["slide_number"]);
        break;
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <a href="/api/auth/login">Login</a>
        <br />
        <a href="/api/auth/logout">Logout</a>
      </div>
      <Voice onFuncCallResult={handleFuncCallResult} />
      <div>
        <h1>{testLecture.title}</h1>
        <Slideshow lecture={testLecture} />
      </div>
    </main>
  );
}

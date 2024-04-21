"use client";

import Voice, { MessageTranscript } from "../components/Voice";
import Slideshow, { skipToSlide } from "../components/Slideshow";
import { useEffect, useState } from "react";
import { RetellWebClient } from "retell-client-js-sdk";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Sidebar from "../components/Sidebar";
import NavBar from "../navBar/NavBar";

function page() {
  const [retellClient, setRetellClient] = useState<RetellWebClient | undefined>(
    undefined
  );
  const [funcCallSocket, setFuncCallSocket] = useState<WebSocket | undefined>(
    undefined
  );

  const [messages, setMessages] = useState<MessageTranscript[]>([]);

  const getSlideIndex = () => {
    const { searchParams } = new URL(window.location.href);
    const slide_index = searchParams.get("slideIndex");
    return slide_index ? parseInt(slide_index) : 0;
  };

  var theLecture: Lecture | undefined;

  useEffect(() => {
    theLecture = JSON.parse(localStorage.getItem("lecture") || "{}");
  }, []);

  const handleFuncCallResult = (result: FunctionCall) => {
    if (theLecture) {
      const curr_slide = getSlideIndex();
      switch (result.name) {
        case "next_slide":
          // If the slide is not the last one, skip to the next slide
          if (curr_slide + 1 < theLecture.slides.length) {
            skipToSlide(curr_slide + 1);
          }
          break;
        case "prev_slide":
          // If the slide is not the first one, skip to the previous slide
          if (curr_slide - 1 >= 0) {
            skipToSlide(curr_slide - 1);
          }
          break;
        case "goto_slide":
          const slide_number = result.arguments["slide_number"];
          // If the slide number is within the bounds of the slides array, skip to that slide
          if (slide_number >= 0 && slide_number < theLecture.slides.length) {
            skipToSlide(result.arguments["slide_number"]);
          }
          break;
      }
    } else {
      alert("No lecture provided.");
    }
  };

  // Have the voice AI speak the slide speaker notes if you change slides
  const handleSlideChange = (slideIndex: number) => {
    if (theLecture) {
      console.log("Current slide number:", slideIndex);
      const slide = theLecture.slides[slideIndex];
      const speaker_notes = slide.speaker_notes || slide.title;
      if (speaker_notes) {
        funcCallSocket?.send(speaker_notes);
      }
    } else {
      alert("No lecture provided.");
    }
  };

  // When data socket connects, read first slide
  const handleDataSocketConnect = () => {
    if (theLecture) {
      setTimeout(() => {
        const slide_number = getSlideIndex();
        const slide = theLecture!.slides[slide_number];
        console.log("CONVERSATION STARTED", slide);
        const speaker_notes = slide.speaker_notes || slide.title;
        if (speaker_notes) {
          funcCallSocket?.send(speaker_notes);
        }
      }, 5000);
    } else {
      alert("No lecture provided.");
    }
  };

  // If last message equals current slide speaker notes, slide has finished so time to move oon
  const handleUpdate = (update: { transcript: MessageTranscript[] }) => {
    if (theLecture) {
      setMessages(update.transcript);

      const lastMessage = update.transcript[update.transcript.length - 1];

      const slide_number = getSlideIndex();
      const slide = theLecture.slides[slide_number];
      const speaker_notes = slide.speaker_notes || slide.title;

      if (lastMessage.content.includes(speaker_notes!)) {
        // If the slide is not the last one, skip to the next slide
        if (slide_number + 1 < theLecture.slides.length) {
          setTimeout(() => {
            skipToSlide(slide_number + 1);
          }, 2500);
        }
      }
    } else {
      alert("No lecture provided.");
    }
  };

  return (
    <main className="flex flex-col h-full w-full">
      <PanelGroup direction="vertical">
        <Panel defaultSize={100}>
          <PanelGroup direction="horizontal">
            <Panel minSize={25} defaultSize={100}>
              <div className="flex flex-col items-center">
                <h1 className="text-2xl font-bold py-4">
                  {theLecture?.title ?? "Could not generate"}
                </h1>
                <div className="w-full h-min relative flex  items-center justify-center">
                  <div className="absolute z-20 h-full top-0 left-0 w-full flex items-center justify-center">
                    <Voice
                      onFuncCallResult={handleFuncCallResult}
                      onDataSocketConnect={handleDataSocketConnect}
                      funcCallSocket={funcCallSocket}
                      retellClient={retellClient}
                      setFuncCallSocket={setFuncCallSocket}
                      setRetellClient={setRetellClient}
                      onUpdate={handleUpdate}
                    />
                  </div>
                  {!funcCallSocket && (
                    <div className="absolute z-10 h-full top-0 left-0 w-full bg-white/75"></div>
                  )}
                  <Slideshow
                    lecture={
                      theLecture ?? {
                        title: "Could not generate",
                        description: "Could not generate",
                        slides: [],
                      }
                    }
                    onSlideChange={handleSlideChange}
                  />
                </div>
                <h3 className="text-lg text-center">
                  Ask questions about this by interrupting the lecture
                </h3>
              </div>
            </Panel>
            <PanelResizeHandle />
            <Panel
              id="sidebar"
              defaultSize={messages.length > 0 ? 25 : 0}
              minSize={messages.length > 0 ? 25 : 0}
            >
              <Sidebar messages={messages} />
            </Panel>
          </PanelGroup>
        </Panel>
        <PanelResizeHandle />
        <Panel collapsible={true} defaultSize={0}>
          <h1></h1>
        </Panel>
      </PanelGroup>
    </main>
  );
}

export default page;

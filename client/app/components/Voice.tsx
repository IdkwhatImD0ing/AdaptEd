"use client";

import { useEffect, useRef, useState } from "react";
import { RetellWebClient } from "retell-client-js-sdk";

const AGENT_ID = "094ec635562bfaa326741f43e55db95d";

const SERVER_ENDPOINT =
  "http://localhost:8000/voice/register-call-on-your-server";

const FUNC_CALL_ENDPOINT = "ws://localhost:8000/voice/data-websocket";

interface RegisterCallResponse {
  callId?: string;
  sampleRate: number;
}

export type MessageTranscript = {
  role: string;
  content: string;
};

export default function Voice(props: {
  onFuncCallResult?: (result: any) => void;
  onDataSocketConnect?: () => void;
  onUpdate?: (update: { transcript: MessageTranscript[] }) => void;
  funcCallSocket: WebSocket | undefined;
  retellClient: RetellWebClient | undefined;
  setFuncCallSocket: (funcCallSocket: WebSocket) => void;
  setRetellClient: (retellClient: RetellWebClient) => void;
}) {
  const [isCalling, setIsCalling] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);

  useEffect(() => {
    // If SDK already initialized
    if (props.retellClient) {
      console.log("SDK already initialized");
      return;
    }

    console.log("Mounted");

    // Initialize the SDK
    const newRetellClient = new RetellWebClient();
    props.setRetellClient(newRetellClient);

    // Setup event listeners
    newRetellClient.on("conversationStarted", () => {
      console.log("conversationStarted");
    });

    newRetellClient.on("audio", (_audio: Uint8Array) => {
      console.log("There is audio");
      setUserSpeaking(true);
    });

    newRetellClient.on("conversationEnded", ({ code, reason }) => {
      console.log("Closed with code:", code, ", reason:", reason);
      setUserSpeaking(false);
      setIsCalling(false); // Update button to "Start" when conversation ends
    });

    newRetellClient.on("error", (error) => {
      console.error("An error occurred:", error);
      setIsCalling(false); // Update button to "Start" in case of error
    });

    newRetellClient.on(
      "update",
      (update: { transcript: MessageTranscript[] }) => {
        // Update messages
        // setMessages(update.transcript);
        // Print live transcript as needed
        console.log("update", update);
        props.onUpdate?.(update);
      }
    );

    // Start conversation on mount
    // toggleConversation();

    return () => {
      // Cleanup event listeners when the component is unmounted
      if (newRetellClient) {
        newRetellClient.stopConversation();
        newRetellClient.off("conversationStarted");
        newRetellClient.off("audio");
        newRetellClient.off("conversationEnded");
        newRetellClient.off("error");
        newRetellClient.off("update");
      }
    };
  }, []);

  const connectFuncCallWebsocket = async (call_id: string) => {
    // Connect to the function call websocket
    const newFuncCallSocket = new WebSocket(FUNC_CALL_ENDPOINT + "/" + call_id);
    props.setFuncCallSocket(newFuncCallSocket);

    newFuncCallSocket.onopen = () => {
      console.log("Function call websocket connected");
      props.onDataSocketConnect?.();
    };

    newFuncCallSocket.onmessage = (event) => {
      try {
        const funcCallResult: FunctionCall = JSON.parse(event.data);

        console.log("Function call result:", funcCallResult);
        props.onFuncCallResult?.(funcCallResult);
      } catch (error) {
        console.error("Error parsing function call result:", error);
      }
    };

    newFuncCallSocket.onclose = () => {
      console.log("Function call websocket disconnected");
    };
  };

  const toggleConversation = async () => {
    if (isCalling) {
      props.retellClient!.stopConversation();
    } else {
      const registerCallResponse = await registerCall(AGENT_ID);
      if (registerCallResponse.callId) {
        props
          .retellClient!.startConversation({
            callId: registerCallResponse.callId,
            sampleRate: registerCallResponse.sampleRate,
            enableUpdate: true,
          })
          .catch(console.error);
        console.log("Started call");
        setIsCalling(true); // Update button to "Stop" when conversation starts
      }
    }
  };

  async function registerCall(agentId: string): Promise<RegisterCallResponse> {
    try {
      // Replace with your server url
      const response = await fetch(SERVER_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentId: agentId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data: RegisterCallResponse = await response.json();
      if (data.callId) {
        connectFuncCallWebsocket(data.callId);
      } else {
        console.error("No call id provided for registered call.", data);
      }
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  return (
    <div>
      {!isCalling && (
        <button
          onClick={toggleConversation}
          className="flex items-center bg-purple-500 hover:bg-purple-600 text-white rounded-full p-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { RetellWebClient } from "retell-client-js-sdk";

const isDev = process.env.NODE_ENV == "development";

const AGENT_ID = isDev
  ? "bd5a5ec2b96d50d774bb5d71a697bb15"
  : "e1352846fcdffd559626cc5647b19a36";

const SERVER_ENDPOINT = isDev
  ? "http://localhost:8000/voice/register-call-on-your-server"
  : "https://portal.bot/voice/register-call-on-your-server";

const FUNC_CALL_ENDPOINT = isDev
  ? "ws://localhost:8000/voice/data-websocket"
  : "wss://portal.bot/voice/data-websocket";

interface RegisterCallResponse {
  callId?: string;
  sampleRate: number;
}

type MessageTranscript = {
  role: string;
  content: string;
};

const App = () => {
  const [isCalling, setIsCalling] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);

  const retellClientRef = useRef<RetellWebClient>();
  const funcCallSocketRef = useRef<WebSocket>();

  useEffect(() => {
    // Initialize the SDK
    retellClientRef.current = new RetellWebClient();

    // Setup event listeners
    retellClientRef.current.on("conversationStarted", () => {
      console.log("conversationStarted");
      setLoading(true);
    });

    retellClientRef.current.on("audio", (_audio: Uint8Array) => {
      console.log("There is audio");
      setUserSpeaking(true);
    });

    retellClientRef.current.on("conversationEnded", ({ code, reason }) => {
      console.log("Closed with code:", code, ", reason:", reason);
      setUserSpeaking(false);
      setLoading(false);
      setIsCalling(false); // Update button to "Start" when conversation ends
    });

    retellClientRef.current.on("error", (error) => {
      console.error("An error occurred:", error);
      setIsCalling(false); // Update button to "Start" in case of error
    });

    retellClientRef.current.on(
      "update",
      (update: { transcript: MessageTranscript[] }) => {
        // Update messages
        // setMessages(update.transcript);
        // Print live transcript as needed
        console.log("update", update);
      }
    );

    return () => {
      // Cleanup event listeners when the component is unmounted
      if (retellClientRef.current) {
        retellClientRef.current.stopConversation();
        retellClientRef.current.off("conversationStarted");
        retellClientRef.current.off("audio");
        retellClientRef.current.off("conversationEnded");
        retellClientRef.current.off("error");
        retellClientRef.current.off("update");
      }
    };
  }, []);

  const connectFuncCallWebsocket = async (call_id: string) => {
    // Connect to the function call websocket
    funcCallSocketRef.current = new WebSocket(
      FUNC_CALL_ENDPOINT + "/" + call_id
    );

    funcCallSocketRef.current.onopen = () => {
      console.log("Function call websocket connected");
    };

    funcCallSocketRef.current.onmessage = (event) => {
      const funcCallResult = JSON.parse(event.data);
      console.log("Function call result:", funcCallResult);
    };

    funcCallSocketRef.current.onclose = () => {
      console.log("Function call websocket disconnected");
    };
  };

  const toggleConversation = async () => {
    if (isCalling) {
      retellClientRef.current!.stopConversation();
    } else {
      const registerCallResponse = await registerCall(AGENT_ID);
      if (registerCallResponse.callId) {
        retellClientRef
          .current!.startConversation({
            callId: registerCallResponse.callId,
            sampleRate: registerCallResponse.sampleRate,
            enableUpdate: true,
          })
          .catch(console.error);
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
    <button onClick={toggleConversation} className="text-white ">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        fill="currentColor"
        width={50}
        height={50}
        // className="w-4 h-4"
      >
        <g transform="scale(10.66667,10.66667)">
          <path d="M18.25 11a.75.75 0 0 1 .743.648l.007.102v.5a6.75 6.75 0 0 1-6.249 6.732l-.001 2.268a.75.75 0 0 1-1.493.102l-.007-.102v-2.268a6.75 6.75 0 0 1-6.246-6.496L5 12.25v-.5a.75.75 0 0 1 1.493-.102l.007.102v.5a5.25 5.25 0 0 0 5.034 5.246l.216.004h.5a5.25 5.25 0 0 0 5.246-5.034l.004-.216v-.5a.75.75 0 0 1 .75-.75M12 2a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4m0 1.5A2.5 2.5 0 0 0 9.5 6v6a2.5 2.5 0 0 0 5 0V6A2.5 2.5 0 0 0 12 3.5" />
        </g>
      </svg>
    </button>
  );
};

export default App;

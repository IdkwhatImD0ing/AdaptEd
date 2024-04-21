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

type MessageTranscript = {
  role: string;
  content: string;
};

export default function Voice(props: {
  onFuncCallResult: (result: any) => void;
  onDataSocketConnect: () => void;
  retellClientRef: React.MutableRefObject<RetellWebClient | undefined>;
  funcCallSocketRef: React.MutableRefObject<WebSocket | undefined>;
}) {
  const [isCalling, setIsCalling] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);

  const { retellClientRef, funcCallSocketRef } = props;

  useEffect(() => {
    // If SDK already initialized
    if (retellClientRef.current) {
      return;
    }

    console.log("Mounted");

    // Initialize the SDK
    retellClientRef.current = new RetellWebClient();

    // Setup event listeners
    retellClientRef.current.on("conversationStarted", () => {
      console.log("conversationStarted");
    });

    retellClientRef.current.on("audio", (_audio: Uint8Array) => {
      console.log("There is audio");
      setUserSpeaking(true);
    });

    retellClientRef.current.on("conversationEnded", ({ code, reason }) => {
      console.log("Closed with code:", code, ", reason:", reason);
      setUserSpeaking(false);
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

    // Start conversation on mount
    // toggleConversation();

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
      props.onDataSocketConnect();
    };

    funcCallSocketRef.current.onmessage = (event) => {
      try {
        const funcCallResult: FunctionCall = JSON.parse(event.data);

        console.log("Function call result:", funcCallResult);
        props.onFuncCallResult(funcCallResult);
      } catch (error) {
        console.error("Error parsing function call result:", error);
      }
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
        <button onClick={toggleConversation}>Start Conversation</button>
      )}
    </div>
  );
}

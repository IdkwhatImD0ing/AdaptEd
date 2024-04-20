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
    <div
      id="voiceRoot"
      className="fixed bottom-5 left-5 flex flex-col items-center p-7 pb-4 bg-black shadow-lg rounded-full z-50"
    >
      {!isCalling ? (
        <button onClick={toggleConversation} className="text-white w-12 h-12">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            fill="currentColor"
            className="w-full h-full"
          >
            <g transform="scale(10.66667,10.66667)">
              <path d="M18.25 11a.75.75 0 0 1 .743.648l.007.102v.5a6.75 6.75 0 0 1-6.249 6.732l-.001 2.268a.75.75 0 0 1-1.493.102l-.007-.102v-2.268a6.75 6.75 0 0 1-6.246-6.496L5 12.25v-.5a.75.75 0 0 1 1.493-.102l.007.102v.5a5.25 5.25 0 0 0 5.034 5.246l.216.004h.5a5.25 5.25 0 0 0 5.246-5.034l.004-.216v-.5a.75.75 0 0 1 .75-.75M12 2a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4m0 1.5A2.5 2.5 0 0 0 9.5 6v6a2.5 2.5 0 0 0 5 0V6A2.5 2.5 0 0 0 12 3.5" />
            </g>
          </svg>
        </button>
      ) : (
        <>
          {userSpeaking ? (
            <button onClick={toggleConversation} className="w-12 h-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 256 256"
                className="w-full h-full"
              >
                <rect width="15" height="120" y="10" rx="6" x="61">
                  <animate
                    attributeName="height"
                    begin="0.5s"
                    calcMode="linear"
                    dur="1s"
                    repeatCount="indefinite"
                    values="120;110;100;90;80;70;60;50;40;140;120"
                  />
                  <animate
                    attributeName="y"
                    begin="0.5s"
                    calcMode="linear"
                    dur="1s"
                    repeatCount="indefinite"
                    values="10;15;20;25;30;35;40;45;50;0;10"
                  />
                </rect>
                <rect width="15" height="120" x="91" y="10" rx="6">
                  <animate
                    attributeName="height"
                    begin="0.25s"
                    calcMode="linear"
                    dur="1s"
                    repeatCount="indefinite"
                    values="120;110;100;90;80;70;60;50;40;140;120"
                  />
                  <animate
                    attributeName="y"
                    begin="0.25s"
                    calcMode="linear"
                    dur="1s"
                    repeatCount="indefinite"
                    values="10;15;20;25;30;35;40;45;50;0;10"
                  />
                </rect>
                <rect width="15" height="140" x="121" rx="6">
                  <animate
                    attributeName="height"
                    begin="0s"
                    calcMode="linear"
                    dur="1s"
                    repeatCount="indefinite"
                    values="120;110;100;90;80;70;60;50;40;140;120"
                  />
                  <animate
                    attributeName="y"
                    begin="0s"
                    calcMode="linear"
                    dur="1s"
                    repeatCount="indefinite"
                    values="10;15;20;25;30;35;40;45;50;0;10"
                  />
                </rect>
                <rect width="15" height="120" x="151" y="10" rx="6">
                  <animate
                    attributeName="height"
                    begin="0.25s"
                    calcMode="linear"
                    dur="1s"
                    repeatCount="indefinite"
                    values="120;110;100;90;80;70;60;50;40;140;120"
                  />
                  <animate
                    attributeName="y"
                    begin="0.25s"
                    calcMode="linear"
                    dur="1s"
                    repeatCount="indefinite"
                    values="10;15;20;25;30;35;40;45;50;0;10"
                  />
                </rect>
                <rect width="15" height="120" x="181" y="10" rx="6">
                  <animate
                    attributeName="height"
                    begin="0.5s"
                    calcMode="linear"
                    dur="1s"
                    repeatCount="indefinite"
                    values="120;110;100;90;80;70;60;50;40;140;120"
                  />
                  <animate
                    attributeName="y"
                    begin="0.5s"
                    calcMode="linear"
                    dur="1s"
                    repeatCount="indefinite"
                    values="10;15;20;25;30;35;40;45;50;0;10"
                  />
                </rect>
              </svg>
            </button>
          ) : (
            <button onClick={toggleConversation} className="w-12 h-12">
              {!loading ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                  className="w-full h-full"
                >
                  <rect width="15" height="30" y="113" rx="6" x="61"></rect>
                  <rect width="15" height="30" x="91" y="113" rx="6"></rect>
                  <rect width="15" height="30" x="121" rx="6" y="113"></rect>
                  <rect width="15" height="30" x="151" y="113" rx="6"></rect>
                  <rect width="15" height="30" x="181" y="113" rx="6"></rect>
                </svg>
              ) : (
                <svg
                  className="w-full h-full"
                  viewBox="0 0 135 135"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#171616"
                >
                  <path d="M67.447 58c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10zm9.448 9.447c0 5.523 4.477 10 10 10 5.522 0 10-4.477 10-10s-4.478-10-10-10c-5.523 0-10 4.477-10 10zm-9.448 9.448c-5.523 0-10 4.477-10 10 0 5.522 4.477 10 10 10s10-4.478 10-10c0-5.523-4.477-10-10-10zM58 67.447c0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10 10-4.477 10-10z">
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 67 67"
                      to="-360 67 67"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                  </path>
                  <path d="M28.19 40.31c6.627 0 12-5.374 12-12 0-6.628-5.373-12-12-12-6.628 0-12 5.372-12 12 0 6.626 5.372 12 12 12zm30.72-19.825c4.686 4.687 12.284 4.687 16.97 0 4.686-4.686 4.686-12.284 0-16.97-4.686-4.687-12.284-4.687-16.97 0-4.687 4.686-4.687 12.284 0 16.97zm35.74 7.705c0 6.627 5.37 12 12 12 6.626 0 12-5.373 12-12 0-6.628-5.374-12-12-12-6.63 0-12 5.372-12 12zm19.822 30.72c-4.686 4.686-4.686 12.284 0 16.97 4.687 4.686 12.285 4.686 16.97 0 4.687-4.686 4.687-12.284 0-16.97-4.685-4.687-12.283-4.687-16.97 0zm-7.704 35.74c-6.627 0-12 5.37-12 12 0 6.626 5.373 12 12 12s12-5.374 12-12c0-6.63-5.373-12-12-12zm-30.72 19.822c-4.686-4.686-12.284-4.686-16.97 0-4.686 4.687-4.686 12.285 0 16.97 4.686 4.687 12.284 4.687 16.97 0 4.687-4.685 4.687-12.283 0-16.97zm-35.74-7.704c0-6.627-5.372-12-12-12-6.626 0-12 5.373-12 12s5.374 12 12 12c6.628 0 12-5.373 12-12zm-19.823-30.72c4.687-4.686 4.687-12.284 0-16.97-4.686-4.686-12.284-4.686-16.97 0-4.687 4.686-4.687 12.284 0 16.97 4.686 4.687 12.284 4.687 16.97 0z">
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 67 67"
                      to="360 67 67"
                      dur="8s"
                      repeatCount="indefinite"
                    />
                  </path>
                </svg>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default App;

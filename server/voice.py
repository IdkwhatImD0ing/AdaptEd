import json
import os
from dotenv import load_dotenv
from fastapi import Request, WebSocket, WebSocketDisconnect, APIRouter
from fastapi.responses import JSONResponse

from llm import LlmClient
import asyncio
from retell import Retell

load_dotenv()

router = APIRouter(
    prefix="/voice",
    responses={404: {"description": "Not found"}},
)

client = Retell(api_key=os.environ["RETELL_API_KEY"])

# Maps call IDs to their respective data_websockets
# Used to send function call results to sidebar because Retell's websocket doesn't
data_websockets = {}


@router.post("/register-call-on-your-server")
async def handle_register_call_api(request: Request):
    # Extract agentId from request body; apiKey should be securely stored and not passed from the client
    agent_id = (await request.json())["agentId"]

    try:
        call = client.call.register(
            agent_id=agent_id,
            audio_encoding="s16le",
            audio_websocket_protocol="web",
            sample_rate=24000,
        )
        return JSONResponse(
            {
                "callId": call.call_id,
                "sampleRate": call.sample_rate,
            }
        )
    except Exception as error:
        print(f"Error registering call: {error}")
        # Send an error response back to the client
        return JSONResponse({"error": "Failed to register call"}, status_code=500)


@router.websocket("/llm-websocket/{call_id}")
async def websocket_handler(websocket: WebSocket, call_id: str):
    await websocket.accept()
    print(f"LLM WebSocket connected for {call_id}")

    llm_client = LlmClient()

    # send first message to signal ready of server
    response_id = 0
    first_event = llm_client.draft_begin_messsage()
    await websocket.send_text(json.dumps(first_event))

    async def stream_response(request):
        global data_websockets
        nonlocal response_id
        nonlocal call_id

        for event in llm_client.draft_response(request):
            if "is_function" in event:
                # If "function call result" websocket has been established, use it to send func calls
                if call_id in data_websockets:
                    func_socket = data_websockets[call_id]
                    await func_socket.send_text(json.dumps(event))
                else:
                    print(
                        f"\033[91mError: Function call occurred but no data_websocket connected to send it for call ID: {call_id}\033[0m"
                    )
            else:
                await websocket.send_text(json.dumps(event))
                if request["response_id"] < response_id:
                    return  # new response needed, abondon this one

    try:
        while True:
            message = await websocket.receive_text()
            request = json.loads(message)
            # print out transcript
            # os.system("cls" if os.name == "nt" else "clear")
            # print(json.dumps(request, indent=4))

            if "response_id" not in request:
                continue  # no response needed, process live transcript update if needed
            response_id = request["response_id"]
            asyncio.create_task(stream_response(request))
    except WebSocketDisconnect:
        print(f"LLM WebSocket disconnected for {call_id}")
    except Exception as e:
        print(f"LLM WebSocket error for {call_id}: {e}")
    finally:
        print(f"LLM WebSocket connection closed for {call_id}")


@router.websocket("/data-websocket/{call_id}")
async def data_websocket_handler(websocket: WebSocket, call_id: str):
    await websocket.accept()
    data_websockets[call_id] = websocket
    print(f"Data websocket connected for {call_id}")

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        print(f"Data WebSocket disconnected for {call_id}")
        del data_websockets[call_id]

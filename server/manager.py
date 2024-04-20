from typing import Dict
from fastapi.websockets import WebSocket


class ConnectionManager:
    # initializes ws and adds to active connections inside of a dictionary
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    # establish connection between a client and ws. waits for ws to start and adds accepted client to active connections
    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        print(self.active_connections)

    # disconnects client from ws
    async def disconnect(self, client_id: str):
        del self.active_connections[client_id]
        print(self.active_connections)

    #  converts music into binary which it then sends as bytes
    async def send_personal_message(self, data: dict, websocket: WebSocket):
        await websocket.send_json(data)

    # shows music to all clients with active connections to the ws
    async def broadcast(self, data: dict):
        for connection in self.active_connections.values():
            await connection.send_json(data)

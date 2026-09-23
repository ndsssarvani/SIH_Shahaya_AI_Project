import json
import asyncio
from typing import List, Dict, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(prefix="/ws", tags=["realtime"])


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        dead_connections = []
        for connection in list(self.active_connections):
            try:
                await connection.send_text(message)
            except Exception:
                dead_connections.append(connection)
        for dc in dead_connections:
            self.disconnect(dc)

    async def broadcast_json(self, data: Dict[str, Any]):
        message = json.dumps(data)
        await self.broadcast(message)


manager = ConnectionManager()


def dispatch_alert_event(alert_data: Dict[str, Any]):
    """Sync wrapper to schedule alert broadcast across all active WebSocket connections."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(manager.broadcast_json(alert_data))
        else:
            loop.run_until_complete(manager.broadcast_json(alert_data))
    except RuntimeError:
        # Fallback if no event loop in thread
        new_loop = asyncio.new_event_loop()
        new_loop.run_until_complete(manager.broadcast_json(alert_data))
        new_loop.close()
    except Exception as e:
        print(f"[WS Alert Dispatch Warning] {e}")


@router.websocket("/officer")
async def officer_alerts_socket(websocket: WebSocket):
    """Officers connect here to receive live risk alerts as they're generated."""
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection open and accept heartbeat pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


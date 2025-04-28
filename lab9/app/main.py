from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.chat import ConnectionManager
import logging

# Configure logging
logging.basicConfig(
    filename="chat.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    filemode="a"
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Real-Time Chat API", description="WebSocket-based chat application", version="1.0.0")

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize connection manager
manager = ConnectionManager()

@app.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    await manager.connect(websocket, username)
    logger.info(f"User {username} connected")
    try:
        while True:
            data = await websocket.receive_text()
            logger.info(f"Message from {username}: {data}")
            await manager.broadcast(f"{username}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket, username)
        logger.info(f"User {username} disconnected")
        await manager.broadcast(f"{username} has left the chat")

@app.on_event("startup")
async def startup():
    logger.info("Chat application started")

@app.on_event("shutdown")
async def shutdown():
    logger.info("Chat application shutdown")
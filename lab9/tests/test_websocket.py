import pytest
from fastapi.testclient import TestClient
from app.main import app
from fastapi import WebSocketDisconnect
import asyncio

client = TestClient(app)

@pytest.mark.asyncio
async def test_websocket_connect_disconnect():
    async with client.websocket_connect("/ws/testuser1") as websocket:
        # Check connection
        await websocket.send_text("Hello, chat!")
        message = await websocket.receive_text()
        assert "testuser1: Hello, chat!" in message
        # Disconnect is handled automatically by context manager

@pytest.mark.asyncio
async def test_websocket_broadcast():
    async with client.websocket_connect("/ws/user1") as ws1, \
               client.websocket_connect("/ws/user2") as ws2:
        await ws1.send_text("Hi from user1")
        # Receive message in both clients
        msg1 = await ws1.receive_text()
        msg2 = await ws2.receive_text()
        assert msg1 == "user1: Hi from user1"
        assert msg2 == "user1: Hi from user1"

@pytest.mark.asyncio
async def test_websocket_disconnect_broadcast():
    async with client.websocket_connect("/ws/user3") as ws1, \
               client.websocket_connect("/ws/user4") as ws2:
        await ws1.close()  # Simulate disconnect
        msg = await ws2.receive_text()
        assert msg == "user3 has left the chat"
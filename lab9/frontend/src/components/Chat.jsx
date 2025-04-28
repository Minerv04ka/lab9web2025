import React, { useState, useEffect, useRef } from 'react';

function Chat() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);
  const chatContainerRef = useRef(null);

  const connectWebSocket = (username) => {
    console.log('Attempting to connect to WebSocket with username:', username);
    const websocket = new WebSocket(`ws://localhost:8000/ws/${username}`);
    
    websocket.onopen = () => {
      console.log('WebSocket connected');
      setMessages((prev) => [...prev, `Connected as ${username}`]);
    };

    websocket.onmessage = (event) => {
      console.log('Received message:', event.data);
      setMessages((prev) => [...prev, event.data]);
    };

    websocket.onclose = () => {
      console.log('WebSocket closed');
      setMessages((prev) => [...prev, 'Disconnected from server']);
      setWs(null); // Allow reconnection
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setMessages((prev) => [...prev, 'WebSocket connection failed']);
    };

    setWs(websocket);
  };

  useEffect(() => {
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [ws]);

  useEffect(() => {
    // Scroll to bottom of chat
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const connect = (e) => {
    e.preventDefault();
    if (username.trim()) {
      connectWebSocket(username);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && ws && ws.readyState === WebSocket.OPEN) {
      console.log('Sending message:', message);
      ws.send(message);
      setMessage('');
    } else {
      console.log('Cannot send message: WebSocket is not open');
      setMessages((prev) => [...prev, 'Error: Cannot send message, please reconnect']);
      setWs(null); // Reset to allow reconnection
    }
  };

  return (
    <div>
      {!ws ? (
        <form onSubmit={connect}>
          <h2>Enter Chat</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />
          <button type="submit">Join Chat</button>
        </form>
      ) : (
        <div>
          <h2>Chat as {username}</h2>
          <div className="chat-container" ref={chatContainerRef}>
            {messages.map((msg, index) => (
              <div key={index} className="message">{msg}</div>
            ))}
          </div>
          <form onSubmit={sendMessage}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message"
              required
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chat;
import React, { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const API_URL = "http://localhost:5000/api/journal"; // Route all requests through backend
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const from = params.get("from");
    if (from === "negative") {
      setMessages([
        {
          text: "🌧️ Hey, I noticed you're feeling a bit low. Let it all out — I'm here for you ❤️",
          sender: "bot",
        },
      ]);
    }
  }, []);
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);
    setInput("");
    setLoading(true); // show animation
    try {
      // Sending message to the backend which will forward it to the ML model
      const res = await axios.post(API_URL, {
        text: userMessage,
      });
      const botReply = res.data.result;

      // Display the ML model's response
      setMessages((prev) => [...prev, { text: botReply, sender: "bot" }]);
    } catch (error) {
      console.error("Error communicating with backend:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Oops! Something went wrong 😢", sender: "bot" },
      ]);
    }
    setLoading(false); // show animation
  };

  return (
    <div className="app">
      <h1>🌞 RANT AI</h1>
      <p className="mood-message">
        Hey there! I'm here to brighten your day. 🌈 Just type how you feel 🌻
      </p>
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`message-row ${msg.sender}`}>
            {msg.sender === "bot" && <div className="avatar">🤖</div>}
            <div className={`message ${msg.sender}`}>{msg.text}</div>
            {msg.sender === "user" && <div className="avatar">🧑</div>}
          </div>
        ))}

        {loading && (
          <div className="message-row bot">
            <div className="avatar">🤖</div>
            <div className="message bot loading-indicator">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
      </div>
      <div className="input-area">
        <input
          type="text"
          placeholder="Tell me what's on your mind..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;

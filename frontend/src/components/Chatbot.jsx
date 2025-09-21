// components/Chatbot.jsx
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FiMessageCircle, FiX } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

export default function Chatbot({ sessionId }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new message
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages]);

const sendMessage = async () => {
  if (!input.trim()) return;
  const userMsg = { role: "user", message: input };
  setMessages((prev) => [...prev, userMsg]);
  setInput("");
  setLoading(true);

  try {
    const res = await axios.post("http://localhost:5000/api/chat/ask", {
      sessionId,
      message: input,
    });

    const reply = res.data.reply;
    let typedMsg = "";
    const botMsg = { role: "assistant", message: "" };
    setMessages((prev) => [...prev, botMsg]);

    let i = 0;
    const interval = setInterval(() => {
      if (i < reply.length) {
        typedMsg += reply[i];
        i++;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", message: typedMsg };
          return updated;
        });
      } else {
        clearInterval(interval);
        setLoading(false);
      }
    }, 30); // typing speed in ms (30ms per char)
  } catch (err) {
    console.error("❌ ChatBot error:", err);
    const errMsg = { role: "assistant", message: "Sorry, something went wrong. Try again." };
    setMessages((prev) => [...prev, errMsg]);
    setLoading(false);
  }
};

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

   return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat window */}
      <div
        className={`transition-all duration-300 ease-in-out transform origin-bottom-right 
          ${open ? "scale-100 opacity-100 h-150 w-80" : "scale-0 opacity-0 h-0 w-0"} 
          bg-white shadow-lg rounded-lg flex flex-col overflow-hidden`}
      >
        {open && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between bg-[#006A71] p-3">
              <h2 className="text-white font-bold">Chatbot</h2>
              <button onClick={() => setOpen(false)}>
                <FiX className="text-white text-xl" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-gray-50">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg max-w-[75%] ${
                    msg.role === "user" ? "bg-[#C1F0F6] ml-auto" : "bg-[#E2E8F0] mr-auto"
                  }`}
                >
                  <ReactMarkdown>{msg.message}</ReactMarkdown>
                </div>
              ))}
              {loading && (
                <div className="p-2 rounded-lg bg-[#E2E8F0] mr-auto animate-pulse">...</div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-2 flex gap-2 border-t border-gray-200">
              <textarea
                rows={1}
                className="flex-1 resize-none border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#9ACBD0] overflow-hidden"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="bg-[#9ACBD0] text-white px-3 py-1 rounded hover:bg-[#76b5b8]"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>

      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="bg-[#006A71] text-white p-4 rounded-full shadow-lg hover:bg-[#76b5b8] transition-transform duration-300 transform hover:scale-110"
        >
          <FiMessageCircle className="text-xl" />
        </button>
      )}
    </div>
  );
}
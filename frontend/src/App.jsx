// App.jsx
import { useEffect, useState } from 'react'
import { ReactTyped } from 'react-typed'
import './index.css'
import axios from 'axios'
import CardWithHistory from './components/Form'
import ChatBot from './components/Chatbot'

function App() {
  const [sessionId, setSessionId] = useState(null)
  const [loading, setLoading] = useState(true)

useEffect(() => {
  const initSession = async () => {
    let storedSession = localStorage.getItem("sessionId");

    try {
      if (!storedSession) {
        // 🚀 Request a new session
        const res = await axios.post("http://localhost:5000/api/session");
        storedSession = res.data.sessionId;
        localStorage.setItem("sessionId", storedSession);
      }
      console.log("Session ID:", storedSession); // ✅ Move it here
      setSessionId(storedSession);
    } catch (err) {
      console.error("❌ Failed to initialize session:", err.message);
    } finally {
      setLoading(false);
    }
  };

  initSession();
}, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-600">Initializing session...</p>
      </div>
    )
  }


  return (
    <>
      <div className="flex justify-center px-4">
        <h1 className="header-font text-[#9ACBD0] text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mt-6 text-center">
          <ReactTyped
            strings={[
              "3D PRINTING CALCULATOR",
              "WITH A.I. CHATBOT",
              "SAVE YOUR CALCULATIONS!"
            ]}
            typeSpeed={60}
            backSpeed={40}
            loop
          />
        </h1>
      </div>
      
      <CardWithHistory sessionId={sessionId} />

      <ChatBot sessionId={sessionId} />
    </>
  )
}

export default App

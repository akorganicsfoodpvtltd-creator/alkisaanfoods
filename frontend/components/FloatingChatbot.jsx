"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Simple, local-friendly icons
import { IoChatbubbleEllipses, IoSend, IoClose, IoRemove, IoCall } from "react-icons/io5";
import { RiCustomerService2Fill } from "react-icons/ri";
import { FaUserCircle, FaLeaf, FaWhatsapp } from "react-icons/fa";

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Quick reply options
  const quickReplies = [
    "📍 Store Locations",
    "🛒 Products & Prices",
    "🌾 Gluten Free",
    "📞 Contact Us",
    "💰 Wholesale",
    "🚚 Delivery"
  ];

  // Company contact number
  const COMPANY_PHONE = "+923004809083";
  const WHATSAPP_NUMBER = "923004809083";

  // Greeting when chatbot opens
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          type: "bot",
          text: "👋 Assalam-o-Alaikum! Main Al Kissan Foods ka assistant hoon.",
          timestamp: new Date().toLocaleTimeString()
        },
        {
          type: "bot",
          text: "Aap kis cheez mein madad chahenge?",
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    }
  }, [open]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Focus input when opened
  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [open, minimized]);

  // Handle Call Button Click
  const handleCallClick = () => {
    window.location.href = `tel:${COMPANY_PHONE}`;
  };

  // Handle WhatsApp Button Click
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Assalam-o-Alaikum! Main Al Kissan Foods ke chatbot se baat kar raha hoon. Mujhe madad chahiye.");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { 
      type: "user", 
      text: input,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch("http://localhost:5000/api/chatbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });

      const data = await res.json();
      setTyping(false);

      if (data.found) {
        setMessages(prev => [
          ...prev,
          { 
            type: "bot", 
            text: data.reply,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      } else {
        // Message with contact options - Proper format
        setMessages(prev => [
          ...prev,
          { 
            type: "bot", 
            text: "Mujhe is sawal ka jawab nahi mila. Kya aap chahenge ke humare customer service representative aap se contact karein?",
            timestamp: new Date().toLocaleTimeString(),
            showContactOptions: true
          }
        ]);
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setTyping(false);
      setMessages(prev => [
        ...prev,
        { 
          type: "bot", 
          text: "Technical issue aa raha hai. Barah-e-karam dobara try karein.",
          timestamp: new Date().toLocaleTimeString(),
          showContactOptions: true
        }
      ]);
    }
  };

  const handleQuickReply = (reply) => {
    setInput(reply);
    setTimeout(() => sendMessage(), 100);
  };

  const toggleMinimize = () => {
    setMinimized(!minimized);
  };

  const formatTime = (timestamp) => {
    return timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-green-600 to-green-500 text-white shadow-2xl z-50 flex items-center justify-center group hover:shadow-lg border-2 border-white/20"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {open ? (
          <IoClose className="text-3xl" />
        ) : (
          <div className="relative">
            <RiCustomerService2Fill className="text-4xl" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white animate-pulse"></span>
          </div>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed bottom-24 right-6 w-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-200"
            style={{ height: minimized ? 'auto' : '32rem' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-700 to-green-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <IoChatbubbleEllipses className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Al Kissan Assistant</h3>
                    <p className="text-xs text-green-100 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                      Online
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={toggleMinimize}
                    className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                  >
                    <IoRemove className="text-xl" />
                  </button>
                  <button 
                    onClick={() => setOpen(false)}
                    className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                  >
                    <IoClose className="text-xl" />
                  </button>
                </div>
              </div>
            </div>

            {!minimized && (
              <>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50" style={{ height: 'calc(32rem - 130px)' }}>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mb-4 flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.type === "bot" && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-sm mr-2 flex-shrink-0 shadow-md">
                          <FaLeaf />
                        </div>
                      )}
                      <div className={`max-w-[80%] ${msg.type === "user" ? "order-1" : "order-2"}`}>
                        <div
                          className={`px-4 py-3 rounded-2xl shadow-sm ${
                            msg.type === "user"
                              ? "bg-green-600 text-white rounded-br-none"
                              : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          
                          {/* Contact Options - Proper format with message and buttons */}
                          {msg.showContactOptions && (
                            <div className="mt-4 space-y-3">
                              {/* Message line */}
                              <p className="text-xs text-gray-600 border-t pt-2">
                                Aap in numbers par bhi contact kar sakte hain:
                              </p>
                              
                              {/* Buttons */}
                              <div className="flex gap-2">
                                <button
                                  onClick={handleCallClick}
                                  className="flex-1 flex items-center justify-center gap-1 text-xs bg-green-600 text-white px-3 py-2 rounded-full hover:bg-green-700 transition-colors"
                                >
                                  <IoCall className="text-sm" />
                                  Call Now
                                </button>
                                <button
                                  onClick={handleWhatsAppClick}
                                  className="flex-1 flex items-center justify-center gap-1 text-xs bg-green-600 text-white px-3 py-2 rounded-full hover:bg-green-700 transition-colors"
                                >
                                  <FaWhatsapp className="text-sm" />
                                  WhatsApp
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        <p className={`text-xs mt-1 text-gray-400 ${msg.type === "user" ? "text-right" : "text-left"}`}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                      {msg.type === "user" && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm ml-2 flex-shrink-0 shadow-md">
                          <FaUserCircle />
                        </div>
                      )}
                    </motion.div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {typing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-sm shadow-md">
                        <FaLeaf />
                      </div>
                      <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-gray-200">
                        <div className="flex gap-1.5">
                          <motion.span 
                            animate={{ y: [0, -4, 0] }} 
                            transition={{ repeat: Infinity, duration: 0.8 }} 
                            className="w-2 h-2 bg-green-500 rounded-full" 
                          />
                          <motion.span 
                            animate={{ y: [0, -4, 0] }} 
                            transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} 
                            className="w-2 h-2 bg-green-500 rounded-full" 
                          />
                          <motion.span 
                            animate={{ y: [0, -4, 0] }} 
                            transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} 
                            className="w-2 h-2 bg-green-500 rounded-full" 
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Quick Replies */}
                <div className="px-4 py-3 bg-white border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {quickReplies.map((reply, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickReply(reply)}
                        className="text-xs bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700 px-3 py-1.5 rounded-full border border-gray-200"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-200 bg-white p-3">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1 border border-gray-200 focus-within:border-green-500">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && sendMessage()}
                      placeholder="Apna message likhein..."
                      className="flex-1 py-2.5 bg-transparent outline-none text-sm"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim()}
                      className={`p-2 rounded-full ${
                        input.trim() 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <IoSend />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
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
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 768);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const chatRef = useRef(null);

  // Responsive breakpoints
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  const isLaptop = windowWidth >= 1024 && windowWidth < 1440;
  const isDesktop = windowWidth >= 1440;

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

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Prevent body scroll when chat is open on mobile
  useEffect(() => {
    if (open && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open, isMobile]);

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

  // Responsive styles - FIXED for laptop screens
  const getChatWindowWidth = () => {
    if (isMobile) return 'calc(100% - 32px)';
    if (isTablet) return '380px';
    if (isLaptop) return '400px';
    return '420px'; // Desktop
  };

  const getChatWindowHeight = () => {
    if (minimized) return 'auto';
    if (isMobile) return 'min(600px, 80vh)';
    if (isTablet) return 'min(600px, 70vh)';
    if (isLaptop) return 'min(650px, 80vh)';
    return '700px'; // Desktop
  };

  const getChatPosition = () => {
    if (isMobile) {
      return {
        bottom: '80px',
        right: '16px',
        left: '16px',
      };
    }
    return {
      bottom: '90px',
      right: '24px',
    };
  };

  const getButtonSize = () => {
    if (isMobile) return 'w-14 h-14';
    return 'w-16 h-16';
  };

  const getIconSize = () => {
    if (isMobile) return 'text-3xl';
    return 'text-4xl';
  };

  const getMessagesHeight = () => {
    if (isMobile) return 'calc(min(600px, 80vh) - 200px)';
    if (isTablet) return 'calc(min(600px, 70vh) - 190px)';
    if (isLaptop) return 'calc(min(650px, 80vh) - 190px)';
    return 'calc(700px - 190px)'; // Desktop
  };

  const position = getChatWindowWidth();

  return (
    <>
      {/* Floating Button - Responsive positioning */}
      <motion.button
        onClick={() => setOpen(!open)}
        className={`fixed ${isMobile ? 'bottom-4 right-4' : 'bottom-6 right-6'} ${getButtonSize()} rounded-full bg-gradient-to-r from-green-600 to-green-500 text-white shadow-2xl z-[9999] flex items-center justify-center group hover:shadow-lg border-2 border-white/20`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {open ? (
          <IoClose className={`${isMobile ? 'text-2xl' : 'text-3xl'}`} />
        ) : (
          <div className="relative">
            <RiCustomerService2Fill className={getIconSize()} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white animate-pulse"></span>
          </div>
        )}
      </motion.button>

      {/* Chat Window - Responsive - FIXED for laptop */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={chatRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 20 }}
            className={`fixed bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[9999] border border-gray-200`}
            style={{
              width: getChatWindowWidth(),
              height: getChatWindowHeight(),
              maxHeight: isMobile ? '80vh' : '90vh',
              bottom: isMobile ? '80px' : '90px',
              right: isMobile ? '16px' : '24px',
              left: isMobile ? '16px' : 'auto',
              marginLeft: isMobile ? 'auto' : 0,
              marginRight: isMobile ? 'auto' : 0,
            }}
          >
            {/* Header - Responsive padding */}
            <div className="bg-gradient-to-r from-green-700 to-green-600 text-white p-3 md:p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="bg-white/20 p-1.5 md:p-2 rounded-full">
                    <IoChatbubbleEllipses className={isMobile ? 'text-lg' : 'text-xl'} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>Al Kissan Assistant</h3>
                    <p className={`text-green-100 flex items-center gap-1 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                      <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-300 rounded-full animate-pulse"></span>
                      Online
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={toggleMinimize}
                    className="hover:bg-white/20 p-1 md:p-1.5 rounded-lg transition-colors"
                  >
                    <IoRemove className={isMobile ? 'text-lg' : 'text-xl'} />
                  </button>
                  <button 
                    onClick={() => setOpen(false)}
                    className="hover:bg-white/20 p-1 md:p-1.5 rounded-lg transition-colors"
                  >
                    <IoClose className={isMobile ? 'text-lg' : 'text-xl'} />
                  </button>
                </div>
              </div>
            </div>

            {!minimized && (
              <>
                {/* Messages Area - Responsive height with scroll */}
                <div 
                  className="flex-1 overflow-y-auto p-3 md:p-4 bg-gray-50" 
                  style={{ 
                    height: getMessagesHeight(),
                    maxHeight: getMessagesHeight()
                  }}
                >
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mb-3 md:mb-4 flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.type === "bot" && (
                        <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-sm mr-1.5 md:mr-2 flex-shrink-0 shadow-md`}>
                          <FaLeaf className={isMobile ? 'text-xs' : 'text-sm'} />
                        </div>
                      )}
                      <div className={`max-w-[85%] md:max-w-[80%] ${msg.type === "user" ? "order-1" : "order-2"}`}>
                        <div
                          className={`px-3 py-2 md:px-4 md:py-3 rounded-2xl shadow-sm ${
                            msg.type === "user"
                              ? "bg-green-600 text-white rounded-br-none"
                              : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                          }`}
                        >
                          <p className={`${isMobile ? 'text-xs' : 'text-sm'} break-words`}>{msg.text}</p>
                          
                          {/* Contact Options - Responsive */}
                          {msg.showContactOptions && (
                            <div className="mt-3 space-y-2">
                              <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-600 border-t pt-2`}>
                                Aap in numbers par bhi contact kar sakte hain:
                              </p>
                              
                              {/* Buttons - Stack on mobile */}
                              <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2`}>
                                <button
                                  onClick={handleCallClick}
                                  className={`flex items-center justify-center gap-1 ${isMobile ? 'text-xs py-2' : 'text-xs'} bg-green-600 text-white px-3 py-1.5 rounded-full hover:bg-green-700 transition-colors`}
                                >
                                  <IoCall className={isMobile ? 'text-xs' : 'text-sm'} />
                                  Call Now
                                </button>
                                <button
                                  onClick={handleWhatsAppClick}
                                  className={`flex items-center justify-center gap-1 ${isMobile ? 'text-xs py-2' : 'text-xs'} bg-green-600 text-white px-3 py-1.5 rounded-full hover:bg-green-700 transition-colors`}
                                >
                                  <FaWhatsapp className={isMobile ? 'text-xs' : 'text-sm'} />
                                  WhatsApp
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        <p className={`text-[10px] md:text-xs mt-1 text-gray-400 ${msg.type === "user" ? "text-right" : "text-left"}`}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                      {msg.type === "user" && (
                        <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm ml-1.5 md:ml-2 flex-shrink-0 shadow-md`}>
                          <FaUserCircle className={isMobile ? 'text-xs' : 'text-sm'} />
                        </div>
                      )}
                    </motion.div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {typing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-1.5 md:gap-2"
                    >
                      <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-sm shadow-md`}>
                        <FaLeaf className={isMobile ? 'text-xs' : 'text-sm'} />
                      </div>
                      <div className="bg-white px-3 py-2 md:px-4 md:py-3 rounded-2xl rounded-bl-none border border-gray-200">
                        <div className="flex gap-1.5">
                          <motion.span 
                            animate={{ y: [0, -4, 0] }} 
                            transition={{ repeat: Infinity, duration: 0.8 }} 
                            className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-green-500 rounded-full`} 
                          />
                          <motion.span 
                            animate={{ y: [0, -4, 0] }} 
                            transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} 
                            className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-green-500 rounded-full`} 
                          />
                          <motion.span 
                            animate={{ y: [0, -4, 0] }} 
                            transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} 
                            className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-green-500 rounded-full`} 
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Quick Replies - Responsive */}
                <div className="px-3 py-2 md:px-4 md:py-3 bg-white border-t border-gray-100 flex-shrink-0">
                  <div className="flex flex-wrap gap-1.5 md:gap-2 max-h-20 overflow-y-auto">
                    {quickReplies.map((reply, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickReply(reply)}
                        className={`${isMobile ? 'text-[10px] px-2 py-1' : 'text-xs px-3 py-1.5'} bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700 rounded-full border border-gray-200 transition-colors whitespace-nowrap`}
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Area - Responsive */}
                <div className="border-t border-gray-200 bg-white p-2 md:p-3 flex-shrink-0">
                  <div className="flex items-center gap-1.5 md:gap-2 bg-gray-100 rounded-full px-3 md:px-4 py-1 border border-gray-200 focus-within:border-green-500">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && sendMessage()}
                      placeholder={isMobile ? "Message..." : "Apna message likhein..."}
                      className="flex-1 py-2 md:py-2.5 bg-transparent outline-none text-xs md:text-sm min-w-0"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim()}
                      className={`p-1.5 md:p-2 rounded-full transition-colors flex-shrink-0 ${
                        input.trim() 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <IoSend className={isMobile ? 'text-sm' : 'text-base'} />
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
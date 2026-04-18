import { useState, useRef, useEffect } from "react";
import { X, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface QuickOption {
  id: string;
  label: string;
  response: string;
}

const QUICK_OPTIONS: QuickOption[] = [
  {
    id: "join",
    label: "How to join IEEE?",
    response: "To join IEEE, you can become a member through the official IEEE website or visit our Join page for more information about student membership benefits and the registration process. As a student member, you'll get access to exclusive resources, networking opportunities, and technical publications."
  },
  {
    id: "events",
    label: "Upcoming events",
    response: "Check out our Events page to see all upcoming workshops, seminars, and technical sessions. We regularly organize events on emerging technologies, skill development, and professional networking. Stay connected through our social media channels for the latest updates!"
  },
  {
    id: "contact",
    label: "Contact team",
    response: "You can reach our team at:\n📧 ieee.fbc@socet.edu.in\n📧 ieee.sc@socet.edu.in\n📧 ieee.tr@socet.edu.in\n📞 +91 79660 46304\n📍 Apple Lab, B-120, Silver Oak University\n\nOr visit our Contact page to send us a message directly!"
  },
  {
    id: "benefits",
    label: "IEEE benefits",
    response: "IEEE membership offers:\n• Access to cutting-edge technical papers and publications\n• Networking opportunities with professionals worldwide\n• Career development resources and job boards\n• Discounts on conferences and events\n• Leadership and skill development programs\n• Student branch activities and competitions\n• Resume building and professional recognition"
  },
  {
    id: "about",
    label: "About IEEE SOU SB",
    response: "IEEE Silver Oak University Student Branch is dedicated to providing students with opportunities for professional development, technical growth, and networking. We conduct various events, workshops, and competitions throughout the year. Visit our About page to learn more about our mission, vision, and activities!"
  },
  {
    id: "chapters",
    label: "Student chapters",
    response: "We have several active chapters:\n• WIE (Women in Engineering)\n• SPS (Signal Processing Society)\n• CS (Computer Society)\n• SIGHT (Special Interest Group on Humanitarian Technology)\n\nEach chapter focuses on specific technical domains and organizes specialized events and workshops."
  }
];

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hello! I'm your IEEE SOU SB assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [customInput, setCustomInput] = useState("");

  /* ─── Auto-scroll refs ─── */
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  // Track whether user is near the bottom of the chat
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const threshold = 100;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    setIsNearBottom(distanceFromBottom <= threshold);
  };

  // Auto-scroll to bottom when new messages arrive (only if user is near bottom)
  useEffect(() => {
    if (isNearBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isNearBottom]);

  const fetchChatResponse = async (userInput: string) => {
    try {
      const response = await fetch(`/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Server error");
      }
      const data = await response.json();
      return data.reply;
    } catch (error: any) {
      return "My AI brain seems to be offline at the moment. Please try again later or use the Quick Options!";
    }
  };

  const handleQuickOption = async (option: QuickOption) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: option.label,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    const botMessage: Message = {
      id: `bot-${Date.now()}`,
      text: option.response,
      sender: "bot",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
  };

  const handleCustomMessage = async () => {
    if (!customInput.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: customInput,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const inputToProcess = customInput;
    setCustomInput("");

    const reply = await fetchChatResponse(inputToProcess);

    const botMessage: Message = {
      id: `bot-${Date.now()}`,
      text: reply,
      sender: "bot",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCustomMessage();
    }
  };

  return (
    <>
      {/* ─── Floating Button + Tooltip ─── */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 group floating-button-mobile">
          {/* Tooltip — desktop only */}
          <span
            className="
              hidden md:block
              absolute right-full mr-3 top-1/2 -translate-y-1/2
              whitespace-nowrap
              bg-[#00629B] text-white text-xs font-medium
              px-3 py-1.5 rounded-full
              opacity-0 scale-95 -translate-x-1
              group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0
              transition-all duration-300 ease-in-out
              pointer-events-none
            "
          >
            Need help?
          </span>

          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full shadow-lg bg-[#00629B] hover:bg-[#004f7d] transition-all duration-300 hover:scale-110 hover:shadow-xl"
            size="icon"
            aria-label="Open assistant"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* ─── Chat Panel ─── */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[90vw] md:w-[400px] h-[70vh] md:h-[600px] max-h-[calc(100vh-120px)] lg:max-h-[calc(100vh-200px)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-[100] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 ai-assistant-mobile animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="bg-[#00629B] text-white p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base leading-none">IEEE SOU SB Assistant</h3>
                <p className="text-[10px] opacity-80 mt-1 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse" /> Online
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-8 w-8 rounded-full"
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Options — Marquee Slider */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">Quick Options:</p>
            <style>{`
              @keyframes marquee-scroll {
                0%   { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .marquee-track {
                display: flex;
                width: max-content;
                animation: marquee-scroll 18s linear infinite;
              }
              .marquee-track:hover {
                animation-play-state: paused;
              }
              .marquee-viewport {
                overflow: hidden;
                -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
                mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
              }
            `}</style>
            <div className="marquee-viewport">
              <div className="marquee-track gap-2">
                {/* Render twice for seamless loop */}
                {[...QUICK_OPTIONS, ...QUICK_OPTIONS].map((option, idx) => (
                  <button
                    key={`${option.id}-${idx}`}
                    onClick={() => handleQuickOption(option)}
                    className="flex-shrink-0 text-xs px-4 py-2 mx-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-[#00629B] hover:text-white hover:border-[#00629B] transition-all duration-200 shadow-sm active:scale-95 whitespace-nowrap"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50 dark:bg-gray-800/50"
          >
            {messages.map(message => (
              <div
                key={message.id}
                className={cn(
                  "flex animate-in fade-in slide-in-from-bottom-2 duration-300",
                  message.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm text-sm",
                    message.sender === "user"
                      ? "bg-[#00629B] text-white rounded-tr-none"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-gray-600"
                  )}
                >
                  <p className="whitespace-pre-line leading-relaxed">
                    {message.text.split(/(\[.*?\]\(.*?\))/g).map((part, i) => {
                      const match = part.match(/\[(.*?)\]\((.*?)\)/);
                      if (match) {
                        return (
                          <a key={i} href={match[2]} className="text-blue-600 dark:text-blue-400 underline font-semibold hover:text-blue-800 transition-colors">
                            {match[1]}
                          </a>
                        );
                      }
                      return <span key={i}>{part}</span>;
                    })}
                  </p>
                  <p className={cn(
                    "text-[10px] mt-1.5 font-medium opacity-60",
                    message.sender === "user" ? "text-right" : "text-left"
                  )}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
            {/* Invisible anchor for auto-scroll */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..."
                  rows={1}
                  className="w-full pl-4 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00629B] transition-all resize-none max-h-32"
                  style={{ height: 'auto' }}
                />
              </div>
              <Button
                onClick={handleCustomMessage}
                size="icon"
                className="bg-[#00629B] hover:bg-[#004f7d] h-10 w-10 rounded-xl shadow-md transition-all active:scale-90"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 text-center uppercase tracking-tight font-medium">
              Rule-based assistant • IEEE SOU SB 2025
            </p>
          </div>
        </div>
      )}
    </>
  );
}

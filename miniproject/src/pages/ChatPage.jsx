import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import api, { BASE_URL } from "../api";
import { getImageUrl } from "../utils/urlHelper";
import { io } from "socket.io-client";
import { Send, MessageSquareText, Trash2 } from "lucide-react";
import "../styles/chat.css";

function ChatPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  
  const messagesEndRef = useRef(null);

  // 1. Initialize Socket
  useEffect(() => {
    // Assuming backend is same domain but port 5000, or from BASE_URL
    const socketInstance = io(BASE_URL.replace("/api", ""));
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // 2. Fetch Conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get("chat/conversations");
        const convos = res.data;
        setConversations(convos);
        
        // Auto-select chat if passed via URL
        const queryParams = new URLSearchParams(window.location.search);
        const autoSelectId = queryParams.get("convo");
        
        if (autoSelectId) {
            const chatToSelect = convos.find(c => c._id === autoSelectId);
            if (chatToSelect) {
                setActiveChat(chatToSelect);
            } else {
                // If not found in list (brand new chat), fetch it specifically
                try {
                    const specificRes = await api.get(`chat/conversations`);
                    const reFetched = specificRes.data.find(c => c._id === autoSelectId);
                    if (reFetched) {
                        setConversations(specificRes.data);
                        setActiveChat(reFetched);
                    }
                } catch (e) {
                    console.error("Failed to fetch specific conversation", e);
                }
            }
        }
      } catch (err) {
        console.error("Failed to fetch conversations", err);
      }
    };
    fetchConversations();
  }, [location.search]); // Re-run if query params change

  // 3. Load Active Chat Messages & Join Socket Room
  useEffect(() => {
    if (!activeChat || !socket) return;
    
    // Join socket room
    socket.emit("join_chat", activeChat._id);

    const fetchMessages = async () => {
      try {
        const res = await api.get(`chat/${activeChat._id}/messages`);
        setMessages(res.data);
        
        // Optimistically clear the unread count in the sidebar
        setConversations(prev => prev.map(c => {
          if (c._id === activeChat._id) {
            return {
              ...c,
              unreadCounts: { ...c.unreadCounts, [user.id]: 0 }
            };
          }
          return c;
        }));
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    };
    fetchMessages();

    // Listen for incoming messages
    const handleReceiveMessage = (msg) => {
      // If we are looking at this chat, append it 
      if (msg.conversationId === activeChat._id) {
        setMessages((prev) => [...prev, msg]);
        
        // The backend also resets it to 0 when we read it, but if we're actively sitting in the room
        // and looking at it, let's keep the sidebar count at 0 and update the text snippet.
        setConversations(prev => prev.map(c => {
          if (c._id === activeChat._id) {
             return {
               ...c,
               lastMessage: msg,
               unreadCounts: { ...c.unreadCounts, [user.id]: 0 }
             };
          }
          return c;
        }));
      } else {
        // We received a message for a different chat. Update its lastMessage and bump unread count.
        setConversations(prev => prev.map(c => {
          if (c._id === msg.conversationId) {
             return {
               ...c,
               lastMessage: msg,
               unreadCounts: { 
                 ...c.unreadCounts, 
                 [user.id]: (c.unreadCounts?.[user.id] || 0) + 1 
               }
             };
          }
          return c;
        }));
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [activeChat, socket, user.id]);

  // 4. Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 5. Send Message Handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !socket) return;

    const msgData = {
      conversationId: activeChat._id,
      senderId: user.id,
      text: newMessage.trim()
    };

    // Emit via socket immediately
    socket.emit("send_message", msgData);
    setNewMessage("");
  };

  const getOtherParticipant = (convo) => {
    return convo.participants.find(p => p._id !== user.id);
  };

  // 6. Clear Chat Handler
  const handleClearChat = async () => {
    if (!window.confirm("Are you sure you want to clear this chat?")) return;
    try {
      await api.delete(`chat/${activeChat._id}/clear`);
      setMessages([]); // Clear locally
      
      // Update sidebar to remove lastMessage locally
      setConversations(prev => prev.map(c => {
        if (c._id === activeChat._id) {
          return { ...c, lastMessage: null };
        }
        return c;
      }));
    } catch (err) {
      console.error("Failed to clear chat", err);
      alert("Failed to clear chat.");
    }
  };

  // 7. Delete Chat Handler
  const handleDeleteChat = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this entire conversation?")) return;
    try {
      await api.delete(`chat/${activeChat._id}`);
      setMessages([]);
      
      // Remove conversation from sidebar
      setConversations(prev => prev.filter(c => c._id !== activeChat._id));
      setActiveChat(null);
    } catch (err) {
      console.error("Failed to delete chat", err);
      alert("Failed to delete conversation.");
    }
  };

  return (
    <div className="chat-container">
      {/* SIDEBAR - LIST OF CONVERSATIONS */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h2>Messages</h2>
        </div>
        <div className="conversations-list">
          {conversations.length === 0 ? (
            <p className="text-gray-400 text-center text-sm p-4">No conversations yet.</p>
          ) : (
            conversations.map(convo => {
              const otherUser = getOtherParticipant(convo);
              if (!otherUser) return null;
              const isSelected = activeChat?._id === convo._id;
              
              return (
                <div 
                  key={convo._id} 
                  className={`conversation-item ${isSelected ? "active" : ""}`}
                  onClick={() => setActiveChat(convo)}
                >
                  <div className="convo-avatar relative">
                    {otherUser.profilePic ? (
                      <img src={getImageUrl(otherUser.profilePic)} alt="" />
                    ) : (
                      <span className="text-xl font-bold">{otherUser.name?.charAt(0) || otherUser.email?.charAt(0) || "U"}</span>
                    )}
                  </div>
                  <div className="convo-info flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <p className="convo-name truncate pr-2">{otherUser.name || otherUser.email}</p>
                      {convo.unreadCounts && convo.unreadCounts[user.id] > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {convo.unreadCounts[user.id]}
                        </span>
                      )}
                    </div>
                    <p className={`convo-last-message truncate ${convo.unreadCounts && convo.unreadCounts[user.id] > 0 ? 'font-semibold text-gray-800' : ''}`}>
                      {convo.lastMessage ? convo.lastMessage.text : "Say hello!"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MAIN CHAT WINDOW */}
      {activeChat ? (
        <div className="chat-main">
          {/* Active Chat Header */}
          <div className="chat-header">
            <div className="convo-avatar" style={{width: 40, height: 40}}>
              {getOtherParticipant(activeChat)?.profilePic ? (
                <img src={getImageUrl(getOtherParticipant(activeChat).profilePic)} alt="" />
              ) : (
                getOtherParticipant(activeChat)?.name?.charAt(0) || "U"
              )}
            </div>
            <div>
              <h3 className="font-bold text-gray-800 m-0">
                {getOtherParticipant(activeChat)?.name || getOtherParticipant(activeChat)?.email}
              </h3>
            </div>
            
            <div className="ml-auto flex gap-2">
              <button 
                onClick={handleClearChat}
                className="text-orange-500 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 p-2 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                title="Clear Chat Messages"
                type="button"
              >
                <Trash2 size={20} />
              </button>
              <button 
                onClick={handleDeleteChat}
                className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full border border-red-200 transition-colors flex items-center justify-center cursor-pointer font-medium text-sm"
                title="Delete Entire Conversation"
                type="button"
              >
                Delete Chat
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className="chat-messages-area">
            {messages.map((msg, index) => {
              const isSentByMe = msg.sender === user.id;
              return (
                <div key={index} className={`message-bubble ${isSentByMe ? "sent" : "received"}`}>
                  {msg.text}
                  <span className="message-time">
                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form className="chat-input-area" onSubmit={handleSendMessage}>
            <input 
              type="text" 
              className="chat-input" 
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
              <Send size={20} />
            </button>
          </form>
        </div>
      ) : (
        <div className="no-chat-selected">
          <div className="empty-chat-icon shadow-xl">
            <MessageSquareText size={36} />
          </div>
          <h3 className="font-extrabold text-gray-900 text-2xl mb-3 tracking-tight">Your Conversations</h3>
          <p className="text-gray-500 max-w-xs text-center leading-relaxed">
            Select a conversation from the list to start messaging or view your history.
          </p>
        </div>
      )}
    </div>
  );
}

export default ChatPage;

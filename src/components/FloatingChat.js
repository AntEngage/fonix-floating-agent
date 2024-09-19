import React, { useState, useEffect } from 'react';
import ChatSDK from '../sdk/chat-sdk';
import './FloatingChat.css';

const FloatingChat = ({ host, port, conversationId, callerName, phoneNumber, ariClient, token, actionPrompt, callDirection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [chatSDK, setChatSDK] = useState(null);

  useEffect(() => {
    const sdk = new ChatSDK({ host, port, conversationId, callerName, phoneNumber, ariClient, token, actionPrompt, callDirection });
    sdk.setOnMessageCallback((data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });
    setChatSDK(sdk);

    const chatContainer = document.querySelector('.floating-chat-container');
    if (chatContainer) {
      chatContainer.style.zIndex = '999999';
    }

    return () => {
      sdk.disconnect();
    };
  }, []);

  const handleSendMessage = () => {
    if (chatSDK && message) {
      chatSDK.sendMessage(message);
      setMessages((prevMessages) => [...prevMessages, { from: 'me', text: message }]);
      setMessage('');
    }
  };

  return (
    <div className="floating-chat-container">
      <div className={`floating-chat-button ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        💬
      </div>
      {isOpen && (
        <div className={`chat-window ${isOpen ? 'open' : ''}`}>
          <div className="chat-header">
            <h4>Chat</h4>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.from === 'me' ? 'me' : 'them'}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChat;

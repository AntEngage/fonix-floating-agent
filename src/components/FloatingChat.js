import React, { useState, useEffect, useRef } from 'react';
import ChatSDK from '../sdk/chat-sdk';
import './FloatingChat.css';
import AudioHandler from './AudioHandler';
import OutboundCallIcon from '../assets/images/outgoing-call.svg';
import ChatIcon from '../assets/images/chat.svg';
import Avatar from '../assets/images/avatar.svg';
const { v4: uuidv4 } = require('uuid');

const FloatingChat = ({
  ae_domain,
  botId,
  token,
  licenseToken,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isWebCallOpen, setIsWebCallOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [chatSDK, setChatSDK] = useState(null);
  const [socketConnected, setSocketConnected] = useState(true);
  const [conversationId, setConversationId] = useState(uuidv4());
  const [isBreathing, setIsBreathing] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const sdk = new ChatSDK({
      ae_domain,
      conversationId,
      botId,
      token,
      licenseToken,
    });
    sdk.setOnMessageCallback((data) => {
      let newMessage = data.text;
      if (newMessage && newMessage.includes('#call-switch')) {
        newMessage = newMessage.replace('#call-switch', '').trim();
        setIsBreathing(true);
        setTimeout(() => {
          setIsBreathing(false);
        }, 10000);
      }
      setMessages((prevMessages) => [...prevMessages, { ...data, text: newMessage }]);
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (chatSDK && message) {
      chatSDK.sendMessage(message);
      setMessages((prevMessages) => [...prevMessages, { from: 'me', text: message }]);
      setMessage('');
    }
  };

  return (
    <div className="floating-chat-container">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <img className="ae-logo" height="25" width="25" src='ae-logo.png'></img>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>
          <div className="chat-messages">
            {messages.map((msg, index) =>
              msg.sender !== 'fonix' ? (
                <div key={index} className="chat-message me">
                  <span>{msg.text}</span>
                </div>
              ) : (
                <div key={index} className="chat-message them">
                  <div className="avatar-wrapper">
                    <Avatar />
                  </div>
                  <div className="message-content">
                    <span>{msg.text}</span>
                  </div>
                </div>
              )
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input">
            <div className="input-container">
              <input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="message-input"
              />
              <button onClick={handleSendMessage} className="send-button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.18412 4.11244C4.33657 3.98818 4.54771 3.96483 4.72363 4.05279L19.7236 11.5528C19.893 11.6375 20 11.8106 20 12C20 12.1894 19.893 12.3625 19.7236 12.4472L4.72363 19.9472C4.54771 20.0352 4.33657 20.0118 4.18412 19.8876C4.03167 19.7633 3.96623 19.5612 4.0169 19.3712L5.98255 12L4.0169 4.62884C3.96623 4.4388 4.03167 4.2367 4.18412 4.11244ZM6.88416 12.5L5.26911 18.5564L18.382 12L5.26911 5.44357L6.88416 11.5H13.5C13.7762 11.5 14 11.7239 14 12C14 12.2761 13.7762 12.5 13.5 12.5H6.88416Z" fill="url(#paint0_linear_6296_22824)" />
                  <defs>
                    <linearGradient id="paint0_linear_6296_22824" x1="4" y1="12" x2="20" y2="12" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#3C419A" />
                      <stop offset="1" stopColor="#9332BF" />
                    </linearGradient>
                  </defs>
                </svg>
              </button>
            </div>

            <OutboundCallIcon
              className={`floating-chat-button-call ${isBreathing ? 'breathing-animation' : ''}`}
              onClick={() => {
                setIsWebCallOpen(!isWebCallOpen);
                setIsOpen(false);
              }}
            ></OutboundCallIcon>
          </div>
        </div>
      )}
      {isWebCallOpen && (
        <div className={`chat-window-web-call ${isWebCallOpen ? 'open' : ''}`}>
          <div className="chat-header-web-call">
            <img className="ae-logo" height="25" width="25" src='ae-logo.png'></img>
            <button onClick={() => setIsWebCallOpen(false)}>✕</button>
          </div>
          <AudioHandler
            conversationId={conversationId}
            showBubbleVisualizer={true}
            heading={'Flowify'}
            showTimer={true}
            direction={'horizontal'}
            socketConnected={socketConnected}
            setSocketConnected={setSocketConnected}
            botId={botId}
            ae_domain={ae_domain}
            setIsWebCallOpen={setIsWebCallOpen}
            setIsOpen={setIsOpen}
          />
        </div>
      )}
      {!isOpen && !isWebCallOpen && (
        <ChatIcon
          className="floating-chat-button"
          onClick={() => {
            setIsOpen(true);
            setIsWebCallOpen(false);
          }}
        >
        </ChatIcon>
      )}
    </div>
  );
};

export default FloatingChat;

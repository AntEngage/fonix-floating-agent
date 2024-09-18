// src/components/FloatingChatWithCall.js
import React, { useState } from 'react';
import FloatingChat from './FloatingChat'; // Reuse existing chat component
import AudioHandler from './AudioHandler'; // Reuse existing audio call component
import './FloatingChat.css'; // Include the styles

const FloatingChatWithCall = ({
  host,
  port,
  conversationId,
  callerName,
  phoneNumber,
  ariClient,
  token,
  actionPrompt,
  callDirection,
  callConfig
}) => {
  const [isCalling, setIsCalling] = useState(false);

  return (
    <div className="floating-chat-with-call-container">
      {/* Call Button */}
      {!isCalling && (
        <div className="floating-call-button" onClick={() => setIsCalling(true)}>
          📞
        </div>
      )}

      {/* Chat Component */}
      <FloatingChat
        host={host}
        port={port}
        conversationId={conversationId}
        callerName={callerName}
        phoneNumber={phoneNumber}
        ariClient={ariClient}
        token={token}
        actionPrompt={actionPrompt}
        callDirection={callDirection}
      />

      {/* Call Component */}
      {isCalling && (
        <AudioHandler
          serverUrl={callConfig.serverUrl}
          botId={callConfig.botId}
          showBubbleVisualizer={callConfig.showBubbleVisualizer}
          heading={callConfig.heading}
          showTimer={callConfig.showTimer}
          direction={callConfig.direction}
        />
      )}
    </div>
  );
};

export default FloatingChatWithCall;

// src/sdk/chat-sdk.js
import io from 'socket.io-client';

class ChatSDK {
  constructor({ host, port, conversationId, callerName, phoneNumber, ariClient, token, actionPrompt, callDirection }) {
    this.host = host;
    this.port = port;
    this.id = conversationId;
    this.callerName = callerName;
    this.phoneNumber = phoneNumber;
    this.ariClient = ariClient;
    this.token = token;
    this.actionPrompt = actionPrompt;
    this.callDirection = callDirection;
    this.socket = null;
    this.initializeSocket();
  }

  initializeSocket() {
    this.socket = io(`http://${this.host}:${this.port}`, {
      query: {
        conversation_id: this.id,
        callerName: this.callerName,
        phoneNumber: this.phoneNumber,
        ariClient: this.ariClient,
        token: this.token,
        transcriptOnly: false,
        actionPrompt: this.actionPrompt,
        call_direction: this.callDirection,
      },
    });

    this.socket.on('connect', () => {
      console.log('Connected to the Socket.IO server - ' + this.id);
    });

    this.socket.on('chat-response/' + this.id, (data) => {
      console.log(data);
      if (this.onMessage) {
        this.onMessage(data);
      }
    });
  }

  sendMessage(message) {
    if (this.socket) {
      this.socket.emit('chat', {
        conversation_id: this.id,
        body: message,
      });
    }
  }

  setOnMessageCallback(callback) {
    this.onMessage = callback;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default ChatSDK;

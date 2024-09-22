import io from 'socket.io-client';

class ChatSDK {
  constructor({ ae_domain, conversationId, botId, token, licenseToken }) {
    this.ae_domain = ae_domain;
    this.id = conversationId;
    this.botId = botId;
    this.token = token;
    this.licenseToken = licenseToken;
    this.socket = null;
    this.initializeSocket();
  }

  initializeSocket() {
    this.socket = io(this.ae_domain, {
      query: {
        conversation_id: this.id,
        botId: this.botId,
        token: this.token,
        licenseToken: this.licenseToken,
      },
    });

    this.socket.on('connect', () => {
      console.log('Connected to the Socket.IO server - ' + this.id);
    });

    this.socket.on('chat-response/' + this.id, (data) => {
      const parsedData = JSON.parse(data);
      console.log(parsedData);
      if (this.onMessage) {
        this.onMessage(parsedData);
      }
    });
    

    this.socket.on('unauthorized', (data) => {
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

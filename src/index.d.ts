import { ComponentType } from 'react';

export interface FloatingChatProps {
  host: string;
  port: number | string;
  conversationId: string;
  callerName: string;
  phoneNumber: string;
  ariClient: string;
  token: string;
  actionPrompt: string;
  callDirection: string;
}

declare const FloatingChat: ComponentType<FloatingChatProps>;
export default FloatingChat;

import { ComponentType } from 'react';

export interface FloatingChatProps {
  ae_domain: string;
  botId: string;
  token: string;
  licenseToken: string;
}

declare const FloatingChat: ComponentType<FloatingChatProps>;
export default FloatingChat;

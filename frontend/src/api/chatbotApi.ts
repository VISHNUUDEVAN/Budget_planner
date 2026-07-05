import api from './client';

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  createdAt: string;
}

export const chatbotApi = {
  getHistory: async () => {
    const res = await api.get<{ success: true; data: { messages: ChatMessage[] } }>('/chatbot/history');
    return res.data.data.messages;
  },

  sendMessage: async (text: string) => {
    const res = await api.post<{ success: true; data: { message: ChatMessage } }>('/chatbot/message', { text });
    return res.data.data.message;
  },

  clearHistory: async () => {
    const res = await api.post<{ success: true; data: { message: string } }>('/chatbot/clear');
    return res.data;
  }
};

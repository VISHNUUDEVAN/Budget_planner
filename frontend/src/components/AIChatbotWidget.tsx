import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatbotApi } from '../api/chatbotApi';
import type { ChatMessage } from '../api/chatbotApi';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, X, Send, RotateCcw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AIChatbotWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Only render if user is logged in
  if (!user) return null;

  // Fetch chat history
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chatbotHistory'],
    queryFn: chatbotApi.getHistory,
    enabled: isOpen
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: chatbotApi.sendMessage,
    onMutate: async (newText) => {
      // Cancel refetches
      await queryClient.cancelQueries({ queryKey: ['chatbotHistory'] });

      // Snapshot previous messages
      const previousMessages = queryClient.getQueryData<ChatMessage[]>(['chatbotHistory']) || [];

      // Optimistically add user message
      const tempUserMessage: ChatMessage = {
        id: Math.random().toString(),
        sender: 'user',
        text: newText,
        createdAt: new Date().toISOString()
      };
      
      queryClient.setQueryData<ChatMessage[]>(
        ['chatbotHistory'],
        [...previousMessages, tempUserMessage]
      );

      return { previousMessages };
    },
    onError: (err, newText, context) => {
      queryClient.setQueryData(['chatbotHistory'], context?.previousMessages);
    },
    onSuccess: (responseMessage) => {
      // Replace optimistic messages with actual history
      queryClient.setQueryData<ChatMessage[]>(['chatbotHistory'], (old = []) => {
        // filter out temp message and append response
        const filtered = old.filter(m => !m.id.startsWith('0.'));
        return [...filtered, responseMessage];
      });
      // Invalidate dashboard queries to update transactions if AI saved any expenses
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    }
  });

  // Clear history mutation
  const clearHistoryMutation = useMutation({
    mutationFn: chatbotApi.clearHistory,
    onSuccess: () => {
      queryClient.setQueryData(['chatbotHistory'], []);
      queryClient.invalidateQueries({ queryKey: ['chatbotHistory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    }
  });

  // Auto-open on first time onboarding
  useEffect(() => {
    const hasAutoOpened = localStorage.getItem(`chatbot_auto_opened_${user.id}`);
    if (!hasAutoOpened) {
      // We will automatically open the chatbot to guide them on first login
      setIsOpen(true);
      localStorage.setItem(`chatbot_auto_opened_${user.id}`, 'true');
    }
  }, [user.id]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(inputText);
    setInputText('');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the chat? This will clear the chat history.')) {
      clearHistoryMutation.mutate();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center text-white shadow-xl shadow-primary-500/25 border border-white/20 relative"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="flex items-center justify-center"
            >
              <MessageSquare className="w-6 h-6" />
              {/* Pulsing indicator for first-time onboarding guidance */}
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-danger-500 border-2 border-white rounded-full animate-ping" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Drawer/Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20 }}
            className="absolute bottom-18 right-0 w-[350px] sm:w-[400px] h-[500px] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary-600 to-secondary-500 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-sm leading-tight">Lifestyle AI Assistant</h3>
                  <p className="text-[10px] text-primary-100 font-semibold capitalize">Profile: {user.lifestyleType?.replace('_', ' ') || 'student'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleReset}
                  title="Reset Conversation"
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/20">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {messages.map((msg) => {
                    const isAI = msg.sender === 'ai';
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isAI ? 'justify-start' : 'justify-end'} animate-fade`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-3.5 text-xs font-semibold leading-relaxed shadow-sm ${
                            isAI
                              ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800'
                              : 'bg-primary-600 text-white'
                          }`}
                          style={{ whiteSpace: 'pre-line' }}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                  {sendMessageMutation.isPending && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 flex gap-1.5 items-center">
                        <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce delay-150" />
                        <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce delay-300" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Box */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-100 dark:border-slate-800 flex gap-2 items-center bg-white dark:bg-slate-900">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message or command..."
                className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-primary-500 focus:outline-none dark:text-white"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || sendMessageMutation.isPending}
                className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition-colors shadow-md shadow-primary-500/10"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

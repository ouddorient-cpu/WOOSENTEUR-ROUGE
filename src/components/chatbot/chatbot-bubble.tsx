'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Loader2, Minimize2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChatMessage } from './chat-message';
import { chatWithAssistant, type ChatInput, type ChatOutput } from '@/ai/flows/chatbot-flow';
import { cn } from '@/lib/utils';
import type { User } from 'firebase/auth';
import type { UserProfile } from '@/lib/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotBubbleProps {
  user?: User | null;
  userProfile?: UserProfile | null;
}

export function ChatbotBubble({ user, userProfile }: ChatbotBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get user's first name
  const getUserName = useCallback(() => {
    if (user?.displayName) {
      return user.displayName.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'ami';
  }, [user]);

  const userName = getUserName();

  // Get user plan
  const getUserPlan = useCallback((): ChatInput['userPlan'] => {
    if (!user) return 'visitor';
    return userProfile?.subscriptionPlan || 'free';
  }, [user, userProfile]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show notification bubble after delay
  // Shows for visitors and free/essential users (not standard/premium)
  useEffect(() => {
    const isPaidUser = userProfile?.subscriptionPlan === 'premium' ||
                       userProfile?.subscriptionPlan === 'standard';

    // Show notification for visitors and non-paid users
    if (!isPaidUser && !hasGreeted) {
      const timer = setTimeout(() => {
        setShowNotification(true);
      }, 3000); // Show after 3 seconds for better engagement

      return () => clearTimeout(timer);
    }
  }, [userProfile, hasGreeted]);

  // Send initial greeting when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0 && !hasGreeted) {
      const sendGreeting = async () => {
        setIsLoading(true);
        setHasGreeted(true);
        try {
          const response = await chatWithAssistant({
            userName,
            userMessage: 'Bonjour',
            userPlan: getUserPlan(),
            creditsRemaining: userProfile?.creditBalance ?? 0,
            isFirstMessage: true,
          });
          setMessages([{ role: 'assistant', content: response.response }]);
        } catch (error) {
          console.error('Greeting error:', error);
          setMessages([{
            role: 'assistant',
            content: `Salut ${userName} ! 👋 Moi c'est Woody, ton assistant Woosenteur. Comment puis-je t'aider ?`
          }]);
        } finally {
          setIsLoading(false);
        }
      };
      sendGreeting();
    }
  }, [isOpen, messages.length, hasGreeted, userName, getUserPlan, userProfile?.creditBalance]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const response = await chatWithAssistant({
        userName,
        userMessage,
        userPlan: getUserPlan(),
        creditsRemaining: userProfile?.creditBalance ?? 0,
        conversationHistory,
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Oups ${userName}, j'ai eu un petit souci ! Peux-tu réessayer ?`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setShowNotification(false);
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[380px] h-[500px] max-h-[70vh] z-50 shadow-2xl flex flex-col animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <CardHeader className="py-3 px-4 border-b bg-gradient-to-r from-blue-500 to-primary text-primary-foreground rounded-t-lg flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Image
                  src="https://res.cloudinary.com/db2ljqpdt/image/upload/v1776544330/ChatGPT_Image_23_mars_2026__21_48_54-removebg-preview_wfgbmn.png"
                  alt="Woody"
                  width={32}
                  height={32}
                  style={{ width: 32, height: 'auto' }}
                  className="drop-shadow"
                />
                Woody — Assistant Woosenteur
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={() => setIsOpen(false)}
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={() => {
                    setIsOpen(false);
                    setMessages([]);
                    setHasGreeted(false);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                role={message.role}
                content={message.content}
              />
            ))}
            {isLoading && (
              <ChatMessage
                role="assistant"
                content=""
                isLoading
              />
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input */}
          <div className="p-3 border-t flex-shrink-0">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Écris ton message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}


      {/* Floating Bubble Button — Woody avatar */}
      <button
        onClick={handleOpen}
        className={cn(
          "fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-16 h-16 rounded-full",
          "hover:scale-110 active:scale-95 transition-transform duration-200",
          "focus:outline-none",
          isOpen && "hidden"
        )}
        aria-label="Ouvrir le chat Woody"
      >
        <Image
          src="https://res.cloudinary.com/db2ljqpdt/image/upload/v1776544330/ChatGPT_Image_23_mars_2026__21_48_54-removebg-preview_wfgbmn.png"
          alt="Woody — chat Woosenteur"
          width={64}
          height={64}
          style={{ width: 64, height: 'auto' }}
          className="drop-shadow-xl"
        />
        {/* Notification dot */}
        {showNotification && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white" />
        )}
      </button>
    </>
  );
}

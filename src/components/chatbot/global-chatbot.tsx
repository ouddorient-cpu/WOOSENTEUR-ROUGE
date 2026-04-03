'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase/firestore/use-doc';
import type { UserProfile } from '@/lib/types';
import { ChatbotBubble } from './chatbot-bubble';

/**
 * Global Chatbot Wrapper
 * This is a client component that wraps the ChatbotBubble
 * and handles user authentication state for the root layout.
 * Always renders the chatbot, even for visitors (non-logged-in users).
 */
export function GlobalChatbot() {
  const { user, loading } = useUser();

  // Fetch user profile if logged in
  const userProfilePath = user ? `users/${user.uid}` : null;
  const { data: userProfile } = useDoc<UserProfile>(userProfilePath);

  // Always render chatbot - don't wait for auth loading
  // This ensures visitors see the chatbot immediately
  return <ChatbotBubble user={loading ? null : user} userProfile={userProfile} />;
}

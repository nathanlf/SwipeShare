// components/OnlineStatusProvider.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { createSupabaseComponentClient } from '@/utils/supabase/clients/component';

// Define the context type
type OnlineStatusContextType = {
  isUserOnline: (userId: string) => boolean;
  addUsersToTrack: (userIds: string[]) => void;
  onlineUsers: string[];
};

// Create the context with a default value
const OnlineStatusContext = createContext<OnlineStatusContextType>({
  isUserOnline: () => false,
  addUsersToTrack: () => {},
  onlineUsers: [],
});

// Hook for components to use
export const useOnlineStatus = () => useContext(OnlineStatusContext);

type OnlineStatusProviderProps = {
  children: React.ReactNode;
  currentUser: User | null;
};

export const OnlineStatusProvider: React.FC<OnlineStatusProviderProps> = ({ children, currentUser }) => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [usersToTrack, setUsersToTrack] = useState<string[]>([]);
  const supabase = createSupabaseComponentClient();

  // Function to check if a user is online
  const isUserOnline = useCallback((userId: string) => {
    return onlineUsers.includes(userId);
  }, [onlineUsers]);

  // Function to add users to track
  const addUsersToTrack = useCallback((userIds: string[]) => {
    setUsersToTrack(prevUsers => {
      const uniqueUsers = [...new Set([...prevUsers, ...userIds])];
      return uniqueUsers;
    });
  }, []);

  // Set up presence tracking when currentUser and usersToTrack change
  useEffect(() => {
    if (!currentUser || usersToTrack.length === 0) return;

    // Create a channel for presence tracking
    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: currentUser.id,
        },
      },
    });

    // Handle presence state changes
    channel
      .on('presence', { event: 'sync' }, () => {
        // Get the current state of all online users
        const presenceState = channel.presenceState();
        
        // Extract user IDs from presence state
        const currentOnlineUsers = Object.keys(presenceState).filter(id => 
          // Only include users we're tracking
          usersToTrack.includes(id)
        );
        
        // Update the state with online users
        setOnlineUsers(currentOnlineUsers);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // When subscribed, track the current user's presence
          await channel.track({
            user_id: currentUser.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      // Clean up the channel when the component unmounts
      supabase.removeChannel(channel);
    };
  }, [currentUser, usersToTrack, supabase]);

  return (
    <OnlineStatusContext.Provider value={{ isUserOnline, addUsersToTrack, onlineUsers }}>
      {children}
    </OnlineStatusContext.Provider>
  );
};
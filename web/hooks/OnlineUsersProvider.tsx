import React, { createContext, useContext, ReactNode } from 'react';
import { createSupabaseComponentClient } from '@/utils/supabase/clients/component';
import { useOnlineUsers } from '@/hooks/useOnlineUsers';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';

// Create context for online users
interface OnlineUsersContextType {
  onlineUsers: string[];
  isUserOnline: (userId: string) => boolean;
}

const OnlineUsersContext = createContext<OnlineUsersContextType>({
  onlineUsers: [],
  isUserOnline: () => false,
});

interface OnlineUsersProviderProps {
  children: ReactNode;
}

export function OnlineUsersProvider({ children }: OnlineUsersProviderProps) {
  const supabase = createSupabaseComponentClient();
  const [user, setUser] = useState<User | null>(null);
  
  // Get the current user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
    };
    
    getUser();
    
    // Set up auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });
    
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [supabase]);
  
  // Get online users data from hook
  const onlineUsersData = useOnlineUsers(supabase, user);
  
  return (
    <OnlineUsersContext.Provider value={onlineUsersData}>
      {children}
    </OnlineUsersContext.Provider>
  );
}

// Hook to use online users context
export function useOnlineUsersContext() {
  return useContext(OnlineUsersContext);
}
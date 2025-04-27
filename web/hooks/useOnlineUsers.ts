/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { User } from "@supabase/supabase-js";

/**
 * Hook to track online users across the app
 */
export function useOnlineUsers(supabase: SupabaseClient, user: User | null) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!user || !user.id) return;

    // Create a global presence channel
    const presenceChannel = supabase.channel("global_presence");

    // Handle users joining
    const handleUserJoin = (newPresences: any[]) => {
      const joiningUserIds = newPresences.map((presence) => presence.user_id);

      setOnlineUsers((prevUsers) => {
        // Filter out duplicates
        const uniqueJoiningIds = joiningUserIds.filter(
          (id) => !prevUsers.includes(id),
        );
        if (uniqueJoiningIds.length === 0) return prevUsers;
        return [...prevUsers, ...uniqueJoiningIds];
      });
    };

    // Handle users leaving
    const handleUserLeave = (leftPresences: any[]) => {
      const leavingUserIds = leftPresences.map((presence) => presence.user_id);

      if (leavingUserIds.length > 0) {
        setOnlineUsers((prevUsers) =>
          prevUsers.filter((userId) => !leavingUserIds.includes(userId)),
        );
      }
    };

    // Set up presence subscription
    presenceChannel
      .on("presence", { event: "join" }, (payload) => {
        handleUserJoin(payload.newPresences);
      })
      .on("presence", { event: "leave" }, (payload) => {
        handleUserLeave(payload.leftPresences);
      })
      .on("presence", { event: "sync" }, () => {
        // When syncing, get the current state
        const state = presenceChannel.presenceState();
        const currentUsers = Object.values(state).flatMap((presences: any[]) =>
          presences.map((presence) => presence.user_id),
        );

        setOnlineUsers(currentUsers);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Track the current user when subscribed
          await presenceChannel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    // Clean up
    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [supabase, user]);

  return {
    onlineUsers,
    isUserOnline: (userId: string) => onlineUsers.includes(userId),
  };
}

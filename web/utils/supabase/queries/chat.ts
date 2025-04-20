import { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { Chat } from "../models/chat";
import { Profile } from "../models/profile";

// Common select fragment to avoid repetition
const chatSelectFragment = `
  id, 
  user_1(id, name, handle, avatar_url, availability, is_flexible),
  user_2(id, name, handle, avatar_url, availability, is_flexible)
  last_activity,
  last_message_preview,
`;

/**
 * Get the two users involved in a chat by chat ID
 */
export const getUsersInChat = async (
  supabase: SupabaseClient,
  chatId: string
): Promise<[z.infer<typeof Profile>, z.infer<typeof Profile>]> => {
  const { data: chat, error } = await supabase
    .from("chat")
    .select(`
      id,
      user_1(id, name, handle, avatar_url, availability, is_flexible),
      user_2(id, name, handle, avatar_url, availability, is_flexible)
    `)
    .eq("id", chatId)
    .single();

  if (error) {
    throw new Error(`Error fetching users in chat: ${error.message}`);
  }

  const parsedChat = Chat.parse(chat);

  return [parsedChat.user_1, parsedChat.user_2];
};

/**
 * Get a single chat by ID
 */
export const getChatById = async (
  supabase: SupabaseClient,
  chatId: string
): Promise<z.infer<typeof Chat>> => {
  const { data: chat, error } = await supabase
    .from("chat")
    .select(chatSelectFragment)
    .eq("id", chatId)
    .single();

  if (error) {
    throw new Error(`Error fetching chat: ${error.message}`);
  }

  return Chat.parse(chat);
};

/**
 * Get or create a chat between two users
 */
export const getChatByUsers = async (
  supabase: SupabaseClient,
  user1Id: string,
  user2Id: string
): Promise<z.infer<typeof Chat>> => {
  const { data: existingChat, error: searchError } = await supabase
    .from("chat")
    .select(chatSelectFragment)
    .or(
      `and(user_1.eq.${user1Id},user_2.eq.${user2Id}),and(user_1.eq.${user2Id},user_2.eq.${user1Id})`
    )
    .maybeSingle();

  if (searchError) {
    throw new Error(
      `Error searching for existing chat: ${searchError.message}`
    );
  }

  if (existingChat) {
    return Chat.parse(existingChat);
  }

  const { data: newChat, error: insertError } = await supabase
    .from("chat")
    .insert({
      user_1: user1Id,
      user_2: user2Id,
      last_activity: new Date(),
    })
    .select(chatSelectFragment)
    .single();

  if (insertError) {
    throw new Error(`Error creating new chat: ${insertError.message}`);
  }

  return Chat.parse(newChat);
};

/**
 * Update chat fields like last message preview and activity
 */
export const editChat = async (
  supabase: SupabaseClient,
  chat: z.infer<typeof Chat>
): Promise<void> => {
  const updatableFields = {
    last_activity: chat.last_activity,
    last_message_preview: chat.last_message_preview,
  };

  const { error } = await supabase
    .from("chat")
    .update(updatableFields)
    .eq("id", chat.id);

  if (error) {
    throw new Error(`Error updating chat: ${error.message}`);
  }
};

/**
 * Get all chats involving a user
 */
export const getConversations = async (
  supabase: SupabaseClient,
  currentUserId: string
): Promise<z.infer<typeof Chat>[]> => {
  const { data: chats, error } = await supabase
    .from("chat")
    .select(chatSelectFragment)
    .or(`user_1.eq.${currentUserId},user_2.eq.${currentUserId}`)
    .order("last_activity", { ascending: false });

  if (error) {
    throw new Error(`Error fetching conversations: ${error.message}`);
  }

  return Chat.array().parse(chats);
};

/**
 * Returns chat ID between two users (creates one if not found)
 */
export const getOrCreateChatForNavigation = async (
  supabase: SupabaseClient,
  currentUserId: string,
  otherUserId: string
): Promise<string> => {
  const chat = await getChatByUsers(supabase, currentUserId, otherUserId);
  return chat.id;
};

import { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { DraftMessage, Message } from "../models/message";

/**
 * Fetches paginated messages for a specific chat.
 */
export const getMessages = async (
  supabase: SupabaseClient,
  chatId: string,
  cursor: number,
  textSearch?: string
): Promise<z.infer<typeof Message>[]> => {
  const query = supabase
    .from("message")
    .select(
      `
      id,
      content,
      created_at,
      attachment_url,
      author:profile!author_id ( id, name, handle, avatar_url )
    `
    )
    .eq("chat_id", chatId)
    .order("created_at", { ascending: false })
    .range(cursor, cursor + 49);

  if (textSearch) {
    query.textSearch("content", textSearch, {
      config: "english",
      type: "plain",
    });
  }

  const { data: messages, error: messagesError } = await query;

  if (messagesError) {
    throw new Error(`Error fetching messages: ${messagesError.message}`);
  }

  return Message.array().parse(messages);
};

/**
 * Sends a message, optionally uploading an attachment,
 * and updates the chat's last activity and preview.
 */
export const sendMessage = async (
  supabase: SupabaseClient,
  draftMessage: z.infer<typeof DraftMessage>,
  file: File | null
): Promise<z.infer<typeof DraftMessage>> => {
  const { data: message, error } = await supabase
    .from("message")
    .insert(draftMessage)
    .select(
      `
      id,
      content,
      created_at,
      attachment_url,
      author:profile!message_author_id_fkey ( id, name, handle, avatar_url ),
      author_id,
      chat_id
    `
    )
    .single();

  if (error) {
    throw new Error(`Error sending message: ${error.message}`);
  }

  await supabase
    .from("chat")
    .update({
      last_activity: new Date(),
      last_message_preview: draftMessage.content.substring(0, 50),
    })
    .eq("id", draftMessage.chat_id);

  // Handle file upload and patch message with file URL
  if (file && message) {
    const { data: fileData, error: uploadError } = await supabase.storage
      .from("attachments")
      .upload(`${message.id}`, file);

    if (uploadError) {
      throw new Error(`File upload failed: ${uploadError.message}`);
    }

    if (fileData) {
      const publicUrl = supabase.storage
        .from("attachments")
        .getPublicUrl(fileData.path).data.publicUrl;

      const { data: updatedMessage, error: updateError } = await supabase
        .from("message")
        .update({
          attachment_url: publicUrl,
        })
        .eq("id", message.id)
        .select(
          `
          id,
          content,
          created_at,
          attachment_url,
          author:profile!message_author_id_fkey ( id, name, handle, avatar_url ),
          author_id,
          chat_id
        `
        )
        .single();

      if (updateError) {
        throw new Error(
          `Failed to update message with file: ${updateError.message}`
        );
      }

      return DraftMessage.parse(updatedMessage);
    }
  }

  return DraftMessage.parse(message);
};

/**
 * Fetches the last message for a specific chat.
 */
export const getLastMessage = async (
  supabase: SupabaseClient,
  chatId: string
): Promise<z.infer<typeof Message> | null> => {
  const { data: messages, error: messagesError } = await supabase
    .from("message")
    .select(
      `
      id,
      content,
      created_at,
      attachment_url,
      author:profile!author_id ( id, name, handle, avatar_url )
    `
    )
    .eq("chat_id", chatId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (messagesError) {
    throw new Error(`Error fetching last message: ${messagesError.message}`);
  }

  if (messages && messages.length > 0) {
    return Message.parse(messages[0]);
  }

  return null;
};

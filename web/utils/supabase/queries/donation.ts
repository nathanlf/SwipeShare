import { SupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { Post, PostType } from "../models/post";
import { z } from "zod";

// Create a new donation
export const createDonation = async (
  supabase: SupabaseClient,
  content: string,
  author_id: string,
  attachment_url?: string | null
): Promise<PostType> => {
  const newDonation = {
    id: uuidv4(),
    content,
    author_id,
    attachment_url: attachment_url || null,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("donation")
    .insert(newDonation)
    .select("*")
    .single();
  console.log(data)
  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return Post.parse(data);
};

// Get a donation by ID
export const getDonationById = async (
  supabase: SupabaseClient,
  donationId: string
): Promise<PostType> => {
  const { data, error } = await supabase
    .from("donation")
    .select("*")
    .eq("id", donationId)
    .single();

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return Post.parse(data);
};

// Get all donations
export const getAllDonations = async (
  supabase: SupabaseClient,
  limit: number = 50,
  offset: number = 0
): Promise<PostType[]> => {
  const { data, error } = await supabase
    .from("donation")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return z.array(Post).parse(data);
};

// Get donations by author
export const getDonationsByAuthor = async (
  supabase: SupabaseClient,
  authorId: string,
  limit: number = 50,
  offset: number = 0
): Promise<PostType[]> => {
  const { data, error } = await supabase
    .from("donation")
    .select("*")
    .eq("author_id", authorId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return z.array(Post).parse(data);
};

// Update a donation
export const updateDonation = async (
  supabase: SupabaseClient,
  donationId: string,
  updates: Partial<Omit<PostType, "id" | "created_at" | "author_id">>
): Promise<PostType> => {
  const { data, error } = await supabase
    .from("donation")
    .update(updates)
    .eq("id", donationId)
    .select("*")
    .single();

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return Post.parse(data);
};

// Delete a donation
export const deleteDonation = async (
  supabase: SupabaseClient,
  donationId: string
): Promise<boolean> => {
  const { error } = await supabase
    .from("donation")
    .delete()
    .eq("id", donationId);

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return true;
};

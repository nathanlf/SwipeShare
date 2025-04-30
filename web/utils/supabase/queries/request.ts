import { SupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { Post, PostType } from "../models/post";
import { z } from "zod";

// Create a new request
export const createRequest = async (
  supabase: SupabaseClient,
  content: string,
  author_id: string,
  attachment_url?: string | null,
): Promise<PostType> => {
  const newRequest = {
    id: uuidv4(),
    content,
    author_id,
    attachment_url: attachment_url || null,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("request")
    .insert(newRequest)
    .select("*")
    .single();

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return Post.parse(data);
};

// Get a request by ID
export const getRequestById = async (
  supabase: SupabaseClient,
  requestId: string,
): Promise<PostType> => {
  const { data, error } = await supabase
    .from("request")
    .select("*")
    .eq("id", requestId)
    .single();

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return Post.parse(data);
};

// Get all requests
export const getAllRequests = async (
  supabase: SupabaseClient,
  limit: number = 50,
  offset: number = 0,
): Promise<PostType[]> => {
  const { data, error } = await supabase
    .from("request")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return z.array(Post).parse(data);
};

// Get requests by author
export const getRequestsByAuthor = async (
  supabase: SupabaseClient,
  authorId: string,
  limit: number = 50,
  offset: number = 0,
): Promise<PostType[]> => {
  const { data, error } = await supabase
    .from("request")
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

// Update a request
export const updateRequest = async (
  supabase: SupabaseClient,
  requestId: string,
  updates: Partial<Omit<PostType, "id" | "created_at" | "author_id">>,
): Promise<PostType> => {
  const { data, error } = await supabase
    .from("request")
    .update(updates)
    .eq("id", requestId)
    .select("*")
    .single();

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return Post.parse(data);
};

// Delete a request
export const deleteRequest = async (
  supabase: SupabaseClient,
  requestId: string,
): Promise<boolean> => {
  const { error } = await supabase.from("request").delete().eq("id", requestId);

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return true;
};

export const add_interested_user_request = async(
  supabase:SupabaseClient,
  requestId:string,
  interested_user_id:string
):Promise<boolean> =>{
  const{data,error} =  await supabase
  .from("request")
  .select('interested_users')
  .eq('id',requestId)
  .single();
  if(error){ throw new Error(error.message);}
  let not_yet_added:boolean = true;
  let newarr:string[] = []
  //console.log("this is for a REQUEST")
  if(data.interested_users != null){
     newarr = data.interested_users;
     if(!(newarr.includes(interested_user_id))) {
      newarr.push(interested_user_id);
      console.log(newarr);
     }
     else{not_yet_added = false;}
  }
  else{
    newarr.push(interested_user_id);
    console.log(newarr);
  }
  const{data2,error2} = await supabase
  .from("request")
  .update({interested_users:newarr})
  .eq('id',requestId);
  if(error2){throw new Error(error2.message);}
  return not_yet_added;

  //console.log(data.interested_users.length);
  //let newarr:string[] = data.interested_users;
  //newarr.push("12345");
//  console.log(newarr);  
}

import { SupabaseClient } from "@supabase/supabase-js";
import { Profile } from "../models/profile";
import { z } from "zod";

/*export const getProfile = async (
  supabase: SupabaseClient,
  profileId: string
): Promise<z.infer<typeof Profile>> => {
  const query = supabase
    .from("profile")
    .select(`id, name, handle, avatar_url`)
    .eq("id", profileId)
    .single();

  const { data: profile, error: profileError } = await query;

  if (profileError || !profile) {
    throw new Error(`Error fetching profile.`);
  }

  return Profile.parse(profile);
};*/

export const getProfile = async(
    supabase:SupabaseClient,
    profileId:string
    ): Promise<z.infer<typeof Profile>> => {
        const {data,error} = await supabase
        .from('profile')
        .select('id, name, handle, avatar_url, availability, is_flexible')
        .eq('id',profileId)
        .single();
        console.log(data)
        if(error){console.log(error.message);
            throw new Error(error.message);}
        
          return Profile.parse(data);
}

export const changeProfileImage = async (
  supabase: SupabaseClient,
  file: File
): Promise<void> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData) throw Error("Error loading current user.");

  const { data: fileData, error: uploadError } = await supabase.storage
    .from("avatars")
    .update(`${file.name}`, file, { upsert: true });

  if (uploadError) throw Error(uploadError.message);

  const { error: updateError } = await supabase
    .from("profile")
    .update({
      avatar_url: supabase.storage.from("avatars").getPublicUrl(fileData.path, {
        transform: {
          width: 300,
          height: 300,
        },
      }).data.publicUrl,
    })
    .eq("id", userData.user.id);

  if (updateError) {
    throw new Error(`Error updating profile image: ${updateError.message}`);
  }
};

export const changeProfileDisplayName = async (
  supabase: SupabaseClient,
  newDisplayName: string
): Promise<void> => {
    
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData) throw Error("Error loading current user.");

  const { error: updateError } = await supabase
    .from("profile")
    .update({
      display_name: newDisplayName,
    })
    .eq("id", userData.user.id);

  if (updateError) {
    throw new Error(`Error updating profile: ${updateError.message}`);
  }
};


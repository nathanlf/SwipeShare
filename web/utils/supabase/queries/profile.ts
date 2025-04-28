import { SupabaseClient } from "@supabase/supabase-js";
import { Profile } from "../models/profile";
import { z } from "zod";
import { Timeslot } from "@/components/ui/availability/availability";

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

export const getProfile = async (
  supabase: SupabaseClient,
  profileId: string,
): Promise<z.infer<typeof Profile>> => {
  const { data, error } = await supabase
    .from("profile")
    .select(
      "id, name, handle, avatar_url, availability, is_flexible, is_donator",
    )
    .eq("id", profileId)
    .single();

  if (error) {
    console.log(error.message);
    throw new Error(error.message);
  }

  return Profile.parse(data);
};

export const changeProfileImage = async (
  supabase: SupabaseClient,
  user: z.infer<typeof Profile> | undefined,
  file: File
): Promise<void> => {
  // Check if user exists at the beginning of the function
  if (!user || !user.id) {
    throw new Error("User is undefined or missing ID");
  }

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
    .eq("id", user.id);

  if (updateError) {
    throw new Error(`Error updating profile image: ${updateError.message}`);
  }
};

export const changeProfileDisplayName = async (
  supabase: SupabaseClient,
  newDisplayName: string,
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

export const updateAvailability = async (
  supabase: SupabaseClient,
  availability: Timeslot[],
): Promise<void> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData) throw Error("Error loading current user.");

  const { error: updateError } = await supabase
    .from("profile")
    .update({ availability: availability })
    .eq("id", userData.user.id);

  if (updateError) {
    console.error(new Error(`Error updating profile: ${updateError.message}`));
  }
};

export const setFlexibility = async (
  supabase: SupabaseClient,
  profileId: string,
  is_flexible: boolean,
): Promise<void> => {
  const { data: data, error: error } = await supabase
    .from("profile")
    .update({ is_flexible: is_flexible })
    .eq("id", profileId)
    .select();
  console.log(data);
  if (error) {
    throw new Error(error.message);
  }
};

  export const setPersona = async(
    supabase:SupabaseClient,
    profileId:string,
    is_donator:boolean):
    Promise<void> =>{
      const{data: data, error:error} = await supabase
      .from('profile')
      .update({is_donator:is_donator})
      .eq('id',profileId)
      .select();
      console.log(data);
      if(error){throw new Error(error.message);}
    }

    export const setHandleDB = async(
      supabase:SupabaseClient,
      profileId:string,
      handle:string
    ):Promise<void>=>{
      const{data:data, error:error} = await supabase
        .from('profile')
        .update({handle:handle})
        .eq('id',profileId)
        .select();
        console.log(data);
        if(error){throw new Error(error.message);}
    }

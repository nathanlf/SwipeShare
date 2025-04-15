import { SupabaseClient, User } from "@supabase/supabase-js";
import { Profile } from "../models/post";
import { z } from "zod";



export const getProfileData = async(
    supabase:SupabaseClient,
    user:User,
    profileId:string
    ): Promise<z.infer<typeof Profile>> => {
        const {data,error} = await supabase
        .from('profile')
        .select('id,name,handle,avatar_url')
        .eq('id',profileId)
        .single();
        if(error){console.log(error.message);
            throw new Error(error.message);}
        
          // ... your implementation here ...
          return Profile.parse(data);

    }

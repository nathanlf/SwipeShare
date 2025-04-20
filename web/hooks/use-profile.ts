import { useQuery } from "@tanstack/react-query";
import { createSupabaseComponentClient } from "@/utils/supabase/component";
import { Profile } from "@/utils/supabase/models/profile";

export const useProfile = () => {
  const supabase = createSupabaseComponentClient();

  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: authResult, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authResult.user) {
        throw new Error("Not logged in");
      }

      const { data: profile, error: profileError } = await supabase
        .from("profile")
        .select("*")
        .eq("id", authResult.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error("Could not load profile");
      }

      return Profile.parse(profile); 
    },
    staleTime: 1000 * 60 * 5,
  });
};

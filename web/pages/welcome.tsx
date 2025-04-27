import { Button } from "@/components/ui/button";
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { getProfile, setFlexibility, setPersona } from "@/utils/supabase/queries/profile";
import { Carrot, Croissant, CupSoda, Salad, Soup } from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { useRouter } from "next/router";
import { toast } from "sonner";


export default function WelcomePage() {

    const queryClient = useQueryClient();
    const supabase = createSupabaseComponentClient();
    const router = useRouter();

    const { data } = useQuery({
        queryKey: ["user_profile"],
        queryFn: async () => {
            const { data } = await supabase.auth.getUser();
            if (!data) {
                return {
                    redirect: {
                        destination: "/login",
                        permanent: false,
                    },
                };
            };
            return await getProfile(supabase, data.user!.id);
        },
    });
    const gotohome = async (profileid: string) => {
        if (isDonator == null) {
            toast("Please fill out all of the fields above.", {
                className: "!bg-red-600 !text-primary-foreground !border-none",
            });
            return;
        }
        if (isFlexible == null) {
            toast("Please fill out all of the fields above.", {
                className: "!bg-red-600 !text-primary-foreground !border-none",
            });
            return;
        }
        console.log("is donator is " + isDonator);
        console.log("is flexible is " + isFlexible);
        console.log("user id is " + profileid);
        await setFlexibility(supabase, profileid, isFlexible);
        await setPersona(supabase, profileid, isDonator);
        await queryClient.resetQueries({ queryKey: ["user_profile"] });

        router.push('/');
    }

    const [isFlexible, setIsFlexible] = useState<boolean | null>(null);
    const [isDonator, setIsDonator] = useState<boolean | null>(null);

    const updatedonator = (value: string) => {
        if (value == "donating") {
            setIsDonator(true);
        } else if (value == "requesting") { setIsDonator(false); }
        else (setIsDonator(null));
    }
    const updateflexible = (value: string) => {

        if (value == "flexible") {
            setIsFlexible(true);
        }
        else if (value == "not_flexible") {
            setIsFlexible(false);
        }
        else (setIsFlexible(null));
    }

    return (
        <div className="flex min-h-[calc(100svh)] flex-col text-primary-foreground  items-center  gap-6 bg-primary1 p-6 md:p-20 font-roboto">
            <div className="flex flex-row gap-x-2">
                <Croissant size={40} className="text-accent1" />
                <Salad size={40} className="text-accent1" />
                <h1 className="text-4xl font-bold  mb-6">Welcome to SwipeShare!</h1>
                <CupSoda size={40} className="text-accent1" />
                <Carrot size={40} className="text-accent1" />
            </div>
            <div className="p-14 px-18 border border-b  bg-opacity-100 rounded-md shadow-lg">
                <div className="flex flex-row gap-x-6 justify-center items-center">
                    <div className="flex flex-col gap-y-18">
                        <p className="text-lg font-hubot">I am primarily interested in...</p>
                        <p className="text-lg font-hubot">My day-to-day meal schedule is...</p>
                    </div>
                    <div className="flex flex-col gap-y-8 flex-grow">
                        <ToggleGroup type="single" variant="outline" className="w-130" onValueChange={(value) => updatedonator(value)} >
                            <ToggleGroupItem value="donating" aria-label="Toggle bold" className="font-bold font-hubot text-md p-8 shadow-sm">
                                Donating Meal Swipes
                            </ToggleGroupItem>
                            <ToggleGroupItem value="requesting" aria-label="Toggle italic" className="font-bold font-hubot text-md p-8 shadow-sm">
                                Receiving Meal Swipes
                            </ToggleGroupItem>

                        </ToggleGroup>
                        <ToggleGroup type="single" variant="outline" className="w-130" onValueChange={(value) => updateflexible(value)}>
                            <ToggleGroupItem value="flexible" aria-label="Toggle bold" className="font-bold font-hubot text-md p-8 shadow-sm">
                                Pretty Flexible
                            </ToggleGroupItem>
                            <ToggleGroupItem value="not_flexible" aria-label="Toggle italic" className="font-bold font-hubot text-md p-8 shadow-sm">
                                Pretty Consistent
                            </ToggleGroupItem>

                        </ToggleGroup>
                    </div>
                </div>
                <div className="flex flex-col mt-8 gap-y-10 items-center justify-center">
                    <div className="flex flex-row gap-x-2 mt-10">
                        <p > Don&apos;t worry, you can always change these preferences later.</p>
                        <Soup />
                    </div>
                    <Button variant="secondary1" className="border text-primary-foreground border-primary-foreground " size="lg" onClick={() => { gotohome(data.id) }}>Start Sharing!</Button>
                </div>
            </div>

        </div>

    )
}

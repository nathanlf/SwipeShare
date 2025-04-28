import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { Profile } from "@/utils/supabase/models/profile";
import { changeProfileImage, getProfile, setFlexibility, setPersona } from "@/utils/supabase/queries/profile";
import { createSupabaseServerClient } from "@/utils/supabase/server-props";
import { User } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GetServerSidePropsContext } from "next";
import { z } from "zod";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { setHandleDB } from "@/utils/supabase/queries/profile";
import { ImageUp, UserRound} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

//get the base backend functionality set up to display the users current choices
type SettingsPageProps = { user: User; profile: z.infer<typeof Profile> };

export default function SettingsPage({ user }: SettingsPageProps) {
    const supabase = createSupabaseComponentClient();
    const queryClient = useQueryClient();
    const originalProfile = useRef<z.infer<typeof Profile> | null>(null);

    const { data: profile1 } = useQuery({
        queryKey: ["user_profile"],
        queryFn: async () => {
            const { data } = await supabase.auth.getUser();
            if (!data) return null;
            return await getProfile(supabase, data.user!.id);
        },
    });

    const [handle, setHandle] = useState<string>("");
    const [checked, setChecked] = useState<boolean>(false);
    const [isDonator, setIsDonator] = useState<boolean>(true);
    const [isChanged, setIsChanged] = useState(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        if (selectedFile && profile1) {
            changeProfileImage(supabase, profile1 , selectedFile).then(() => {
                setSelectedFile(null);
                queryClient.resetQueries();
            });
        }
    }, [queryClient, selectedFile, supabase, user, profile1]);

    useEffect(() => {
        const p = originalProfile.current;
        if (!p) return;

        const changed =
            handle !== p.handle ||
            checked !== (!!p.is_flexible) ||
            isDonator !== p.is_donator;

        setIsChanged(changed);
    }, [handle, checked, isDonator]);

    useEffect(() => {
        if (profile1 && !originalProfile.current) {
            originalProfile.current = profile1;
            setHandle(profile1.handle);
            setChecked(!!profile1.is_flexible);   // coerce to boolean
            setIsDonator(!!profile1.is_donator);
        }
    }, [profile1]);

    const checkedchange = () => {
        setChecked(!checked);
    }
    const updatePersona = (value: string) => {
        if (value == "donating") {
            setIsDonator(true)
        }
        else { setIsDonator(false) }
        //have to fill this out
        //also have to set default for toggle group based on profile.isdonator
    }

    const savechanges = () => {
        console.log("curr value of handle state is " + handle);
        console.log("curr value of donator state is " + isDonator);
        console.log("curr value of flexible state is " + checked);
        console.log(profile1);
        if (!isChanged) return;
        if (handle == "") {
            toast("Do not leave any fields blank.", {
                className: "!bg-red-600 !text-primary-foreground !border-none",
            });
            return
        }
        if (!profile1) return;
        setHandleDB(supabase, profile1?.id, handle);
        setFlexibility(supabase, profile1.id, checked);
        setPersona(supabase, profile1.id, isDonator);
        originalProfile.current = {
            ...originalProfile.current!,   // keep id, name, etc.
            handle,
            is_flexible: checked,
            is_donator: isDonator,
        };
        setIsChanged(false);
        toast("Changes saved!", {
            className: "!bg-accent1 !border-none !text-primary-foreground"
        });
    }

    const cancel = () => {
        const p = originalProfile.current;
        if (!p) return;
        console.log("original handle is " + p.handle);
        console.log("original flexibility is " + p.is_flexible);
        console.log("original donator status is " + p.is_donator);
        setHandle(p.handle);
        setChecked(!!p.is_flexible);
        setIsDonator(!!p.is_donator);
        setIsChanged(false);
        //basically, reset all values to the original ones from the database
    }

    const fileInputRef = useRef<HTMLInputElement | null>(null);


    return (
        <div className="w-full h-full flex justify-center items-center overflow-y-auto">
            <Card className="h-[80vh] w-7/10 bg-white">
                <CardHeader className="px-10">
                    <div className="flex flex-row justify-between">
                        <CardTitle className="text-4xl font-light">
                            My Profile
                        </CardTitle>
                    </div>
                    <CardDescription>
                        To change your settings, press &quot;save changes&quot; after making edits.
                    </CardDescription>
                </CardHeader>
                <CardContent className="w-full h-4/5 overflow-y-scroll flex flex-col gap-y-10 px-20">
                    <div className="flex flex-row items-center justify-between">
                        <p>Name:</p>
                        <Input disabled type="name" placeholder={profile1 ? profile1.name : "name"} className="w-2/3 border-secondary1" />
                    </div>
                    <div className="flex flex-row items-center justify-between">
                        <p>Handle:</p>
                        <Input type="handle" className="w-2/3 border-secondary1" value={handle} onChange={(e) => setHandle(e.target.value)} />
                    </div>
                    <div className="flex flex-row items-center justify-between">
                        <p>Meal Schedule:</p>
                        <div className="w-2/3 flex flex-row gap-x-2 items-center">
                            <Checkbox id="terms" checked={checked ? checked : false} onCheckedChange={checkedchange} className="border-secondary1" />
                            <label
                                htmlFor="terms"
                                className="text-md font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Flexible
                            </label>
                        </div>
                    </div>
                    <div className="flex flex-row items-center justify-between">
                        <p>Primary Persona:</p>
                        <ToggleGroup value={isDonator ? "donating" : "requesting"} type="single" variant="outline" size="sm" className="w-2/3" onValueChange={(value) => updatePersona(value)}>
                            <ToggleGroupItem value="donating" aria-label="Toggle bold" className="font-bold font-hubot text-sm  p-8 py-5 shadow-sm">
                                Donating Meal Swipes
                            </ToggleGroupItem>
                            <ToggleGroupItem value="requesting" aria-label="Toggle italic" className="font-bold font-hubot text-sm p-8 py-5 shadow-sm">
                                Receiving Meal Swipes
                            </ToggleGroupItem>

                        </ToggleGroup>
                    </div>
                    <div className="flex flex-row items-center justify-between">
                        <p>Profile Picture:</p>
                        {profile1 && (
                            <div className="flex items-center gap-8 w-2/3">
                                <Avatar className="mt-1">
                                    <AvatarImage
                                        src={
                                            supabase.storage
                                                .from("avatars")
                                                .getPublicUrl(profile1.avatar_url ?? "").data.publicUrl
                                        }
                                    />
                                    <AvatarFallback className="w-10 h-10 rounded-full bg-secondary1 flex items-center justify-center text-white">
                                        <UserRound />
                                    </AvatarFallback>
                                </Avatar>
                                <Input
                                    className="hidden"
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    onChange={(e) =>
                                        setSelectedFile(
                                            (e.target.files ?? []).length > 0
                                                ? e.target.files![0]
                                                : null
                                        )
                                    }
                                />
                                <Button variant="outline" className="border-secondary1 hover:shadow-md"
                                    onClick={() => {
                                        if (fileInputRef && fileInputRef.current)
                                            fileInputRef.current.click();
                                    }}>
                                    Change Avatar
                                    <ImageUp />
                                </Button>
                            </div>
                        )}
                    </div>



                </CardContent>
                <CardFooter className="flex flex-row justify-between gap-x-10">
                    <Button disabled={!isChanged} variant="outline" className="border-secondary1 hover:shadow-md" onClick={cancel}>Reset</Button>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button disabled={!isChanged} variant="secondary1" className="hover:bg-[#cd5bdee3] hover:shadow-md"
                                onClick={() => { setIsOpen(true) }}>
                                Save Changes
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">

                            <div className="text-center">
                                Are you sure you want to save your changes?
                            </div>
                            <div className="flex flex-row space-x-4 text-center mx-auto">
                                <DialogFooter>
                                    <Button type="submit" variant="secondary1" onClick={() => {
                                        savechanges();
                                        setIsOpen(false);
                                    }}>Save Changes</Button>
                                </DialogFooter>
                                <DialogFooter>
                                    <Button variant="secondary" onClick={() => { setIsOpen(false) }}>Cancel</Button>
                                </DialogFooter>
                            </div>

                        </DialogContent>
                    </Dialog>
                </CardFooter>
            </Card>
        </div>





    )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const supabase = createSupabaseServerClient(context);
    // Create the supabase context that works specifically on the server and
    // pass in the context.
    const { data: userData, error: userError } = await supabase.auth.getUser();

    // If the user is not logged in, redirect them to the login page.
    if (userError || !userData) {
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }

    // Return the user as props.
    return {
        props: {
            user: userData.user,
        },
    };
}
//old button before adding the dialog (in case of issues later):
// <Button disabled={!isChanged} variant="secondary1" className="hover:bg-[#cd5bdee3] hover:shadow-md" onClick={savechanges}>Save Changes</Button>

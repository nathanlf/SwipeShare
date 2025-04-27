import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import TimeInput from "../../components/ui/availability/availability";
import { createSupabaseServerClient } from "@/utils/supabase/server-props";
import { getProfile } from "@/utils/supabase/queries/profile";
import { GetServerSidePropsContext } from "next";
import { z } from "zod";
import { Profile } from "@/utils/supabase/models/profile";
import { DateTime } from "luxon";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";

type AvailabilityProps = {
  initialProfile: z.infer<typeof Profile>;
};
export default function AvailabilityPage({
  initialProfile,
}: AvailabilityProps) {
  const [available, setAvailable] = useState(false);
  const [notManual, setNotManual] = useState(true);
  const [profile, setProfile] = useState(initialProfile);
  const [now, setNow] = useState(nowEasternMs);

  const supabase = createSupabaseComponentClient();

  useEffect(() => {
    const THIRTY_SECONDS = 30_000;
    const timedExecution = setInterval(() => {
      setNow(nowEasternMs);
    }, THIRTY_SECONDS);

    return () => clearInterval(timedExecution);
  }, []);

  useEffect(() => {
    if (!notManual) return;

    const isAvailable = (profile.availability ?? []).some((slot) => {
      const start = timeStrToTodayDateNY(slot.starttime)?.getTime();
      const end = timeStrToTodayDateNY(slot.endtime)?.getTime();
      return start != null && end != null && start <= now && end >= now;
    });
    setAvailable(isAvailable);
  }, [now, profile.availability, notManual]);

  useEffect(() => {
    const channel = supabase
      .channel(`availability:${profile.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profile",
        },
        async () => {
          const newProfile = await getProfile(supabase, profile.id);
          setProfile(newProfile);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile.id, supabase]);

  return (
    <div className="w-full h-full flex justify-center items-center overflow-y-auto">
      <Card className="h-[80vh] w-7/10 bg-white">
        <CardHeader>
          <div className="flex flex-row justify-between">
            <CardTitle className="text-4xl font-light">
              <span className="text-primary">Status - </span>
              {available ? (
                <span className="text-accent1 text-4xl font-light">
                  Available to Gift
                </span>
              ) : (
                <span className="text-text text-4xl text-[#484349]">
                  Unavailable
                </span>
              )}
            </CardTitle>

            {!notManual && (
              <Popover>
                <PopoverTrigger>
                  <Button className="bg-secondary1 cursor-pointer">
                    <Plus />
                    Alter Availability
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="border-accent1 w-[350px] mt-2">
                  <h1 className="font-semibold">Status Settings</h1>
                  <p className="text-gray-500 text-sm">
                    Change your availability here.
                  </p>
                  <div className="flex flex-col justify-center items-center gap-2 mt-6">
                    <Button
                      onClick={() => {
                        setAvailable(true);
                      }}
                      className="rounded-4xl w-2/3 bg-accent1 cursor-pointer font-semibold"
                    >
                      Available to Gift
                    </Button>
                    <Button
                      onClick={() => {
                        setAvailable(false);
                      }}
                      className="rounded-4xl w-2/3 bg-[#484349] cursor-pointer font-semibold"
                    >
                      Unavailable
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>

          <CardDescription>
            *Your status will let others know that you are available to donate
            swipes.
          </CardDescription>
        </CardHeader>

        <CardContent className="w-full h-4/5 overflow-y-scroll">
          <TimeInput profile={profile} />
        </CardContent>

        <CardFooter className="flex flex-col items-end mt-auto">
          <div className="w-full flex justify-end items-center gap-5 mt-15 mb-5 pr-10">
            <Switch
              checked={notManual}
              onCheckedChange={setNotManual}
              className="h-7 w-12 cursor-pointer hover:[&>span]:bg-accent1 [&>span]:size-6 [&>span]:translate-x-[calc(100%-4px)]"
            />
            <Label className="text-base">Sync status with your schedule.</Label>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createSupabaseServerClient(context);
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const profile = await getProfile(supabase, userData.user.id);

  return {
    props: {
      initialProfile: profile,
    },
  };
}

function nowEasternMs(): number {
  return DateTime.now().setZone("America/New_York").toMillis();
}

function timeStrToTodayDateNY(timeStr: string): Date | null {
  const m = timeStr.match(/^(\d{1,2}):(\d{2})([ap])$/i);
  if (!m) return null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, h, mm, ampm] = m;
  let hour = +h % 12;
  if (ampm.toLowerCase() === "p") hour += 12;

  const dt = DateTime.now()
    .setZone("America/New_York")
    .set({ hour, minute: +mm, second: 0, millisecond: 0 });
  return dt.toJSDate();
}

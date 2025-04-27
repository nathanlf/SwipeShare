import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardDescription, CardTitle, CardContent } from "@/components/ui/card";
import CreatePost from "@/components/post";
import Image from 'next/image';


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, MapPin, MessagesSquare } from "lucide-react";
// import { User } from "@supabase/supabase-js";
// import { z } from "zod";

import { ColumnDef } from "@tanstack/react-table";

import { ScrollArea } from "@/components/ui/scroll-area";
import { GetServerSidePropsContext } from "next";
import { DataTable } from "@/components/ui/datatable";
import { createSupabaseServerClient } from "@/utils/supabase/server-props";
import { getProfile } from "@/utils/supabase/queries/profile";
import { User } from "@supabase/supabase-js";
import { z } from "zod";
import { Profile } from "@/utils/supabase/models/profile";

export type Timeslot = {
  starttime: string;
  endtime: string;
};
export const timeslots: Timeslot[] = [
  {
    starttime: "10a",
    endtime: "11a",
  },
  {
    starttime: "12:30p",
    endtime: "2p",
  },
  {
    starttime: "4p",
    endtime: "5p",
  },
];

export const columns: ColumnDef<Timeslot>[] = [
  {
    accessorKey: "starttime",
    cell: ({ row }) => {
      const { starttime, endtime } = row.original;
      return (
        <div className="text-left font-bold !rounded-md text-sm">
          {starttime} - {endtime}
        </div>
      );
    },
  },
];

// type HomePageProps = { user: User; profile: z.infer<typeof Profile> };
type HomePageProps = { user: User; profile: z.infer<typeof Profile> };

export default function HomePage({ user, profile }: HomePageProps) {
  console.log(profile);
  return (
    <div className="flex flex-col">
      <Tabs defaultValue={profile.is_donator ? "requests" : "donations"} className="w-1/2 mx-auto">
        <TabsList className="grid w-full grid-cols-2 mb-12">
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="donations">
          <ScrollArea className="h-150 w-full rounded-md">
            <div className="flex flex-col overflow-y-auto">
              <PostCard
                username="user123"
                time_since_post="3m"
                dining_halls={["Chase", "Lenoir"]}
                times={timeslots}
                is_request={false}
              />
              <PostCard
                username="user456"
                time_since_post="2h"
                dining_halls={["Chase"]}
                times={timeslots}
                is_request={false}
              />
              <PostCard
                username="user456"
                time_since_post="2h"
                dining_halls={["Chase"]}
                times={timeslots}
                is_request={false}
              />
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="requests">
          <ScrollArea className="h-150 w-full rounded-md">
            <div className="flex flex-col">
              <PostCard
                username="user456"
                time_since_post="3m"
                dining_halls={["Chase"]}
                times={timeslots}
                is_request={true}
                imgsrc={"/sampleimg.png"}
                caption={"feeling hungry and hopeful :p"}
              />
              <PostCard
                username="user456"
                time_since_post="3m"
                dining_halls={["Chase"]}
                times={timeslots}
                is_request={true}
              />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
      <div className="fixed bottom-6 right-6 z-10">
        <CreatePost />
      </div>
    </div>
  );
}
//fixed bottom-6 right-6 z-10"
type props = {
  username: string;
  time_since_post: string;
  dining_halls: string[];
  times: Timeslot[];
  is_request: boolean;
  imgsrc?: string;
  caption?: string;
};
function PostCard({
  username,
  time_since_post,
  dining_halls,
  times,
  is_request,
  imgsrc,
  caption,
}: props) {
  const listitems = dining_halls.map((hall) => {
    return (
      <div className="flex flex-row gap-0.5" key={hall}>
        <MapPin size={15} />
        <p>{hall}</p>
      </div>
    );
  });
  return (
    <Card className="rounded-sm px-4 gap-3 mb-8">
      <CardHeader>
        <CardTitle className="text-xl font-sans font-bold">
          {is_request ? "Swipe Requested" : "Swipe Available"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-row gap-x-6">
        <div className="space-y-4 flex-3">
          <div className="flex flex-col gap-y-2">
            <CardDescription className="flex flex-row gap-x-1 pt-0.5">
              <CalendarDays size={16} />
              <p className="text-xs ">
                {time_since_post} ~ @{username}
              </p>
            </CardDescription>
            <CardDescription className="flex flex-row gap-1.5 text-primary1 text-xs">
              {listitems}
            </CardDescription>
          </div>
          {caption ? (
            <p className="bg-[#dbdee64d] text-sm text-popover-foreground p-2 pb-4 rounded-sm">
              {caption}
            </p>
          ) : null}
          <div className="flex flex-row">
            <div className="w-full">
              <DataTable columns={columns} data={times} />
            </div>
          </div>
          <CardDescription className="text-accent2 underline transition-colors hover:text-accent1">
            View all Time Slots
          </CardDescription>
        </div>
        <div className="flex-2 flex flex-col gap-y-6 mx-16">
          {imgsrc ? (
            <Image
              width={100}
              height={100}
              src={imgsrc}
              alt="image"
              className="object-cover mx-auto self-center w-full h-[120px]"
            ></Image>
          ) : (
            <div className="mb-8"></div> // Reserve image height when missing
          )}
          <Button variant="secondary1" size="default" className=" rounded-sm ">
            {is_request ? "Donate Swipe" : "Request Swipe"}
          </Button>
          <Button
            variant="outline"
            className="rounded-sm text-muted-foreground"
          >
            <MessagesSquare size={30} />
            Message @{username}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// The `getServerSideProps` function is used to fetch the user data and on
// the server side before rendering the page to both pre-load the Supabase
// user and profile data. If the user is not logged in, we can catch this
// here and redirect the user to the login page.
export async function getServerSideProps(context: GetServerSidePropsContext) {
  // Create the supabase context that works specifically on the server and
  // pass in the context.
  const supabase = createSupabaseServerClient(context);

  // Attempt to load the user data
  const { data: userData, error: userError } = await supabase.auth.getUser();

  // If the user is not logged in, redirect them to the login page.
  if (userError || !userData) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  //   // Load the profile data
  const profile = await getProfile(supabase, userData.user.id);

  // Return the user and profile as props.
  return {
    props: {
      user: userData.user,
      profile: profile,
    },
  };
}

/* 
 <div className="flex-2 flex flex-col gap-y-6 mx-16">
                    {imgsrc ? <Image width={100} height={100} src={imgsrc} alt="image" className="object-cover mx-auto self-center w-full h-[120px]"></Image> : null}
                    <Button variant="secondary1" size="default" className=" rounded-sm " >{is_request ? "Donate Swipe" : "Request Swipe"}</Button>
                    <Button variant="outline" className="rounded-sm text-muted-foreground" ><MessagesSquare size={30} />
                        Message @{username}</Button>

                </div>
*/
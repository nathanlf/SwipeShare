import { columns, Timeslot } from "@/pages";
import { Profile } from "@/utils/supabase/models/profile";
import { CalendarDays, MapPin, MessagesSquare, Trash2, Users, X } from "lucide-react";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../card";
import { Badge } from "../badge";
import { DataTable } from "../datatable";
import { Button } from "../button";
import { GetServerSidePropsContext } from "next";
import { createSupabaseServerClient } from "@/utils/supabase/server-props";
import { getProfile } from "@/utils/supabase/queries/profile";
import Image from "next/image";
import router from "next/router";
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";


type props = {
  authorProfile: z.infer<typeof Profile>;
  time_since_post: string;
  dining_halls: string[]; // from user
  times: Timeslot[]; // from user
  is_request: boolean;
  imgsrc?: string;
  caption?: string;
  showx: boolean;
  interestedUsers?: { userId: string; name: string }[];
  handledelete?: () => Promise<void>;
  handleMessageClick: () => void; // Changed to a function with no parameters that returns void
};
export function PostCard({
  authorProfile,
  time_since_post,
  dining_halls,
  times,
  is_request,
  imgsrc,
  caption,
  handleMessageClick,
  handledelete,
  interestedUsers,
  showx
}: props) {
  const handle = authorProfile?.handle || "unknown";
  const name = authorProfile?.name || "unknown";
  const [isOpen, setIsOpen] = useState<boolean>(false);


  const isFlexible = authorProfile?.is_flexible || false;

  const listitems = dining_halls.map((hall) => {
    return (
      <div className="flex flex-row gap-0.5" key={hall}>
        <MapPin size={15} />
        <p>{hall}</p>
      </div>
    );
  });

  return (
    <Card className="rounded-sm px-4 gap-3 relative group">
      <CardHeader>
        <CardTitle className="text-xl font-sans font-bold w-full text-center">
          {is_request ? "Swipe Requested" : "Swipe Available"}

        </CardTitle>
        <div className="absolute top-2 right-2 flex flex-row gap-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">

          {interestedUsers && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-blue-100 hover:bg-blue-300 !hover:shadow-lg p-0 text-xs"
                >
                  <Users className="text-blue-600 w-4 h-4" />
                </Button>
              </PopoverTrigger>

              {interestedUsers.length > 0 ?
                <PopoverContent className="w-56 p-3">
                  <p className="text-sm font-semibold mb-2 text-accent1">Interested Users</p>
                  <ul className="space-y-1">
                    {interestedUsers.map(user => (
                      <li key={user.userId} className="text-muted-foreground text-sm">
                        {user.name}
                      </li>
                    ))}
                  </ul>
                </PopoverContent>
                : <PopoverContent className="w-56 p-3">
                  <p className="text-sm font-semibold mb-2 text-accent1">No Interested Users</p></PopoverContent>}

            </Popover>
          )}



          {showx ?

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className=" bg-red-100 hover:bg-red-300 !hover:shadow-lg shadow-md group-hover:opacity-100 transition-opacity duration-200 text-xs p-0"
                  onClick={() => { setIsOpen(true) }}>
                  <Trash2 className="text-red-600 " />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">

                <div className="text-center">
                  Are you sure you want to delete this post?

                </div>
                <div className="flex flex-row space-x-4 text-center mx-auto">
                  <DialogFooter>
                    <Button type="submit" variant="destructive" onClick={
                      async () => {
                        if (handledelete) {
                          await handledelete();   // call directly — already bound
                          setIsOpen(false);       // close modal
                          console.log("hello")
                          toast("Post deleted.")
                        }
                      }} >Delete</Button>
                  </DialogFooter>
                  <DialogFooter>
                    <Button variant="secondary" onClick={() => { setIsOpen(false) }}>Cancel</Button>
                  </DialogFooter>
                </div>

              </DialogContent>
            </Dialog>

            : null}
        </div>

      </CardHeader>
      <CardContent className="flex flex-row gap-x-6">
        <div className="space-y-4 flex-3z">
          <div className="flex flex-col gap-y-2">
            <div className="flex flex-row gap-x-3 items-start">
              <CardDescription className="flex flex-row gap-x-1 pt-0.5">
                <CalendarDays size={16} />
                <p className="text-xs ">
                  {time_since_post} ~ @{handle}
                </p>
              </CardDescription>
              {isFlexible ? (
                <Badge variant="default" className="bg-[#ff9000] ">
                  flexible
                </Badge>
              ) : null}
            </div>
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
          <CardDescription className="flex w-full justify-center">
            <Button
              variant="ghost"
              onClick={() => router.push(`/availability/${authorProfile.id}`)}
              className="text-accent2 underline transition-colors hover:text-accent justify-center items-center cursor-pointer h-5"
            >
              View all Time Slots
            </Button>
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
          <Button
            variant="secondary1"
            size="default"
            className="rounded-sm hover:cursor-pointer"
            disabled={true}
          >
            {is_request ? "Donate Swipe" : "Request Swipe"}
          </Button>
          <Button
            variant="outline"
            className="rounded-sm text-slate-300 hover:cursor-pointer"
            onClick={handleMessageClick}
            disabled={true}
          >
            <MessagesSquare size={30} />
            Message {name}
          </Button>
        </div>
      </CardContent>
    </Card>
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
      user: userData.user,
      profile: profile,
    },
  };
}

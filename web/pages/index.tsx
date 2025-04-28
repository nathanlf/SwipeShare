import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Image from "next/image";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, MapPin, MessagesSquare, Search, ChevronDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GetServerSidePropsContext } from "next";
import { DataTable } from "@/components/ui/datatable";
import { createSupabaseServerClient } from "@/utils/supabase/server-props";
import { getProfile } from "@/utils/supabase/queries/profile";
import { User } from "@supabase/supabase-js";
import { z } from "zod";
import { Profile } from "@/utils/supabase/models/profile";
import CreatePostButton from "@/components/post";
import { Badge } from "@/components/ui/badge";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { getAllDonations } from "@/utils/supabase/queries/donation";
import { getAllRequests } from "@/utils/supabase/queries/request";
import { useState, useEffect, useRef, useMemo } from "react";

import { Input } from "@/components/ui/input";
import React from "react";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";

import { getOrCreateChatByUsers } from "@/utils/supabase/queries/chat";
import { useRouter } from "next/router";


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

type HomePageProps = { user: User; profile: z.infer<typeof Profile> };

export default function HomePage({ user, profile }: HomePageProps) {
  const router = useRouter();
  const supabase = createSupabaseComponentClient();
  const [activeTab, setActiveTab] = useState<string>(profile.is_donator ? "requests" : "donations");
  const [authorProfiles, setAuthorProfiles] = useState<Record<string, z.infer<typeof Profile>>>({});
  // Load donations with infinite query
  const {
    data: donationsData,
    fetchNextPage: fetchNextDonations,
    hasNextPage: hasMoreDonations,
    isFetchingNextPage: isLoadingMoreDonations,
    status: donationsStatus
  } = useInfiniteQuery({
    queryKey: ["donations"],
    queryFn: async ({ pageParam = 0 }) => {
      const limit = 10;
      const result = await getAllDonations(supabase, limit, pageParam);
      return result;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 10 ? allPages.length * 10 : undefined;
    }
  });

  // Load requests with infinite query
  const {
    data: requestsData,
    fetchNextPage: fetchNextRequests,
    hasNextPage: hasMoreRequests,
    isFetchingNextPage: isLoadingMoreRequests,
    status: requestsStatus
  } = useInfiniteQuery({
    queryKey: ["requests"],
    queryFn: async ({ pageParam = 0 }) => {
      const limit = 10;
      const result = await getAllRequests(supabase, limit, pageParam);
      return result;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 10 ? allPages.length * 10 : undefined;
    }
  });

  // Flatten & memoize the pages into a single array
  const donations = useMemo(() => {
    return donationsData?.pages.flat() || [];
  }, [donationsData]);
  const requests = useMemo(() => {
    return requestsData?.pages.flat() || [];
  }, [requestsData]);

  //memoized requests for filtered post results:

  // Load author profiles for all posts when data changes
  useEffect(() => {
    const allPosts = [...donations, ...requests];
    const authorIds = [...new Set(allPosts.map(post => post.author_id))];

    // Fetch profiles for any authors we don't already have
    const newAuthorIds = authorIds.filter(id => !authorProfiles[id]);

    if (newAuthorIds.length > 0) {
      const fetchProfiles = async () => {
        const profiles: Record<string, z.infer<typeof Profile>> = { ...authorProfiles };

        for (const id of newAuthorIds) {
          try {
            const authorProfile = await getProfile(supabase, id);
            profiles[id] = authorProfile;
          } catch (error) {
            console.error(`Failed to fetch profile for author ${id}:`, error);
          }
        }

        setAuthorProfiles(profiles);
      };

      fetchProfiles();
    }
  }, [donations, requests, authorProfiles, supabase]);

  // Set up intersection observer for infinite scrolling
  const donationsEndRef = useRef<HTMLDivElement>(null);
  const requestsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (requestsEndRef.current && !isLoadingMoreRequests) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMoreRequests && activeTab === "requests") {
            fetchNextRequests();
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(requestsEndRef.current);

      return () => observer.disconnect(); // Clean up observer on unmount
    }
  }, [requestsEndRef, isLoadingMoreRequests, hasMoreRequests, activeTab, fetchNextRequests]);

  useEffect(() => {
    if (donationsEndRef.current && !isLoadingMoreDonations) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMoreDonations) {
            fetchNextDonations();
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(donationsEndRef.current);

      return () => observer.disconnect();
    }
  }, [donationsEndRef, isLoadingMoreDonations, hasMoreDonations, fetchNextDonations]);

  // Format time since post
  const formatTimeSince = (dateString: string | null | undefined) => {
    if (!dateString) return "";

    const postDate = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `${diffMins}m`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) {
        return `${diffHours}h`;
      } else {
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d`;
      }

    }
  };


  //const [showChaseBar, setShowChaseBar] = React.useState<Checked>(true)
  //const [showLBar, setShowLBar] = React.useState<Checked>(true)
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedDiningHalls, setSelectedDiningHalls] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);

  /*
  const filteredDonations = useMemo(() => {
    if (selectedDiningHalls.length === 0) return donations; // No filter applied

    return donations.filter(donation =>
      donation.dining_halls.some(hall =>
        selectedDiningHalls.includes(hall)
      )
    );
  }, [donations, selectedDiningHalls]);

  const filteredRequests = useMemo(() => {
    if (selectedDiningHalls.length === 0) return requests; // No filter applied

    return requests.filter(request =>
      request.dining_halls.some(hall =>
        selectedDiningHalls.includes(hall)
      )
    );
  }, [requests, selectedDiningHalls]);
*/

  const test = () => {
    console.log(selectedDiningHalls);
    console.log(selectedTimes);
    setIsOpen(false);
  }

  const modifySelectedTimes = (name: string, value) => {
    if (value == true) {
      setSelectedTimes([...selectedTimes, name])
    }
    else if (value == false) {
      setSelectedTimes(selectedTimes.filter(a => a != name))
    }
  }


  const handleMessageClick = async (authorId: string) => {
    try {
      if(user.id !== authorId){
        const chat = await getOrCreateChatByUsers(supabase, user.id, authorId)
        router.push(`/chat/${chat.id}`)
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (error: any){
      console.error("Error creating or getting chat: ", error.message)
    }
  }

  return (
    <div className="flex flex-col mt-4 w-full gap-y-10">
      <div className="mx-auto w-full flex flex-row gap-x-2 pl-14 pr-5">
        <div className=" flex flex-row h-9 rounded-md border border-input shadow-none bg-muted flex-4 px-1">
          <Search size={16} className="self-center text-accent1" />
          <Input type="default" placeholder="Search Posts" className="!bg-transparent focus-visible:rounded-md shadow-none rounded-none py-0 !border-none" />
        </div>
        <div className="flex-1 flex justify-center  relative">
          <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="w-full"
          >
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="flex items-center justify-between space-x-4 mx-auto bg-muted border-accent1">
                <h4 className="text-sm font-semibold">
                  Filter Results
                </h4>
                <ChevronDown className="h-4 w-4" />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>


            <CollapsibleContent
              className={cn(
                "absolute left-0 mt-2 w-full rounded-md z-20",
                // nice slide/fade animation that shadcn expects:
                "data-[state=open]:animate-collapsible-down",
                "data-[state=closed]:animate-collapsible-up"
              )}>
              <Card className="bg-muted border-accent1">
                <CardContent>

                  <form>
                    <div className="grid w-full items-center gap-4">
                      <div className="flex flex-col gap-y-1">
                        <Label htmlFor="dining_hall" className="text-secondary1 font-semibold">Dining Halls:</Label>
                        <ToggleGroup type="multiple"
                          value={selectedDiningHalls}
                          onValueChange={setSelectedDiningHalls}
                          className="gap-x-1" >
                          <ToggleGroupItem value="Chase" aria-label="Chase" size="sm" className="data-[state=on]:bg-accent1-muted hover:bg-accent1-muted data-[state=on]:text-popover-foreground rounded-md">
                            Chase
                          </ToggleGroupItem>
                          <ToggleGroupItem value="Lenoir" aria-label="Lenoir" size="sm" className="data-[state=on]:bg-accent1-muted hover:bg-accent1-muted data-[state=on]:text-popover-foreground rounded-md">
                            Lenoir
                          </ToggleGroupItem>

                        </ToggleGroup>
                      </div>

                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="framework" className="text-secondary1">Timing:</Label>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="breakfast" className="data-[state=checked]:bg-secondary1 data-[state=checked]:border-secondary1 border-secondary1"
                            checked={selectedTimes.includes("breakfast")}
                            onCheckedChange={(value) => { modifySelectedTimes("breakfast", value) }} />
                          <label
                            htmlFor="breakfast"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Breakfast (7a-10:45a)
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="lunch" className="data-[state=checked]:bg-secondary1 data-[state=checked]:border-secondary1 border-secondary1"
                            checked={selectedTimes.includes("lunch")}
                            onCheckedChange={(value) => { modifySelectedTimes("lunch", value) }} />
                          <label
                            htmlFor="lunch"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Lunch (11a-3p)
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="lite-lunch" className="data-[state=checked]:bg-secondary1 data-[state=checked]:border-secondary1 border-secondary1"
                            checked={selectedTimes.includes("lite-lunch")}
                            onCheckedChange={(value) => { modifySelectedTimes("lite-lunch", value) }} />
                          <label
                            htmlFor="lite-lunch"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Lite Lunch (3p-5p)
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="dinner" className="data-[state=checked]:bg-secondary1 data-[state=checked]:border-secondary1 border-secondary1"
                            checked={selectedTimes.includes("dinner")}
                            onCheckedChange={(value) => { modifySelectedTimes("dinner", value) }} />
                          <label
                            htmlFor="dinner"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Dinner (5p-8p)
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="late-night" className="data-[state=checked]:bg-secondary1 data-[state=checked]:border-secondary1 border-secondary1"
                            checked={selectedTimes.includes("late-night")}
                            onCheckedChange={(value) => { modifySelectedTimes("late-night", value) }} />
                          <label
                            htmlFor="late-night"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Late Dinner (8p-12a)
                          </label>
                        </div>

                      </div>
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="ml-auto">
                  <Button onClick={test} size="sm">Search</Button>
                </CardFooter>
              </Card>

            </CollapsibleContent>
          </Collapsible>


        </div>

      </div>



      <Tabs
        defaultValue={profile.is_donator ? "requests" : "donations"}
        className="w-1/2 mx-auto"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2 mb-12">
          <TabsTrigger value="donations" className="hover:cursor-pointer">Donations</TabsTrigger>
          <TabsTrigger value="requests" className="hover:cursor-pointer">Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="donations">
          <ScrollArea className="h-150 w-full rounded-md ">
            <div className="mx-4">
              <div className="flex flex-col overflow-y-auto">
                {donationsStatus === "pending" ? (
                  <p className="text-center py-4">Loading donations...</p>
                ) : donationsStatus === "error" ? (
                  <p className="text-center py-4 text-red-500">Error loading donations</p>
                ) : donations.length === 0 ? (
                  <p className="text-center py-4">No donations available</p>
                ) : (
                  donations.map((donation) => {
                    const authorProfile = authorProfiles[donation.author_id];
                    return (
                      <PostCard
                        key={donation.id}
                        authorProfile={authorProfile}
                        time_since_post={formatTimeSince(donation.created_at)}
                        dining_halls={["Chase", "Lenoir"]} // todo: add this to post model
                        times={timeslots} // todo: add this to post model?
                        is_request={false}
                        caption={donation.content}
                        imgsrc={donation.attachment_url || undefined}
                        handleMessageClick={() => handleMessageClick(donation.author_id)}
                      />
                    );
                  })
                )}
                <div ref={donationsEndRef} className="h-10" />
                {isLoadingMoreDonations && (
                  <p className="text-center py-4">Loading more donations...</p>
                )}
                <PostCard username="test123" time_since_post="0m" dining_halls={["Chase"]} times={timeslots} is_request={false} isflexible={true} />

              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="requests">
          <ScrollArea className="h-150 w-full rounded-md">
            <div className="flex flex-col">
              {requestsStatus === "pending" ? (
                <p className="text-center py-4">Loading requests...</p>
              ) : requestsStatus === "error" ? (
                <p className="text-center py-4 text-red-500">Error loading requests</p>
              ) : requests.length === 0 ? (
                <p className="text-center py-4">No requests available</p>
              ) : (
                requests.map((request) => {
                  const authorProfile = authorProfiles[request.author_id];
                  return (
                    <PostCard
                      key={request.id}
                      authorProfile={authorProfile}
                      time_since_post={formatTimeSince(request.created_at)}
                      dining_halls={["Chase", "Lenoir"]} // todo: add this to post model
                      times={timeslots} // todo: add this to post model
                      is_request={true}
                      caption={request.content}
                      imgsrc={request.attachment_url || undefined}
                      handleMessageClick={() => handleMessageClick(request.author_id)}
                    />
                  );
                })
              )}
              <div ref={requestsEndRef} className="h-10" />
              {isLoadingMoreRequests && (
                <p className="text-center py-4">Loading more requests...</p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
      <div className="fixed bottom-6 right-6 z-10">
        <CreatePostButton user={user} />
      </div>
    </div>
  );
}

type props = {
  authorProfile: z.infer<typeof Profile>;
  time_since_post: string;
  dining_halls: string[]; // from user
  times: Timeslot[]; // from user
  is_request: boolean;
  imgsrc?: string;
  caption?: string;
  handleMessageClick: () => void; // Changed to a function with no parameters that returns void
};

function PostCard({
  authorProfile,
  time_since_post,
  dining_halls,
  times,
  is_request,
  imgsrc,
  caption,
  handleMessageClick,
}: props) {
  const handle = authorProfile?.handle || 'unknown';
  const name = authorProfile?.name || 'unknown';

  const isFlexible = authorProfile?.is_flexible || false

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
        <div className="space-y-4 flex-3z">
          <div className="flex flex-col gap-y-2">
            <div className="flex flex-row gap-x-3 items-start">
              <CardDescription className="flex flex-row gap-x-1 pt-0.5">
                <CalendarDays size={16} />
                <p className="text-xs ">
                  {time_since_post} ~ @{handle}
                </p>
              </CardDescription>
              {isFlexible ? <Badge variant="default" className="bg-[#ff9000] ">flexible</Badge> : null}
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
          <CardDescription className="text-accent2 underline transition-colors hover:text-accent1">
            View all Time Slots
          </CardDescription>
        </div>
        <div className="flex-2 flex flex-col gap-y-6 mx-16">
          {imgsrc ? (<Image width={100} height={100} src={imgsrc} alt="image" className="object-cover mx-auto self-center w-full h-[120px]"></Image>) :
            (<div className="mb-8"></div> // Reserve image height when missing
            )}
          <Button variant="secondary1" size="default" className="rounded-sm hover:cursor-pointer">{is_request ? "Donate Swipe" : "Request Swipe"}</Button>
          <Button 
            variant="outline" 
            className="rounded-sm text-slate-300 hover:cursor-pointer"
            onClick={handleMessageClick}
          >
            <MessagesSquare size={30} />Message {name}
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
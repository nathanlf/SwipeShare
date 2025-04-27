import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import Image from "next/image";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, MapPin, MessagesSquare } from "lucide-react";
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

  // Load author profiles for all posts when data changes
  useEffect(() => {
    const allPosts = [...donations, ...requests];
    const authorIds = [...new Set(allPosts.map(post => post.author_id))];
    
    // Fetch profiles for any authors we don't already have
    const newAuthorIds = authorIds.filter(id => !authorProfiles[id]);
    
    if (newAuthorIds.length > 0) {
      const fetchProfiles = async () => {
        const profiles: Record<string, z.infer<typeof Profile>> = {...authorProfiles};
        
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

  return (
    <div className="flex flex-col mt-14">
      <Tabs 
        defaultValue={profile.is_donator ? "requests" : "donations"} 
        className="w-1/2 mx-auto"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2 mb-12">
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="donations">
          <ScrollArea className="h-170 w-full rounded-md">
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
                        username={authorProfile?.handle || "unknown"}
                        time_since_post={formatTimeSince(donation.created_at)}
                        dining_halls={["Chase", "Lenoir"]} // todo: add this to post model
                        times={timeslots} // todo: add this to post model?
                        is_request={false}
                        isflexible={authorProfile?.is_flexible || false}
                        caption={donation.content}
                        imgsrc={donation.attachment_url || undefined}
                      />
                    );
                  })
                )}
                <div ref={donationsEndRef} className="h-10" />
                {isLoadingMoreDonations && (
                  <p className="text-center py-4">Loading more donations...</p>
                )}
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
                      username={authorProfile?.handle || "unknown"}
                      time_since_post={formatTimeSince(request.created_at)}
                      dining_halls={["Chase", "Lenoir"]} // todo: add this to post model
                      times={timeslots} // todo: add this to post model
                      is_request={true}
                      isflexible={authorProfile?.is_flexible || false}
                      caption={request.content}
                      imgsrc={request.attachment_url || undefined}
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
  username: string;
  time_since_post: string;
  dining_halls: string[];
  times: Timeslot[];
  is_request: boolean;
  imgsrc?: string;
  caption?: string;
  isflexible: boolean;
};

function PostCard({
  username,
  time_since_post,
  dining_halls,
  times,
  is_request,
  imgsrc,
  caption,
  isflexible,
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
            <div className="flex flex-row gap-x-3 items-start">
              <CardDescription className="flex flex-row gap-x-1 pt-0.5">
                <CalendarDays size={16} />
                <p className="text-xs ">
                  {time_since_post} ~ @{username}
                </p>
              </CardDescription>
              {isflexible ? <Badge variant="default" className="bg-[#ff9000] ">flexible</Badge> : null}
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
          <Button variant="secondary1" size="default" className="rounded-sm">{is_request ? "Donate Swipe" : "Request Swipe"}</Button>
          <Button variant="outline" className="rounded-sm text-muted-foreground">
            <MessagesSquare size={30} />Message @{username}
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

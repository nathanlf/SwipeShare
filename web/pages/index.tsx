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
import {
  CalendarDays,
  MapPin,
  MessagesSquare,
  Funnel,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GetServerSidePropsContext } from "next";
import { DataTable } from "@/components/ui/datatable";
import { createSupabaseServerClient } from "@/utils/supabase/server-props";
import { getAvailability, getProfile } from "@/utils/supabase/queries/profile";
import { User } from "@supabase/supabase-js";
import { z } from "zod";
import { Profile } from "@/utils/supabase/models/profile";
import CreatePostButton from "@/components/post";
import { Badge } from "@/components/ui/badge";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { add_interested_user, getAllDonations } from "@/utils/supabase/queries/donation";
import { getAllRequests, add_interested_user_request } from "@/utils/supabase/queries/request";
import { useState, useEffect, useRef, useMemo } from "react";

import { Input } from "@/components/ui/input";
import React from "react";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

import { getOrCreateChatByUsers } from "@/utils/supabase/queries/chat";
import { useRouter } from "next/router";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

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
  const [activeTab, setActiveTab] = useState<string>(
    profile.is_donator ? "requests" : "donations"
  );
  const [authorProfiles, setAuthorProfiles] = useState<
    Record<string, z.infer<typeof Profile>>
  >({});

  const [searchTerm, setSearchTerm] = useState<string>("");
  // Load donations with infinite query
  const {
    data: donationsData,
    fetchNextPage: fetchNextDonations,
    hasNextPage: hasMoreDonations,
    isFetchingNextPage: isLoadingMoreDonations,
    status: donationsStatus,
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
    },
  });

  // Load requests with infinite query
  const {
    data: requestsData,
    isFetchingNextPage: isLoadingMoreRequests,
    status: requestsStatus,
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
    },
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
    const authorIds = [...new Set(allPosts.map((post) => post.author_id))];

    // Fetch profiles for any authors we don't already have
    const newAuthorIds = authorIds.filter((id) => !authorProfiles[id]);

    if (newAuthorIds.length > 0) {
      const fetchProfiles = async () => {
        const profiles: Record<string, z.infer<typeof Profile>> = {
          ...authorProfiles,
        };

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
    if (donationsEndRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting &&
            hasMoreDonations &&
            activeTab === "donations" &&
            !isLoadingMoreDonations
          ) {
            console.log("Loading more donations...");  // Add debug logging
            fetchNextDonations();
          }
        },
        { threshold: 0.1 }  // Lower threshold for better detection
      );

      observer.observe(donationsEndRef.current);
      return () => observer.disconnect();
    }
  }, [
    donationsEndRef,
    isLoadingMoreDonations,
    hasMoreDonations,
    activeTab,
    fetchNextDonations,
  ]);

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
  }, [
    donationsEndRef,
    isLoadingMoreDonations,
    hasMoreDonations,
    fetchNextDonations,
  ]);

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

  // Filter popover state
  const [filterPopoverOpen, setFilterPopoverOpen] = useState<boolean>(false);
  const [selectedDiningHalls, setSelectedDiningHalls] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [filtersApplied, setFiltersApplied] = useState<boolean>(false);
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, Timeslot[]>>({});


  useEffect(() => {
    const loadAvailability = async () => {
      const newMap: Record<string, Timeslot[]> = { ...availabilityMap };
      for (const donation of donations) {
        const authorId = donation.author_id;
        if (!newMap[authorId]) {
          try {
            const availability = await getAvailability(supabase, authorId);
            newMap[authorId] = availability;
          } catch (err) {
            console.error(`Failed to get availability for ${authorId}`, err);
            newMap[authorId] = []; // Prevent retry loops
          }
        }
      }
      setAvailabilityMap(newMap);
    }
    loadAvailability();
  }, [donations]);


  const modifySelectedTimes = (name: string, value: string | boolean) => {
    if (value == true) {
      setSelectedTimes([...selectedTimes, name]);
    } else if (value == false) {
      setSelectedTimes(selectedTimes.filter((a) => a != name));
    }
  };

  const getMilitary = (time: string): number => {
    const regex = /^(\d{1,2})(?::(\d{2}))?(a|p)$/i;
    const match = time.trim().toLowerCase().match(regex);

    if (!match) throw new Error(`Invalid time format: ${time}`);

    let hour = parseInt(match[1], 10);
    const minute = match[2] ? parseInt(match[2], 10) : 0;
    const meridiem = match[3];

    if (meridiem === 'p' && hour !== 12) hour += 12;
    if (meridiem === 'a' && hour === 12) hour = 0;

    return hour * 60 + minute;
  }

  const handleSearch = () => {
    // Your search functionality here
    console.log("Searching with filters:", { selectedDiningHalls, selectedTimes });

    //console.log(availabilityMap);
    setFiltersApplied(!(filtersApplied));
    setFilterPopoverOpen(false); // Close popover when search is clicked
  };

  const clearFilters = () => {
    setSelectedDiningHalls([]);
    setSelectedTimes([]);
    setFiltersApplied(!filtersApplied);
  };

  // Count total selected filters
  const totalFiltersSelected = selectedDiningHalls.length + selectedTimes.length;

  const handleMessageClick = async (authorId: string) => {
    try {
      if (user.id !== authorId) {
        const chat = await getOrCreateChatByUsers(supabase, user.id, authorId);
        router.push(`/chat/${chat.id}`);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error creating or getting chat: ", error.message);
    }
  };
  const handleRequestClick = async (postId: string) => {
    const newlyadded = await add_interested_user(supabase, postId, profile.id);
    if (newlyadded == true) {
      toast("Meal Request Sent!");
    }
    else {
      toast("You have already requested this meal.")
    }

  }
  const handleDonateClick = async (postId: string) => {
    const newlyadded = await add_interested_user_request(supabase, postId, profile.id);
    if (newlyadded == true) {
      toast("Donation Request Sent!");
    }
    else {
      toast("You have already requested this meal.");
    }
  }

  const filteredDonations = useMemo(() => {

    return donations.filter(donation => {
      const authorProfile = authorProfiles[donation.author_id];
      const authorName = authorProfile?.name?.toLowerCase() || "";
      const authorHandle = authorProfile?.handle?.toLowerCase() || "";
      const content = donation.content?.toLowerCase() || "";
      const search = searchTerm.toLowerCase();
      const dininghalls = donation.dining_halls || "";
      const availability = availabilityMap[donation.author_id] || [];

      let includes_dininghalls = false;
      if (selectedDiningHalls.length == 0) { includes_dininghalls = true; }
      for (const hall of selectedDiningHalls) {
        if (dininghalls.includes(hall.toLowerCase())) {
          includes_dininghalls = true;
          break;
        }
      }
      let matchestimes = false;
      matchestimes = availability.some(slot => {
        const slotstart = getMilitary(slot.starttime);
        const slotend = getMilitary(slot.endtime);
        if (selectedTimes.includes("breakfast")) {
          if (slotstart <= 645 && slotstart > 420) {
            return true;
          }
        }
        if (selectedTimes.includes("lunch")) {
          if (slotstart <= 900 && slotend > 660) {
            return true;
          }
        }
        if (selectedTimes.includes("lite-lunch")) {
          if (slotstart <= 1020 && slotend > 900) { //checks if the slot starts within the time range. also have to check if it end sin the time range
            return true;
          }
        }
        if (selectedTimes.includes("dinner")) {
          if (slotstart <= 1200 && slotend > 1020) {
            return true;
          }
        }
        if (selectedTimes.includes("late-night")) {
          if (slotstart <= 1440 && slotend > 1200) {
            return true;
          }
        }
        return false;

      });
      if (selectedTimes.length == 0) { matchestimes = true; }

      return ((authorName.includes(search) ||
        authorHandle.includes(search) ||
        content.includes(search)) &&
        includes_dininghalls
        && matchestimes
      );
    });
  }, [donations, authorProfiles, searchTerm, filtersApplied]);




  const filteredRequests = useMemo(() => {
    // if (!searchTerm.trim()) return requests;

    return requests.filter(request => {
      const authorProfile = authorProfiles[request.author_id];
      const authorName = authorProfile?.name?.toLowerCase() || "";
      const authorHandle = authorProfile?.handle?.toLowerCase() || "";
      const content = request.content?.toLowerCase() || "";
      const search = searchTerm.toLowerCase();
      const dininghalls = request.dining_halls || "";
      const availability = availabilityMap[request.author_id] || [];


      let includes_dininghalls = false;
      if (selectedDiningHalls.length == 0) { includes_dininghalls = true; }
      for (const hall of selectedDiningHalls) {
        if (dininghalls.includes(hall.toLowerCase())) {
          includes_dininghalls = true;
          break;
        }
      }
      let matchestimes = false;
      matchestimes = availability.some(slot => {
        const slotstart = getMilitary(slot.starttime);
        const slotend = getMilitary(slot.endtime);

        if (selectedTimes.includes("breakfast")) {
          if (slotstart <= 645 && slotstart > 420) {
            return true;
          }
        }
        if (selectedTimes.includes("lunch")) {
          if (slotstart <= 900 && slotend > 660) {
            return true;
          }
        }
        if (selectedTimes.includes("lite-lunch")) {
          if (slotstart <= 1020 && slotend > 900) { //checks if the slot starts within the time range. also have to check if it end sin the time range
            return true;
          }
        }
        if (selectedTimes.includes("dinner")) {
          if (slotstart <= 1200 && slotend > 1020) {
            return true;
          }
        }
        if (selectedTimes.includes("late-night")) {
          if (slotstart <= 1440 && slotend > 1200) {
            return true;
          }
        }
        return false;

      });
      if (selectedTimes.length == 0) { matchestimes = true; }


      return ((authorName.includes(search) ||
        authorHandle.includes(search) ||
        content.includes(search)) &&
        includes_dininghalls && matchestimes
      );
    });
  }, [requests, authorProfiles, searchTerm, filtersApplied]);

  // Checkbox item component for consistency
  const CheckboxItem = ({ id, label, checked, onCheckedChange }: {
    id: string,
    label: string,
    checked: boolean,
    onCheckedChange: (value: boolean) => void
  }) => {
    return (
      <div className="flex items-center space-x-2 rounded-md p-1.5 hover:bg-gray-50">
        <Checkbox
          id={id}
          className="data-[state=checked]:bg-accent1 data-[state=checked]:border-accent1 border-gray-300"
          checked={checked}
          onCheckedChange={onCheckedChange}
        />
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-700 cursor-pointer"
        >
          {label}
        </label>
      </div>
    );
  };

  return (
    <div className="flex flex-col mt-5 w-full gap-y-10">
      {/* this div below is the both the search bar and the filter button */}
      <div className="flex flex-row gap-x-2 pl-14 pr-5 justify-center items-center w-full">
        {/* this div below is the input at the top*/}
        <div className=" flex flex-row h-9 rounded-md shadow-none bg-muted flex-4 px-1 ml-6">
          <Input
            type="text"
            placeholder="Search by name or keywords..."
            className="!bg-transparent focus-visible:rounded-md shadow-none rounded-none py-0 !border-none text-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex justify-center">
          <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-muted border-accent1 relative hover:bg-accent1/10 transition-colors"
              >
                <Funnel className="h-4 w-4 text-black" />
                <span className="text-sm font-medium sr-only md:not-sr-only text-black">Filter</span>
                {totalFiltersSelected > 0 && (
                  <Badge className="h-5 w-5 p-0 flex items-center justify-center bg-accent1 text-white text-xs rounded-full absolute -top-2 -right-2">
                    {totalFiltersSelected}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent
              className="w-full h-1/2 p-0 bg-white border border-grey-200 rounded-lg shadow-lg"
              align="end"
            >
              <Card className="border-0 shadow-none">
                <CardHeader className="flex flex-col items-center justify-between">
                  <CardTitle className="text-md font-semibold text-gray-800">
                    Filter Options
                  </CardTitle>
                </CardHeader>

                <Separator />

                <CardContent className="pt-4 px-4 pb-2 mt-[-25px]">
                  <form>
                    <div className="grid w-full items-center gap-4">
                      <div className="flex flex-col gap-y-2">
                        <Label
                          htmlFor="dining_hall"
                          className="text-sm font-medium text-gray-700"
                        >
                          Dining Halls
                        </Label>
                        <ToggleGroup
                          type="multiple"
                          value={selectedDiningHalls}
                          onValueChange={setSelectedDiningHalls}
                          className="flex flex-wrap gap-2"
                        >
                          <ToggleGroupItem
                            value="Chase"
                            aria-label="Chase"
                            size="sm"
                            className="h-8 px-3 !rounded-md text-sm border border-gray-200 data-[state=on]:bg-accent1 data-[state=on]:text-white hover:bg-gray-100 data-[state=on]:hover:bg-accent1/90"
                          >
                            Chase
                          </ToggleGroupItem>
                          <ToggleGroupItem
                            value="Lenoir"
                            aria-label="Lenoir"
                            size="sm"
                            className="h-8 px-3 !rounded-md text-sm border border-gray-200 data-[state=on]:bg-accent1 data-[state=on]:text-white hover:bg-gray-100 data-[state=on]:hover:bg-accent1/90"
                          >
                            Lenoir
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </div>

                      <Separator className="my-1" />

                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="timing" className="text-sm font-medium text-gray-700">
                          Meal Times
                        </Label>
                        <div className="grid grid-cols-1 gap-y-2">
                          <CheckboxItem
                            id="breakfast"
                            label="Breakfast (7a-10:45a)"
                            checked={selectedTimes.includes("breakfast")}
                            onCheckedChange={(value) => modifySelectedTimes("breakfast", value)}
                          />
                          <CheckboxItem
                            id="lunch"
                            label="Lunch (11a-3p)"
                            checked={selectedTimes.includes("lunch")}
                            onCheckedChange={(value) => modifySelectedTimes("lunch", value)}
                          />
                          <CheckboxItem
                            id="lite-lunch"
                            label="Lite Lunch (3p-5p)"
                            checked={selectedTimes.includes("lite-lunch")}
                            onCheckedChange={(value) => modifySelectedTimes("lite-lunch", value)}
                          />
                          <CheckboxItem
                            id="dinner"
                            label="Dinner (5p-8p)"
                            checked={selectedTimes.includes("dinner")}
                            onCheckedChange={(value) => modifySelectedTimes("dinner", value)}
                          />
                          <CheckboxItem
                            id="late-night"
                            label="Late Dinner (8p-12a)"
                            checked={selectedTimes.includes("late-night")}
                            onCheckedChange={(value) => modifySelectedTimes("late-night", value)}
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                </CardContent>

                <Separator />

                <CardFooter className="flex justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs text-gray-500 hover:bg-gray-100"
                    onClick={clearFilters}
                  >
                    Clear all
                  </Button>
                  <Button
                    onClick={handleSearch}
                    className="bg-accent1 hover:bg-accent1/90 text-white"
                  >
                    Apply Filters
                  </Button>
                </CardFooter>
              </Card>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Tabs
        defaultValue={profile.is_donator ? "requests" : "donations"}
        className="w-4/6 mx-auto mt-[-20px]"
        onValueChange={setActiveTab}
      >
        <TabsList className="flex w-full mb-2">
          <TabsTrigger value="donations" className="hover:cursor-pointer">
            Donations
          </TabsTrigger>
          <TabsTrigger value="requests" className="hover:cursor-pointer">
            Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="donations">
          <ScrollArea className="h-[80vh] w-full rounded-md ">
            <div className="">
              <div className="flex flex-col overflow-y-auto">
                {donationsStatus === "pending" ? (
                  <p className="text-center py-4">Loading donations...</p>
                ) : donationsStatus === "error" ? (
                  <p className="text-center py-4 text-red-500">
                    Error loading donations
                  </p>
                ) : filteredDonations.length === 0 ? (
                  searchTerm.trim() ? (
                    <p className="text-center py-4">No matching donations found</p>
                  ) : (
                    <p className="text-center py-4">No donations available</p>
                  )
                ) : (
                  filteredDonations.map((donation) => {
                    const authorProfile = authorProfiles[donation.author_id];
                    return (
                      <PostCard
                        key={donation.id}
                        postid={donation.id}
                        authorProfile={authorProfile}
                        time_since_post={formatTimeSince(donation.created_at)}
                        dining_halls={["Chase", "Lenoir"]}
                        times={timeslots}
                        is_request={false}
                        caption={donation.content}
                        imgsrc={donation.attachment_url || undefined}
                        handleMessageClick={() =>
                          handleMessageClick(donation.author_id)
                        }
                        handleRequestClick={() =>
                          handleRequestClick(donation.id)
                        }
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
                <p className="text-center py-4 text-red-500">
                  Error loading requests
                </p>
              ) : filteredRequests.length === 0 ? (
                searchTerm.trim() ? (
                  <p className="text-center py-4">No matching requests found</p>
                ) : (
                  <p className="text-center py-4">No requests available</p>
                )
              ) : (
                filteredRequests.map((request) => {
                  const authorProfile = authorProfiles[request.author_id];
                  return (
                    <PostCard
                      key={request.id}
                      postid={request.id}
                      authorProfile={authorProfile}
                      time_since_post={formatTimeSince(request.created_at)}
                      dining_halls={["Chase", "Lenoir"]}
                      times={timeslots}
                      is_request={true}
                      caption={request.content}
                      imgsrc={request.attachment_url || undefined}
                      handleMessageClick={() =>
                        handleMessageClick(request.author_id)
                      }
                      handleRequestClick={() =>
                        handleDonateClick(request.id)
                      }
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

interface PostCardProps {
  authorProfile: z.infer<typeof Profile>
  postid: string;
  time_since_post: string;
  dining_halls: string[];
  times: Timeslot[]; // Define a more specific type if possible
  is_request: boolean;
  imgsrc?: string;
  caption?: string;
  handleMessageClick: () => void;
  handleRequestClick: () => void;
}

export function PostCard({
  authorProfile,
  postid,
  time_since_post,
  dining_halls,
  times,
  is_request,
  imgsrc,
  caption,
  handleMessageClick,
  handleRequestClick
}: PostCardProps) {
  // State for fullscreen image
  const supabase = createSupabaseComponentClient();

  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const handle = authorProfile?.handle || "unknown";
  const name = authorProfile?.name || "unknown";
  const isFlexible = authorProfile?.is_flexible || false;
  const avail: Timeslot[] = authorProfile?.availability || [];
  const avail_small = avail.slice(0, 3);
  // Add escape key handler for closing fullscreen image
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreenImage(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const listitems = dining_halls.map((hall) => {
    return (
      <div className="flex flex-row gap-0.5" key={hall}>
        <MapPin size={15} />
        <p>{hall}</p>
      </div>
    );
  });

  return (
    <>
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
                <DataTable columns={columns} data={avail_small} />
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <CardDescription className="text-accent2 underline transition-colors hover:text-accent1">
                  View all Time Slots
                </CardDescription>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{name}'s availability</DialogTitle>
                </DialogHeader>
                <div className="w-full">
                  <DataTable columns={columns} data={avail} />
                </div>

              </DialogContent>
            </Dialog>

          </div>
          <div className="flex-2 flex flex-col gap-y-6 mx-16">
            {imgsrc ? (
              <button
                onClick={() => setFullscreenImage(imgsrc)}
                className="bg-transparent border-0 p-0 cursor-pointer hover:opacity-90 transition-opacity"
              >
                <Image
                  width={100}
                  height={100}
                  src={imgsrc}
                  alt="image"
                  className="object-cover mx-auto self-center w-full h-[120px]"
                />
              </button>
            ) : (
              <div className="mb-8"></div> // Reserve image height when missing
            )}
            <Button
              variant="secondary1"
              size="default"
              className="rounded-sm hover:cursor-pointer"
              onClick={handleRequestClick}
            >
              {is_request ? "Donate Swipe" : "Request Swipe"}
            </Button>
            <Button
              variant="outline"
              className="rounded-sm text-slate-300 hover:cursor-pointer"
              onClick={handleMessageClick}
            >
              <MessagesSquare size={30} />
              Message {name}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Fullscreen image overlay */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs bg-black/60"
          onClick={() => setFullscreenImage(null)}
        >
          <Image
            src={fullscreenImage}
            alt="Fullscreen view"
            width={1000}
            height={1000}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl"
          />
        </div>
      )}
    </>
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
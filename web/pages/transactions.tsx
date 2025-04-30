import { PostType } from "@/utils/supabase/models/post";
import { Profile } from "@/utils/supabase/models/profile";
import {
  getDonationsByAuthor,
  deleteDonation,
} from "@/utils/supabase/queries/donation";
import { getProfile } from "@/utils/supabase/queries/profile";
import { createSupabaseServerClient } from "@/utils/supabase/server-props";
import { GetServerSidePropsContext } from "next";
import { z } from "zod";
import { PostCard } from "@/components/ui/user-posts/post-card";
import { useEffect, useState } from "react";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { useQuery } from "@tanstack/react-query";
import {
  getRequestsByAuthor,
  deleteRequest,
} from "@/utils/supabase/queries/request";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type UserPostsPageProps = {
  initialProfile: z.infer<typeof Profile>;
  initialDonations: PostType[];
  initialRequests: PostType[];
};
export default function UserPostsPage({
  initialProfile,
  initialDonations,
  initialRequests,
}: UserPostsPageProps) {
  const supabase = createSupabaseComponentClient();

  const [isDonation, setIsDonation] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [currentDonations, setCurrentDonations] =
    useState<PostType[]>(initialDonations);
  const [currentRequests, setCurrentRequests] =
    useState<PostType[]>(initialRequests);

  const deleteDonationPost = async (post_id: string) => {
    (isDonation ? setCurrentDonations : setCurrentRequests)((prev) =>
      prev.filter((d) => d.id !== post_id)
    );
    await (isDonation ? deleteDonation : deleteRequest)(supabase, post_id);
    await refetch();
  };

  const queryType = isDonation ? currentDonations : currentRequests;
  const queryTypeKey = isDonation ? "donations" : "requests";

  const { data: freshPost = queryType, refetch } = useQuery({
    queryKey: [queryTypeKey, initialProfile.id],
    queryFn: () =>
      isDonation
        ? getDonationsByAuthor(supabase, initialProfile.id)
        : getRequestsByAuthor(supabase, initialProfile.id),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    (isDonation ? setCurrentDonations : setCurrentRequests)(freshPost);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freshPost]);

  if (deleting) {
    return (
      <div className="flex flex-col items-center w-full h-screen">
        <div className="flex flex-col h-full w-full">
          <h1 className="text-black text-4xl font-semibold mt-10 text-center">
            Your Posts
          </h1>
          <p className="text-gray-500 text-sm text-center max-w-lg mx-auto mb-6">
            Track and manage all requests and donations that you currently have
            posted.
          </p>

          <div className="flex-1 flex flex-col overflow-hidden">
            <Tabs
              defaultValue={isDonation ? "donations" : "requests"}
              onValueChange={(value) =>
                value === "donations"
                  ? setIsDonation(true)
                  : setIsDonation(false)
              }
              className="flex flex-col h-full"
            >
              <TabsList className="grid w-4/5 max-w-md mx-auto grid-cols-2">
                <TabsTrigger value="donations" className="hover:cursor-pointer">
                  Donations
                </TabsTrigger>
                <TabsTrigger value="requests" className="hover:cursor-pointer">
                  Requests
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent
                  value="donations"
                  className="h-full flex flex-col overflow-hidden"
                >
                  <div className="flex h-full overflow-y-auto pb-4 mx-auto p-5">
                    <div className="h-full gap-10 grid grid-cols-1">
                      {currentDonations.length === 0 && (
                        <p className="flex w-full h-full text-center items-center justify-center text-black">
                          You do not have any currently posted swipe donations.
                        </p>
                      )}
                      {currentDonations.map((donation) => (
                        <Dialog key={donation.id}>
                          <DialogTrigger>
                            <div
                              key={donation.id}
                              className="cursor-pointer rounded-lg overflow-hidden shadow-[0_0_10px_2px_rgba(239,68,68,0.6)] hover:shadow-[0_0_15px_4px_rgba(239,68,68,0.8)] transition"
                            >
                              <PostCard
                                authorProfile={initialProfile}
                                time_since_post={formatTimeSince(
                                  donation.created_at
                                )}
                                dining_halls={["Chase", "Lenoir"]}
                                times={initialProfile.availability!.slice(0, 3)}
                                is_request={false}
                                caption={donation.content}
                                imgsrc={donation.attachment_url || undefined}
                                handleMessageClick={() => {}}
                              />
                            </div>
                          </DialogTrigger>
                          <DialogContent className="w-3/5 bg-white border-accent1">
                            <div>
                              <h1 className="text-xl font-bold text-accent1">
                                Are you Sure?
                              </h1>
                              <h1 className="text-zinc-400 text-sm mb-8">
                                This change cannot be undone.
                              </h1>
                            </div>

                            <p className="font-semibold text-center text-black mb-3">
                              Would you like to proceed with deleting this post?
                            </p>
                            <div className="flex flex-row w-full justify-center gap-10">
                              <DialogClose>
                                <Button className="cursor-pointer bg-background">
                                  Cancel
                                </Button>
                              </DialogClose>
                              <Button
                                onClick={() => deleteDonationPost(donation.id)}
                                className="cursor-pointer bg-accent1"
                              >
                                Delete
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="requests"
                  className="h-full flex flex-col overflow-hidden"
                >
                  <div className="flex-1 overflow-y-auto mx-auto p-5">
                    <div className="h-full gap-10 grid grid-cols-1">
                      {currentRequests.length === 0 && (
                        <p className="flex w-full h-full text-center items-center justify-center text-black">
                          You do not have any currently posted swipe requests.
                        </p>
                      )}
                      {currentRequests.map((request) => (
                        <Dialog key={request.id}>
                          <DialogTrigger>
                            <div
                              key={request.id}
                              className="cursor-pointer rounded-lg overflow-hidden shadow-[0_0_10px_2px_rgba(239,68,68,0.6)] hover:shadow-[0_0_15px_4px_rgba(239,68,68,0.8)] transition"
                            >
                              <PostCard
                                authorProfile={initialProfile}
                                time_since_post={formatTimeSince(
                                  request.created_at
                                )}
                                dining_halls={["Chase", "Lenoir"]}
                                times={initialProfile.availability!.slice(0, 3)}
                                is_request={true}
                                caption={request.content}
                                imgsrc={request.attachment_url || undefined}
                                handleMessageClick={() => {}}
                              />
                            </div>
                          </DialogTrigger>
                          <DialogContent className="w-3/5 bg-white border-accent1">
                            <Label className="text-xl font-bold text-accent1">
                              Are you Sure?
                            </Label>
                            <Label className="text-zinc-400 text-sm mb-8">
                              This change cannot be undone.
                            </Label>

                            <p className="font-semibold text-center text-black mb-3">
                              Would you like to proceed with deleting this post?
                            </p>
                            <div className="flex flex-row w-full justify-center gap-10">
                              <DialogClose>
                                <Button className="cursor-pointer bg-background">
                                  Cancel
                                </Button>
                              </DialogClose>
                              <Button
                                onClick={() => deleteDonationPost(request.id)}
                                className="cursor-pointer bg-accent1"
                              >
                                Delete
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          <div className="p-6 mt-auto w-full flex justify-center">
            <Button
              onClick={() => {
                setDeleting(!deleting);
              }}
              className={
                deleting
                  ? "cursor-pointer size-12 bg-red-800 hover:bg-primary"
                  : "cursor-pointer size-12 bg-primary hover:bg-red-800"
              }
            >
              <Trash2 size={12} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full h-screen">
      <div className="flex flex-col h-full w-full">
        <h1 className="text-black text-4xl font-semibold mt-10 text-center">
          Your Posts
        </h1>
        <p className="text-gray-500 text-sm text-center max-w-lg mx-auto mb-6">
          Track and manage all requests and donations that you currently have
          posted.
        </p>

        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs
            defaultValue={isDonation ? "donations" : "requests"}
            onValueChange={(value) =>
              value === "donations" ? setIsDonation(true) : setIsDonation(false)
            }
            className="flex flex-col h-full"
          >
            <TabsList className="grid w-4/5 max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="donations" className="hover:cursor-pointer">
                Donations
              </TabsTrigger>
              <TabsTrigger value="requests" className="hover:cursor-pointer">
                Requests
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent
                value="donations"
                className="h-full flex flex-col overflow-hidden"
              >
                <div className="flex-1 overflow-y-auto pb-4 mx-auto p-5">
                  <div className="h-full gap-10 grid grid-cols-1">
                    {currentDonations.length === 0 && (
                      <p className="flex w-full h-full text-center items-center justify-center text-black">
                        You do not have any currently posted swipe donations.
                      </p>
                    )}
                    {currentDonations.map((donation) => (
                      <PostCard
                        key={donation.id}
                        authorProfile={initialProfile}
                        time_since_post={formatTimeSince(donation.created_at)}
                        dining_halls={["Chase", "Lenoir"]}
                        times={initialProfile.availability!.slice(0, 3)}
                        is_request={false}
                        caption={donation.content}
                        imgsrc={donation.attachment_url || undefined}
                        handleMessageClick={() => {}}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="requests"
                className="h-full flex flex-col overflow-hidden"
              >
                <div className="flex-1 overflow-y-auto pb-4 mx-auto p-5">
                  <div className="h-full gap-10 grid grid-cols-1">
                    {currentRequests.length === 0 && (
                      <p className="flex w-full h-full text-center items-center justify-center text-black">
                        You do not have any currently posted swipe requests.
                      </p>
                    )}
                    {currentRequests.map((request) => (
                      <PostCard
                        key={request.id}
                        authorProfile={initialProfile}
                        time_since_post={formatTimeSince(request.created_at)}
                        dining_halls={["Chase", "Lenoir"]}
                        times={initialProfile.availability!.slice(0, 3)}
                        is_request={true}
                        caption={request.content}
                        imgsrc={request.attachment_url || undefined}
                        handleMessageClick={() => {}}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="p-6 mt-auto w-full flex justify-center">
          <Button
            onClick={() => {
              setDeleting(!deleting);
            }}
            className={
              deleting
                ? "cursor-pointer size-12 bg-red-800 hover:bg-primary"
                : "cursor-pointer size-12 bg-primary hover:bg-red-800"
            }
          >
            <Trash2 size={12} />
          </Button>
        </div>
      </div>
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
  const donations = await getDonationsByAuthor(supabase, profile.id);
  const requests = await getRequestsByAuthor(supabase, profile.id);

  return {
    props: {
      initialProfile: profile,
      initialDonations: donations,
      initialRequests: requests,
    },
  };
}

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

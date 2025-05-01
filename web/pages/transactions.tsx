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
import Head from "next/head";

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
  const [interestedUserMap, setInterestedUserMap] = useState<
    Record<string, { userId: string; name: string }[]>
  >({});

  useEffect(() => {
    const fetchInterestedProfiles = async () => {
      const map: Record<string, { userId: string; name: string }[]> = {};

      for (const donation of currentDonations) {
        const userIds = donation.interested_users || [];
        const entries: { userId: string; name: string }[] = [];

        for (const uid of userIds) {
          try {
            const prof = await getProfile(supabase, uid);
            entries.push({ userId: uid, name: prof.name });
          } catch (err) {
            console.error(`Failed to fetch profile for ${uid}`, err);
          }
        }

        map[donation.id] = entries;
      }

      setInterestedUserMap(map);
    };

    fetchInterestedProfiles();
  }, [currentDonations]);

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


  return (
    <div className="flex flex-col items-center w-full h-screen">
      <Head>
        <title>Transactions</title>
        <meta name="description" content="View and manage posts" />
      </Head>
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
                      // eslint-disable-next-line react/jsx-key
                      <PostCard
                        key={donation.id}
                        authorProfile={initialProfile}
                        time_since_post={formatTimeSince(donation.created_at)}
                        dining_halls={["Chase", "Lenoir"]}
                        times={initialProfile.availability!.slice(0, 3)}
                        is_request={false}
                        caption={donation.content}
                        imgsrc={donation.attachment_url || undefined}
                        showx={true}
                        handleMessageClick={() => { }}
                        handledelete={() => deleteDonationPost(donation.id)}
                        interestedUsers={interestedUserMap[donation.id] || []}


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
                        handleMessageClick={() => { }}
                        showx={true}
                        handledelete={() => deleteDonationPost(request.id)}

                      />
                    ))}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="p-6 mt-auto w-full flex justify-center">

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

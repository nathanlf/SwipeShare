import { z } from "zod";
import { Post } from "../models/post";
import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { Profile } from "../models/profile";

/**
 * Creates a fallback author when the real profile data isn't available yet
 * (used in optimistic post caching).
 */
const getFallbackAuthor = (author_id: string): z.infer<typeof Profile> => ({
  id: author_id,
  name: "Posting...",
  handle: "posting",
  avatar_url: null,
  availability: [],
  is_flexible: false,
});

/**
 * Safely find a user from profiles array or return fallback
 */
const findAuthorOrFallback = (
  author_id: string,
  profiles?: z.infer<typeof Profile>[]
): z.infer<typeof Profile> => {
  if (!profiles || profiles.length === 0) {
    return getFallbackAuthor(author_id);
  }

  const foundUser = profiles.find((profile) => profile.id === author_id);
  if (!foundUser) {
    return getFallbackAuthor(author_id);
  }

  // Validate that the found user has all required fields
  try {
    return Profile.parse(foundUser);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  } catch (e: any) {
    return getFallbackAuthor(author_id);
  }
};

/**
 * Generates a function that adds a donation to the cache.
 */
export const addDonationToCacheFn =
  (queryUtils: QueryClient, profiles?: z.infer<typeof Profile>[]) =>
  (newDonation: z.infer<typeof Post>) => {
    queryUtils.setQueryData(
      ["donations"],
      (oldData: InfiniteData<z.infer<typeof Post>[]> | undefined) => {
        // Add author data to the post
        const author = findAuthorOrFallback(newDonation.author_id, profiles);

        const parsedDonation = {
          ...newDonation,
          author,
        };

        // If oldData doesn't exist, create a new cache structure
        if (!oldData) {
          return {
            pageParams: [0],
            pages: [[parsedDonation]],
          };
        }

        // Otherwise, update existing cache by adding post to the first page
        return {
          pageParams: oldData.pageParams,
          pages: oldData.pages.map((page, index) =>
            index === 0 ? [parsedDonation, ...page] : page
          ),
        };
      }
    );
  };

/**
 * Generates a function that adds a request to the cache.
 */
export const addRequestToCacheFn =
  (queryUtils: QueryClient, profiles?: z.infer<typeof Profile>[]) =>
  (newRequest: z.infer<typeof Post>) => {
    queryUtils.setQueryData(
      ["requests"],
      (oldData: InfiniteData<z.infer<typeof Post>[]> | undefined) => {
        // Add author data to the post
        const author = findAuthorOrFallback(newRequest.author_id, profiles);

        const parsedRequest = {
          ...newRequest,
          author,
        };

        // If oldData doesn't exist, create a new cache structure
        if (!oldData) {
          return {
            pageParams: [0],
            pages: [[parsedRequest]],
          };
        }

        // Otherwise, update existing cache by adding post to the first page
        return {
          pageParams: oldData.pageParams,
          pages: oldData.pages.map((page, index) =>
            index === 0 ? [parsedRequest, ...page] : page
          ),
        };
      }
    );
  };

/**
 * Generates a function that updates a donation in the cache.
 */
export const updateDonationInCacheFn =
  (queryUtils: QueryClient, profiles?: z.infer<typeof Profile>[]) =>
  (updatedDonation: z.infer<typeof Post>) => {
    queryUtils.setQueryData(
      ["donations"],
      (oldData: InfiniteData<z.infer<typeof Post>[]> | undefined) => {
        // Add author data to the post
        const author = findAuthorOrFallback(
          updatedDonation.author_id,
          profiles
        );

        const parsedDonation = {
          ...updatedDonation,
          author,
        };

        // If oldData doesn't exist, create a new cache structure
        if (!oldData) {
          return {
            pageParams: [0],
            pages: [[parsedDonation]],
          };
        }

        // Otherwise, update the existing post in the cache
        return {
          pageParams: oldData.pageParams,
          pages: oldData.pages.map((page) =>
            page.map((post) =>
              post.id === updatedDonation.id ? parsedDonation : post
            )
          ),
        };
      }
    );
  };

/**
 * Generates a function that updates a request in the cache.
 */
export const updateRequestInCacheFn =
  (queryUtils: QueryClient, profiles?: z.infer<typeof Profile>[]) =>
  (updatedRequest: z.infer<typeof Post>) => {
    queryUtils.setQueryData(
      ["requests"],
      (oldData: InfiniteData<z.infer<typeof Post>[]> | undefined) => {
        // Add author data to the post
        const author = findAuthorOrFallback(updatedRequest.author_id, profiles);

        const parsedRequest = {
          ...updatedRequest,
          author,
        };

        // If oldData doesn't exist, create a new cache structure
        if (!oldData) {
          return {
            pageParams: [0],
            pages: [[parsedRequest]],
          };
        }

        // Otherwise, update the existing post in the cache
        return {
          pageParams: oldData.pageParams,
          pages: oldData.pages.map((page) =>
            page.map((post) =>
              post.id === updatedRequest.id ? parsedRequest : post
            )
          ),
        };
      }
    );
  };

/**
 * Generates a function that deletes a donation from the cache.
 */
export const deleteDonationFromCacheFn =
  (queryUtils: QueryClient) => (donationId: string) => {
    queryUtils.setQueryData(
      ["donations"],
      (oldData: InfiniteData<z.infer<typeof Post>[]> | undefined) => {
        if (!oldData) {
          return { pageParams: [0], pages: [] };
        }

        return {
          pageParams: oldData.pageParams,
          pages: oldData.pages.map((page) =>
            page.filter((post) => post.id !== donationId)
          ),
        };
      }
    );
  };

/**
 * Generates a function that deletes a request from the cache.
 */
export const deleteRequestFromCacheFn =
  (queryUtils: QueryClient) => (requestId: string) => {
    queryUtils.setQueryData(
      ["requests"],
      (oldData: InfiniteData<z.infer<typeof Post>[]> | undefined) => {
        if (!oldData) {
          return { pageParams: [0], pages: [] };
        }

        return {
          pageParams: oldData.pageParams,
          pages: oldData.pages.map((page) =>
            page.filter((post) => post.id !== requestId)
          ),
        };
      }
    );
  };

/**
 * Generates a function that adds a user to interested_users for a donation.
 */
export const addInterestedUserToDonationCacheFn =
  (queryUtils: QueryClient) => (donationId: string, userId: string) => {
    queryUtils.setQueryData(
      ["donations"],
      (oldData: InfiniteData<z.infer<typeof Post>[]> | undefined) => {
        if (!oldData) {
          return { pageParams: [0], pages: [] };
        }

        return {
          pageParams: oldData.pageParams,
          pages: oldData.pages.map((page) =>
            page.map((post) => {
              if (post.id === donationId) {
                const interestedUsers = post.interested_users || [];
                // Only add if not already present
                if (!interestedUsers.includes(userId)) {
                  return {
                    ...post,
                    interested_users: [...interestedUsers, userId],
                  };
                }
              }
              return post;
            })
          ),
        };
      }
    );
  };

/**
 * Generates a function that adds a user to interested_users for a request.
 */
export const addInterestedUserToRequestCacheFn =
  (queryUtils: QueryClient) => (requestId: string, userId: string) => {
    queryUtils.setQueryData(
      ["requests"],
      (oldData: InfiniteData<z.infer<typeof Post>[]> | undefined) => {
        if (!oldData) {
          return { pageParams: [0], pages: [] };
        }

        return {
          pageParams: oldData.pageParams,
          pages: oldData.pages.map((page) =>
            page.map((post) => {
              if (post.id === requestId) {
                const interestedUsers = post.interested_users || [];
                // Only add if not already present
                if (!interestedUsers.includes(userId)) {
                  return {
                    ...post,
                    interested_users: [...interestedUsers, userId],
                  };
                }
              }
              return post;
            })
          ),
        };
      }
    );
  };

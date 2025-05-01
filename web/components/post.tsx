import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { MapPin, ImageIcon, Plus, Loader2, Calendar } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { createRequest } from "@/utils/supabase/queries/request";
import { createDonation } from "@/utils/supabase/queries/donation";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/utils/supabase/queries/profile";

// Import post caching functions
import {
  addDonationToCacheFn,
  addRequestToCacheFn,
  deleteDonationFromCacheFn,
  deleteRequestFromCacheFn,
} from "@/utils/supabase/cache/post-cache";

interface CreatePostProps {
  user: User;
}

export default function CreatePostButton({ user }: CreatePostProps) {
  const [postType, setPostType] = useState<"donation" | "request" | null>(null);
  const [description, setDescription] = useState("");
  const [diningHalls, setDiningHalls] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const supabase = createSupabaseComponentClient();
  const queryClient = useQueryClient();

  // Fetch current user profile for use in cache updates
  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      return await getProfile(supabase, user.id);
    },
    enabled: !!user.id,
  });

  const availableDiningHalls = ["Chase", "Lenoir"];

  const handleDiningHallToggle = (hall: string) => {
    if (diningHalls.includes(hall)) {
      setDiningHalls(diningHalls.filter((h) => h !== hall));
    } else {
      setDiningHalls([...diningHalls, hall]);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to the existing image bucket
      const { error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage
        .from("attachments")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!postType || diningHalls.length === 0) {
      return;
    }

    setIsSubmitting(true);

    // Create a temporary ID for optimistic updates
    const tempId = uuidv4();
    
    // Store original values in case we need to roll back
    const pendingDescription = description;
    const pendingDiningHalls = [...diningHalls];
    const pendingFile = selectedFile;

    try {
      // Create optimistic post object
      const optimisticPost = {
        id: tempId,
        content: description,
        author_id: user.id,
        created_at: new Date().toISOString(),
        attachment_url: null as string | null, // Explicitly type this to avoid the type error
        dining_halls: diningHalls,
        interested_users: []
      };

      // Add optimistic post to cache
      if (postType === "donation") {
        addDonationToCacheFn(queryClient, profile ? [profile] : undefined)(optimisticPost);
      } else {
        addRequestToCacheFn(queryClient, profile ? [profile] : undefined)(optimisticPost);
      }

      // Reset form immediately for better UX
      setDescription("");
      setDiningHalls([]);
      setSelectedFile(null);

      // Format content with dining halls included for server
      const content = JSON.stringify({
        text: pendingDescription,
        diningHalls: pendingDiningHalls,
      });

      let attachmentUrl: string | null = null;

      // Upload image if selected
      if (pendingFile) {
        attachmentUrl = await uploadImage(pendingFile);
        
        // Update the optimistic post with the attachment URL
        const updatedPost = {
          ...optimisticPost,
          attachment_url: attachmentUrl
        };
        
        if (postType === "donation") {
          addDonationToCacheFn(queryClient, profile ? [profile] : undefined)(updatedPost);
        } else {
          addRequestToCacheFn(queryClient, profile ? [profile] : undefined)(updatedPost);
        }
      }

      // Create post based on type using the appropriate function
      if (postType === "request") {
        await createRequest(supabase, content, user.id, attachmentUrl);
      } else if (postType === "donation") {
        await createDonation(supabase, content, user.id, attachmentUrl);
      }

      // Invalidate queries to refetch the updated data from server
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });

      // Success handling
      toast.success("Post Created", {
        description: `Your ${postType} has been successfully posted`,
      });

      // Reset postType and close dialog
      setPostType(null);
      setIsDialogOpen(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error creating post:", error);
      
      // Remove the optimistic update from cache on error
      if (postType === "donation") {
        deleteDonationFromCacheFn(queryClient)(tempId);
      } else {
        deleteRequestFromCacheFn(queryClient)(tempId);
      }
      
      // Restore the form values
      setDescription(pendingDescription);
      setDiningHalls(pendingDiningHalls);
      setSelectedFile(pendingFile);
      
      toast.error("Error", {
        description: `Failed to create post: ${error?.message || "Unknown error"}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Cleanup when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      // Wait for exit animation
      const timer = setTimeout(() => {
        setPostType(null);
        setDescription("");
        setDiningHalls([]);
        setSelectedFile(null);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isDialogOpen]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="bg-accent2 hover:bg-accent1 text-white rounded-lg shadow-lg gap-x-1"
          onClick={() => setIsDialogOpen(true)}
        >
          Create Post
          <Plus />
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white/90 backdrop-blur-md max-w-lg sm:max-w-md lg:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a New Post</DialogTitle>
            <DialogDescription>
              Share a meal swipe donation or request
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                What would you like to post?
              </label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={postType === "donation" ? "default" : "outline"}
                  onClick={() => setPostType("donation")}
                  className={
                    postType === "donation" ? "bg-primary1 text-white" : ""
                  }
                  disabled={isSubmitting}
                >
                  Donate a Swipe
                </Button>
                <Button
                  type="button"
                  variant={postType === "request" ? "default" : "outline"}
                  onClick={() => setPostType("request")}
                  className={
                    postType === "request" ? "bg-primary1 text-white" : ""
                  }
                  disabled={isSubmitting}
                >
                  Request a Swipe
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-b border-gray-200 py-3 px-1">
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Schedule your availability
                </span>
              </div>
              <Link href={`/availability/${user.id}`} passHref>
                <Button
                  type="button"
                  variant="outline"
                  className="text-primary1 border-primary1 hover:bg-primary1/10"
                  size="sm"
                >
                  Edit Availability
                </Button>
              </Link>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2 flex items-center gap-1">
                <MapPin size={16} />
                Select Dining Halls
              </label>
              <div className="flex flex-wrap gap-2">
                {availableDiningHalls.map((hall) => (
                  <Button
                    key={hall}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDiningHallToggle(hall)}
                    className={
                      diningHalls.includes(hall) ? "bg-primary1 text-white" : ""
                    }
                    disabled={isSubmitting}
                  >
                    {hall}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="text-sm font-medium text-gray-700 block mb-2"
              >
                Description (Optional)
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-md text-slate-700 break-all"
                placeholder="Add more details about your post..."
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2 flex items-center gap-1">
                <ImageIcon size={16} />
                Add an Image (Optional)
              </label>
              <div className="relative">
                <label className="block w-full px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                  <span className="text-gray-700 font-medium">Choose File</span>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isSubmitting}
                  />
                </label>
                <p className="mt-1 text-sm text-gray-600">
                  {selectedFile
                    ? `Selected: ${selectedFile.name}`
                    : "No file chosen"}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-primary1 text-white"
              disabled={!postType || diningHalls.length === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
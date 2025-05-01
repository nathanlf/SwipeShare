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
import { useState } from "react";
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

    setIsSubmitting(true);

    try {
      // Format content with dining halls included
      const content = JSON.stringify({
        text: description,
        diningHalls: diningHalls,
      });

      let attachmentUrl: string | null = null;

      // Upload image if selected
      if (selectedFile) {
        attachmentUrl = await uploadImage(selectedFile);
      }

      // Create post based on type using the appropriate function
      if (postType === "request") {
        await createRequest(supabase, content, user.id, attachmentUrl);
      } else if (postType === "donation") {
        await createDonation(supabase, content, user.id, attachmentUrl);
      }

      // Success handling
      toast.success("Post Created", {
        description: `Your ${postType} has been successfully posted`,
      });

      // Reset form and close dialog
      setDescription("");
      setDiningHalls([]);
      setSelectedFile(null);
      setPostType(null);
      setIsDialogOpen(false);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error creating post:", error);
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

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="bg-accent2 hover:bg-accent1 text-white rounded-lg shadow-lg gap-x-1 dark:bg-accent2/90 dark:hover:bg-accent1/90"
          onClick={() => setIsDialogOpen(true)}
        >
          Create Post
          <Plus />
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white/90 backdrop-blur-md max-w-lg sm:max-w-md lg:max-w-2xl dark:bg-[#18181b] dark:text-white">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="dark:text-white">Create a New Post</DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              Share a meal swipe donation or request
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                What would you like to post?
              </label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={postType === "donation" ? "default" : "outline"}
                  onClick={() => setPostType("donation")}
                  className={
                    postType === "donation" 
                      ? "bg-primary1 text-white dark:bg-primary1/90" 
                      : "dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800"
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
                    postType === "request" 
                      ? "bg-primary1 text-white dark:bg-primary1/90" 
                      : "dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800"
                  }
                  disabled={isSubmitting}
                >
                  Request a Swipe
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-b border-gray-200 dark:border-gray-700 py-3 px-1">
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Schedule your availability
                </span>
              </div>
              <Link href={`/availability/${user.id}`} passHref>
                <Button
                  type="button"
                  variant="outline"
                  className="text-primary1 border-primary1 hover:bg-primary1/10 dark:border-primary1/70 dark:hover:bg-primary1/20"
                  size="sm"
                >
                  Edit Availability
                </Button>
              </Link>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2 flex items-center gap-1">
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
                      diningHalls.includes(hall) 
                        ? "bg-primary1 text-white dark:bg-primary1/90" 
                        : "dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800"
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
                className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2"
              >
                Description (Optional)
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-md text-slate-700 break-all dark:border-gray-600 dark:bg-[#201f20] dark:text-gray-200"
                placeholder="Add more details about your post..."
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2 flex items-center gap-1">
                <ImageIcon size={16} />
                Add an Image (Optional)
              </label>
              <div className="relative">
                <label className="block w-full px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 dark:bg-[#201f20] dark:border-gray-600 dark:hover:bg-gray-700">
                  <span className="text-gray-700 font-medium dark:text-gray-300">Choose File</span>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isSubmitting}
                  />
                </label>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {selectedFile
                    ? `Selected: ${selectedFile.name}`
                    : "No file chosen"}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button 
                type="button" 
                variant="outline" 
                disabled={isSubmitting}
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-primary1 text-white dark:bg-primary1/90 dark:hover:bg-primary1/70"
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
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
import { MapPin, ImageIcon, CirclePlus, Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function CreatePost() {
  const [postType, setPostType] = useState<"donation" | "request" | null>(null);
  const [description, setDescription] = useState("");
  const [diningHalls, setDiningHalls] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const availableDiningHalls = ["Chase", "Lenoir"];

  const handleDiningHallToggle = (hall: string) => {
    if (diningHalls.includes(hall)) {
      setDiningHalls(diningHalls.filter(h => h !== hall));
    } else {
      setDiningHalls([...diningHalls, hall]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      type: postType,
      description,
      diningHalls,
      image: selectedFile
    };

    console.log("Submitting post:", formData);
    // update supabase via API calls
    // depending on the post type
    // call getRequests() query
    // call getDonations() query
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-accent2 hover:bg-accent1 text-white rounded-lg shadow-lg gap-x-1">
          Create Post
          <Plus />
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white/90 backdrop-blur-md max-w-lg sm:max-w-md lg:min-w-2xl">
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
                  className={postType === "donation" ? "bg-primary1 text-white" : ""}
                >
                  Donate a Swipe
                </Button>
                <Button
                  type="button"
                  variant={postType === "request" ? "default" : "outline"}
                  onClick={() => setPostType("request")}
                  className={postType === "request" ? "bg-primary1 text-white" : ""}
                >
                  Request a Swipe
                </Button>
              </div>
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
                    variant={diningHalls.includes(hall) ? "accent1" : "outline"}
                    size="sm"
                    onClick={() => handleDiningHallToggle(hall)}
                    className={diningHalls.includes(hall) ? " text-white" : ""}
                  >
                    {hall}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="text-sm font-medium text-gray-700 block mb-2">
                Description (Optional)
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-md"
                placeholder="Add more details about your post..."
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2 flex items-center gap-1">
                <ImageIcon size={16} />
                Add an Image (Optional)
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full"
              />
              {selectedFile && (
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-primary1 text-white"
              disabled={!postType || diningHalls.length === 0}
            >
              Post
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
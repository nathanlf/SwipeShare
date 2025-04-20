import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogHeader,
    DialogFooter,
    DialogClose,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { useState } from "react";
  
  export default function CreatePost() {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [description, setDescription] = useState("");
  
    const options = ["Option 1", "Option 2", "Option 3"];
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      console.log({ option: selectedOption, description });
    };
  
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="default" className="bg-primary1 text-white">
            Create Post
          </Button>
        </DialogTrigger>
  
        <DialogContent className="bg-white/90 backdrop-blur-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Create a New Post</DialogTitle>
            </DialogHeader>
  
            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Choose a category:
              </label>
              <div className="flex gap-3 mt-1">
                {options.map((option) => (
                  <Button
                    type="button"
                    key={option}
                    variant={selectedOption === option ? "default" : "outline"}
                    onClick={() => setSelectedOption(option)}
                    className={selectedOption === option ? "bg-primary1 text-white" : ""}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
  
            <div className="mt-4">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">
                Post Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                placeholder="Write your post here..."
              />
            </div>
  
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" className="bg-primary1 text-white">
                Submit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
  
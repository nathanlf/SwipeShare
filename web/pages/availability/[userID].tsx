import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function AvailabilityPage() {
  const [available, setAvailable] = useState(false);
  const [notManual, setNotManual] = useState(true);

  return (
    <div className="w-full h-full flex justify-center items-start mt-12">
      <Card className="h-4/5 w-7/10 bg-white">
        <CardHeader>
          <div className="flex flex-row justify-between">
            <CardTitle className="text-4xl font-light">
              <span className="text-primary">Status - </span>
              {available ? (
                <span className="text-accent text-4xl font-light">
                  Available to Gift
                </span>
              ) : (
                <span className="text-text text-4xl">Unavailable</span>
              )}
            </CardTitle>

            {!notManual && (
              <Popover>
                <PopoverTrigger>
                  <Button className="bg-secondary cursor-pointer">
                    <Plus />
                    Alter Availability
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="border-accent w-[350px] mt-2">
                  <h1 className="font-semibold">Status Settings</h1>
                  <p className="text-gray-500 text-sm">
                    Change your availability here.
                  </p>
                  <div className="flex flex-col justify-center items-center gap-2 mt-6">
                    <Button
                      onClick={() => {
                        setAvailable(true);
                      }}
                      className="rounded-4xl w-2/3 bg-accent cursor-pointer font-semibold"
                    >
                      Available to Gift
                    </Button>
                    <Button
                      onClick={() => {
                        setAvailable(false);
                      }}
                      className="rounded-4xl w-2/3 bg-background cursor-pointer font-semibold"
                    >
                      Unavailable
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>

          <CardDescription>
            *Your status will let others know that you are available to donate
            swipes.
          </CardDescription>
        </CardHeader>

        <CardContent className="w-full h-8/10 overflow-y-scroll">
          <div className="ml-8">
            <h1 className="text-background text-2xl font-bold">Add Times</h1>
          </div>
          <div className="ml-8 mt-8">
            <h1 className="text-background text-2xl font-bold">
              Available Times
            </h1>
          </div>
        </CardContent>

        <CardFooter>
          <div className="w-full flex justify-end items-center gap-5 mt-10 pr-10">
            <Switch
              checked={notManual}
              onCheckedChange={setNotManual}
              className="h-7 w-12 cursor-pointer hover:[&>span]:bg-accent [&>span]:size-6 [&>span]:translate-x-[calc(100%-4px)]"
            />
            <Label className="text-base">Sync status with your schedule.</Label>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

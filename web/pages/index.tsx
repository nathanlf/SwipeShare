import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, MapPin, MessagesSquare } from "lucide-react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DataTable } from "@/components/ui/datatable";

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

export default function Home() {
  return (
    <div>
      <Tabs defaultValue="account" className="w-1/2 mx-auto">
        <TabsList className="grid w-full grid-cols-2 mb-12">
          <TabsTrigger value="account">Donations</TabsTrigger>
          <TabsTrigger value="password">Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <ScrollArea>
            <div className="flex flex-col gap-y-8">
              <PostCard
                username="user123"
                time_since_post="3m"
                dining_halls={["Chase", "Lenoir"]}
                times={timeslots}
                is_request={false}
              />
              <PostCard
                username="user456"
                time_since_post="2h"
                dining_halls={["Chase"]}
                times={timeslots}
                is_request={false}
              />
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="password">
          <ScrollArea>
            <div className="flex flex-col gap-y-8">
              <PostCard
                username="user456"
                time_since_post="3m"
                dining_halls={["Chase"]}
                times={timeslots}
                is_request={true}
                imgsrc={"/sampleimg.png"}
                caption={"feeling hungry and hopeful :p"}
              />
              <PostCard
                username="user456"
                time_since_post="3m"
                dining_halls={["Chase"]}
                times={timeslots}
                is_request={true}
              />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

type props = {
  username: string;
  time_since_post: string;
  dining_halls: string[];
  times: Timeslot[];
  is_request: boolean;
  imgsrc: string | null;
  caption: string | null;
};
function PostCard({
  username,
  time_since_post,
  dining_halls,
  times,
  is_request,
  imgsrc,
  caption,
}: props) {
  const listitems = dining_halls.map((hall) => {
    return (
      // eslint-disable-next-line react/jsx-key
      <div className="flex flex-row gap-0.5">
        <MapPin size={15} />
        <p>{hall}</p>
      </div>
    );
  });
  return (
    <Card className="rounded-sm px-4 gap-3">
      <CardHeader>
        <CardTitle className="text-xl font-sans font-bold">
          {is_request ? "Swipe Requested" : "Swipe Available"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-row gap-x-6">
        <div className="space-y-4 flex-3">
          <div className="flex flex-col gap-y-2">
            <CardDescription className="flex flex-row gap-x-1 pt-0.5">
              <CalendarDays size={16} />
              <p className="text-xs ">
                {time_since_post} ~ @{username}
              </p>
            </CardDescription>
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
          {imgsrc ? (
            <Image
              width={100}
              height={100}
              src={imgsrc}
              alt="image"
              className="object-cover mx-auto self-center w-full h-[120px]"
            ></Image>
          ) : (
            <div className="mb-8" /> // Reserve image height when missing
          )}
          <Button variant="secondary1" size="default" className=" rounded-sm ">
            {is_request ? "Donate Swipe" : "Request Swipe"}
          </Button>
          <Button
            variant="outline"
            className="rounded-sm text-muted-foreground"
          >
            <MessagesSquare size={30} />
            Message @{username}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* 
 <div className="flex-2 flex flex-col gap-y-6 mx-16">
                    {imgsrc ? <Image width={100} height={100} src={imgsrc} alt="image" className="object-cover mx-auto self-center w-full h-[120px]"></Image> : null}
                    <Button variant="secondary1" size="default" className=" rounded-sm " >{is_request ? "Donate Swipe" : "Request Swipe"}</Button>
                    <Button variant="outline" className="rounded-sm text-muted-foreground" ><MessagesSquare size={30} />
                        Message @{username}</Button>

                </div>
*/

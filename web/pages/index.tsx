
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardDescription, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area";

export type Timeslot = {
    starttime: string
    endtime: string
}

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
    }
]
export const columns: ColumnDef<Timeslot>[] = [
    {
        accessorKey: "starttime",
        cell: ({ row }) => {
            const { starttime, endtime } = row.original;
            return <div className="text-left font-bold !rounded-md text-sm">{starttime} - {endtime}</div>
        },
    },
]
interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}
export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })
    //const first = True;
    return (
        <div className="rounded-md ">
            <Table className="gap-2">
                <TableBody className="gap-2">
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row, index) => {
                            const color = Number.isInteger(index / 2) ? "bg-[#3bbf904d] !rounded-md border-none mt-2 hover:bg-[#3bbf9040]" : "bg-[#3bbf9026] !rounded-md border-none mt-2 hover:bg-[#3bbf901a]";
                            return (
                                <TableRow className={color}
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell className="rounded-md py-0.5 leading-6" key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            )
                        })
                    ) : (
                        <TableRow className="bg-green-200">
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>

    )
}



export default function Home() {
    return (
        <div >
            <Tabs defaultValue="account" className="w-1/2 mx-auto">
                <TabsList className="grid w-full grid-cols-2 mb-12">
                    <TabsTrigger value="account">Donations</TabsTrigger>
                    <TabsTrigger value="password">Requests</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                    <ScrollArea >
                        <div className="flex flex-col gap-y-8">
                            <PostCard />
                            <PostCard />


                        </div>

                    </ScrollArea>
                </TabsContent>
                <TabsContent value="password">
                    <Card>
                        <CardHeader>
                            <CardTitle>Password</CardTitle>
                            <CardDescription>
                                Change your password here. After saving, you'll be logged out.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="space-y-1">
                                <Label htmlFor="current">Current password</Label>
                                <Input id="current" type="password" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="new">New password</Label>
                                <Input id="new" type="password" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Save password</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>

        </div>
    );

}

function PostCard() {
    return (
        <Card className="rounded-sm px-4" >
            <CardHeader>
                <CardTitle className="text-xl font-sans font-normal">Swipe Available</CardTitle>
                <CardDescription className="flex flex-row gap-x-1 pt-0.5">
                    <CalendarDays size={16} />
                    <p className="text-xs ">3m ~ @user123</p>
                </CardDescription>
                <CardDescription className="flex flex-row gap-1.5 text-primary1 text-xs">
                    <div className="flex flex-row gap-0.5">
                        <MapPin size={15} />
                        <p>Chase</p>
                    </div>
                    <div className="flex flex-row gap-0.5">
                        <MapPin size={15} />
                        <p>Lenoir</p>                                    </div>


                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-row gap-x-6">
                <div className="space-y-4 flex-3">
                    <div className="flex flex-row">
                        <div className="w-full">
                            <DataTable columns={columns} data={timeslots} />
                        </div>
                    </div>
                    <CardDescription className="text-accent2 underline transition-colors hover:text-accent1">
                        View all Time Slots
                    </CardDescription>
                </div>
                <div className="flex-2 flex flex-col gap-y-6 mx-16">
                    <Button variant="secondary1" size="default" className=" rounded-sm " >Request Swipe</Button>
                    <Button variant="outline" className="rounded-sm text-muted-foreground" ><MessagesSquare size={30} />
                        Message @user123</Button>

                </div>
            </CardContent>
        </Card>

    );
}
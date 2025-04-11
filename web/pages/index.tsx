import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardDescription, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays } from "lucide-react";




export default function Home() {
    return (
        <div className="flex flex-row">
            <div className="w-1/5 h-screen border border-gray-400"></div>
            <Tabs defaultValue="account" className="w-1/2 mx-auto">
                <TabsList className="grid w-full grid-cols-2 mb-12">
                    <TabsTrigger value="account">Donations</TabsTrigger>
                    <TabsTrigger value="password">Requests</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                    <div className="flex flex-col gap-y-8">
                        <Card className="rounded-sm px-4" >
                            <CardHeader>
                                <CardTitle className="text-xl font-sans font-normal">Swipe Available</CardTitle>
                                <CardDescription className="flex flex-row gap-x-1 pt-0.5">
                                    <CalendarDays size={16} />
                                    <p className="text-xs ">3m ~ @user123</p>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="space-y-1">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" defaultValue="Pedro Duarte" />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="username">Username</Label>
                                    <Input id="username" defaultValue="@peduarte" />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button>Save changes</Button>
                            </CardFooter>
                        </Card>
                        <Card className="rounded-sm px-4">
                            <CardHeader>
                                <CardTitle className="text-xl font-sans font-normal">Swipe Available</CardTitle>
                                <CardDescription>
                                    Make changes to your account here. Click save when you're done.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="space-y-1">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" defaultValue="Pedro Duarte" />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="username">Username</Label>
                                    <Input id="username" defaultValue="@peduarte" />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button>Save changes</Button>
                            </CardFooter>
                        </Card>

                    </div>
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
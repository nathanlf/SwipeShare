import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";


export default function Test() {
    return (
        <div className="flex flex-col gap-y-6">
            <div className="flex flex-row justify-center my-20 text-center px-16 gap-x-10">
                <Card className="w-1/2 p-8 ">
                    <div className="flex flex-row gap-x-6 items-center justify-center">
                        <CardTitle className=" text-primary1">This is our Primary Color</CardTitle>
                        <Button variant="default" size="default" className="bg-primary1 w-1/4 mx-auto">
                            :p
                        </Button>
                    </div>
                    <div className="flex flex-row gap-x-6 items-center justify-center">
                        <CardTitle className=" text-secondary1">This is our Secondary Color</CardTitle>
                        <Button variant="default" size="default" className="bg-secondary1 w-1/4 mx-auto">
                            :3
                        </Button>
                    </div>

                    <CardDescription>
                        <Button variant="default" size="default" className=" bg-secondary1-muted">this is the muted version of our secondary color--aka with opacity 63%-- that i used bc it looks nice</Button>

                    </CardDescription>
                </Card>
                <Card className="w-1/2 bg-primary1">
                    <CardTitle className=" text-primary1">This is our primary color</CardTitle>
                    <CardDescription>

                    </CardDescription>

                </Card>

            </div>
            <div className="flex flex-row  px-16 gap-x-10">
                <Card className="w-1/2 p-8 ">
                    <div className="flex flex-row gap-x-6 items-center justify-center">
                        <CardTitle className=" text-accent1">This is our Accent Color</CardTitle>
                        <Button variant="default" size="default" className="bg-accent1 w-1/4 mx-auto">
                            :p
                        </Button>
                    </div>
                    <div className="flex flex-row gap-x-6 items-center justify-center">
                        <CardTitle className=" text-accent2">This is our Second Accent Color</CardTitle>
                        <Button variant="default" size="default" className="bg-accent2 w-1/4 mx-auto">
                            :3
                        </Button>
                    </div>


                </Card>

            </div>

        </div>
    )
}
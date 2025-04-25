import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { Carrot, Croissant, CupSoda, Dessert, Donut, Salad, Soup } from "lucide-react";
import router from "next/router";


export default function WelcomePage() {
    const gotohome = () => {
        router.push('/');
    }

    return (
        <div className="flex min-h-[calc(100svh)] flex-col text-primary-foreground  items-center  gap-6 bg-primary1 p-6 md:p-20 font-roboto">
            <div className="flex flex-row gap-x-2">
                <Croissant size={40} className="text-accent1" />
                <Salad size={40} className="text-accent1" />
                <h1 className="text-4xl font-bold  mb-6">Welcome to SwipeShare!</h1>
                <CupSoda size={40} className="text-accent1" />
                <Carrot size={40} className="text-accent1" />
            </div>
            <div className="p-14 px-18 border border-b  bg-opacity-100 rounded-md shadow-lg">
                <div className="flex flex-row gap-x-6 justify-center items-center">
                    <div className="flex flex-col gap-y-18">
                        <p className="text-lg font-hubot">I am primarily interested in...</p>
                        <p className="text-lg font-hubot">My day-to-day meal schedule is...</p>
                    </div>
                    <div className="flex flex-col gap-y-8 flex-grow">
                        <ToggleGroup type="single" variant="outline" className="w-130" >
                            <ToggleGroupItem value="bold" aria-label="Toggle bold" className="font-bold font-hubot text-md p-8 shadow-sm">
                                Donating Meal Swipes
                            </ToggleGroupItem>
                            <ToggleGroupItem value="italic" aria-label="Toggle italic" className="font-bold font-hubot text-md p-8 shadow-sm">
                                Receiving Meal Swipes
                            </ToggleGroupItem>

                        </ToggleGroup>
                        <ToggleGroup type="single" variant="outline" className="w-130">
                            <ToggleGroupItem value="bold" aria-label="Toggle bold" className="font-bold font-hubot text-md p-8 shadow-sm">
                                Pretty Flexible
                            </ToggleGroupItem>
                            <ToggleGroupItem value="italic" aria-label="Toggle italic" className="font-bold font-hubot text-md p-8 shadow-sm">
                                Pretty Consistent
                            </ToggleGroupItem>

                        </ToggleGroup>
                    </div>
                </div>
                <div className="flex flex-col mt-8 gap-y-10 items-center justify-center">
                    <div className="flex flex-row gap-x-2 mt-10">
                        <p > Don't worry, you can always change these preferences later.</p>
                        <Soup />
                    </div>
                    <Button variant="secondary1" className="border text-primary-foreground border-primary-foreground " size="lg" onClick={gotohome}>Start Sharing!</Button>
                </div>
            </div>

        </div>

    )
}
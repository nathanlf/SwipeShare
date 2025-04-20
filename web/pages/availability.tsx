import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/datatable";
import { columns, Timeslot } from ".";
import { useEffect } from "react";

const fifteenMinuteSteps = Array.from({ length: 4 * 4 }, (_, i) => {
  const h = Math.floor(i / 4) + 8;
  const m = (i % 4) * 15;
  // return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
  return `${String(h)}:${String(m).padStart(2, "0")}`;
});
const fifteenMinuteSteps2 = Array.from({ length: 10 * 4 }, (_, i) => {
  const h = Math.floor(i / 4) + 1;
  const m = (i % 4) * 15;
  // return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
  return `${String(h)}:${String(m).padStart(2, "0")}`;
});

const validTimes = new Set(fifteenMinuteSteps);
const validTimespm = new Set(fifteenMinuteSteps2);

type Listitem = {
  value: string;
  label: string;
};

const timeslist: Listitem[] = [];
const timeslist_to: Listitem[] = [];

/*FILLING OUT timeslist for FROM */
for (const item of validTimes) {
  const newitem: Listitem = { value: item + "a", label: item + "a" };
  timeslist.push(newitem);
}
const noonlist: Listitem[] = [];
noonlist.push(
  { value: "12:00p", label: "12:00p" },
  { value: "12:15p", label: "12:15p" },
  { value: "12:30p", label: "12:30p" },
  { value: "12:45p", label: "12:45p" }
);
for (const item of noonlist) {
  timeslist.push(item);
}
for (const item of validTimespm) {
  const newitem: Listitem = { value: item + "p", label: item + "p" };
  timeslist.push(newitem);
}
timeslist.push({ value: "11:00p", label: "11:00p" });

/******/
/*FILLING OUT timeslist_to*/
const fifteenMinuteStepsto = Array.from({ length: 3 * 4 }, (_, i) => {
  const h = Math.floor(i / 4) + 9;
  const m = (i % 4) * 15;
  // return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
  return `${String(h)}:${String(m).padStart(2, "0")}`;
});
const fifteenMinuteStepsto2 = Array.from({ length: 11 * 4 }, (_, i) => {
  const h = Math.floor(i / 4) + 1;
  const m = (i % 4) * 15;
  // return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
  return `${String(h)}:${String(m).padStart(2, "0")}`;
});
const validTimes2 = new Set(fifteenMinuteStepsto);
const validTimespm2 = new Set(fifteenMinuteStepsto2);

timeslist_to.push({ value: "8:30a", label: "8:30a" });
timeslist_to.push({ value: "8:45a", label: "8:45a" });

for (const item of validTimes2) {
  const newitem: Listitem = { value: item + "a", label: item + "a" };
  timeslist_to.push(newitem);
}
const noonlist2: Listitem[] = [];
noonlist2.push(
  { value: "12:00p", label: "12:00p" },
  { value: "12:15p", label: "12:15p" },
  { value: "12:30p", label: "12:30p" },
  { value: "12:45p", label: "12:45p" }
);
for (const item of noonlist2) {
  timeslist_to.push(item);
}
for (const item of validTimespm2) {
  const newitem: Listitem = { value: item + "p", label: item + "p" };
  timeslist_to.push(newitem);
}

//light purple secondary: bg-[#cd5bde41]

export default function TimeInput() {
  const [openFrom, setOpenFrom] = React.useState(false);
  const [openTo, setOpenTo] = React.useState(false);

  const [valueFrom, setValueFrom] = React.useState("");
  const [valueTo, setValueTo] = React.useState("");
  const [buttonClicked, setButtonClicked] = React.useState(false);
  const [timeslots, setTimeslots] = React.useState<Timeslot[]>([]);

  useEffect(() => {
    if (buttonClicked) {
      if (valueFrom != "" && valueTo != "") {
        const str_timefrom = convertTimeToMinutes(valueFrom);
        const str_timeto = convertTimeToMinutes(valueTo);
        if (str_timeto && str_timefrom) {
          if (str_timeto <= str_timefrom) {
            toast("Please enter a valid time range!");
          } else if (
            timeslots.some(
              (slot) => slot.starttime === valueFrom && slot.endtime === valueTo
            )
          ) {
            toast("Timeslot has already been entered.");
          } else {
            setTimeslots((prev: Timeslot[]) => [
              ...prev,
              { starttime: valueFrom, endtime: valueTo },
            ]);
            setValueFrom("");
            setValueTo("");
          }
        }
      }
      setButtonClicked(false);
    }
  }, [buttonClicked, valueFrom, valueTo]);

  function convertTimeToMinutes(timeStr: string): number | null {
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})([ap])$/i);
    if (!match) return null;

    let [_, hourStr, minStr, meridiem] = match;
    let hour = parseInt(hourStr, 10);
    const minutes = parseInt(minStr, 10);
    meridiem = meridiem.toLowerCase();

    if (hour < 1 || hour > 12 || minutes < 0 || minutes >= 60) return null;

    if (meridiem === "p" && hour !== 12) {
      hour += 12;
    } else if (meridiem === "a" && hour === 12) {
      hour = 0;
    }

    return hour * 60 + minutes;
  }

  return (
    <div className="flex flex-col gap-y-10">
      <div className="flex flex-row items-center gap-x-16 mx-20 px-6 my-10 py-4 rounded-md text-center justify-center ">
        <div className="flex flex-row gap-x-4 items-center">
          <p className="text-sm text-muted-foreground">From</p>
          <Popover open={openFrom} onOpenChange={setOpenFrom}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openFrom}
                className={
                  valueFrom
                    ? "w-[200px] justify-between font-semibold hover:bg-accent1-muted bg-[#3bbf9026] border-primary1 border-2 "
                    : "w-[200px] justify-between font-semibold hover:bg-accent1-muted border-primary1 border-2"
                }
              >
                {valueFrom
                  ? timeslist.find((entry) => entry.value === valueFrom)?.label
                  : "Choose a time..."}
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search times..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No timeslots found.</CommandEmpty>
                  <CommandGroup>
                    {timeslist.map((entry) => (
                      <CommandItem
                        key={entry.value}
                        value={entry.value}
                        onSelect={(currentValue) => {
                          setValueFrom(
                            currentValue === valueFrom ? "" : currentValue
                          );
                          setOpenFrom(false);
                        }}
                      >
                        {entry.label}
                        <Check
                          className={cn(
                            "ml-auto",
                            valueFrom === entry.value
                              ? "opacity-100 "
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-row gap-x-4 items-center">
          <p className="text-sm text-muted-foreground">To</p>

          <Popover open={openTo} onOpenChange={setOpenTo}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openTo}
                className={
                  valueTo
                    ? "w-[200px] justify-between font-semibold hover:bg-accent1-muted bg-[#3bbf9026] border-primary1 border-2 "
                    : "w-[200px] justify-between font-semibold hover:bg-accent1-muted border-primary1 border-2"
                }
              >
                {valueTo
                  ? timeslist_to.find((entry) => entry.value === valueTo)?.label
                  : "Choose a time..."}
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search times..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No timeslots found.</CommandEmpty>
                  <CommandGroup>
                    {timeslist_to.map((entry) => (
                      <CommandItem
                        key={entry.value}
                        value={entry.value}
                        onSelect={(currentValue) => {
                          setValueTo(
                            currentValue === valueTo ? "" : currentValue
                          );
                          setOpenTo(false);
                        }}
                      >
                        {entry.label}
                        <Check
                          className={cn(
                            "ml-auto",
                            valueTo === entry.value
                              ? "opacity-100 "
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <Button
            onClick={() => {
              setButtonClicked(true);
            }}
          >
            add
          </Button>
        </div>
      </div>
      <div className="w-full px-40">
        <DataTable columns={columns} data={timeslots} />
      </div>
    </div>
  );
}

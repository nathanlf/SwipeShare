import * as React from "react";
import { Check, ChevronsUpDown, Trash2 } from "lucide-react";

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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/datatable";
import { useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { z } from "zod";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { Profile } from "@/utils/supabase/models/profile";
import { updateAvailability } from "@/utils/supabase/queries/profile";

export type Timeslot = {
  starttime: string;
  endtime: string;
};

export const columns = (
  onDelete: (timeslot: Timeslot) => void
): ColumnDef<Timeslot>[] => [
  {
    accessorKey: "starttime",
    cell: ({ row }) => {
      const { starttime, endtime } = row.original;
      return (
        <div
          className="text-left font-bold rounded-4xl text-sm flex justify-between items-center cursor-pointer p-2 group"
          onClick={() => onDelete(row.original)}
        >
          <span>
            {starttime} - {endtime}
          </span>
          <Trash2 className="h-4 w-4 opacity-0 group-hover:opacity-100 text-red-500" />
        </div>
      );
    },
  },
];

const fifteenMinuteSteps = Array.from({ length: 4 * 4 }, (_, i) => {
  const h = Math.floor(i / 4) + 8;
  const m = (i % 4) * 15;
  return `${String(h)}:${String(m).padStart(2, "0")}`;
});
const fifteenMinuteSteps2 = Array.from({ length: 10 * 4 }, (_, i) => {
  const h = Math.floor(i / 4) + 1;
  const m = (i % 4) * 15;
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
  return `${String(h)}:${String(m).padStart(2, "0")}`;
});
const fifteenMinuteStepsto2 = Array.from({ length: 11 * 4 }, (_, i) => {
  const h = Math.floor(i / 4) + 1;
  const m = (i % 4) * 15;
  return `${String(h)}:${String(m).padStart(2, "0")}`;
});
const validTimes2 = new Set(fifteenMinuteStepsto);
const validTimespm2 = new Set(fifteenMinuteStepsto2);

timeslist_to.push({ value: "8:15a", label: "8:15a" });
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

type TimeInputProps = { profile: z.infer<typeof Profile> };
export default function TimeInput({ profile }: TimeInputProps) {
  const [openFrom, setOpenFrom] = React.useState(false);
  const [openTo, setOpenTo] = React.useState(false);

  const [valueFrom, setValueFrom] = React.useState("");
  const [valueTo, setValueTo] = React.useState("");
  const [buttonClicked, setButtonClicked] = React.useState(false);
  const [timeslots, setTimeslots] = React.useState<Timeslot[]>(
    profile.availability ?? []
  );

  const supabase = createSupabaseComponentClient();

  useEffect(() => {
    if (profile.availability != null) {
      setTimeslots(profile.availability);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!buttonClicked) return;
    setButtonClicked(false);

    if (!valueFrom || !valueTo) return;

    const fromMin = convertTimeToMinutes(valueFrom)!;
    const toMin = convertTimeToMinutes(valueTo)!;

    if (toMin <= fromMin) {
      toast("Please enter a valid time range!");
      return;
    }
    if (
      timeslots.some((s) => s.starttime === valueFrom && s.endtime === valueTo)
    ) {
      toast("Timeslot has already been entered.");
      return;
    }

    setTimeslots((prev) => {
      const raw = [...prev, { starttime: valueFrom, endtime: valueTo }];
      const merged = mergeAndSortSlots(raw);
      updateAvailability(supabase, merged); // <-- up
      return merged;
    });

    setValueFrom("");
    setValueTo("");
    // eslint-disable-next-line
  }, [buttonClicked, timeslots, valueFrom, valueTo]);

  function mergeAndSortSlots(slots: Timeslot[]): Timeslot[] {
    if (slots.length === 0) return [];
    const sorted = [...slots].sort((a, b) => {
      const aStart = convertTimeToMinutes(a.starttime)!;
      const bStart = convertTimeToMinutes(b.starttime)!;
      return aStart - bStart;
    });

    const merged: Timeslot[] = [{ ...sorted[0] }];
    for (const slot of sorted.slice(1)) {
      const last: Timeslot = merged[merged.length - 1];
      const lastEnd: number = convertTimeToMinutes(last.endtime)!;
      const currStart: number = convertTimeToMinutes(slot.starttime)!;
      const currEnd: number = convertTimeToMinutes(slot.endtime)!;

      if (currStart <= lastEnd) {
        if (currEnd > lastEnd) {
          last.endtime = slot.endtime;
        }
      } else {
        merged.push({ ...slot });
      }
    }

    return merged;
  }

  function convertTimeToMinutes(timeStr: string): number | null {
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})([ap])$/i);
    if (!match) return null;

    // eslint-disable-next-line prefer-const, @typescript-eslint/no-unused-vars
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

  const handleDeleteTimeslot = (timeslot: Timeslot) => {
    const newTimeslots = timeslots.filter(
      (slot) =>
        !(
          slot.starttime === timeslot.starttime &&
          slot.endtime === timeslot.endtime
        )
    );
    setTimeslots(newTimeslots);
    updateAvailability(supabase, newTimeslots); // <-- update db immediately
    toast("Timeslot deleted.");
  };

  const tableColumns = columns(handleDeleteTimeslot);

  return (
    <div className="flex flex-col gap-y-10">
      <div className="flex flex-row items-center gap-x-16 mx-20 px-6 mt-10 rounded-md text-center justify-center">
        <div className="flex flex-row gap-x-4 items-center">
          <p className="text-sm text-muted-foreground">From</p>
          <Popover open={openFrom} onOpenChange={setOpenFrom}>
            <PopoverTrigger aria-label="Time From Button" asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openFrom}
                className={
                  valueFrom
                    ? "w-[200px] justify-between font-semibold hover:bg-accent1-muted bg-[#3bbf9026] border-primary1 border-2"
                    : "w-[200px] justify-between font-semibold bg-white hover:bg-accent1-muted border-primary1 border-2 cursor-pointer"
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
                        className="text-black dark:text-white"
                      >
                        {entry.label}
                        <Check
                          className={cn(
                            "ml-auto",
                            valueFrom === entry.value
                              ? "opacity-100"
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
            <PopoverTrigger aria-label="Time To Button" asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openTo}
                className={
                  valueTo
                    ? "w-[200px] justify-between font-semibold hover:bg-accent1-muted bg-[#3bbf9026] border-primary1 border-2 cursor-pointer"
                    : "w-[200px] justify-between font-semibold bg-white hover:bg-accent1-muted border-primary1 border-2 cursor-pointer"
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
                        className="text-black dark:text-white"
                      >
                        {entry.label}
                        <Check
                          className={cn(
                            "ml-auto",
                            valueTo === entry.value
                              ? "opacity-100"
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
            className="bg-secondary1 cursor-pointer dark:text-white font-semibold"
          >
            Add
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-y-8">
        <div className="flex flex-col justify-between">
          <Label className="text-[#484349] dark:text-accent text-2xl font-bold underline justify-center mt-4">
            Your Available Timeslots
          </Label>
          <Label className="text-gray text-muted-foreground text-xs justify-center">
            *Click timeslots to delete.
          </Label>
        </div>

        <div className="w-full px-40">
          <DataTable columns={tableColumns} data={timeslots} />
        </div>
      </div>
    </div>
  );
}

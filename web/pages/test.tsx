// "use client";

// import { useState } from "react";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Popover,
//   PopoverTrigger,
//   PopoverContent,
// } from "@/components/ui/popover";
// import { Button } from "@/components/ui/button";
// import { format } from "date-fns";

// // Generate all valid 15-minute times
// const fifteenMinuteSteps = Array.from({ length: 24 * 4 }, (_, i) => {
//   const h = Math.floor(i / 4);
//   const m = (i % 4) * 15;
//   return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
// });

// const validTimes = new Set(fifteenMinuteSteps);

// const MIN_DATE = new Date(2024, 3, 15); // April 15, 2024
// const MAX_DATE = new Date(2024, 4, 30); // May 30, 2024

// function TimeInput({
//   label,
//   value,
//   onChange,
// }: {
//   label: string;
//   value: string;
//   onChange: (v: string) => void;
// }) {
//   const [input, setInput] = useState(value);
//   const [input2, setInput2] = useState(value);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const val = e.target.value;
//     // Allow only numbers and colon
//     if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val)) {
//       return;
//     }
//     setInput(val);

//     if (validTimes.has(val)) {
//       onChange(val);
//     }
//   };
//   const handleChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const val = e.target.value;
//     // Allow only numbers and colon
//     if (!/^[0-5]*$/.test(val)) return;
//     setInput2(val);

//     if (validTimes.has(val)) {
//       onChange(val);
//     }
//   };

//   return (
//     <div className="flex flex-col gap-1">
//       <label className="text-sm font-medium">{label}</label>
//       <div className="flex flex-row gap-x-0.5">
//         <input
//           type="text"
//           inputMode="numeric"
//           className="border px-2 py-1 rounded w-[90px] text-center"
//           placeholder="HH"
//           value={input}
//           onChange={handleChange}
//           maxLength={5}
//         />
//         :
//         <input
//           type="text"
//           inputMode="numeric"
//           className="border px-2 py-1 rounded w-[90px] text-center"
//           placeholder="MM"
//           value={input2}
//           onChange={handleChange2}
//           maxLength={5}
//         />
//       </div>
//     </div>
//   );
// }

// export default function DateRangeTimePicker() {
//   const [startDate, setStartDate] = useState<Date | undefined>();
//   const [endDate, setEndDate] = useState<Date | undefined>();
//   const [startTime, setStartTime] = useState("");
//   const [endTime, setEndTime] = useState("");

//   return (
//     <div className="space-y-6 max-w-md mx-auto p-4 border rounded-md shadow-md">
//       <h2 className="text-xl font-semibold">Select Date & Time Range</h2>

//       <div className="space-y-3">
//         <h3 className="text-md font-medium">Start</h3>
//         <div className="flex items-center gap-4">
//           <Popover>
//             <PopoverTrigger asChild>
//               <Button variant="outline">
//                 {startDate ? format(startDate, "PPP") : "Pick a start date"}
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-auto p-0">
//               <Calendar
//                 mode="single"
//                 selected={startDate}
//                 onSelect={setStartDate}
//                 fromDate={MIN_DATE}
//                 toDate={MAX_DATE}
//               />
//             </PopoverContent>
//           </Popover>
//           <TimeInput label="Time" value={startTime} onChange={setStartTime} />
//         </div>
//       </div>

//       <div className="space-y-3">
//         <h3 className="text-md font-medium">End</h3>
//         <div className="flex items-center gap-4">
//           <Popover>
//             <PopoverTrigger asChild>
//               <Button variant="outline">
//                 {endDate ? format(endDate, "PPP") : "Pick an end date"}
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-auto p-0">
//               <Calendar
//                 mode="single"
//                 selected={endDate}
//                 onSelect={setEndDate}
//                 fromDate={MIN_DATE}
//                 toDate={MAX_DATE}
//               />
//             </PopoverContent>
//           </Popover>
//         </div>
//       </div>

//       {/* Optional: Show result */}
//       <div className="mt-4 text-sm text-gray-600">
//         <div>
//           <strong>Start:</strong>{" "}
//           {startDate && startTime
//             ? `${format(startDate, "yyyy-MM-dd")} ${startTime}`
//             : "—"}
//         </div>
//         <div>
//           <strong>End:</strong>{" "}
//           {endDate && endTime
//             ? `${format(endDate, "yyyy-MM-dd")} ${endTime}`
//             : "—"}
//         </div>
//       </div>
//     </div>
//   );
// }

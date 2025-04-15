import { Input } from "@/components/ui/input"

export default function SearchBar() {
  return (
    <div className="flex items-center w-full max-w-sm rounded-lg px-3.5 gap-2">
      <Input type="search" placeholder="Search..." className="w-full h-8 font-semibold bg-gray-50 text-black" />
    </div>
  )
}
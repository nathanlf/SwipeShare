import { Input } from "@/components/ui/input";

type SearchBarProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
};

export default function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <div className="flex items-center w-full max-w-sm rounded-lg px-3.5 gap-2">
      <Input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder || "Search..."}
        className="w-full h-8 font-semibold bg-gray-50 text-black"
      />
    </div>
  );
}

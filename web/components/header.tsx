import { Soup } from "lucide-react";
import Link from "next/link";



export default function Header() {
    return (
        <header className="flex px-3 pt-3 h-16 shrink-0 items-center justify-between gap-2">
            {/* Link on the top left. */}
            <Link href="/" className="flex items-center gap-3">
                <Soup className="text-primary1 w-6 h-6" />
                <p className="text-lg font-bold text-primary1">SwipeShare</p>
            </Link>

        </header>
    );

}
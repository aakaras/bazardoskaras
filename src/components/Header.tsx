import Link from "next/link";
import { LogIn, ShoppingBag } from "lucide-react";
import { ShareModal } from "@/components/ShareModal";

export function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Decorative top bar representing transition from Brazil to Poland */}
      <div className="h-2 w-full flex">
        <div className="h-full bg-br-green w-1/6"></div>
        <div className="h-full bg-br-yellow w-1/6"></div>
        <div className="h-full bg-br-blue w-1/6"></div>
        <div className="h-full bg-pl-white w-1/6"></div>
        <div className="h-full bg-pl-red w-2/6"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-slate-100 p-2 rounded-full">
              <ShoppingBag className="w-5 h-5 text-slate-700" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">Bazar dos Karas</span>
          </Link>

          <nav className="flex items-center gap-3 sm:gap-4">
            <ShareModal variant="header" buttonText="Compartilhar" />
          </nav>
        </div>
      </div>
    </header>
  );
}

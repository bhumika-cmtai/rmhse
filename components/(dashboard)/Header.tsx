// header.tsx

"use client";

import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Header({ title, onMenuClick }: { title: string; onMenuClick?: () => void }) {
  return (
    // --- CHANGE IS HERE ---
    <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-8 w-8" />
        </Button>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      </div>
      <Link
        href="/logout"
        className="flex items-center gap-2 rounded-lg px-4 py-2 text-slate-600 transition-colors duration-200 hover:bg-red-100 hover:text-red-600"
      >
        <LogOut className="h-5 w-5" />
        <span className="hidden sm:inline">Logout</span>
      </Link>
    </header>
  );
}
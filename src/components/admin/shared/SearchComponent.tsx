"use client";

import { RiSearchLine } from "react-icons/ri";
import { Input } from "@/components/ui/input";

export function SearchComponent() {
  return (
    <div className="relative w-full max-w-md">
      <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <Input
        type="search"
        placeholder="Buscar..."
        className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-sky-500"
      />
    </div>
  );
}

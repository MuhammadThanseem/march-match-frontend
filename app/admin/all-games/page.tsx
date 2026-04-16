"use client";

import BottomNavAdmin from "@/app/components/BottomNavAdmin";
import { useRouter } from "next/navigation";
import AllGamesComponent from "@/app/components/AllGame";

export default function SuperAdminHomePage() {
  const router = useRouter();

  return (
    <>
      <main className="relative z-10 w-full max-w-[375px] min-h-screen mx-auto flex flex-col bg-[#0A0E17] text-white overflow-hidden font-sans">
        {/* =================== HEADER =================== */}
        {/* Header */}
        <header className="w-full px-5 pt-12 pb-4 flex justify-between items-center sticky top-0 bg-[#0A0E17]/90 backdrop-blur-md border-b border-white/20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="cursor-pointer w-10 h-10 flex items-center justify-center rounded-full bg-[#1F2937] border border-white/20 hover:bg-gray-800"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <h1 className="text-xl font-bold text-brand-text font-display">
              All Games
            </h1>
          </div>
        </header>
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-4 w-full">
          <AllGamesComponent />
        </div>
      </main>
      <BottomNavAdmin />
    </>
  );
}

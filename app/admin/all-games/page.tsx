"use client";

import BottomNavAdmin from "@/app/components/BottomNavAdmin";
import { useRouter } from "next/navigation";
import AllGamesComponent from "@/app/components/AllGame";

export default function SuperAdminHomePage() {
  const router = useRouter();

  return (
    <>
      <main className="h-screen w-full max-w-md mx-auto flex flex-col bg-[#0A0E17] text-white font-sans overflow-hidden">
        {/* =================== HEADER =================== */}
        <header className="px-5 pt-12 pb-4 flex justify-between items-center bg-[#0A0E17]/90 backdrop-blur-md border-b border-white/20 flex-shrink-0">
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

        {/* ✅ ONLY THIS SCROLLS */}
        <div className="flex-1 overflow-y-auto pb-24">
          <AllGamesComponent />
        </div>
      </main>
      <BottomNavAdmin />
    </>
  );
}

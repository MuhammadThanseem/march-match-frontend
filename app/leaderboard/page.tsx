"use client";

import { useRouter } from "next/navigation";
import { FaChevronLeft } from "react-icons/fa";
import BottomNav from "../components/BottomNav";

export default function LeaderboardPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen w-full flex justify-center items-center  text-white overflow-x-hidden">
      {/* MOBILE WRAPPER */}
      <main className="relative bg-[#0A0E17] w-full max-w-md mx-auto min-h-screen mx-auto flex flex-col  z-10">
        <header className="w-full px-5 pt-12 pb-4 flex justify-between items-center sticky top-0 bg-[#0A0E17]/90 backdrop-blur-md border-b border-[#1F2937]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="cursor-pointer w-10 h-10 flex items-center justify-center rounded-full bg-[#111827] hover:bg-gray-800 border border-[#1F2937]"
            >
              <FaChevronLeft />
            </button>
            <h1 className="text-xl font-bold tracking-wide font-teko">
              Leaderboard
            </h1>
          </div>
        </header>
        <div className="text-center justify-center items-center flex flex-col mt-20 px-6">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Coming Soon</h1>
          <p className="text-xl text-gray-600 mb-8">
            Our leaderboard is under construction. Stay tuned!
          </p>
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-indigo-500 rounded-full mx-auto mb-6"></div>
          </div>
          <p className="text-gray-500">
            We're working hard to bring you an amazing leaderboard experience.
          </p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  const isActive = (route: string) => pathname === route;

  return (
    <nav
      className="
        fixed bottom-0 left-1/2 -translate-x-1/2
        w-full max-w-md mx-auto
        z-50 bg-[#0A0E17]/95 backdrop-blur-xl 
        border-t border-gray-700 py-2
      "
    >
      <div className="flex justify-between items-center px-4">
        
        {/* Home */}
        <Link href="/home" className="flex flex-col items-center gap-1">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition
              ${isActive("/home") ? "bg-[#00F0FF]/10" : "hover:bg-[#1F2937]"}
            `}
          >
            <i
              className={`fa-solid fa-house text-lg
                ${isActive("/home") ? "text-[#00F0FF]" : "text-gray-500"}
              `}
            ></i>
          </div>
          <span
            className={`text-[10px]
              ${isActive("/home") ? "text-[#00F0FF]" : "text-gray-500"}
            `}
          >
            Home
          </span>
        </Link>

        {/* History */}
        <Link href="/history" className="flex flex-col items-center gap-1">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition
              ${isActive("/history") ? "bg-[#00F0FF]/10" : "hover:bg-[#1F2937]"}
            `}
          >
            <i
              className={`fa-solid fa-chart-line text-lg
                ${isActive("/history") ? "text-[#00F0FF]" : "text-gray-500"}
              `}
            ></i>
          </div>
          <span
            className={`text-[10px]
              ${isActive("/history") ? "text-[#00F0FF]" : "text-gray-500"}
            `}
          >
            History
          </span>
        </Link>

        {/* Center Button (Join Game) */}
        <div className="relative -top-5">
          <Link
            href="/home"
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#FF5C00] to-yellow-400 
               flex items-center justify-center shadow-lg border-4 border-[#0A0E17] 
               hover:scale-105 active:scale-95 transition"
          >
            <i className="fa-solid fa-basketball text-white text-2xl"></i>
          </Link>
        </div>

        {/* Wallet */}
        <Link href="/wallet" className="flex flex-col items-center gap-1">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition
              ${isActive("/wallet") ? "bg-[#00F0FF]/10" : "hover:bg-[#1F2937]"}
            `}
          >
            <i
              className={`fa-solid fa-wallet text-lg
                ${isActive("/wallet") ? "text-[#00F0FF]" : "text-gray-500"}
              `}
            ></i>
          </div>
          <span
            className={`text-[10px]
              ${isActive("/wallet") ? "text-[#00F0FF]" : "text-gray-500"}
            `}
          >
            Wallet
          </span>
        </Link>

        {/* Profile */}
        <Link href="/profile" className="flex flex-col items-center gap-1">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition
              ${isActive("/profile") ? "bg-[#00F0FF]/10" : "hover:bg-[#1F2937]"}
            `}
          >
            <i
              className={`fa-solid fa-user text-lg
                ${isActive("/profile") ? "text-[#00F0FF]" : "text-gray-500"}
              `}
            ></i>
          </div>
          <span
            className={`text-[10px]
              ${isActive("/profile") ? "text-[#00F0FF]" : "text-gray-500"}
            `}
          >
            Profile
          </span>
        </Link>
      </div>
    </nav>
  );
}
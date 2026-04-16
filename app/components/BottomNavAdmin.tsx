"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNavAdmin() {
  const pathname = usePathname();
  const isActive = (route: string) => pathname === route;

  return (
    <nav
      className="
        fixed bottom-0 left-1/2 -translate-x-1/2
        w-full max-w-[375px]
        z-50 bg-[#0A0E17]/95 backdrop-blur-xl 
        border-t border-gray-700 py-2
      "
    >
      <div className="flex justify-between items-center px-4">
        
        {/* Home */}
        <Link href="/admin/dashboard" className="flex flex-col items-center gap-1">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition
              ${isActive("/admin/dashboard") ? "bg-[#00F0FF]/10" : "hover:bg-[#1F2937]"}
            `}
          >
            <i
              className={`fa-solid fa-house text-lg
                ${isActive("/admin/dashboard") ? "text-[#00F0FF]" : "text-gray-500"}
              `}
            ></i>
          </div>
          <span
            className={`text-[10px]
              ${isActive("/admin/dashboard") ? "text-[#00F0FF]" : "text-gray-500"}
            `}
          >
            Home
          </span>
        </Link>

        {/* Center Button (Join Game) */}
        <div className="relative -top-5">
          <Link
            href="/admin/add-game"
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#FF5C00] to-yellow-400 
               flex items-center justify-center shadow-lg border-4 border-[#0A0E17] 
               hover:scale-105 active:scale-95 transition"
          >
            <i className="fa-solid fa-basketball text-white text-2xl"></i>
          </Link>
        </div>


        {/* Profile */}
        <Link href="/admin/profile" className="flex flex-col items-center gap-1">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition
              ${isActive("/admin/profile") ? "bg-[#00F0FF]/10" : "hover:bg-[#1F2937]"}
            `}
          >
            <i
              className={`fa-solid fa-user text-lg
                ${isActive("/admin/profile") ? "text-[#00F0FF]" : "text-gray-500"}
              `}
            ></i>
          </div>
          <span
            className={`text-[10px]
              ${isActive("/admin/profile") ? "text-[#00F0FF]" : "text-gray-500"}
            `}
          >
            Profile
          </span>
        </Link>
      </div>
    </nav>
  );
}
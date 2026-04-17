"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center font-sans antialiased relative text-white overflow-x-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E17] via-[#111827] to-[#0A0E17]" />

        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FF5C00]/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#00F0FF]/10 rounded-full blur-[80px]" />

        {/* SVG Pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="seams"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 50 Q 50 0 100 50 T 200 50"
                fill="none"
                stroke="#FF5C00"
                strokeWidth="2"
                opacity="0.5"
              />
              <path
                d="M50 0 Q 100 50 50 100 T 50 200"
                fill="none"
                stroke="#FF5C00"
                strokeWidth="2"
                opacity="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#seams)" />
        </svg>
      </div>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-md mx-auto min-h-[840px] mx-auto flex flex-col px-6 py-12 justify-between">
        {/* Logo + Title */}
        <section className="flex flex-col items-center mt-8 animate-pulse">
          <div className="relative w-32 h-32 mb-6">
            <div className="absolute inset-0 bg-[#FF5C00]/20 rounded-full blur-xl"></div>
            <img
              className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
              src="https://storage.googleapis.com/uxpilot-auth.appspot.com/7ce66a9c1f-3afe42961fe45da8e19d.png"
              alt="logo"
            />
          </div>

          <h1 className="font-extrabold text-6xl text-center tracking-wider uppercase">
            March <span className="text-[#FF5C00]">Madness</span>
            <span className="block text-5xl text-[#00F0FF] mt-[-10px]">
              110
            </span>
          </h1>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111827]/80 border border-[#FF5C00]/30 mt-4">
            <i className="fa-solid fa-bolt text-[#FF5C00] text-sm" />
            <p className="text-sm font-medium text-gray-300 uppercase">
              Action Every 4 Minutes
            </p>
          </div>
        </section>

        {/* Info Sections */}
        <section className="flex flex-col gap-4 mt-12">
          <div className="rounded-2xl p-5 bg-white/5 backdrop-blur-xl border border-white/10 relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#00F0FF]" />
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <i className="fa-solid fa-gamepad text-[#00F0FF]" /> Fast-Paced
              Pools
            </h3>
            <p className="text-sm text-gray-400">
              Winning number = (combined score) mod 10. Win at 10 checkpoints
              per game!
            </p>
          </div>

          <div className="rounded-2xl p-5 bg-white/5 backdrop-blur-xl border border-white/10 relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#00FF66]" />
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <i className="fa-solid fa-sack-dollar text-[#00FF66]" /> Big
              Payouts
            </h3>
            <p className="text-sm text-gray-400">
              $110 Total Pot. $11 entry. Cash out at timeouts, halftime, final
              score.
            </p>
          </div>
        </section>

        {/* Buttons */}
        <section className="mt-auto pt-12 flex flex-col items-center w-full gap-6">
          <div className="flex gap-2 mb-2">
            <div className="w-8 h-1.5 rounded-full bg-[#00F0FF]" />
            <div className="w-2 h-1.5 rounded-full bg-gray-600" />
            <div className="w-2 h-1.5 rounded-full bg-gray-600" />
          </div>

          <button
            onClick={() => router.push("/signin")}
            className="w-full cursor-pointer py-4 rounded-xl bg-[#00F0FF] text-black font-bold text-lg uppercase tracking-wider hover:bg-white transition duration-300 shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center justify-center gap-2"
          >
            Get Started <i className="fa-solid fa-arrow-right" />
          </button>

          <button className="text-sm text-gray-400 hover:text-white">
            Already have an account?{" "}
            <span
              onClick={() => router.push("/login")}
              className="text-[#FF5C00] cursor-pointer "
            >
              Log In
            </span>
          </button>
        </section>
      </main>
    </div>
  );
}

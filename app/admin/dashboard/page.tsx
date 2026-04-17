"use client";

import { useEffect, useState } from "react";
import BottomNavAdmin from "@/app/components/BottomNavAdmin";
import Image from "next/image";
import httpService from "@/app/utils/httpService";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

import { Navigation } from "swiper/modules";

export default function SuperAdminHomePage() {
  const [games, setGames] = useState([]);
  const [upcomingGames, setUpcomingGames] = useState([]);
  const [liveGames, setLiveGames] = useState([]);
  const [payouts, setPayouts] = useState<any[]>([]);

  useEffect(() => {
    let interval: any;
    let timeoutIds: any[] = [];
    let isFetching = false;
    loadGames();

    const fetchLiveGames = async () => {
      if (isFetching) return;
      isFetching = true;

      await loadLiveGames();
      await loadUpcomingGames();

      isFetching = false;
    };

    const setupStartTimers = (games: any[]) => {
      // clear old timers
      timeoutIds.forEach(clearTimeout);
      timeoutIds = [];

      const now = Date.now();

      games.forEach((game) => {
        const startTime = new Date(game.startTime).getTime();
        const delay = startTime - now;

        if (delay > 0) {
          const id = setTimeout(async () => {
            console.log("🚀 Game started → refreshing");

            await fetchLiveGames();

            // start interval AFTER first game starts
            if (!interval) {
              interval = setInterval(fetchLiveGames, 4 * 60 * 1000);
            }
          }, delay);

          timeoutIds.push(id);
        }
      });
    };

    const init = async () => {
      const res: any = await httpService.get("/games/upcoming");
      const games = res.data.games;

      setUpcomingGames(games);

      setupStartTimers(games);
      await loadLiveGames();
      loadRecentPayouts();
    };

    init();

    return () => {
      if (interval) clearInterval(interval);
      timeoutIds.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (!liveGames?.length) return;

    const timers: any[] = [];

    liveGames.forEach((game: any) => {
      if (game?.nextCheckpoint?.startTime) {
        const delay = getDelay(game.nextCheckpoint.startTime);

        const timer = setTimeout(() => {
          console.log("Refreshing game:", game._id);
          loadLiveGames(); // 🔥 refresh when checkpoint starts
        }, delay);

        timers.push(timer);
      }
    });

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [liveGames]);

  const loadGames = async () => {
    try {
      const response: any = await httpService.get("/games/all");

      setGames(response.data.games.slice(0, 5));
    } catch (err) {
      console.log("Wallet fetch error:", err);
    }
  };

  const loadUpcomingGames = async () => {
    try {
      const response: any = await httpService.get("/games/upcoming");
      setUpcomingGames(response.data.games);
    } catch (err) {
      console.log("Wallet fetch error:", err);
    }
  };

  const loadLiveGames = async () => {
    try {
      const response: any = await httpService.get("/games/live");

      setLiveGames(response.data.games);
    } catch (err) {
      console.log("Wallet fetch error:", err);
    }
  };

  const loadRecentPayouts = async () => {
    try {
      const res: any = await httpService.get("/wallet/recent-payouts");

      setPayouts(res.data.data);
    } catch (err) {
      console.log("Wallet fetch error:", err);
    }
  };

  const getTeamCode = (name: string) => {
    if (!name) return "";

    const words = name.trim().split(" ");

    if (words.length === 1) {
      return words[0].substring(0, 3).toUpperCase();
    }

    return words
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 3);
  };

  const getDelay = (startTime: string) => {
    const now = new Date().getTime();
    const target = new Date(startTime).getTime();
    return Math.max(target - now, 0);
  };

  return (
    <>
      <main className="relative z-10 w-full max-w-md mx-auto min-h-screen mx-auto flex flex-col bg-[#0A0E17] text-white overflow-hidden font-sans">
        {/* =================== HEADER =================== */}
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 max-w-md mx-auto px-5 pt-12 pb-4 flex justify-between items-center bg-[#0A0E17]/90 backdrop-blur-md border-b border-white/5 z-50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Image
                src="/images/profile.jpg"
                width={40}
                height={40}
                className="rounded-full border-2 border-[#00F0FF] object-cover"
                alt="Profile"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00FF66] rounded-full border-2 border-[#0A0E17]"></div>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Welcome back,</p>
              <h2 className="text-sm font-bold">Super Admin</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-full bg-white/5 flex items-center gap-2 backdrop-blur-md">
              <i className="fa-solid fa-wallet text-[#00FF66] text-xs"></i>
              <span className="text-sm font-bold">$0.00</span>
            </div>
            <button className="relative w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition">
              <i className="fa-regular fa-bell"></i>
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#FF5C00] rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Live Game Card */}
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-20 w-full mt-32">
          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={16}
            slidesPerView={1.1}
            centeredSlides={true}
            className="px-4"
          >
            {liveGames.map((game: any) => (
              <SwiperSlide key={game._id}>
                <div className="cursor-pointer rounded-3xl p-5 bg-gradient-to-br from-[#1F2937]/80 to-[#111827]/90 border border-gray-700">
                  <div className="flex justify-between items-center mb-6">
                    <TeamBadge
                      code={game.teamAName?.slice(0, 3).toUpperCase()}
                      name={game.teamAName}
                    />

                    <ScoreCard
                      scoreA={game.teamAScore}
                      scoreB={game.teamBScore}
                    />

                    <TeamBadge
                      code={game.teamBName?.slice(0, 3).toUpperCase()}
                      name={game.teamBName}
                    />
                  </div>

                  <CheckpointCard
                    checkpoint={game.currentCheckpoint}
                    nextCheckpoint={game.nextCheckpoint}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Recent Payouts */}
          <RecentPayouts payouts={payouts} />

          {/* Upcoming Games */}
          <UpcomingGames />

          {/* All Games */}
          <AllGames />
        </div>
      </main>
      <BottomNavAdmin />
    </>
  );
  /* ----------------------------- Components ----------------------------- */

  function TeamBadge({ code, name }: { code: string; name: string }) {
    return (
      <div className="flex flex-col items-center w-[80px] flex-shrink-0">
        {/* Circle */}
        <div className="w-12 h-12 rounded-full bg-[#111827] border border-gray-600 flex items-center justify-center mb-2">
          <span className="font-display text-lg font-bold">{code}</span>
        </div>

        {/* Name */}
        <span className="text-xs text-gray-400 text-center leading-tight truncate w-full">
          {name}
        </span>
      </div>
    );
  }

  type ScoreCardProps = {
    scoreA: number;
    scoreB: number;
    quarter?: string; // e.g. "Q2"
    time?: string; // e.g. "04:15"
  };

  function ScoreCard({
    scoreA,
    scoreB,
    quarter = "LIVE",
    time = "",
  }: ScoreCardProps) {
    const total = scoreA + scoreB;

    return (
      <div className="flex flex-col items-center px-4">
        {/* Time / Quarter */}
        <span className="text-xs font-bold text-gray-500 mb-1">
          {quarter} {time && `• ${time}`}
        </span>

        {/* Score */}
        <div className="flex items-end gap-3">
          <span className="text-4xl font-bold">{scoreA}</span>
          <span className="text-gray-500 mb-1">-</span>
          <span className="text-4xl font-bold">{scoreB}</span>
        </div>

        {/* Total */}
        <div className="mt-2 bg-[#111827] px-3 py-1 rounded-full border border-gray-700">
          <span className="text-xs text-gray-300">
            Combined: <span className="text-[#00F0FF] font-bold">{total}</span>
          </span>
        </div>
      </div>
    );
  }

  type Checkpoint = {
    type: string; // "timeout" | "halftime" | "final"
    sequence: number; // 1–10
    rewardAmount: number;
    timeRemaining?: string; // "03:12"
    progress?: number; // 0–100
  };

  function CheckpointCard({
    checkpoint,
    nextCheckpoint,
  }: {
    checkpoint: any | null;
    nextCheckpoint: any | null;
  }) {
    const [remaining, setRemaining] = useState(0);
    const [progress, setProgress] = useState(0);

    if (!checkpoint || !nextCheckpoint) return null;

    const { type, sequence, rewardAmount, startTime, endTime } = checkpoint;
    const { type: nextType } = nextCheckpoint;

    const labelMap: any = {
      timeout: `Media Timeout ${sequence}`,
      halftime: "Halftime",
      final: "Final",
    };

    useEffect(() => {
      if (!startTime || !endTime) return;

      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();
      const total = end - start;

      const update = () => {
        const now = Date.now();

        const remainingMs = Math.max(0, end - now);
        const elapsed = Math.min(total, now - start);

        // seconds
        setRemaining(Math.floor(remainingMs / 1000));

        // percentage
        const percent = Math.max(0, Math.min(100, (remainingMs / total) * 100));
        setProgress(percent);
      };

      update();

      const interval = setInterval(update, 1000);
      return () => clearInterval(interval);
    }, [startTime, endTime]);

    // format mm:ss
    const formatTime = (sec: number) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    return (
      <div className="bg-[#0A0E17]/60 rounded-2xl p-4 border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400 uppercase">
            Next Checkpoint
          </span>

          <span className="text-xs font-bold text-[#00FF66]">
            {labelMap[nextType] || nextType}
          </span>
        </div>

        {/* Content */}
        <div className="flex justify-between">
          <div>
            <p className="text-[10px] text-gray-500">Time Remaining</p>
            <p className="text-3xl font-bold text-[#FF5C00]">
              {formatTime(remaining)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-gray-500">Payout Amount</p>
            <p className="text-2xl font-bold">${rewardAmount.toFixed(2)}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="w-full h-1.5 bg-gray-800 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FF5C00] to-yellow-400 transition-all duration-1000 linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  function RecentPayouts({ payouts }: any) {
    return (
      <section className="w-full py-4 mt-2 border-y border-gray-800 bg-[#0A0E17]/50">
        <div className="px-5 mb-2 flex items-center">
          <i className="fa-solid fa-bolt text-yellow-400 text-xs mr-2"></i>
          <h4 className="text-xs font-bold text-gray-400 uppercase">
            Recent Payouts
          </h4>
        </div>

        <div className="relative w-full h-10 overflow-hidden flex items-center">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0A0E17] to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0A0E17] to-transparent z-10"></div>

          {payouts.length === 0 ? (
            <div className="px-5 text-xs text-gray-400">No recent payouts</div>
          ) : (
            <div className="flex whitespace-nowrap animate-scroll-left gap-4 px-4">
              {payouts.map((tx: any, i: number) => (
                <div
                  key={tx.id || i}
                  className="flex items-center gap-2 bg-[#1F2937] px-3 py-1.5 rounded-full border border-gray-700"
                >
                  <span className="text-xs font-bold text-gray-300">
                    {tx.label}
                  </span>

                  <span className="w-1 h-1 bg-gray-600 rounded-full"></span>

                  <span className="text-xs font-bold text-blue-400">
                    #{tx.winningNumber} wins
                  </span>

                  <span className="w-1 h-1 bg-gray-600 rounded-full"></span>

                  <span className="text-xs font-bold text-[#00FF66]">
                    ${tx.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  function UpcomingGames() {
    return (
      <section className="px-5 py-4">
        <div className="flex justify-between mb-4">
          <h3 className="text-sm font-bold">Upcoming Games</h3>
        </div>

        <div className="flex flex-col gap-3">
          {upcomingGames?.length > 0 ? (
            upcomingGames.map((game: any) => (
              <GameCard
                key={game._id}
                team1={game.teamAName}
                short1={getTeamCode(game.teamAName)}
                team2={game.teamBName}
                short2={getTeamCode(game.teamBName)}
                time={game.startTime}
                status={game.status.toUpperCase()}
              />
            ))
          ) : (
            <p className="text-xs text-gray-500">No upcoming games</p>
          )}
        </div>
      </section>
    );
  }

  function AllGames() {
    return (
      <section className="px-5 py-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold">All Games</h3>

          <Link
            href="/admin/all-games"
            className="text-xs font-medium text-blue-400 cursor-pointer"
          >
            View All
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {games?.length > 0 ? (
            games.map((game: any) => (
              <GameCard
                key={game._id}
                team1={game.teamAName}
                short1={getTeamCode(game.teamAName)}
                team2={game.teamBName}
                short2={getTeamCode(game.teamBName)}
                time={game.startTime}
                status={game.status.toUpperCase()}
              />
            ))
          ) : (
            <p className="text-xs text-gray-500">No games found</p>
          )}
        </div>
      </section>
    );
  }

  function GameCard({ team1, short1, team2, short2, time, status }: any) {
    // 🎨 Status styles
    const statusStyles: any = {
      UPCOMING: "bg-yellow-500/10 text-yellow-400 border border-yellow-400/30",
      LIVE: "bg-[#FF5C00]/10 text-[#FF5C00] border border-[#FF5C00]/30 animate-pulse",
      COMPLETED: "bg-green-500/10 text-green-400 border border-green-400/30",
    };

    return (
      <div className="rounded-2xl p-3 flex justify-between bg-white/5 hover:bg-[#1F2937]/60 transition border border-transparent hover:border-gray-600">
        {/* Teams */}
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#1F2937] flex items-center justify-center rounded-full text-[10px] font-bold">
              {short1}
            </div>
            <span className="text-sm font-semibold">{team1}</span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <div className="w-6 h-6 bg-[#1F2937] flex items-center justify-center rounded-full text-[10px] font-bold">
              {short2}
            </div>
            <span className="text-sm text-gray-400">{team2}</span>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex flex-col items-end gap-2">
          <span className="text-xs text-gray-400">
            {new Date(time).toLocaleString()}
          </span>

          <button
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
              statusStyles[status] ||
              "bg-gray-700 text-gray-300 border border-gray-600"
            }`}
          >
            {status.toUpperCase()}
          </button>
        </div>
      </div>
    );
  }
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import BottomNav from "../components/BottomNav";
import httpService from "../utils/httpService";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

import { Navigation } from "swiper/modules";

export default function DashboardPage() {
  const [upcomingGames, setUpcomingGames] = useState([]);
  const [liveGames, setLiveGames] = useState([]);
  const [wallet, setWallet] = useState({
    balance: 0,
    playable: 0,
    pending: 0,
  });
  const [payouts, setPayouts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (!user) {
      router.push("/login");
      return;
    }

    const parsed = JSON.parse(user);
    setUser(parsed || null);

    let interval: any;
    let timeoutIds: any[] = [];
    let isFetching = false;

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
              interval = setInterval(fetchLiveGames, 2 * 60 * 1000);
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
      loadWallet();
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

  // ✅ Fetch wallet
  const loadWallet = async () => {
    try {
      const res: any = await httpService.get("/wallet/me");

      setWallet(res.data.data);
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

  const loadUpcomingGames = async () => {
    try {
      const response: any = await httpService.get("/games/upcoming");
      setUpcomingGames(response.data.games);
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

  const loadLiveGames = async () => {
    try {
      const response: any = await httpService.get("/games/live");

      setLiveGames(response.data.games);
    } catch (err) {
      console.log("Wallet fetch error:", err);
    }
  };

  const getDelay = (startTime: string) => {
    const now = new Date().getTime();
    const target = new Date(startTime).getTime();
    return Math.max(target - now, 0);
  };

  return (
    <>
      <main className="relative z-10 w-full max-w-[375px] min-h-screen mx-auto flex flex-col bg-[#0A0E17] text-white overflow-hidden font-sans">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 max-w-[375px] mx-auto px-5 pt-12 pb-4 flex justify-between items-center bg-[#0A0E17]/90 backdrop-blur-md border-b border-white/5 z-50">
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
              <h2 className="text-sm font-bold">{user?.name || "Guest"}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-full bg-white/5 flex items-center gap-2 backdrop-blur-md">
              <i className="fa-solid fa-wallet text-[#00FF66] text-xs"></i>
              <span className="text-sm font-bold">
                ${wallet.balance.toFixed(2)}
              </span>
            </div>
            <button className="relative w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition">
              <i className="fa-regular fa-bell"></i>
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#FF5C00] rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-10 w-full mt-32">
          {/* Live Game Card */}
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
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/join-game/${game._id}`);
                  }}
                  className="cursor-pointer rounded-3xl p-5 bg-gradient-to-br from-[#1F2937]/80 to-[#111827]/90 border border-gray-700"
                >
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

          {/* Number Badge */}
          {liveGames.length !== 0 ? (
            <section className="px-5 py-2 flex justify-center">
              <div className="w-full max-w-[280px] rounded-3xl bg-white/5 p-1 border border-gray-600/50 relative">
                <div className="rounded-[22px] p-4 bg-[#1F2937] border border-gray-700 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 uppercase tracking-wider">
                      Your Number
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-300">
                        Winning logic:
                      </span>
                      <span className="text-xs bg-[#0A0E17] px-2 py-0.5 rounded border border-gray-700 text-[#00F0FF] font-bold">
                        Combined Mod 10
                      </span>
                    </div>
                  </div>

                  <div className="w-16 h-16 rounded-xl bg-[#1F2937] border-2 border-gray-600 flex items-center justify-center relative">
                    <span className="text-5xl font-bold text-[#00F0FF]">0</span>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {/* Recent Payouts */}
          <RecentPayouts payouts={payouts} />

          {/* Upcoming Games */}
          <UpcomingGames
            upcomingGames={upcomingGames}
            getTeamCode={getTeamCode}
          />

          {/* Quick Actions */}
          <QuickActions />
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </>
  );
}

/* ----------------------------- Components ----------------------------- */

function TeamBadge({ code, name }: { code: string; name: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 rounded-full bg-[#111827] border border-gray-600 flex items-center justify-center mb-2">
        <span className="font-display text-xl font-bold">{code}</span>
      </div>
      <span className="text-xs text-gray-400">{name}</span>
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
  endTime: string; // ISO string
  starTime: string; // ISO string
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
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
        <span className="text-xs text-gray-400 uppercase">Next Checkpoint</span>

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

function UpcomingGames({ upcomingGames, getTeamCode }: any) {
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
              id={game._id}
              team1={game.teamAName}
              short1={getTeamCode(game.teamAName)}
              team2={game.teamBName}
              short2={getTeamCode(game.teamBName)}
              time={new Date(game.startTime).toLocaleString()}
              amount={game.entryFee}
              entryFee={game.entryFee}
            />
          ))
        ) : (
          <p className="text-xs text-gray-500">No upcoming games</p>
        )}
      </div>
    </section>
  );
}

function GameCard({ id, team1, short1, team2, short2, time, entryFee }: any) {
  return (
    <div className="rounded-2xl p-3 flex justify-between bg-white/5 hover:bg-[#1F2937]/60 transition border border-transparent hover:border-gray-600">
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

      <div className="flex flex-col items-end gap-2">
        <span className="text-xs text-gray-400">{time}</span>

        <Link
          href={`/join-game/${id}`}
          className="bg-[#1F2937] hover:bg-[#00F0FF] hover:text-black px-4 py-1.5 text-xs font-bold rounded-lg transition"
        >
          Join ${entryFee}
        </Link>
      </div>
    </div>
  );
}

function QuickActions() {
  const items = [
    { icon: "fa-plus", label: "Join Game", color: "blue", link: "/join-game" },
    {
      icon: "fa-money-bill-transfer",
      label: "Deposit",
      color: "green",
      link: "/wallet",
    },
    {
      icon: "fa-clock-rotate-left",
      label: "History",
      color: "purple",
      link: "/history",
    },
    {
      icon: "fa-trophy",
      label: "Leaderboard",
      color: "orange",
      link: "/leaderboard",
    },
  ];

  const colorMap: any = {
    blue: "00F0FF",
    green: "00FF66",
    purple: "B026FF",
    orange: "FF5C00",
  };

  return (
    <section className="px-5 py-4 mb-8">
      <h3 className="text-sm font-bold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {items.map((a, i) => (
          <Link
            href={a.link}
            key={i}
            className="rounded-2xl p-4 bg-white/5 border border-gray-700 hover:bg-[#1F2937] flex flex-col items-center gap-2 cursor-pointer transition"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `#${colorMap[a.color]}20` }}
            >
              <i
                className={`fa-solid ${a.icon}`}
                style={{ color: `#${colorMap[a.color]}` }}
              ></i>
            </div>
            <span className="text-sm">{a.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

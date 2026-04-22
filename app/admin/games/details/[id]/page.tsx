"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BottomNav from "@/app/components/BottomNav";
import httpService from "@/app/utils/httpService";

export default function JoinGame() {
  const { id } = useParams();
  const router = useRouter();

  const [game, setGame] = useState<any>(null);
  const [wallet, setWallet] = useState({
    balance: 0,
    playable: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any>([]);
  const [timeLeft, setTimeLeft] = useState<{
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    if (id) {
      loadGameDetails(id as string);
      loadWallet();
      loadJoinedUsers(id as string);
    }
  }, [id]);

  useEffect(() => {
    if (!game?.startTime) return;

    const updateTimer = () => {
      setTimeLeft(getTimeRemaining(game.startTime));
    };

    updateTimer(); // run immediately

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [game?.startTime]);

  // ✅ Fetch game by ID
  const loadGameDetails = async (gameId: string) => {
    try {
      const res: any = await httpService.get(`/games/${gameId}`);
      setGame(res.data.game);
    } catch (err) {
      console.log("Game fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadJoinedUsers = async (gameId: string) => {
    try {
      const res: any = await httpService.get(`/entries/${gameId}/joined-users`);
      setUsers(res.data.data);
    } catch (err) {
      console.log("Game fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch wallet
  const loadWallet = async () => {
    try {
      const res: any = await httpService.get("/wallet/me");

      setWallet(res.data.data);
    } catch (err) {
      console.log("Wallet fetch error:", err);
    }
  };

  // ✅ Format time
  function getTimeRemaining(startTime: string | Date) {
    const total = new Date(startTime).getTime() - new Date().getTime();

    const minutes = Math.floor(total / 1000 / 60);

    // ❌ if started OR more than 20 mins → no countdown
    if (total <= 0 || minutes > 19) return null;

    const seconds = Math.floor((total / 1000) % 60);

    return { minutes, seconds };
  }

  // ✅ Format time
  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ Loading state
  if (loading || !game) {
    return (
      <div className="h-screen flex items-center justify-center text-white bg-[#0A0E17]">
        Loading game...
      </div>
    );
  }

  return (
    <>
      <main className="relative w-full max-w-md mx-auto h-screen mx-auto flex flex-col bg-[#0A0E17] text-white">
        {/* Header */}
        <header className="w-full px-5 pt-12 pb-4 flex justify-between items-center sticky top-0 bg-[#0A0E17]/90 backdrop-blur-md border-b border-[#1F2937]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="cursor-pointer w-10 h-10 flex items-center justify-center rounded-full bg-[#111827] border border-[#1F2937]"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <h1 className="text-xl font-bold tracking-wide">{game.title}</h1>
          </div>

          <div className="bg-[#111827] border border-[#1F2937] px-3 py-2 rounded-full flex items-center gap-2">
            <i className="fa-solid fa-wallet text-green-400 text-sm"></i>
            <span className="text-sm font-bold">${wallet.balance}</span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-44 px-4 space-y-5 mt-4">
          {/* Game Match */}
          <section className="p-5 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
              <span
                className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border ${
                  game.status === "completed"
                    ? "bg-green-900/30 border-green-700 text-green-400"
                    : timeLeft
                      ? "bg-gray-800 border-gray-700 text-white"
                      : game.status === "live"
                        ? "bg-orange-900/30 border-orange-700 text-orange-400"
                        : "bg-gray-800 border-gray-700 text-white"
                }`}
              >
                {game.status === "completed" ? (
                  "Completed"
                ) : timeLeft ? (
                  `Tip-off in ${timeLeft.minutes}m ${timeLeft.seconds}s`
                ) : game.status === "live" ? (
                  <>
                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                    Live
                  </>
                ) : (
                  `Tip-off: ${formatTime(game.startTime)}`
                )}
              </span>
              <span className="text-xs">{game.league}</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-blue-900 flex justify-center items-center">
                  <span className="text-xl font-bold">
                    {game.teamAName?.slice(0, 3).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm mt-2">{game.teamAName}</span>
              </div>

              <span className="text-xl text-gray-400">VS</span>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-blue-400 flex justify-center items-center">
                  <span className="text-xl font-bold">
                    {game.teamBName?.slice(0, 3).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm mt-2">{game.teamBName}</span>
              </div>
            </div>
          </section>

          {/* Entry & Pot */}
          <section className="grid grid-cols-2 gap-4">
            <div className="p-5 text-center bg-[#111827] rounded-xl">
              <p className="text-xs text-gray-400">Entry Fee</p>
              <p className="text-3xl font-bold">${game.entryFee}</p>
            </div>

            <div className="p-5 text-center bg-[#111827] rounded-xl">
              <p className="text-xs text-gray-400">Total Pot</p>
              <p className="text-3xl font-bold text-green-400">
                $
                {(
                  (game?.entryFee || 0) *
                  (game?.totalSlots || 0) *
                  1.1
                ).toFixed(2)}
              </p>
            </div>
          </section>

          <section className="bg-[#111827] border border-[#1F2937] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-4">Joined Users</h3>

            <div className="space-y-3">
              {!users || users.length === 0 ? (
                <div className="text-center text-gray-400 text-sm py-4">
                  No joined users
                </div>
              ) : (
                users?.map((w: any, i: number) => (
                  <div
                    key={w.id || i}
                    className="flex items-center justify-between p-2 hover:bg-[#1F2937] rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                        #{w.number}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-white">
                          {w.userName || "Unknown"}
                        </p>

                        <p className="text-[10px] text-gray-400">
                          Joined • {new Date(w.joinedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-400">
                        Slot #{w.number}
                      </p>

                      <p className="text-[10px] text-gray-400">
                        {w.email || "No email"}
                      </p>
                    </div>
                  </div>
                ))
              )}

              <div className="h-px w-full bg-[#1F2937]"></div>
            </div>
          </section>
        </div>
      </main>

      <BottomNav />
    </>
  );
}

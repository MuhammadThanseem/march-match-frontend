"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BottomNav from "@/app/components/BottomNav";
import httpService from "@/app/utils/httpService";
import toast from "react-hot-toast";

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
  const [joining, setJoining] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    if (id) {
      loadGameDetails(id as string);
      loadWallet();
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

  const handleJoinGame = async () => {
    if (wallet.balance < game.entryFee) {
      toast.error("Insufficient balance");
      return;
    }

    try {
      setJoining(true);
      const res: any = await httpService.post(`/games/join/${id}`, {});

      if (res.data.success) {
        router.push(`/game-details/${id}`);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Join failed");
    } finally {
      setJoining(false);
    }
  };

  function getTimeRemaining(startTime: string | Date) {
    const total = new Date(startTime).getTime() - new Date().getTime();

    const minutes = Math.floor(total / 1000 / 60);

    // ❌ if started OR more than 20 mins → no countdown
    if (total <= 0 || minutes > 19) return null;

    const seconds = Math.floor((total / 1000) % 60);

    return { minutes, seconds };
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

          {/* Payout Distribution */}
          <section id="payout-distribution" className="clean-card p-5">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-800">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                <i className="fa-solid fa-trophy text-yellow-500 text-sm"></i>
              </div>
              <h3 className="text-lg font-bold text-brand-text font-display tracking-wide">
                Payout Breakdown
              </h3>
            </div>

            <div className="space-y-4">
              {/* Media Timeouts */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-brand-text">
                    {game.totalSlots - 2}x Media Timeouts
                  </span>
                </div>
                <span className="text-sm font-bold text-white bg-gray-800 px-3 py-1 rounded-lg">
                  ${game?.entryFee} &nbsp;
                  <span className="text-xs text-brand-muted font-normal">
                    each
                  </span>
                </span>
              </div>

              {/* Halftime */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span className="text-sm font-medium text-brand-text">
                    Halftime Score
                  </span>
                </div>
                <span className="text-sm font-bold text-white bg-gray-800 px-3 py-1 rounded-lg">
                  ${game?.entryFee}
                </span>
              </div>

              {/* Final */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-brand-text">
                    Final Score
                  </span>
                </div>
                <span className="text-sm font-bold text-green-400 bg-green-900/30 border border-green-800/50 px-3 py-1 rounded-lg">
                  ${2 * game?.entryFee || 0}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="mt-5 bg-gray-800/50 rounded-xl p-3 border border-gray-700 flex items-start gap-3">
              <i className="fa-solid fa-circle-info text-blue-500 mt-0.5"></i>
              <p className="text-xs text-brand-muted leading-relaxed">
                Winning number is determined by the last digit of the combined
                score at each checkpoint.
                <strong className="text-brand-text">
                  {" "}
                  Action Every 4 Minutes!
                </strong>
              </p>
            </div>
          </section>

          {/* Number Reveal */}
          <section
            id="number-reveal-area"
            className="hidden clean-card p-8 text-center bg-gradient-to-b from-indigo-900 to-gray-900"
          >
            <h2 className="text-xl font-bold mb-6">Your Assigned Number</h2>

            <div
              id="reveal-card"
              className="w-32 h-40 bg-white text-black rounded-2xl border-4 border-gray-200 flex items-center justify-center shadow-lg"
            >
              <span id="assigned-number" className="text-7xl font-bold">
                ?
              </span>
            </div>

            <p className="mt-4 text-sm">
              Good luck — next win could be minutes away!
            </p>
          </section>

          {/* Balance */}
          <section className="px-2">
            {!game?.joined ? (
              <>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Current Balance</span>
                  <span>${wallet.balance}</span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Entry Fee</span>
                  <span className="text-orange-400">-${game.entryFee}</span>
                </div>

                <div className="border-t border-gray-800 my-3"></div>

                <div className="flex justify-between">
                  <span>New Balance</span>
                  <span>${(wallet?.balance || 0) - (game?.entryFee || 0)}</span>
                </div>
              </>
            ) : (
              <div className="text-green-400 text-center py-3">
                ✅ You have already joined this game
              </div>
            )}
          </section>
        </div>

        {/* CTA */}
        <section className="absolute bottom-[100px] w-full px-5">
          {game?.joined ? (
            <button
              onClick={() => router.push(`/game-details/${game._id}`)}
              className="cursor-pointer w-full bg-green-500 py-4 rounded-2xl text-lg flex justify-center items-center gap-2 hover:bg-green-600 transition shadow-lg"
            >
              View Entry
            </button>
          ) : (
            <button
              onClick={handleJoinGame}
              disabled={joining}
              className="cursor-pointer w-full bg-orange-500 py-4 rounded-2xl text-lg flex justify-center items-center gap-2 hover:bg-orange-600 transition shadow-lg disabled:opacity-50"
            >
              {joining ? "Joining..." : `Join Now - $${game.entryFee}`}
            </button>
          )}
        </section>
      </main>

      <BottomNav />
    </>
  );
}

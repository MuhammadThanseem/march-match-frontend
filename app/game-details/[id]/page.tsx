"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BottomNav from "@/app/components/BottomNav";
import httpService from "@/app/utils/httpService";

export default function GameDetailsPage() {
  const { id } = useParams();

  const [game, setGame] = useState<any>(null);
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [wallet, setWallet] = useState({
    balance: 0,
    playable: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const router = useRouter();
  const [tick, setTick] = useState(0);
  const CHECKPOINT_DURATION = 240;

  useEffect(() => {
    if (id) {
      loadGameDetails(id as string);
      loadWallet();
      loadCheckpoints(id as string);
      loadWinners(id as string);
    }
  }, [id]);

  // 🔄 AUTO REFRESH EVERY 4 MINUTES
  useEffect(() => {
    if (!checkpoints?.length) return;

    const now = Date.now();

    // Find next checkpoint (future one)
    const nextCheckpoint = checkpoints.find(
      (cp) => new Date(cp.startTime).getTime() > now,
    );

    if (!nextCheckpoint) return;

    const delay = new Date(nextCheckpoint.startTime).getTime() - now;

    const timeout = setTimeout(() => {
      console.log("⏱️ Checkpoint reached → refreshing");
      loadCheckpoints(id as string);
      loadWinners(id as string);
      loadGameDetails(id as string);
    }, delay);

    return () => clearTimeout(timeout);
  }, [checkpoints, id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getProgress = (remainingTime: number) => {
    return ((CHECKPOINT_DURATION - remainingTime) / CHECKPOINT_DURATION) * 100;
  };
  const getRemainingTime = (cp: any) => {
    // If backend gives remainingTime
    if (cp.remainingTime !== undefined) {
      const remaining = cp.remainingTime - tick;
      return remaining > 0 ? remaining : 0;
    }

    // fallback (if using endTime)
    if (!cp.endTime) return 0;

    const diff = Math.floor(
      (new Date(cp.endTime).getTime() - Date.now()) / 1000,
    );

    return diff > 0 ? diff : 0;
  };

  const loadGameDetails = async (gameId: string) => {
    try {
      const res: any = await httpService.get(`/games/${gameId}/details`);
      setGame(res.data.game);
      setTimeLeft(res.data.game.currentQuarterTime || 0);
    } catch (err) {
      console.log("Game fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCheckpoints = async (gameId: string, includeScores = false) => {
    try {
      const res: any = await httpService.get(`/games/${gameId}/checkpoints`);

      setCheckpoints(res.data.data);
    } catch (err) {
      console.log("Game fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadWinners = async (gameId: string) => {
    try {
      const res: any = await httpService.get(`/games/${gameId}/winners`);

      setWinners(res.data.data);
    } catch (err) {
      console.log("Game fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadWallet = async () => {
    try {
      const res: any = await httpService.get("/wallet/me");
      setWallet(res.data.data);
    } catch (err) {
      console.log("Wallet fetch error:", err);
    }
  };

  // ⏱️ TIMER
  useEffect(() => {
    if (!timeLeft) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatGameClock = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (loading || !game) {
    return (
      <div className="h-screen flex items-center justify-center text-white bg-[#0A0E17]">
        Loading game...
      </div>
    );
  }

  // ✅ DYNAMIC LOGIC
  const isGameStarted = game.status === "live";

  const totalScore = (game?.teamAScore ?? 0) + (game?.teamBScore ?? 0);
  const winningNumber = totalScore % 10;

  const activeCheckpointIndex: any = checkpoints.findIndex(
    (cp: any) => cp.status === "active",
  );
  const lastCompletedCheckpoint = checkpoints[activeCheckpointIndex - 1];
  const checkpointWinningNumber = lastCompletedCheckpoint?.winningNumber;

  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-center text-white">
      <div className="relative w-full max-w-[375px] h-screen flex flex-col bg-[#0A0E17] overflow-hidden shadow-2xl">
        {/* HEADER */}
        <header className="sticky top-0 z-20 flex justify-between items-center px-5 pt-12 pb-4 bg-[#0A0E17]/90 backdrop-blur-md border-b border-[#1F2937]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="cursor-pointer w-10 h-10 flex items-center justify-center rounded-full bg-[#111827] border border-[#1F2937]"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <h1 className="text-lg font-bold">Game Details</h1>
          </div>

          <div className="flex items-center gap-2 bg-[#111827] px-3 py-1.5 rounded-full border border-[#1F2937]">
            <i className="fa-solid fa-wallet text-green-400 text-xs" />
            <span className="text-sm font-bold">
              ${wallet.balance.toFixed(2)}
            </span>
          </div>
        </header>

        {/* SCROLL AREA */}
        <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-44 mt-4">
          {/* SCOREBOARD */}
          <section className="bg-[#111827] border border-[#1F2937] rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                  game.status === "completed"
                    ? "bg-green-500/10 text-green-400"
                    : isGameStarted
                      ? "bg-red-500/10 text-red-400"
                      : "bg-yellow-500/10 text-yellow-400"
                }`}
              >
                {/* ✅ DOT */}
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    game.status === "completed"
                      ? "bg-green-400"
                      : isGameStarted
                        ? "bg-red-500 animate-pulse"
                        : "bg-yellow-500"
                  }`}
                />

                {/* ✅ TEXT */}
                {game.status === "completed"
                  ? "COMPLETED"
                  : isGameStarted
                    ? `LIVE Q${activeCheckpointIndex + 1} • ${formatGameClock(timeLeft)}`
                    : "UPCOMING"}
              </span>

              <span className="text-xs text-gray-400">{game.league}</span>
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-blue-900 flex items-center justify-center border border-[#1F2937]">
                  <span className="font-bold">
                    {game.teamAName?.slice(0, 3).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-bold">{game.teamAName}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold">{game.teamAScore}</span>
                <span className="text-gray-500">-</span>
                <span className="text-4xl font-bold">{game.teamBScore}</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-blue-400 flex items-center justify-center border border-[#1F2937]">
                  <span className="font-bold">
                    {game.teamBName?.slice(0, 3).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-bold">{game.teamBName}</span>
              </div>
            </div>

            {/* SCORE LOGIC */}
            <div className="bg-[#0F172A] border border-[#1F2937] rounded-xl p-3 flex justify-between">
              <div>
                <p className="text-xs text-gray-400">Combined Score</p>
                <p className="text-sm font-bold">
                  {game.teamAScore} + {game.teamBScore} = {totalScore}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-400">Winning Logic</p>
                <div className="bg-indigo-600 text-xs font-bold px-2 py-1 rounded">
                  {totalScore} mod 10 ={" "}
                  {winningNumber !== null ? (
                    <span className="text-orange-400 font-bold">
                      {winningNumber}
                    </span>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* NUMBER GRID */}
          <section className="bg-[#111827] border border-[#1F2937] rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-brand-text">The Board</h3>
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-[10px] text-brand-muted">Yours</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span className="text-[10px] text-brand-muted">Winning</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <div
                  key={n}
                  className={`
        aspect-square flex items-center justify-center rounded-lg
        border border-[#1F2937] font-bold text-2xl
        transition
        ${
          n === checkpointWinningNumber
            ? "bg-orange-500 text-white" // ✅ only after checkpoint ends
            : n === game.userEntryNumber
              ? "bg-indigo-600 text-white"
              : "bg-[#0F172A]"
        }
      `}
                >
                  {n}
                </div>
              ))}
            </div>

            <p className="text-[10px] text-center text-gray-400 mt-3">
              If game ends now,{" "}
              <span className="text-orange-400 font-bold">{winningNumber}</span>{" "}
              wins
            </p>
          </section>

          {/* TIMELINE */}
          <section className="bg-[#111827] border border-[#1F2937] rounded-2xl p-5">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-sm font-bold text-white">
                Payout Checkpoints
              </h3>
              <span className="text-xs font-semibold text-green-400 bg-green-900/30 px-2 py-1 rounded-md">
                Pot: ${game.totalSlots * 10 + 10}
              </span>
            </div>
            <div className="relative pl-2">
              {checkpoints?.map((cp: any, i: number) => {
                const isCompleted = cp.status === "completed";

                // ✅ ONLY CURRENT ACTIVE CHECKPOINT
                const isActive =
                  i === activeCheckpointIndex && game.status === "live";

                // ✅ ONLY calculate remaining for active checkpoint
                const remaining = isActive ? getRemainingTime(cp) : 0;

                // ✅ progress based on remaining time
                const progress = isActive
                  ? ((CHECKPOINT_DURATION - remaining) / CHECKPOINT_DURATION) *
                    100
                  : 0;

                return (
                  <div key={i} className="relative pb-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center
          ${
            cp.type === "final"
              ? "bg-white border-2 border-green-400"
              : isActive
                ? "bg-orange-500"
                : isCompleted
                  ? "bg-white border-2 border-green-400"
                  : "bg-white border-2 border-gray-500"
          }`}
                      >
                        {cp.type === "final" && (
                          <i className="fa-solid fa-flag-checkered text-[10px] text-green-500"></i>
                        )}

                        {cp.type === "halftime" && !isCompleted && (
                          <i className="fa-solid fa-clock text-[10px] text-white"></i>
                        )}

                        {cp.type !== "final" &&
                          cp.type !== "halftime" &&
                          isCompleted && (
                            <i className="fa-solid fa-check text-[10px] text-green-400"></i>
                          )}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="text-sm font-bold">
                            {cp.type === "halftime"
                              ? "Halftime"
                              : cp.type === "final"
                                ? "Final"
                                : `Media Timeout ${cp.sequence}`}
                          </h4>
                          <span>${cp.rewardAmount}</span>
                        </div>

                        {/* ✅ COMPLETED */}
                        {isCompleted && (
                          <p className="text-xs text-gray-400">
                            Won by #{cp.winningNumber} (Score: {cp.teamAScore}+
                            {cp.teamBScore} = {cp.teamAScore + cp.teamBScore})
                          </p>
                        )}

                        {/* ✅ ONLY ACTIVE SHOWS TIMER */}
                        {isActive && (
                          <>
                            <p className="text-xs text-orange-400 mt-1">
                              ⏱️ {formatGameClock(remaining)} remaining
                            </p>

                            {/* ✅ REVERSE PROGRESS BAR */}
                            <div className="mt-2 w-full bg-gray-700 h-1.5 rounded">
                              <div
                                className="bg-orange-400 h-1.5 rounded transition-all duration-1000 linear"
                                style={{ width: `${100 - progress}%` }}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* WINNERS */}
          <section className="bg-[#111827] border border-[#1F2937] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-4">
              Recent Winners
            </h3>

            <div className="space-y-3">
              {winners?.map((w: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 hover:bg-[#1F2937] rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                      #{w.number}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        {w.type === "halftime"
                          ? "Half Time"
                          : w.type === "final"
                            ? "Final"
                            : `Media TO ${w.checkpoint}`}
                      </p>

                      <p className="text-[10px] text-gray-400">
                        {w.type === "halftime"
                          ? "Halftime"
                          : w.type === "final"
                            ? "Full Time"
                            : `Q ${w.checkpoint}`}{" "}
                        • 11:42
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-green-400">
                      +${w.amount.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      User: {w.userName || "Unknown"}
                    </p>
                  </div>
                </div>
              ))}

              <div className="h-px w-full bg-[#1F2937]"></div>
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="absolute bottom-24 w-full px-4">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-3 flex justify-between items-center">
            <p className="text-sm font-bold">
              Joined • #{game.userEntryNumber}
            </p>

            <button className="bg-indigo-600 px-5 py-2 rounded-lg font-bold">
              View Entry
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}

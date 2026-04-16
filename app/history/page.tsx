"use client";

import {
  FaChevronLeft,
  FaDownload,
  FaMagnifyingGlass,
  FaSliders,
  FaArrowTrendUp,
  FaCheck,
  FaXmark,
  FaChevronDown,
} from "react-icons/fa6";
import BottomNav from "../components/BottomNav";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import httpService from "../utils/httpService";

/* ================= TYPES ================= */

interface Summary {
  totalWinnings: number;
  gamesPlayed: number;
  winRate: number;
  bestHit: number;
}

interface Checkpoint {
  label: string;
  win: boolean;
  amount: number;
}

interface Game {
  month: string;
  day: string;
  teamA: string;
  teamB: string;
  score: string;
  yourNumber: number;
  win: boolean;
  amount: number;
  entry: number;
  checkpointsWon: number;
  totalCheckpoints: number;
  checkpoints: Checkpoint[];
}

/* ================= COMPONENT ================= */

export default function HistoryPage() {
  const router = useRouter();

  const [summary, setSummary] = useState<Summary | null>(null);
  const [history, setHistory] = useState<Game[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [filteredHistory, setFilteredHistory] = useState<Game[]>([]);
  const [openIndex, setOpenIndex] = useState(null);

  /* ================= API ================= */

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    let data = [...history];

    // 🔍 SEARCH
    if (search.trim()) {
      const q = search.toLowerCase();

      data = data.filter(
        (g) =>
          g.teamA.toLowerCase().includes(q) ||
          g.teamB.toLowerCase().includes(q) ||
          g.month.toLowerCase().includes(q) ||
          String(g.day).includes(q),
      );
    }

    // 🎯 FILTERS
    if (activeFilter === "wins") {
      data = data.filter((g) => g.win);
    }

    if (activeFilter === "loss") {
      data = data.filter((g) => !g.win);
    }

    if (activeFilter === "month") {
      const now = new Date();

      data = data.filter((g) => {
        const gameDate = new Date(`${g.month} ${g.day}, ${now.getFullYear()}`);
        return (
          gameDate.getMonth() === now.getMonth() &&
          gameDate.getFullYear() === now.getFullYear()
        );
      });
    }

    setFilteredHistory(data);
  }, [search, activeFilter, history]);

  const fetchHistory = async (): Promise<void> => {
    try {
      const res = await httpService.get<any>("/history/user"); // ✅ endpoint
      const data = res.data.data;

      setSummary(data.summary);
      setHistory(data.games || []);
    } catch (err) {
      console.error("Error fetching history", err);
    }
  };

  const toggleAccordion = (index: any) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  /* ================= UI ================= */

  return (
    <>
      <main className="relative w-full max-w-[375px] min-h-screen mx-auto flex flex-col bg-[#0A0E17] text-white">
        {/* HEADER */}
        <header className="w-full px-5 pt-12 pb-4 flex justify-between items-center sticky top-0 bg-[#0A0E17]/90 backdrop-blur-md border-b border-[#1F2937]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="cursor-pointer w-10 h-10 flex items-center justify-center rounded-full bg-[#111827] hover:bg-gray-800 border border-[#1F2937]"
            >
              <FaChevronLeft />
            </button>
            <h1 className="text-xl font-bold tracking-wide font-teko">
              Game History
            </h1>
          </div>
        </header>

        {/* MAIN */}
        <div className="flex-1 overflow-y-auto pb-32 w-full px-4 mt-4 space-y-5">
          {/* SUMMARY */}
          <section className="rounded-2xl p-5 bg-gradient-to-br from-[#111827] to-[#0A0E17] border border-purple-500/20 shadow-lg relative">
            <div className="flex justify-between">
              <div>
                <p className="text-xs text-gray-400">Total Winnings</p>
                <h2 className="text-3xl font-teko text-green-400">
                  ${summary?.totalWinnings?.toFixed(2) ?? 0.00}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Games Played</p>
                <h2 className="text-2xl font-teko">
                  {summary?.gamesPlayed ?? 0}
                </h2>
              </div>
            </div>

            <div className="mt-4 border-t border-gray-700 pt-4 flex justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <FaArrowTrendUp className="text-[10px] text-green-400" />
                </div>
                <span className="text-xs text-gray-400">
                  Win Rate:{" "}
                  <span className="text-white font-bold">
                    {summary?.winRate ?? 0}%
                  </span>
                </span>
              </div>

              <span className="text-xs text-gray-400">
                Best Hit:{" "}
                <span className="font-bold text-orange-400">
                  {summary?.bestHit ?? 0}
                </span>
              </span>
            </div>
          </section>

          {/* SEARCH + FILTER (UNCHANGED UI) */}
          <section className="space-y-3">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <FaMagnifyingGlass className="text-sm" />
              </span>

              <input
                type="text"
                placeholder="Search teams, dates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#111827] border border-[#1F2937] text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />

              <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                <FaSliders className="text-gray-400" />
              </span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                  activeFilter === "all"
                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-400"
                    : "bg-[#1F2937] text-gray-400"
                }`}
              >
                All Time
              </button>

              <button
                onClick={() => setActiveFilter("month")}
                className={`px-4 py-1.5 rounded-full text-xs ${
                  activeFilter === "month"
                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-400"
                    : "bg-[#1F2937] text-gray-400"
                }`}
              >
                This Month
              </button>

              <button
                onClick={() => setActiveFilter("wins")}
                className={`px-4 py-1.5 rounded-full text-xs ${
                  activeFilter === "wins"
                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-400"
                    : "bg-[#1F2937] text-gray-400"
                }`}
              >
                Wins Only
              </button>

              <button
                onClick={() => setActiveFilter("loss")}
                className={`px-4 py-1.5 rounded-full text-xs ${
                  activeFilter === "loss"
                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-400"
                    : "bg-[#1F2937] text-gray-400"
                }`}
              >
                Losses
              </button>
            </div>
          </section>

          {/* HISTORY */}

          <section className="space-y-4">
            {filteredHistory.map((game, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={index}
                  className="rounded-2xl border border-indigo-500/30 bg-[#111827] shadow-lg overflow-hidden transition-all duration-300"
                >
                  {/* HEADER */}
                  <div
                    onClick={() => toggleAccordion(index)}
                    className="p-4 flex justify-between cursor-pointer border-b border-gray-700 hover:bg-[#0A0E17]/50 transition"
                  >
                    <div className="flex items-center gap-3">
                      {/* DATE */}
                      <div className="w-12 h-12 bg-[#0A0E17] border border-gray-700 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-[10px] text-gray-400">
                          {game.month}
                        </span>
                        <span className="text-xl font-teko">{game.day}</span>
                      </div>

                      {/* DETAILS */}
                      <div>
                        <h3 className="text-sm font-bold">
                          {game.teamA} vs {game.teamB}
                        </h3>

                        <div className="flex gap-2 mt-1 text-[10px]">
                          <span className="bg-gray-800 px-2 py-0.5 rounded">
                            Final: {game.score}
                          </span>

                          <span className="text-gray-400">
                            Your #:{" "}
                            <strong className="text-orange-400">
                              {game.yourNumber}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-lg font-teko ${
                          game.win ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {game.win ? "+" : "-"}${game.amount.toFixed(2)}
                      </span>

                      {/* ROTATING ARROW */}
                      <FaChevronDown
                        className={`text-gray-400 text-xs transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* ACCORDION CONTENT */}
                  <div
                    className={`transition-all duration-500 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="p-4 bg-[#0A0E17]/40">
                      {/* SUMMARY */}
                      <div className="flex justify-between mb-3">
                        <h4 className="text-xs text-gray-400">
                          Checkpoint Summary ({game.checkpointsWon}/
                          {game.totalCheckpoints} Won)
                        </h4>

                        <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-full font-bold">
                          Entry: ${game.entry?.toFixed(2)}
                        </span>
                      </div>

                      {/* CHECKPOINT LIST */}
                      <div className="space-y-2">
                        {game.checkpoints.map((cp, i) => (
                          <div
                            key={i}
                            className={`rounded-lg p-2.5 flex justify-between transition ${
                              cp.win
                                ? "bg-green-500/10 border border-green-500/20"
                                : "bg-red-500/10 border border-red-500/20"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {cp.win ? (
                                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                  <FaCheck className="text-[10px] text-green-400" />
                                </div>
                              ) : (
                                <FaXmark className="text-red-400 text-xs" />
                              )}

                              <span className="text-xs">{cp.label}</span>
                            </div>

                            <span className="text-sm font-teko">
                              {cp.win ? "+" : ""}${cp.amount?.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        </div>
      </main>

      <BottomNav />
    </>
  );
}

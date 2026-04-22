"use client";

import { useEffect, useState } from "react";
import httpService from "@/app/utils/httpService";

export default function AllGamesComponent() {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState<any>(null);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const response: any = await httpService.get("/games/all");

      setGames(response.data.games);
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

  return (
    <>
      {/* All Games */}
      <AllGames />
    </>
  );
  /* ----------------------------- Components ----------------------------- */
  function AllGames() {
    return (
      <section className="px-5 py-4">
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-bold">All Games</h3>
        </div>

        <div className="flex flex-col gap-3">
          {games?.length > 0 ? (
            games.map((game: any) => <GameCard key={game._id} game={game} />)
          ) : (
            <p className="text-xs text-gray-500">No games found</p>
          )}
        </div>
      </section>
    );
  }

  function GameCard({ game }: any) {
    const short1 = getTeamCode(game.teamAName);
    const short2 = getTeamCode(game.teamBName);

    const status = game.status.toUpperCase();

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
            <span className="text-sm font-semibold">{game.teamAName}</span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <div className="w-6 h-6 bg-[#1F2937] flex items-center justify-center rounded-full text-[10px] font-bold">
              {short2}
            </div>
            <span className="text-sm text-gray-400">{game.teamBName}</span>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex flex-col items-end gap-2">
          <span className="text-xs text-gray-400">
            {new Date(game.startTime).toLocaleString()}
          </span>

          {/* ✅ SAME ROW: STATUS + EDIT ICON */}
          <div className="flex items-center gap-2">
            {/* STATUS */}
            <span
              className={`px-3 py-1 text-xs font-bold rounded-lg ${
                statusStyles[status]
              }`}
            >
              {status}
            </span>

            {/* View ICON */}
            <button
              onClick={() => setSelectedGame(game)}
              className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-md bg-[#FF5C00] hover:bg-[#e65300]"
            >
              <i className="fa-solid fa-eye text-[10px]"></i>
            </button>

            {/* EDIT ICON */}
            {(game.status === "live" || game.status === "upcoming") && (
              <button
                onClick={() => setSelectedGame(game)}
                className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-md bg-[#FF5C00] hover:bg-[#e65300]"
              >
                <i className="fa-solid fa-pen text-[10px]"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

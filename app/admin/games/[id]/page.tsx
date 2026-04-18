"use client";

import BottomNavAdmin from "@/app/components/BottomNavAdmin";
import httpService from "@/app/utils/httpService";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AddGamePage() {
  const { id } = useParams();
  const isEdit = id !== "new";
  const [formData, setFormData] = useState({
    title: "",
    teamAName: "",
    teamBName: "",
    league: "",
    entryFee: "",
    totalSlots: 10,
    potAmount: 0, // auto
    startTime: "",
    status: "upcoming",
    teamAScore: 0,
    teamBScore: 0,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<any>({});
  const router = useRouter();
  const [slotScores, setSlotScores] = useState<any>([]);
  const [currentCheckpoint, setCurrentCheckpoint] = useState<any | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    if (isEdit) {
      fetchGame();
    } else {
      loadDefaultSlots();
    }
  }, [id]);

  useEffect(() => {
    if (!currentCheckpoint?.endTime) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(currentCheckpoint.endTime).getTime();

      const diff = end - now;

      if (diff <= 0) {
        setRemainingTime(0);

        clearInterval(interval); // ✅ stop interval
        fetchGame(); // ✅ call only once
      } else {
        setRemainingTime(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentCheckpoint]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const fetchGame = async () => {
    try {
      const res: any = await httpService.get(`/games/${id}/full-details`);

      const game = res.data.data.game;
      const checkpoints = res.data.data.checkpoints;
      const current = res.data.data.currentCheckpoint ?? null;
      setCurrentCheckpoint(current);

      // ✅ Set form data
      setFormData({
        title: game.title || "",
        teamAName: game.teamAName || "",
        teamBName: game.teamBName || "",
        league: game.league || "",
        entryFee: game.entryFee || "",
        totalSlots: game.totalSlots || 10,
        potAmount: game.potAmount || 0,
        startTime: game.startTime ? formatToLocalInput(game.startTime) : "",
        status: game.status || "upcoming",
        teamAScore: game.teamAScore || 0,
        teamBScore: game.teamBScore || 0,
      });

      // ✅ Extract slot scores from checkpoints
      if (checkpoints?.length > 0) {
        const slots = checkpoints.map((cp: any) => ({
          sequence: cp.sequence,
          teamAScore: cp.score?.teamAScore || 0,
          teamBScore: cp.score?.teamBScore || 0,
        }));

        setSlotScores(slots);
      } else {
        loadDefaultSlots();
      }
    } catch (err) {
      toast.error("Failed to load game");
    }
  };

  const loadDefaultSlots = () => {
    const slots = Array.from({ length: formData.totalSlots }, (_, i) => ({
      sequence: i + 1,
      teamAScore: 0,
      teamBScore: 0,
    }));
    setSlotScores(slots);
  };

  const validateForm = () => {
    let newErrors: any = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.teamAName.trim()) newErrors.teamAName = "Team A required";
    if (!formData.teamBName.trim()) newErrors.teamBName = "Team B required";
    if (!formData.league.trim()) newErrors.league = "League required";

    if (!formData.entryFee || Number(formData.entryFee) <= 0) {
      newErrors.entryFee = "Enter valid entry fee";
    }

    if (!formData.totalSlots || Number(formData.totalSlots) <= 0) {
      newErrors.totalSlots = "Enter valid slots";
    }

    if (!formData.startTime) {
      newErrors.startTime = "Start time required";
    }

    if (Number(formData.teamAScore) < 0) {
      newErrors.teamAScore = "Invalid score";
    }

    if (Number(formData.teamBScore) < 0) {
      newErrors.teamBScore = "Invalid score";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const utcStartTime = new Date(formData.startTime).toISOString();

      const payload = {
        ...formData,
        startTime: utcStartTime,
        entryFee: Number(formData.entryFee),
        potAmount: Number(formData.potAmount),
        totalSlots: Number(formData.totalSlots),
        scores: slotScores.map((slot: any) => ({
          sequence: slot.sequence,
          teamAScore: Number(slot.teamAScore),
          teamBScore: Number(slot.teamBScore),
        })),
      };

      if (isEdit) {
        // ✅ UPDATE
        await httpService.put(`/games/${id}`, payload);
        toast.success("Game updated successfully!");
      } else {
        // ✅ CREATE
        await httpService.post("/games/create", payload);
        toast.success("Game created successfully!");
      }
    } catch (error) {
      toast.error("Operation failed");
    }

    setLoading(false);
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    let updatedData = {
      ...formData,
      [name]: value,
    };

    // Auto calculate pot
    if (name === "entryFee" || name === "totalSlots") {
      const entry = Number(name === "entryFee" ? value : formData.entryFee);
      const slots = Number(name === "totalSlots" ? value : formData.totalSlots);

      updatedData.potAmount = entry * slots + 10;
    }

    setFormData(updatedData);
  };

  const formatToLocalInput = (dateString: string) => {
    const date = new Date(dateString);

    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);

    return localDate.toISOString().slice(0, 16);
  };

  return (
    <>
      <main className="relative z-10 w-full max-w-md mx-auto min-h-[840px] h-screen mx-auto flex flex-col overflow-hidden shadow-2xl  bg-[#0A0E17] text-white">
        {/* Header */}
        <header className="w-full px-5 pt-12 pb-4 flex justify-between items-center sticky top-0 bg-[#0A0E17]/90 backdrop-blur-md border-b border-white/20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="cursor-pointer w-10 h-10 flex items-center justify-center rounded-full bg-[#1F2937] border border-white/20 hover:bg-gray-800"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <h1 className="text-xl font-bold text-brand-text font-display">
              {isEdit ? "Edit Game" : "Add Game"}
            </h1>
          </div>
        </header>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pb-32 px-4 mt-4 space-y-6">
          <h2 className="text-2xl font-semibold mb-4">
            {" "}
            {isEdit ? "Edit Game" : "Add Game"}
          </h2>

          {message && (
            <p className="mb-3 text-sm text-blue-600 font-medium">{message}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="text-xs text-gray-400">Game Title</label>
              <input
                type="text"
                name="title"
                placeholder="Enter game title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full mt-1 p-3 rounded-xl outline-none bg-[#111827] border ${
                  errors.title ? "border-red-500" : "border-white/10"
                }`}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Teams */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400">Team A</label>
                <input
                  type="text"
                  name="teamAName"
                  placeholder="Team A"
                  value={formData.teamAName}
                  onChange={handleChange}
                  className={`w-full mt-1 p-3 rounded-xl outline-none bg-[#111827] border ${
                    errors.teamAName ? "border-red-500" : "border-white/10"
                  }`}
                />
                {errors.teamAName && (
                  <p className="text-red-500 text-xs">{errors.teamAName}</p>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-400">Team B</label>
                <input
                  type="text"
                  name="teamBName"
                  placeholder="Team B"
                  value={formData.teamBName}
                  onChange={handleChange}
                  className={`w-full mt-1 p-3 rounded-xl outline-none bg-[#111827] border ${
                    errors.teamBName ? "border-red-500" : "border-white/10"
                  }`}
                />
                {errors.teamBName && (
                  <p className="text-red-500 text-xs">{errors.teamBName}</p>
                )}
              </div>
            </div>

            {/* League */}
            <div>
              <label className="text-xs text-gray-400">League</label>
              <input
                type="text"
                name="league"
                placeholder="League name"
                value={formData.league}
                onChange={handleChange}
                className={`w-full mt-1 p-3 rounded-xl outline-none bg-[#111827] border ${
                  errors.league ? "border-red-500" : "border-white/10"
                }`}
              />
              {errors.league && (
                <p className="text-red-500 text-xs mt-1">{errors.league}</p>
              )}
            </div>

            {/* Fees */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <input
                  type="number"
                  name="entryFee"
                  placeholder="Entry ₹"
                  value={formData.entryFee}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-xl outline-none bg-[#111827] border ${
                    errors.entryFee ? "border-red-500" : "border-white/10"
                  }`}
                />
                {errors.entryFee && (
                  <p className="text-red-500 text-xs">{errors.entryFee}</p>
                )}
              </div>

              <div>
                <input
                  type="number"
                  name="totalSlots"
                  placeholder="Slots"
                  value={formData.totalSlots}
                  className="w-full p-3 rounded-xl bg-[#1f2937] border border-white/10 text-gray-400"
                  disabled
                />
              </div>

              <div>
                <input
                  type="number"
                  name="potAmount"
                  placeholder="Pot ₹"
                  value={formData.potAmount}
                  disabled
                  className="w-full p-3 rounded-xl bg-[#1f2937] border border-white/10 text-gray-400"
                />
              </div>
            </div>

            {/* Time */}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-xl outline-none bg-[#111827] border ${
                    errors.startTime ? "border-red-500" : "border-white/10"
                  }`}
                />
                {errors.startTime && (
                  <p className="text-red-500 text-xs">{errors.startTime}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Timeout Scores</h3>

              {/* ⏱️ TIMER UI */}
              {currentCheckpoint && (
                <div className="text-center bg-[#111827] p-3 rounded-xl border border-white/10">
                  <p className="text-xs text-gray-400">Time Remaining</p>
                  <p
                    className={`text-xl font-bold ${
                      remainingTime < 30000 ? "text-red-500" : "text-green-400"
                    }`}
                  >
                    {formatTime(remainingTime)}
                  </p>
                </div>
              )}

              {slotScores.map((slot: any, index: number) => {
                const isDisabled = isEdit
                  ? !currentCheckpoint ||
                    slot.sequence < currentCheckpoint.sequence
                  : false;
                return (
                  <div
                    key={index}
                    className="grid grid-cols-3 gap-2 items-center"
                  >
                    <span
                      className={`text-sm ${
                        slot.sequence === currentCheckpoint
                          ? "text-green-400 font-semibold"
                          : "text-gray-400"
                      }`}
                    >
                      Timeout {slot.sequence}
                    </span>

                    <input
                      type="number"
                      placeholder="A"
                      value={slot.teamAScore}
                      disabled={isDisabled}
                      onChange={(e) => {
                        const updated = [...slotScores];
                        updated[index].teamAScore = Number(e.target.value);
                        setSlotScores(updated);
                      }}
                      className={`p-2 rounded ${
                        isDisabled
                          ? "bg-gray-700 cursor-not-allowed"
                          : "bg-[#111827]"
                      }`}
                    />

                    <input
                      type="number"
                      placeholder="B"
                      value={slot.teamBScore}
                      disabled={isDisabled}
                      onChange={(e) => {
                        const updated = [...slotScores];
                        updated[index].teamBScore = Number(e.target.value);
                        setSlotScores(updated);
                      }}
                      className={`p-2 rounded ${
                        isDisabled
                          ? "bg-gray-700 cursor-not-allowed"
                          : "bg-[#111827]"
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 transition"
            >
              {loading
                ? isEdit
                  ? "Updating..."
                  : "Saving..."
                : isEdit
                  ? "Update Game"
                  : "Create Game"}
            </button>
          </form>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavAdmin />
    </>
  );
}

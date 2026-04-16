"use client";

import BottomNavAdmin from "@/app/components/BottomNavAdmin";
import httpService from "@/app/utils/httpService";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AddGamePage() {
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

  useEffect(() => {
    const slots: any = Array.from({ length: formData.totalSlots }, (_, i) => ({
      sequence: i + 1,
      teamAScore: 0,
      teamBScore: 0,
    }));

    setSlotScores(slots);
  }, [formData.totalSlots]);

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
    setMessage("");

    try {
      const utcStartTime = new Date(formData.startTime).toISOString();

      const res: any = await httpService.post("/games/create", {
        ...formData,
        startTime: utcStartTime, // ✅ IMPORTANT
        entryFee: Number(formData.entryFee),
        potAmount: Number(formData.potAmount),
        totalSlots: Number(formData.totalSlots),

        scores: slotScores.map((slot: any) => ({
          sequence: slot.sequence,
          teamAScore: Number(slot.teamAScore),
          teamBScore: Number(slot.teamBScore),
        })),
      });

      toast.success("Game created successfully!");
      setErrors({});

      // reset form
      setFormData({
        title: "",
        teamAName: "",
        teamBName: "",
        league: "",
        entryFee: "",
        totalSlots: 10,
        potAmount: 0,
        startTime: "",
        status: "upcoming",
        teamAScore: 0,
        teamBScore: 0,
      });
      // ✅ Reset slot scores
      const resetSlots = Array.from({ length: 10 }, (_, i) => ({
        sequence: i + 1,
        teamAScore: 0,
        teamBScore: 0,
      }));
      setSlotScores(resetSlots);
    } catch (error: any) {
      toast.error("Failed to create game. Please try again.");
      setMessage(error?.response?.data?.message || "Failed to create game");
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

  return (
    <>
      <main className="relative z-10 w-full max-w-[375px] min-h-[840px] h-screen mx-auto flex flex-col overflow-hidden shadow-2xl  bg-[#0A0E17] text-white">
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
              Add Game
            </h1>
          </div>
        </header>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pb-32 px-4 mt-4 space-y-6">
          <h2 className="text-2xl font-semibold mb-4">Add Game</h2>

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

              {slotScores.map((slot: any, index: number) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-2 items-center"
                >
                  <span className="text-sm text-gray-400">
                    Timeout {slot.sequence}
                  </span>

                  <input
                    type="number"
                    placeholder="A"
                    value={slot.teamAScore}
                    onChange={(e) => {
                      const updated = [...slotScores];
                      updated[index].teamAScore = Number(e.target.value);
                      setSlotScores(updated);
                    }}
                    className="p-2 rounded bg-[#111827]"
                  />

                  <input
                    type="number"
                    placeholder="B"
                    value={slot.teamBScore}
                    onChange={(e) => {
                      const updated = [...slotScores];
                      updated[index].teamBScore = Number(e.target.value);
                      setSlotScores(updated);
                    }}
                    className="p-2 rounded bg-[#111827]"
                  />
                </div>
              ))}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 transition"
            >
              {loading ? "Saving..." : "Create Game"}
            </button>
          </form>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavAdmin />
    </>
  );
}

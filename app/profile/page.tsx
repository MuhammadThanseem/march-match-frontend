"use client";

import { useEffect, useState } from "react";
import BottomNav from "../components/BottomNav";
import { useRouter } from "next/navigation";
import httpService from "../utils/httpService";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  // Edit states
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const router = useRouter();

  // Load user data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  // Open Edit Modal
  const openEdit = (field: string) => {
    setEditField(field);
    setEditValue(user[field]);
  };

  // Save Updated Value
 const handleSave = async () => {
    if (!editField) return;

    try {
      const userId = user._id;

      // send dynamic field update
      const res = await httpService.put(`/user/${userId}`, {
        [editField]: editValue,
      });

      if (res.status === 200) {
        toast.success(`${editField} updated successfully!`);
      } else {
        toast.error(`Failed to update ${editField}. Please try again.`);
        return;
      }

      // update UI
      const updated = { ...user, [editField]: editValue };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));

      setEditField(null);
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  if (!user) return null; // Prevent UI flashing

  const handleLogout = () => {
    localStorage.removeItem("user"); // remove stored profile

    // If you store token also, remove it here:
    localStorage.removeItem("token");

    // Redirect user to login page
    router.push("/login");
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
              Profile
            </h1>
          </div>
        </header>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pb-20 px-4 mt-4 space-y-6">
          {/* ================== USER CARD ================== */}
          <section className="clean-card p-5 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue/10 rounded-full blur-3xl"></div>

            <div className="relative w-24 h-24 mb-4">
              <img
                src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg"
                className="w-full h-full rounded-full object-cover border-2 border-blue-500 shadow-glow"
              />
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-brand-card flex items-center justify-center">
                <i className="fa-solid fa-check text-white text-[10px]"></i>
              </div>
            </div>

            <h2 className="text-2xl font-display font-bold">{user.name}</h2>
            <p className="text-sm text-brand-muted mb-2">@{user.username}</p>

            <div className="flex items-center gap-2 bg-navy-800 px-3 py-1.5 rounded-full border border-gray-700">
              <i className="fa-solid fa-shield-halved text-green-500 text-xs"></i>
              <span className="text-xs text-gray-300">Identity Verified</span>
            </div>
          </section>

          {/* ================== STATS ================== */}
          <section className="grid grid-cols-2 gap-3">
            <div className="stat-tile rounded-xl p-4 h-28 relative flex flex-col justify-between">
              <div className="absolute w-16 h-16 bg-green/10 rounded-full blur-xl -right-4 -bottom-4"></div>
              <div className="flex justify-between">
                <span className="text-xs text-brand-muted font-bold uppercase">
                  Total Earnings
                </span>
                <i className="fa-solid fa-sack-dollar text-green-500/50"></i>
              </div>
              <h3 className="text-3xl font-display font-bold text-green-500">
                $1,240<span className="text-lg text-green-500/70">.50</span>
              </h3>
            </div>

            <div className="stat-tile rounded-xl p-4 h-28 relative flex flex-col justify-between">
              <div className="absolute w-16 h-16 bg-blue/10 rounded-full blur-xl -right-4 -bottom-4"></div>
              <div className="flex justify-between">
                <span className="text-xs text-brand-muted font-bold uppercase">
                  Total Wins
                </span>
                <i className="fa-solid fa-trophy text-blue-500/50"></i>
              </div>
              <h3 className="text-3xl font-display font-bold">48</h3>
            </div>

            <div className="stat-tile rounded-xl p-4 h-28 flex flex-col justify-between">
              <div className="flex justify-between">
                <span className="text-xs text-brand-muted font-bold uppercase">
                  Games Joined
                </span>
                <i className="fa-solid fa-basketball text-blue-500/50"></i>
              </div>
              <h3 className="text-3xl font-display font-bold">112</h3>
            </div>

            <div className="stat-tile rounded-xl p-4 h-28 relative flex flex-col justify-between">
              <div className="absolute w-16 h-16 bg-blue/10 rounded-full blur-xl -right-4 -bottom-4"></div>
              <div className="flex justify-between">
                <span className="text-xs text-brand-muted font-bold uppercase">
                  Biggest Win
                </span>
                <i className="fa-solid fa-bolt text-purple-500/50"></i>
              </div>
              <h3 className="text-3xl font-display font-bold text-purple-500">
                $110<span className="text-lg text-purple-500/70">.00</span>
              </h3>
            </div>
          </section>

          {/* ======================= SHARE CARD ======================= */}
          <section className="space-y-3">
            <div className="flex justify-between">
              <h3 className="text-sm font-bold uppercase">Flex Your Stats</h3>
              <button className="text-xs text-blue-500 font-bold flex items-center gap-1">
                <i className="fa-solid fa-share-nodes"></i> Share
              </button>
            </div>

            <div className="share-card-preview rounded-2xl p-5 shadow-glow">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-2xl font-display font-bold">
                      MARCH MADNESS 110
                    </h4>
                    <span className="text-[10px] text-white/70 uppercase tracking-widest">
                      Action Every 4 Minutes
                    </span>
                  </div>
                  <i className="fa-solid fa-basketball text-white/20 text-4xl"></i>
                </div>

                <div className="bg-navy-900/40 p-3 rounded-xl border border-white/10 mb-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg"
                      className="w-8 h-8 rounded-full border border-white/30"
                    />
                    <div>
                      <p className="text-sm font-bold">@marcus_j110</p>
                      <p className="text-[10px] text-white/70">
                        Top 15% Player
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="text-center">
                      <p className="text-[10px] text-white/60 uppercase">
                        Win Rate
                      </p>
                      <p className="text-lg font-display font-bold">42%</p>
                    </div>

                    <div className="text-center border-x border-white/10">
                      <p className="text-[10px] text-white/60 uppercase">
                        Wins
                      </p>
                      <p className="text-lg font-display font-bold">48</p>
                    </div>

                    <div className="text-center">
                      <p className="text-[10px] text-white/60 uppercase">
                        Best #
                      </p>
                      <p className="text-lg font-display font-bold text-yellow-500">
                        7
                      </p>
                    </div>
                  </div>
                </div>

                <button className="w-full py-2 bg-white text-gray-900 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                  <i className="fa-brands fa-instagram"></i> Share to Story
                </button>
              </div>
            </div>
          </section>

          {/* ======================= ACCOUNT DETAILS ======================= */}
          <section className="clean-card overflow-hidden">
            <div className="p-4 border-b border-gray-800 bg-navy-800/50">
              <h3 className="text-sm font-bold uppercase">
                Account Information
              </h3>
            </div>

            <div className="p-4 space-y-4">
              {/* EMAIL */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-envelope text-xs text-gray-400"></i>
                  </div>
                  <div>
                    <p className="text-xs text-brand-muted">Email</p>
                    <p className="text-sm font-medium">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => openEdit("email")}
                  className="cursor-pointer text-xs text-blue-500 font-bold"
                >
                  Edit
                </button>
              </div>

              {/* PHONE */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-phone text-xs text-gray-400"></i>
                  </div>
                  <div>
                    <p className="text-xs text-brand-muted">Phone</p>
                    <p className="text-sm font-medium">{user.phone}</p>
                  </div>
                </div>
                <button
                  onClick={() => openEdit("phone")}
                  className="cursor-pointer text-xs text-blue-500 font-bold"
                >
                  Edit
                </button>
              </div>

              {/* PASSWORD */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-lock text-xs text-gray-400"></i>
                  </div>
                  <div>
                    <p className="text-xs text-brand-muted">Password</p>
                    <p className="text-sm font-medium">••••••••</p>
                  </div>
                </div>
                <button
                  onClick={() => openEdit("password")}
                  className="cursor-pointer text-xs text-blue-500 font-bold"
                >
                  Update
                </button>
              </div>
            </div>
          </section>

          {/* Logout */}
          <section className="pt-2 pb-6">
            <button
              onClick={handleLogout}
              className="w-full py-4 cursor-pointer rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-500/20"
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Log Out
            </button>
          </section>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* ======================= EDIT MODAL ======================= */}
      {editField && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-brand-card p-6 rounded-2xl w-80 border border-gray-700">
            <h3 className="text-lg font-bold capitalize mb-4">
              Edit {editField}
            </h3>

            <input
              type={editField === "password" ? "password" : "text"}
              className="w-full px-3 py-2 bg-navy-900 border border-gray-700 rounded-lg mb-4"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setEditField(null)}
                className="cursor-pointer flex-1 py-2 bg-gray-700 rounded-lg text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="cursor-pointer flex-1 py-2 bg-blue-500 rounded-lg text-sm font-bold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

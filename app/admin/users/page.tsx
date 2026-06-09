"use client";

import Image from "next/image";
import BottomNavAdmin from "@/app/components/BottomNavAdmin";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import httpService from "@/app/utils/httpService";

type User = {
  _id: string;
  name: string;
  email?: string;
  mobile?: string;
  username: string;
  role: string;
  createdAt: string;
  balance: number;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      setError(null);
      const res: any = await httpService.get("/user/all");
      setUsers(res.data.data || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const exportUsersCsv = async () => {
    try {
      setExporting(true);
      setError(null);

      const response: any = await httpService.get("/user/export/transactions", {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "users-transactions-report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err?.message || "Failed to export users");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <main className="relative z-10 w-full max-w-md mx-auto min-h-screen flex flex-col bg-[#0A0E17] text-white overflow-hidden font-sans">
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
              <p className="text-xs text-gray-400 font-medium">Admin panel</p>
              <h2 className="text-sm font-bold">Users</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-full bg-white/5 flex items-center gap-2 backdrop-blur-md">
              <i className="fa-solid fa-wallet text-[#00FF66] text-xs"></i>
              <span className="text-sm font-bold">₹0.00</span>
            </div>
            <button className="relative w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition">
              <i className="fa-regular fa-bell"></i>
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#FF5C00] rounded-full"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pb-28 w-full mt-32 px-5">
          {error && (
            <div className="mb-6 rounded-3xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-400">Users overview</p>
                <h1 className="text-2xl font-bold">All system users</h1>
              </div>
              <button
                onClick={exportUsersCsv}
                disabled={users.length === 0 || exporting}
                className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-[#FF5C00] px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {exporting ? "Exporting..." : "Export users CSV"}
              </button>
            </div>
            <p className="mt-3 text-sm text-gray-400">
              Browse every user in the system and view their balance and
              transaction history.
            </p>
          </div>

          <div className="grid gap-3">
            <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold">Users</h2>
                  <p className="text-xs text-gray-400">
                    {users.length} users in the system
                  </p>
                </div>
              </div>

              {loadingUsers ? (
                <p className="text-sm text-gray-400">Loading users…</p>
              ) : users.length === 0 ? (
                <p className="text-sm text-gray-400">No users found.</p>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      className="rounded-xl border border-white/10 bg-[#111827]/80 p-3 shadow-xl shadow-black/20 transition hover:border-[#00F0FF]/30"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate">
                            {user.name || user.username}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {user.email || user.mobile || "No email/mobile"}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-gray-300">
                            {user.role}
                          </span>
                          <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-300">
                            ₹{user.balance?.toFixed(2) ?? 0}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1 text-xs text-gray-400">
                        <span className="truncate">Username: {user.username}</span>
                        <span>|</span>
                        <span className="truncate">
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        onClick={() => router.push(`/admin/users/${user._id}`)}
                        className="mt-3 w-full cursor-pointer inline-flex items-center justify-center rounded-lg bg-[#FF5C00] px-3 py-2 text-xs font-semibold text-white transition hover:bg-orange-600"
                      >
                        View transactions
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      <BottomNavAdmin />
    </>
  );
}

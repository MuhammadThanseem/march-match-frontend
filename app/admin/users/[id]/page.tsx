"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BottomNavAdmin from "@/app/components/BottomNavAdmin";
import httpService from "@/app/utils/httpService";

type User = {
  id: string;
  name: string;
  email?: string;
  mobile?: string;
  username: string;
  role: string;
  createdAt: string;
  balance: number;
};

type Transaction = {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  status: string;
  title?: string;
  subtitle?: string;
  description?: string;
  createdAt: string;
};


export default function AdminUserTransactionPage() {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [userRes, txRes] = await Promise.all([
          httpService.get<any>(`/user/${id}`),
          httpService.get<any>(
            `/wallet/user/${id}/transactions`,
          ),
        ]);

        setUser(userRes.data.data || null);
        setTransactions(txRes.data.data || []);
      } catch (err: any) {
        setError(err?.message || "Failed to load user transactions");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const totalTransactions = transactions.length;
  const totalVolume = useMemo(
    () => transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0),
    [transactions],
  );

  return (
    <>
      <main className="relative z-10 w-full max-w-md mx-auto min-h-screen flex flex-col bg-[#0A0E17] text-white overflow-hidden font-sans">
        <header className="fixed top-0 left-0 right-0 max-w-md mx-auto px-5 pt-12 pb-4 flex justify-between items-center bg-[#0A0E17]/90 backdrop-blur-md border-b border-white/5 z-50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-200 hover:bg-white/10 transition"
              aria-label="Go back"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <div>
              <p className="text-xs text-gray-400 font-medium">Admin panel</p>
              <h2 className="text-sm font-bold">User transactions</h2>
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

          <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-400">User details</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-gray-300">
                    {user?.role ?? "—"}
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-300">
                    ₹{user?.balance?.toFixed(2) ?? "0.00"}
                  </span>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-gray-300">
                    Joined:{" "}
                    {user ? new Date(user.createdAt).toLocaleDateString() : "—"}
                  </span>
                </div>
              </div>
              <div className="text-right text-sm text-gray-300">
                <p>{totalTransactions} transactions</p>
                <p className="mt-1">Total volume: ₹{totalVolume.toFixed(2)}</p>
              </div>
            </div>
          </section>

          <section className="space-y-3 mt-4 rounded-3xl border border-white/10 bg-[#111827]/80 p-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.5)]">
            {loading ? (
              <p className="text-sm text-gray-400">Loading transactions…</p>
            ) : transactions.length === 0 ? (
              <div className="rounded-[26px] border border-dashed border-white/10 bg-[#0E1726]/80 p-8 text-center text-sm text-gray-400">
                No transactions found for this user.
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="rounded-[26px] border border-white/10 bg-[#0A0E17]/90 p-4 shadow-xl shadow-black/20"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-base font-semibold text-white">
                          {tx.title || tx.type}
                        </p>
                        <p className="text-sm text-gray-400">
                          {tx.subtitle ||
                            tx.description ||
                            "No details available"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-semibold text-white">
                          ₹{tx.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-400">
                          {new Date(tx.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-300">
                      <span className="rounded-full bg-white/5 px-2 py-1">
                        {/* Balance: ₹{tx.balanceAfter.toFixed(2)} */}
                      </span>
                      <span className="rounded-full bg-amber-500/10 px-2 py-1 text-amber-300">
                        {tx.status}
                      </span>
                      <span className="rounded-full bg-white/5 px-2 py-1">
                        Type: {tx.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <BottomNavAdmin />
    </>
  );
}

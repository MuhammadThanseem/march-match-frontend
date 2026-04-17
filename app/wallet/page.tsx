"use client";

import { useRouter } from "next/navigation";
import "@/app/globals.css";
import React, { useEffect, useState } from "react";
import BottomNav from "../components/BottomNav";
import httpService from "../utils/httpService";
import RecentTransactions from "../components/Transaction";
import toast from "react-hot-toast";

type TransactionItemProps = {
  icon: string;
  iconColor: string;
  amount: string;
  title: string;
  subtitle: string;
  status: string;
};

function TransactionItem({
  icon,
  iconColor,
  title,
  subtitle,
  amount,
  status,
}: TransactionItemProps) {
  return (
    <div className="p-4 flex justify-between items-center border-b border-[#1F2937] hover:bg-gray-800/40 transition cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
          <i className={`fa-solid ${icon} ${iconColor} text-sm`} />
        </div>
        <div>
          <h4 className="text-sm font-bold">{title}</h4>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
      </div>

      <div className="text-right">
        <span className="block text-sm font-bold">{amount}</span>
        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-green-900/40 text-green-400 mt-1">
          {status}
        </span>
      </div>
    </div>
  );
}

export default function WalletPage() {
  const router = useRouter();

  const [wallet, setWallet] = useState({
    balance: 0,
    playable: 0,
    pending: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"deposit" | "withdraw" | null>(
    null,
  );
  const [amount, setAmount] = useState("");

  const [transactions, setTransactions] = useState([]);

  const loadWallet = async () => {
    try {
      const response: any = await httpService.get("/wallet/me");
      setWallet(response.data.data);
    } catch (err) {
      console.log("Wallet fetch error:", err);
    }
  };

  const loadTransactions = async () => {
    try {
      const response: any = await httpService.get("/wallet/transactions");
      setTransactions(response.data.data);
    } catch (err) {
      console.log("Transaction fetch error:", err);
    }
  };

  // Call Deposit/Withdraw API
  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    try {
      const response = await httpService.post(`/wallet/${modalType}`, {
        amount: Number(amount),
      });

      if (response.status === 200) {
        if (!modalType) return;

        toast.success(`${modalType.toUpperCase()} Successful`);
        closeModal();
        loadWallet();
        loadTransactions();
      }
    } catch (err) {
      console.log(err);
      toast.error("Error processing transaction");
    }
  };

  useEffect(() => {
    loadWallet();
    loadTransactions();
  }, []);

  const openModal = (type: "deposit" | "withdraw") => {
    setModalType(type);
    setAmount("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
  };

  return (
    <>
      <main className="relative z-10 w-full max-w-md mx-auto min-h-[840px] h-screen mx-auto flex flex-col bg-[#0A0E17] overflow-hidden shadow-2xl text-white font-sans">
        {/* HEADER */}
        <header className="w-full px-5 pt-12 pb-4 flex justify-between items-center sticky top-0 bg-[#0A0E17]/90 backdrop-blur-md border-b border-[#1F2937] z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className=" cursor-pointer w-10 h-10 flex items-center justify-center rounded-full bg-[#111827] border border-[#1F2937] hover:bg-gray-800 transition"
            >
              <i className="fa-solid fa-chevron-left" />
            </button>

            <h1 className="text-xl font-bold font-display tracking-wide">
              Wallet
            </h1>
          </div>
        </header>

        {/* SCROLL CONTENT */}
        <div className="flex-1 overflow-y-auto w-full px-4 mt-4 pb-24 space-y-6">
          {/* BALANCE CARD */}
          <section className="p-6 rounded-2xl bg-gradient-to-br from-[#111827] to-[#0A0E17] border border-blue-500/20 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400 uppercase tracking-wide">
                  Total Balance
                </span>

                <span className="bg-gray-800/80 border border-gray-700 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer">
                  USD <i className="fa-solid fa-chevron-down text-[10px]" />
                </span>
              </div>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-display text-5xl font-bold">
                  ${wallet.balance?.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-700/50">
                <div>
                  <p className="text-xs text-gray-400">Available to Play</p>
                  <p className="text-sm font-bold">
                    ${wallet.balance?.toFixed(2)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-400">Pending Withdrawal</p>
                  <p className="text-sm font-bold text-gray-400">
                    ${wallet.pending?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* QUICK ACTIONS */}
          <section className="grid grid-cols-2 gap-4">
            <button
              className="rounded-2xl p-4 flex flex-col items-center bg-[#111827] border border-orange-500/30 hover:bg-gray-800 transition cursor-pointer"
              onClick={() => openModal("deposit")}
            >
              <div className="w-12 h-12 rounded-full bg-orange-600/10 flex items-center justify-center">
                <i className="fa-solid fa-arrow-down text-orange-400 text-xl" />
              </div>
              <span className="text-sm font-bold">Deposit</span>
            </button>

            <button
              className="rounded-2xl p-4 flex flex-col items-center bg-[#111827] border border-gray-700 hover:bg-gray-800 transition cursor-pointer"
              onClick={() => openModal("withdraw")}
            >
              <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                <i className="fa-solid fa-arrow-up text-white text-xl" />
              </div>
              <span className="text-sm font-bold">Withdraw</span>
            </button>
          </section>
          {/* ADD FUNDS CTA */}
          <button
            className="w-full bg-blue-600 hover:bg-blue-500 cursor-pointer text-white font-bold py-4 rounded-xl shadow-lg tracking-wide flex justify-center items-center gap-2 uppercase font-display"
            onClick={() => openModal("deposit")}
          >
            <i className="fa-solid fa-plus" /> Add Funds
          </button>

          {/* TRANSACTIONS */}
          <section className="rounded-2xl bg-[#111827] border border-[#1F2937]">
            <RecentTransactions transactions={transactions} />
          </section>

          {/* SECURITY NOTE */}
          <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-2">
            <i className="fa-solid fa-lock" /> Secure 256-bit encryption for all
            transactions
          </p>
        </div>
        {/* ---------------- MODAL ---------------- */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#111827] p-6 rounded-2xl w-80 border border-gray-700 shadow-xl">
              <h2 className="text-xl font-bold mb-4 text-center">
                {modalType === "deposit" ? "Deposit Amount" : "Withdraw Amount"}
              </h2>

              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 rounded-lg bg-[#0A0E17] border border-gray-700 text-white mb-4 outline-none"
                placeholder="Enter amount"
              />

              {/* Buttons */}
              <div className="flex gap-3 mt-3">
                <button
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold"
                  onClick={handleSubmit}
                >
                  {modalType === "deposit" ? "Deposit" : "Withdraw"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </>
  );
}

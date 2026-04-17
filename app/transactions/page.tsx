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
      const token = localStorage.getItem("token");

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
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => router.back()}
          >
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#111827] border border-[#1F2937] hover:bg-gray-800 transition">
              <i className="fa-solid fa-chevron-left" />
            </button>

            <h1 className="text-xl font-bold font-display tracking-wide">
              Transactions
            </h1>
          </div>
        </header>

        {/* SCROLL CONTENT */}
        <div className="flex-1 overflow-y-auto w-full px-4 mt-4 pb-24 space-y-6">
          {/* TRANSACTIONS */}
          <section className="rounded-2xl bg-[#111827] border border-[#1F2937]">
            <RecentTransactions
              transactions={transactions}
              limit={0}
              showViewAll={false}
              title="All Transactions"
            />
          </section>

          {/* SECURITY NOTE */}
          <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-2">
            <i className="fa-solid fa-lock" /> Secure 256-bit encryption for all
            transactions
          </p>
        </div>
      </main>

      <BottomNav />
    </>
  );
}

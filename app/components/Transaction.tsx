"use client";

import { useRouter } from "next/navigation";
import { FaTrophy, FaMedal, FaWallet, FaUniversity, FaClock } from "react-icons/fa";

type Transaction = {
  id: string;
  type:
    | "win_final"
    | "win_half"
    | "entry"
    | "deposit"
    | "withdraw"
    | "win_timeout";
  title: string;
  subtitle: string;
  amount: number;
  status: "completed" | "pending";
};

const getTransactionConfig = (tx: Transaction) => {
  switch (tx.type) {
    case "win_final":
      return {
        icon: <FaTrophy />,
        iconBg: "bg-green-900/30 text-green-400",
        amountColor: "text-green-400",
        sign: "+",
      };

    case "win_half":
      return {
        icon: <FaMedal />,
        iconBg: "bg-green-900/30 text-green-400",
        amountColor: "text-green-400",
        sign: "+",
      };

    // ✅ NEW CASE
    case "win_timeout":
      return {
        icon: <FaClock />, // ⏱️ better visual for timeout win
        iconBg: "bg-green-900/30 text-green-400",
        amountColor: "text-green-400",
        sign: "+",
      };

    case "entry":
      return {
        icon: <FaWallet />,
        iconBg: "bg-orange-900/30 text-orange-400",
        amountColor: "text-red-400",
        sign: "-",
      };

    case "deposit":
      return {
        icon: <FaUniversity />,
        iconBg: "bg-blue-900/30 text-blue-400",
        amountColor: "text-green-400",
        sign: "+",
      };

    case "withdraw":
      return {
        icon: <FaUniversity />,
        iconBg: "bg-red-900/30 text-red-400",
        amountColor: "text-red-400",
        sign: "-",
      };

    default:
      return {};
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  return (
    <span
      className={`text-xs px-2 py-1 rounded-md font-medium ${
        status === "completed"
          ? "bg-green-900/40 text-green-400"
          : "bg-yellow-900/40 text-yellow-400"
      }`}
    >
      {status === "completed" ? "Completed" : "Pending"}
    </span>
  );
};

const TransactionItem = ({ tx }: { tx: Transaction }) => {
  const config = getTransactionConfig(tx);

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-800 hover:bg-gray-800/30 transition">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 flex items-center justify-center rounded-full ${config.iconBg}`}
        >
          {config.icon}
        </div>

        <div>
          <p className="font-medium">{tx.title}</p>
          <p className="text-xs text-gray-400">{tx.subtitle}</p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="text-right">
        <p className={`font-semibold ${config.amountColor}`}>
          {config.sign}${tx.amount.toFixed(2)}
        </p>
        <StatusBadge status={tx.status} />
      </div>
    </div>
  );
};

export default function RecentTransactions({
  transactions,
  limit = 5,
  showHeader = true,
  showViewAll = true,
  title = "Recent Transactions",
}: {
  transactions: Transaction[];
  limit?: number;
  showHeader?: boolean;
  showViewAll?: boolean;
  title?: string;
}) {
  const router = useRouter();
  const displayedTransactions = Array.isArray(transactions)
    ? limit
      ? transactions.slice(0, limit)
      : transactions
    : [];

  return (
    <section className="rounded-2xl bg-[#111827] border border-[#1F2937] overflow-hidden">
      {/* HEADER */}
      {showHeader && (
        <div className="p-4 border-b border-gray-800 bg-gray-800/30 flex justify-between items-center">
          <h3 className="text-lg font-bold">{title}</h3>

          {showViewAll && (
            <button
              className="text-xs font-medium text-blue-400 cursor-pointer"
              onClick={() => router.push("/transactions")}
            >
              View All
            </button>
          )}
        </div>
      )}

      {/* LIST */}
      <div className="flex flex-col">
        {displayedTransactions.length === 0 && (
          <p className="text-center text-gray-400 text-sm p-4">
            No transactions found
          </p>
        )}

        {displayedTransactions?.map((tx) => (
          <TransactionItem key={tx.id} tx={tx} />
        ))}
      </div>
    </section>
  );
}

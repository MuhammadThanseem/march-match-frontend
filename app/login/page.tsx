"use client";

import { useState } from "react";
import {
  FaArrowRight,
  FaChevronLeft,
  FaEnvelope,
  FaMobileScreen,
  FaStopwatch,
  FaCoins,
  FaTrophy,
} from "react-icons/fa6";
import httpService from "../utils/httpService";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<"phone" | "email" | null>(
    null,
  );
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [error, setError] = useState("");

  interface LoginResponse {
    token: string;
    user: { name: string; email?: string; mobile?: string; role?: string };
  }

  const handleLogin = async () => {
    const identifier =
      loginMethod === "phone"
        ? mobile.trim()
        : loginMethod === "email"
          ? email.trim()
          : "";

    if (!identifier || !password) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError(""); // clear previous error

    try {
      const response: any = await httpService.post<LoginResponse>(
        "/user/login",
        { identifier, password },
      );

      if (response.status == 200) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        if (
          response.data.user.role === "admin" ||
          response.data.user.role === "superadmin"
        ) {
          router.push("/admin/dashboard");
        } else {
          router.push("/home");
        }
      }
    } catch (err: any) {
      console.error(err);

      // 🔥 handle backend error message
      const message = "Invalid credentials. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center  text-white overflow-x-hidden">
      {/* MOBILE WRAPPER */}
      <main className="relative bg-[#0A0E17] w-full max-w-md mx-auto min-h-screen mx-auto flex flex-col justify-between z-10">
        {/* HERO */}
        <section className="px-6 py-4 flex flex-col items-center text-center mt-6">
          <div className="w-20 h-20 mb-6 rounded-2xl bg-[#111827] border border-orange-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(255,92,0,0.3)] animate-bounce">
            <FaTrophy className="text-4xl text-orange-500" />
          </div>

          <h1 className="font-display text-5xl font-bold uppercase leading-tight">
            Win Every <br />
            <span className="text-orange-500">Few Minutes</span>
          </h1>

          <p className="text-gray-400 mt-3 max-w-[280px]">
            Join the ultimate basketball pool. Fast action, real money.
          </p>
        </section>

        {/* INFO CARDS */}
        <section className="px-6 py-6 space-y-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 flex gap-4 border-l-4 border-cyan-400">
            <div className="w-10 h-10 rounded-full bg-cyan-400/20 flex items-center justify-center">
              <FaCoins className="text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold">$110 Total Pot</h3>
              <p className="text-sm text-gray-400">
                Just $11 to enter. Cash out at timeouts, halftime, and final
                score.
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 flex gap-4 border-l-4 border-orange-500">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
              <FaStopwatch className="text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold">10 Checkpoints</h3>
              <p className="text-sm text-gray-400">
                Win at 8 timeouts ($10), halftime ($10) & final score ($20).
              </p>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="px-6 py-4">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent mb-6"></div>

          <div className="flex justify-between px-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                4<span className="text-sm text-orange-400">&nbsp;MIN</span>
              </div>
              <div className="text-xs text-gray-500 uppercase">Action</div>
            </div>

            <div className="w-px h-8 bg-gray-700"></div>

            <div className="text-center">
              <div className="text-2xl font-bold">
                10<span className="text-sm text-cyan-400">&nbsp;WINS</span>
              </div>
              <div className="text-xs text-gray-500 uppercase">Per Game</div>
            </div>

            <div className="w-px h-8 bg-gray-700"></div>

            <div className="text-center">
              <div className="text-2xl font-bold">
                $110<span className="text-sm text-green-400">&nbsp;POT</span>
              </div>
              <div className="text-xs text-gray-500 uppercase">Total</div>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent mt-6"></div>
        </section>

        {/* AUTH BUTTONS */}
        <section className="px-6 py-2 space-y-3">
          {!loginMethod ? (
            <>
              <button
                onClick={() => setLoginMethod("phone")}
                className="w-full cursor-pointer p-4 rounded-xl bg-white/10 backdrop-blur-lg flex justify-between items-center hover:bg-white/20 transition"
              >
                <div className="flex gap-3 items-center">
                  <FaMobileScreen className="text-gray-400" />
                  <span className="font-medium">Continue with Phone</span>
                </div>
                <FaArrowRight className="text-orange-500" />
              </button>

              <button
                onClick={() => setLoginMethod("email")}
                className="w-full cursor-pointer p-4 rounded-xl bg-white/10 backdrop-blur-lg flex justify-between items-center hover:bg-white/20 transition"
              >
                <div className="flex gap-3 items-center">
                  <FaEnvelope className="text-gray-400" />
                  <span className="font-medium">Continue with Email</span>
                </div>
                <FaArrowRight className="text-orange-500" />
              </button>
            </>
          ) : (
            // LOGIN FORM
            <>
              {loginMethod === "phone" ? (
                <input
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value);
                    setError("");
                  }}
                  className="w-full p-4 rounded-xl bg-white/10 text-white placeholder-gray-400 backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              ) : (
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className="w-full p-4 rounded-xl bg-white/10 text-white placeholder-gray-400 backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              )}

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="w-full p-4 rounded-xl bg-white/10 text-white placeholder-gray-400 backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </>
          )}
        </section>

        {error && <div className="text-red-400 text-sm px-6 mt-2">{error}</div>}

        {/* CTA */}
        <section className="px-6 py-6">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 cursor-pointer rounded-xl bg-orange-500 text-white font-bold text-lg uppercase tracking-wide hover:bg-white hover:text-orange-500 transition shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? "Loading..." : "Continue"}
            <FaArrowRight />
          </button>
        </section>
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
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
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"phone" | "email" | null>(null);
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    mobile: "",
    password: "",
  });

  const [errors, setErrors] = useState<any>({});

  // Handle input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    setErrors((prev: any) => ({
      ...prev,
      [e.target.name]: "",
    }));
  };

  // Validation
  const validate = () => {
    const newErrors: any = {};

    if (!form.username) newErrors.username = "Username is required";
    if (!form.name) newErrors.name = "Name is required";
    if (!form.password) newErrors.password = "Password is required";

    if (authMode === "email") {
      if (!form.email) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(form.email))
        newErrors.email = "Invalid email";
    }

    if (authMode === "phone") {
      if (!form.mobile) newErrors.mobile = "Phone is required";
      else if (!/^\d{10}$/.test(form.mobile))
        newErrors.phone = "Invalid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      const basePayload: any = {
        username: form.username,
        name: form.name,
        password: form.password,
      };

      if (authMode === "email") {
        basePayload.email = form.email;
      }

      if (authMode === "phone") {
        basePayload.mobile = form.mobile;
      }

      const res: any = await httpService.post("/user/register", basePayload);

      if (res.data.status === 201) {
        toast.success("Account created successfully 🎉");
        router.push("/login");
      }
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center text-white overflow-x-hidden">
      {/* MOBILE WRAPPER */}
      <main className="relative w-full max-w-md mx-auto min-h-screen mx-auto  bg-[#0A0E17] flex flex-col justify-between z-10">
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
        {!authMode && (
          <section className="px-6 py-2 space-y-3">
            <button
              onClick={() => setAuthMode("phone")}
              className=" cursor-pointer w-full p-4 rounded-xl bg-white/10 flex justify-between items-center hover:bg-white/20 transition"
            >
              <div className="flex gap-3 items-center">
                <FaMobileScreen className="text-gray-400" />
                <span>Continue with Phone</span>
              </div>
              <FaArrowRight className="text-orange-500" />
            </button>

            <button
              onClick={() => setAuthMode("email")}
              className=" cursor-pointer w-full p-4 rounded-xl bg-white/10 flex justify-between items-center hover:bg-white/20 transition"
            >
              <div className="flex gap-3 items-center">
                <FaEnvelope className="text-gray-400" />
                <span>Continue with Email</span>
              </div>
              <FaArrowRight className="text-orange-500" />
            </button>
          </section>
        )}

        {/* FORM */}
        {authMode && (
          <section className="px-6 space-y-3">
            {/* Username */}
            <input
              name="username"
              placeholder="Username"
              onChange={handleChange}
              className={`w-full p-3 rounded bg-white/10 ${
                errors.username && "border border-red-500"
              }`}
            />
            {errors.username && (
              <p className="text-red-500 text-xs">{errors.username}</p>
            )}

            {/* Name */}
            <input
              name="name"
              placeholder="Name"
              onChange={handleChange}
              className={`w-full p-3 rounded bg-white/10 ${
                errors.name && "border border-red-500"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs">{errors.name}</p>
            )}

            {/* Email / Phone */}
            {authMode === "email" ? (
              <>
                <input
                  name="email"
                  placeholder="Email"
                  onChange={handleChange}
                  className={`w-full p-3 rounded bg-white/10 ${
                    errors.email && "border border-red-500"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email}</p>
                )}
              </>
            ) : (
              <>
                <input
                  name="mobile"
                  placeholder="Phone"
                  onChange={handleChange}
                  className={`w-full p-3 rounded bg-white/10 ${
                    errors.mobile && "border border-red-500"
                  }`}
                />
                {errors.mobile && (
                  <p className="text-red-500 text-xs">{errors.mobile}</p>
                )}
              </>
            )}

            {/* Password */}
            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              className={`w-full p-3 rounded bg-white/10 ${
                errors.password && "border border-red-500"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="cursor-pointer w-full py-3 bg-orange-500 rounded-lg font-bold flex justify-center items-center gap-2"
            >
              {loading ? "Please wait..." : "Sign In"}
              <FaArrowRight />
            </button>
          </section>
        )}

        {/* FOOTER */}
        <section className="px-6 pb-12 text-center mt-4">
          <p className="text-gray-400 text-sm">
            Already have an account?
            <Link
              href="/login"
              className="text-white ml-1 hover:text-orange-500 font-semibold"
            >
              Log in
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}

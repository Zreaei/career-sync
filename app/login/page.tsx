"use client";

import React, { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

export default function LoginPage() {
  const [role, setRole] = useState("mahasiswa");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left: Illustration Side */}
      <div className="hidden md:flex flex-col flex-1 bg-surface-container-low relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary-container/20" />
          {/* Decorative floating shapes */}
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-tertiary-fixed/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-primary-fixed/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "2s" }} />
        </div>
        <div className="relative z-10 max-w-lg text-center space-y-8">
          <div className="inline-flex items-center justify-center p-6 bg-surface-container-lowest rounded-full mb-4 shadow-ambient">
            <Icon name="account_balance" filled className="text-primary text-6xl" size={56} />
          </div>
          <h1 className="font-headline text-4xl lg:text-5xl font-bold text-on-background leading-tight">
            Bridge the Gap Between{" "}
            <span className="text-primary">Campus</span> and{" "}
            <span className="text-primary">Career</span>
          </h1>
          <p className="font-body text-lg text-on-surface-variant max-w-md mx-auto leading-relaxed">
            Join CareerSync to seamlessly transition from academic excellence to
            professional success. Connect, learn, and grow within a curated
            network.
          </p>
        </div>
      </div>

      {/* Right: Login Form Side */}
      <div className="flex-1 flex flex-col bg-surface-container-lowest relative z-10 w-full md:max-w-md lg:max-w-xl">
        {/* Header */}
        <header className="w-full px-8 py-6 flex items-center gap-3">
          <Icon name="school" filled className="text-primary text-3xl" size={28} />
          <span className="font-headline text-2xl font-bold text-primary tracking-tight">
            CareerSync
          </span>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 pb-12 w-full max-w-lg mx-auto">
          <div className="space-y-2 mb-10">
            <h2 className="font-headline text-3xl font-bold text-on-background">
              Welcome Back
            </h2>
            <p className="font-body text-on-surface-variant">
              Access your academic and professional portal.
            </p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Role Selector */}
            <div className="space-y-2">
              <label className="block font-label text-sm text-on-background">
                Select Role
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full appearance-none bg-surface-container-lowest border border-outline-variant text-on-background rounded-lg px-4 py-3.5 pr-10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body"
                >
                  <option value="mahasiswa">Mahasiswa</option>
                  <option value="hr">HR / Recruiter</option>
                  <option value="admin">Administrator</option>
                </select>
                <Icon
                  name="arrow_drop_down"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
                />
              </div>
            </div>

            {/* Email/NIM */}
            <div className="space-y-2">
              <label
                className="block font-label text-sm text-on-background"
                htmlFor="identifier"
              >
                Email Address or NIM
              </label>
              <div className="relative">
                <Icon
                  name="mail"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
                />
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-background rounded-lg pl-12 pr-4 py-3.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body placeholder:text-outline"
                  id="identifier"
                  placeholder="Enter your email or NIM"
                  type="text"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label
                  className="block font-label text-sm text-on-background"
                  htmlFor="password"
                >
                  Password
                </label>
                <Link
                  className="font-label text-sm text-primary hover:text-primary-container transition-colors"
                  href="#"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Icon
                  name="lock"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
                />
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-background rounded-lg pl-12 pr-12 py-3.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body placeholder:text-outline"
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-background transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <Icon name={showPassword ? "visibility" : "visibility_off"} />
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              className="w-full btn-gradient font-label font-bold rounded-lg py-4 mt-4 flex justify-center items-center gap-2 shadow-[0_4px_14px_rgb(9,76,178,0.25)]"
              type="submit"
            >
              Sign In
              <Icon name="arrow_forward" size={20} />
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 text-center font-body text-sm text-on-surface-variant">
            <p>
              By signing in, you agree to our{" "}
              <Link className="text-primary hover:underline" href="#">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link className="text-primary hover:underline" href="#">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

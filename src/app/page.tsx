"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function WelcomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Navbar */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 px-6 py-4 ${
          scrolled ? "bg-slate-900/80 backdrop-blur-md shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-xl font-bold italic">A</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white/90">
              Anime<span className="text-indigo-400">Verse</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Fitur</Link>
            <Link href="#about" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Tentang</Link>
            <Link
              href="/login"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/25"
            >
              Masuk
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/20 blur-[120px] rounded-full -z-10 animate-pulse" />
        <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-purple-600/20 blur-[100px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-medium mb-6 animate-bounce">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Platform Novel Anime No. 1
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            Jelajahi Dunia <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Novel Tanpa Batas
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 leading-relaxed mb-10">
            Dapatkan akses eksklusif ke ribuan chapter novel anime terbaik, kelola konten favoritmu, dan bergabunglah dengan komunitas pembaca terbesar.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-950 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-white/10"
            >
              Mulai Membaca
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
            <Link
              href="/auth/home/inputjudul"
              className="w-full sm:w-auto px-8 py-4 bg-slate-800/50 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all border border-white/10 hover:border-white/20"
            >
              Panel Penulis
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto border-t border-white/5 pt-10">
            <div>
              <div className="text-3xl font-bold mb-1">10k+</div>
              <div className="text-sm text-slate-500 uppercase tracking-widest font-semibold">Judul</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">500k+</div>
              <div className="text-sm text-slate-500 uppercase tracking-widest font-semibold">Chapter</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">1M+</div>
              <div className="text-sm text-slate-500 uppercase tracking-widest font-semibold">Pembaca</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">4.9/5</div>
              <div className="text-sm text-slate-500 uppercase tracking-widest font-semibold">Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Bottom */}
      <div className="h-32 bg-gradient-to-t from-[#0f172a] to-transparent w-full absolute bottom-0 pointer-events-none" />
    </div>
  );
}

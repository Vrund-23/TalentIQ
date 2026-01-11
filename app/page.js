import Link from 'next/link';
import { Terminal, Shield, User } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-indigo-500/10 rounded-full ring-1 ring-indigo-500/50">
            <Terminal className="w-16 h-16 text-indigo-400" />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          CodeArena
        </h1>

        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          The ultimate coding platform for BVM Engineering College.
          Master algorithms, compete with peers, and showcase your skills.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
          <Link
            href="/login"
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold text-lg transition-all shadow-lg shadow-indigo-500/25 flex items-center"
          >
            <User className="mr-2 w-5 h-5" />
            Login
          </Link>
          <Link
            href="/signup"
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg font-semibold text-lg transition-all flex items-center"
          >
            <Shield className="mr-2 w-5 h-5" />
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}

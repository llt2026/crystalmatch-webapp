import React from 'react';
import Image from 'next/image';

export default function LoadingScreen() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-[#1a1a2e] to-[#16213E]">
      <div className="text-center space-y-6">
        {/* Loading Animation */}
        <div className="relative w-24 h-24 mx-auto">
          {/* Outer Circle */}
          <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
          
          {/* Spinning Circle */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
          
          {/* Inner Glow */}
          <div className="absolute inset-4 rounded-full bg-purple-500/10 animate-pulse" />
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Reading the Stars
          </h2>
          <p className="text-purple-200 text-sm">
            Connecting with your cosmic energy...
          </p>
        </div>

        {/* Loading Tips */}
        <div className="max-w-sm mx-auto mt-12">
          <div className="glass-card p-4 rounded-xl text-center">
            <p className="text-purple-300 text-sm italic">
              "The universe works in perfect harmony. Trust the process as we align your energies."
            </p>
          </div>
        </div>
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl animate-float-delayed" />
      </div>
    </main>
  );
} 
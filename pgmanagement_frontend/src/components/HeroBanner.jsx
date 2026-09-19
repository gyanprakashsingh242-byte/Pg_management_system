import React from 'react';

export default function HeroBanner({ onOpenBulkModal, pendingCount, totalPendingAmount }) {
  return (
    <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950 text-white">
      {/* Background Ambience Image */}
      <img
        src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80"
        alt="Modern Building"
        className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-xs"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-indigo-950/80 to-slate-950/90" />

      {/* Foreground Content */}
      <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
            <span>⚡</span> Automated PG Operating System
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            54-Room Co-Living Dashboard
          </h2>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
            Floor 1, 2 aur 3 ke electricity sub-meters calculate karo aur ek single click me tenants ko WhatsApp bill dispatch karo.
          </p>
        </div>

        {/* Call to action floating card */}
        <div className="w-full md:w-auto bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-2xl space-y-3 min-w-[280px]">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-bold">Unpaid Dues Total:</span>
            <span className="text-rose-400 font-black text-sm">₹{totalPendingAmount.toLocaleString()}</span>
          </div>
          
          <button
            onClick={onOpenBulkModal}
            className="w-full py-3 px-5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-500/30 transition flex items-center justify-center gap-2"
          >
            <span>🚀</span> Send All {pendingCount} Bills on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
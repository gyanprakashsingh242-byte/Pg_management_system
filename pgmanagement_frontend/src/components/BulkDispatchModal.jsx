import React, { useState, useEffect } from 'react';
import { ELECTRICITY_RATE } from '../data/initialRooms';

export default function BulkDispatchModal({ rooms, isOpen, onClose }) {
  if (!isOpen) return null;

  const pendingRooms = rooms.filter((r) => !r.isPaid);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const getWhatsAppUrl = (room) => {
    const units = Math.max(0, room.currentMeter - room.prevMeter);
    const elecBill = units * ELECTRICITY_RATE;
    const total = room.rentAmount + elecBill;
    
    const message = 
`*--- PG RENT & UTILITY INVOICE ---*
*Room No:* #${room.roomNumber}
*Tenant:* ${room.tenantName}
*Month:* Current Billing Cycle

📌 *Bill Breakdown:*
• Base Rent: ₹${room.rentAmount.toLocaleString()}
• Electricity: ${units} units (₹${elecBill.toLocaleString()})
💰 *TOTAL PAYABLE:* ₹${total.toLocaleString()}

*Pay via UPI:* 9876543210@upi`;

    return `https://wa.me/${room.phone}?text=${encodeURIComponent(message)}`;
  };

  const handleStartDispatch = () => {
    setIsProcessing(true);
    let idx = 0;
    
    const interval = setInterval(() => {
      if (idx < pendingRooms.length) {
        window.open(getWhatsAppUrl(pendingRooms[idx]), '_blank');
        setCurrentIndex(idx + 1);
        idx++;
      } else {
        clearInterval(interval);
        setIsProcessing(false);
      }
    }, 1500); // 1.5s delay to prevent browser popup block
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl max-w-lg w-full p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-slate-900">Bulk WhatsApp Billing Queue</h3>
            <p className="text-xs text-slate-500 font-medium">Automatic dispatch for all unpaid tenants</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400">✕</button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-600">
            <span>Progress: {currentIndex} / {pendingRooms.length} Sent</span>
            <span>{Math.round((currentIndex / (pendingRooms.length || 1)) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(currentIndex / (pendingRooms.length || 1)) * 100}%` }}
            />
          </div>
        </div>

        <div className="max-h-48 overflow-y-auto space-y-2 pr-1 text-xs">
          {pendingRooms.map((r, i) => (
            <div key={r.roomNumber} className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-700">Room #{r.roomNumber} - {r.tenantName}</span>
              <span className={i < currentIndex ? "text-emerald-600 font-bold" : "text-slate-400 font-medium"}>
                {i < currentIndex ? "✓ Sent" : "Queued"}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button 
            disabled={isProcessing}
            onClick={handleStartDispatch} 
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-2xl text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
          >
            {isProcessing ? "Processing Queue..." : `🚀 Dispatch All ${pendingRooms.length} Bills Now`}
          </button>
        </div>
      </div>
    </div>
  );
}
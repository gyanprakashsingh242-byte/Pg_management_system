import React, { useState } from 'react';
import { ELECTRICITY_RATE } from '../data/initialRooms';

// Real Unsplash modern room images cycle
const ROOM_IMAGES = [
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80',
];

export default function RoomCard({ room, onStatusChange, onUpdateMeter }) {
  const [currentMeterInput, setCurrentMeterInput] = useState(room.currentMeter);

  const unitsConsumed = Math.max(0, currentMeterInput - room.prevMeter);
  const electricityBill = unitsConsumed * ELECTRICITY_RATE;
  const totalBillAmount = room.rentAmount + electricityBill;

  // Pick an image dynamically based on room number
  const imageIndex = parseInt(room.roomNumber, 10) % ROOM_IMAGES.length;
  const roomImage = ROOM_IMAGES[imageIndex];

  const sendWhatsAppInvoice = () => {
    const message = 
`*--- 🏢 PG RENT & UTILITY INVOICE ---*
*Room No:* #${room.roomNumber} (Floor ${room.floor})
*Tenant:* ${room.tenantName}
*Cycle:* Current Month

📌 *Bill Summary:*
• Base Room Rent: ₹${room.rentAmount.toLocaleString()}
• Electricity Meter: ${room.prevMeter} -> ${currentMeterInput} (${unitsConsumed} Units @ ₹${ELECTRICITY_RATE}/u)
• Electricity Bill: ₹${electricityBill.toLocaleString()}

💰 *TOTAL PAYABLE:* ₹${totalBillAmount.toLocaleString()}

*UPI Payment:* 9876543210@upi
_Please send payment receipt after transaction._`;

    window.open(`https://wa.me/${room.phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border border-slate-100 transition-all duration-300 transform hover:-translate-y-1">
      {/* Visual Image Header with Status Pill */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900">
        <img
          src={roomImage}
          alt={`Room ${room.roomNumber}`}
          className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Badges on Image */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-3 py-1 text-[11px] font-black tracking-wider uppercase rounded-full bg-slate-900/80 backdrop-blur-md text-indigo-300 border border-indigo-500/30">
            Floor {room.floor}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <button
            onClick={() => onStatusChange(room.roomNumber)}
            className={`px-3 py-1 text-xs font-black rounded-full backdrop-blur-md transition shadow-lg ${
              room.isPaid
                ? 'bg-emerald-500/90 text-white border border-emerald-300'
                : 'bg-rose-500/90 text-white border border-rose-300 animate-pulse'
            }`}
          >
            {room.isPaid ? '✓ Rent Paid' : '● Due Pending'}
          </button>
        </div>

        {/* Room Title & Tenant overlay */}
        <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end text-white">
          <div>
            <h3 className="text-2xl font-black tracking-tight">Room #{room.roomNumber}</h3>
            <p className="text-xs text-slate-300 font-medium flex items-center gap-1">
              👤 {room.tenantName}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Due</span>
            <span className="text-lg font-black text-amber-300">₹{totalBillAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Card Content & Meter Section */}
      <div className="p-5 space-y-4 bg-white">
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1">⚡ Electricity Units</span>
            <span className="text-indigo-600 font-black">₹{electricityBill.toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Previous</span>
              <input
                type="number"
                disabled
                value={room.prevMeter}
                className="w-full bg-slate-200/70 p-2 rounded-xl font-bold text-slate-600 text-center cursor-not-allowed"
              />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-700 block mb-1">Current</span>
              <input
                type="number"
                value={currentMeterInput}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCurrentMeterInput(val);
                  onUpdateMeter(room.roomNumber, val);
                }}
                className="w-full bg-white border-2 border-indigo-200 focus:border-indigo-600 p-2 rounded-xl font-bold text-slate-900 text-center focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* One-Click Action */}
        <button
          onClick={sendWhatsAppInvoice}
          className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
        >
          <span>📲</span> Send WhatsApp Bill (₹{totalBillAmount.toLocaleString()})
        </button>
      </div>
    </div>
  );
}
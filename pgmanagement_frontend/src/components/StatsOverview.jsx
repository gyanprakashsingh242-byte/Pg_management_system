import React from 'react';

export default function StatsOverview({ totalRentCollected, paidCount, totalPendingDues }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase">Total Capacity</p>
        <h3 className="text-2xl font-extrabold text-slate-900 mt-1">54 Rooms</h3>
        <p className="text-xs font-medium text-indigo-600 mt-1">18 Rooms / Floor</p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase">Collected Rent</p>
        <h3 className="text-2xl font-extrabold text-slate-900 mt-1">₹{totalRentCollected.toLocaleString()}</h3>
        <p className="text-xs font-medium text-emerald-600 mt-1">{paidCount} Rooms Paid</p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase">Pending Dues</p>
        <h3 className="text-2xl font-extrabold text-slate-900 mt-1">₹{totalPendingDues.toLocaleString()}</h3>
        <p className="text-xs font-medium text-rose-600 mt-1">{54 - paidCount} Rooms Pending</p>
      </div>
    </div>
  );
}
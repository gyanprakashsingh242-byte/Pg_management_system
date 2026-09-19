import React from "react";

function TenantStatus({ roomNumber, tenantName, rentAmount, isPaid, onStatusChange }) {
  return (
    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Room {roomNumber}</h3>
        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
          isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
        }`}>
          {isPaid ? '🟢 Paid' : '🔴 Pending'}
        </span>
      </div>

      <p className="text-sm text-slate-600"><span className="font-semibold">Tenant:</span> {tenantName}</p>
      <p className="text-sm text-slate-600"><span className="font-semibold">Rent:</span> ₹{rentAmount}</p>

      <button 
        className={`w-full font-bold py-2 px-4 rounded-xl text-white text-xs transition mt-2 ${
          isPaid ? 'bg-slate-600 hover:bg-slate-700' : 'bg-blue-600 hover:bg-blue-700'
        }`} 
        onClick={onStatusChange}
      >
        {isPaid ? 'Mark as Not Paid' : 'Mark as Paid'}
      </button>
    </div>
  );
}

export default TenantStatus;

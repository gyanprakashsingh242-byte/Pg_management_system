import React from 'react';

export default function FilterBar({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  selectedFloor,
  setSelectedFloor,
}) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search by Room (e.g. 108, 215) or Tenant Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-80 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {/* Status Filter */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          {['all', 'paid', 'unpaid'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`flex-1 md:px-4 py-1.5 text-xs font-bold capitalize rounded-lg transition ${
                statusFilter === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Floor Navigation Tabs */}
      <div className="flex border-t border-slate-100 pt-3 gap-2">
        <span className="text-xs font-bold text-slate-400 flex items-center pr-2">Floors:</span>
        {['all', '1', '2', '3'].map((fl) => (
          <button
            key={fl}
            onClick={() => setSelectedFloor(fl)}
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
              selectedFloor === fl
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {fl === 'all' ? 'All 3 Floors (54)' : `Floor ${fl} (18 Rooms)`}
          </button>
        ))}
      </div>
    </div>
  );
}
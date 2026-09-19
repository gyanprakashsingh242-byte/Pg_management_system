import React, { useState, useEffect, useCallback } from 'react';
import { roomApi, exportReport } from './api/client';
import LoginModal from './components/LoginModal';
import MeterInput from './components/MeterInput';
import TenantDrawer from './components/TenantDrawer';
import InlineRentEdit from './components/InlineRentEdit';

const ELECTRICITY_RATE = 10;

const ROOM_IMAGES = [
  'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1540518614846-7ede433c4b49?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=700&q=80',
];
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=700&q=80';

export default function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [electricityRate, setElectricityRate] = useState(10);
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [isDispatching, setIsDispatching] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isTenantDrawerOpen, setIsTenantDrawerOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const isAdmin = currentUser?.role === 'ROLE_ADMIN' || currentUser?.role === 'ADMIN';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const handleUpdateRent = async (roomNumber, newRent) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.roomNumber === roomNumber ? { ...r, baseRent: newRent } : r
      )
    );

    try {
      await roomApi.updateRent(roomNumber, newRent);
    } catch (err) {
      console.error(`Failed to update rent for Suite #${roomNumber}:`, err);
      alert('Failed to update base rent: ' + (err.response?.data?.message || err.message));
      loadRooms();
    }
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      setCurrentUser(null);
      setIsLoginModalOpen(true);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      const res = await roomApi.getRooms(selectedFloor);
      setRooms(res.data);
    } catch (err) {
      console.error('Failed to fetch rooms from backend:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedFloor]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const handleExport = async () => {
    try {
      setExporting(true);
      await exportReport(electricityRate);
    } catch (err) {
      let errorMsg = 'Export failed';
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text);
          errorMsg = parsed.message || parsed.error || text;
        } catch {
          errorMsg = `Server error (Status: ${err.response.status})`;
        }
      } else {
        errorMsg = err.response?.data?.message || err.message;
      }
      console.error('Export error details:', err.response?.status, errorMsg);
      alert(`Export failed (${err.response?.status || 'Network Error'}): ${errorMsg}`);
    } finally {
      setExporting(false);
    }
  };

  const handleStatusChange = async (roomNumber) => {
    try {
      const res = await roomApi.toggleStatus(roomNumber);
      setRooms((prev) =>
        prev.map((r) => (r.roomNumber === roomNumber ? { ...r, paid: res.data.paid } : r))
      );
    } catch (err) {
      alert('Failed to update payment status in database: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateMeter = async (roomNumber, newReading) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.roomNumber === roomNumber ? { ...r, currentMeter: newReading } : r
      )
    );

    try {
      await roomApi.updateMeter(roomNumber, newReading);
    } catch (err) {
      console.error(`Failed to sync meter for Suite #${roomNumber}:`, err);
    }
  };

  const sendSingleWhatsApp = (room) => {
    const units = Math.max(0, room.currentMeter - room.previousMeter);
    const elecBill = units * electricityRate;
    const total = room.baseRent + elecBill;

    const message =
`*🌿 Living Peace Residencies — Rent & Utility Invoice*
*Room:* #${room.roomNumber} (Floor ${room.floor})
*Resident:* ${room.tenantName}

• Room Rent: ₹${room.baseRent.toLocaleString()}
• Power Units: ${room.previousMeter} -> ${room.currentMeter} (${units} units @ ₹${electricityRate}/unit)
• Power Dues: ₹${elecBill.toLocaleString()}

*Total Payable:* ₹${total.toLocaleString()}
UPI: peace@upi

_Wishing you a peaceful and productive stay ahead._`;

    window.open(`https://wa.me/${room.tenantPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleBulkDispatch = () => {
    const pendingList = rooms.filter((r) => !r.paid);
    if (pendingList.length === 0) return;

    setIsDispatching(true);
    let index = 0;

    const timer = setInterval(() => {
      if (index < pendingList.length) {
        sendSingleWhatsApp(pendingList[index]);
        setBulkProgress(Math.round(((index + 1) / pendingList.length) * 100));
        index++;
      } else {
        clearInterval(timer);
        setIsDispatching(false);
        setTimeout(() => setIsBulkModalOpen(false), 900);
      }
    }, 1500);
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesStatus =
      statusFilter === 'all' ? true : statusFilter === 'paid' ? room.paid : !room.paid;
    const matchesSearch =
      room.roomNumber.includes(searchTerm) ||
      room.tenantName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const totalCollected = rooms.reduce((acc, r) => acc + (r.paid ? r.baseRent : 0), 0);
  const totalPending = rooms.reduce((acc, r) => acc + (!r.paid ? r.baseRent : 0), 0);
  const paidCount = rooms.filter((r) => r.paid).length;
  const pendingCount = rooms.length - paidCount;

  return (
    <div className="relative min-h-screen font-sans text-stone-800 selection:bg-emerald-100 selection:text-emerald-900 pb-20">
      {/* Background Layer */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-stone-950/75 backdrop-blur-[6px]" />
      </div>

      <div className="relative z-10">
        <header className="border-b border-white/10 bg-stone-900/60 backdrop-blur-xl sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-700/80 border border-emerald-500/30 flex items-center justify-center font-serif text-white text-lg">
                🕊️
              </div>
              <div>
                <h1 className="font-medium text-lg tracking-wide text-stone-100 font-serif">
                  Living Peace Residencies
                </h1>
                <p className="text-[11px] text-stone-400">
                  "Peace of mind is the greatest luxury."
                </p>
              </div>
            </div>

            {/* Controls & User Session */}
            <div className="flex items-center gap-3">
              {/* Dynamic Unit Rate Input */}
              <div className="flex items-center gap-2 bg-stone-800/80 border border-white/10 px-3 py-1.5 rounded-xl">
                <span className="text-xs text-stone-300 font-medium">Rate:</span>
                <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs">
                  <span>₹</span>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={electricityRate}
                    onChange={(e) => setElectricityRate(Number(e.target.value) || 1)}
                    className="w-10 bg-stone-900 border border-emerald-500/40 rounded px-1 py-0.5 text-center text-white focus:outline-none"
                  />
                  <span className="text-stone-400 text-[10px]">/u</span>
                </div>
              </div>

              {/* Export to Excel Button (Admin Only) */}
              {isAdmin && (
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="px-3 py-1.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-600/50 text-xs font-medium transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  title="Download complete ledger for Excel"
                >
                  <span>📊</span>
                  <span>{exporting ? 'Exporting...' : 'Export Excel'}</span>
                </button>
              )}

              {/* Residents Directory Toggle (Admin Only) */}
              {isAdmin && (
                <button
                  onClick={() => setIsTenantDrawerOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition flex items-center gap-1.5"
                >
                  <span>🪪</span> Residents
                </button>
              )}

              {/* Auth State Button */}
              {currentUser ? (
                <div className="flex items-center gap-2 bg-stone-800/80 border border-white/10 px-3 py-1.5 rounded-xl text-xs">
                  <span className="text-emerald-300 font-medium">👤 {currentUser.username}</span>
                  <span className="text-[10px] bg-emerald-900/80 text-emerald-200 px-1.5 py-0.5 rounded border border-emerald-700/40 uppercase">
                    {currentUser.role?.replace('ROLE_', '')}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-stone-400 hover:text-rose-400 ml-1 font-bold"
                    title="Log out"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-white/10 text-xs font-medium transition"
                >
                  Admin Login
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 pt-8 space-y-8">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-stone-900/50 backdrop-blur-md border border-white/10 p-5 rounded-2xl text-stone-200">
              <p className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">Database Records</p>
              <h3 className="text-2xl font-serif text-white mt-1">{rooms.length} Living Spaces</h3>
              <p className="text-xs text-stone-400 mt-1">Live from MySQL Service</p>
            </div>

            <div className="bg-stone-900/50 backdrop-blur-md border border-white/10 p-5 rounded-2xl text-stone-200">
              <p className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">Settled Accounts</p>
              <h3 className="text-2xl font-serif text-emerald-300 mt-1">₹{totalCollected.toLocaleString()}</h3>
              <p className="text-xs text-emerald-400/80 mt-1">{paidCount} Residents Clear</p>
            </div>

            <div className="bg-stone-900/50 backdrop-blur-md border border-white/10 p-5 rounded-2xl text-stone-200">
              <p className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">Pending Settlements</p>
              <h3 className="text-2xl font-serif text-amber-300 mt-1">₹{totalPending.toLocaleString()}</h3>
              <p className="text-xs text-amber-400/80 mt-1">{pendingCount} Accounts Awaiting</p>
            </div>
          </div>

          {/* Search & Floor Filters */}
          <div className="bg-stone-900/50 backdrop-blur-md border border-white/10 p-4 rounded-2xl space-y-3">
            <div className="flex flex-col md:flex-row justify-between gap-3 items-center">
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder="Search space (e.g. 104, 212) or resident..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-950/60 border border-white/10 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="flex bg-stone-950/60 border border-white/10 p-1 rounded-xl w-full md:w-auto">
                {['all', 'paid', 'unpaid'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`flex-1 md:px-5 py-1.5 text-xs rounded-lg capitalize transition ${
                      statusFilter === f
                        ? 'bg-stone-800 text-stone-100 font-medium shadow-sm'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
              <span className="text-xs text-stone-400 mr-2">Floor:</span>
              {['all', '1', '2', '3'].map((fl) => (
                <button
                  key={fl}
                  onClick={() => setSelectedFloor(fl)}
                  className={`px-3.5 py-1.5 text-xs rounded-lg transition ${
                    selectedFloor === fl
                      ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-700/50'
                      : 'bg-stone-950/40 text-stone-400 hover:text-stone-200 border border-white/5'
                  }`}
                >
                  {fl === 'all' ? 'All Spaces (54)' : `Floor ${fl}`}
                </button>
              ))}
            </div>
          </div>

          {/* Loading or Room Cards */}
          {loading ? (
            <div className="text-center py-20 text-stone-400 font-serif">
              Connecting to Spring Boot MySQL backend...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRooms.map((room) => {
                const roomInt = parseInt(room.roomNumber, 10) || 1;
                const imageIndex = Math.abs(roomInt) % ROOM_IMAGES.length;
                const cardImage = ROOM_IMAGES[imageIndex];
                const units = Math.max(0, (room.currentMeter || 0) - (room.previousMeter || 0));
                const elecBill = units * electricityRate;
                const totalAmount = (room.baseRent || 0) + elecBill;

                return (
                  <div
                    key={room.roomNumber}
                    className="bg-stone-900/60 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Banner Image */}
                      <div className="relative h-36 w-full overflow-hidden bg-stone-950">
                        <img
                          src={cardImage}
                          alt={`Space ${room.roomNumber}`}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_IMAGE;
                          }}
                          className="w-full h-full object-cover opacity-80 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />

                        <div className="absolute top-2.5 left-3">
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-900/80 text-stone-300 border border-white/10">
                            Floor {room.floor}
                          </span>
                        </div>

                        <div className="absolute top-2.5 right-3">
                          <button
                            onClick={() => handleStatusChange(room.roomNumber)}
                            className={`px-2.5 py-0.5 text-[11px] rounded-full font-medium transition ${
                              room.paid
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50'
                                : 'bg-amber-950/80 text-amber-300 border border-amber-700/50'
                            }`}
                          >
                            {room.paid ? 'Settled' : 'Pending'}
                          </button>
                        </div>

                        <div className="absolute bottom-2.5 left-3 right-3 flex justify-between items-end text-white">
                          <div>
                            <h4 className="font-serif text-lg text-stone-100">Space #{room.roomNumber}</h4>
                            <p className="text-[11px] text-stone-300">{room.tenantName}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] uppercase text-stone-400 block">Total</span>
                            <span className="font-serif text-base text-emerald-300">₹{totalAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Content & Details */}
                      <div className="p-4 space-y-3">
                        {/* Base Rent Row with Inline Editing */}
                        <div className="flex justify-between items-center bg-stone-950/40 border border-white/5 px-3 py-1.5 rounded-xl">
                          <span className="text-[10px] uppercase text-stone-400">Base Tariff</span>
                          <InlineRentEdit
                            roomNumber={room.roomNumber}
                            initialRent={room.baseRent}
                            isAdmin={isAdmin}
                            onSave={handleUpdateRent}
                          />
                        </div>

                        {/* Sub-Meter Reading & Live Inputs */}
                        <div className="bg-stone-950/50 border border-white/5 p-2.5 rounded-xl space-y-1.5 text-xs">
                          <div className="flex justify-between text-stone-400">
                            <span>Sub-Meter Usage:</span>
                            <span className="text-stone-200 font-medium">
                              {units} units (₹{elecBill.toLocaleString()})
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div>
                              <span className="text-[9px] uppercase text-stone-500 block">Previous</span>
                              <input
                                type="number"
                                disabled
                                value={room.previousMeter || 0}
                                className="w-full bg-stone-900 border border-white/5 p-1 rounded text-center text-stone-400 text-xs"
                              />
                            </div>
                            <div>
                              <span className="text-[9px] uppercase text-emerald-400 block">Current (Live DB)</span>
                              <MeterInput
                                initialValue={room.currentMeter}
                                onDebouncedSave={(val) => handleUpdateMeter(room.roomNumber, val)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp Notice Button */}
                    <div className="p-4 pt-0">
                      <button
                        onClick={() => sendSingleWhatsApp(room)}
                        className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded-xl border border-white/5 transition flex items-center justify-center gap-1.5"
                      >
                        <span>🕊️</span> Send Individual Notice
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer Dispatch */}
          <div className="border-t border-white/10 pt-10 pb-6 space-y-6">
            <div className="bg-stone-900/80 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-1 text-center md:text-left">
                <h4 className="font-serif text-xl text-stone-100">Monthly Cycle Review Completed?</h4>
                <p className="text-xs text-stone-400 max-w-md">
                  All updates sync directly with your database. Verify values before bulk notifying.
                </p>
              </div>

              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="px-6 py-3.5 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 text-xs font-medium rounded-xl border border-emerald-600/50 shadow-lg shadow-emerald-950/40 transition flex items-center gap-2"
              >
                <span>📬</span> Dispatch All {pendingCount} Pending Invoices
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Bulk Dispatch Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
          <div className="bg-stone-900 border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-5 text-stone-200">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-serif text-lg text-stone-100">Dispatch Pending Invoices</h4>
                <p className="text-xs text-stone-400">Sending to {pendingCount} residents at ₹{electricityRate}/unit</p>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="text-stone-400 hover:text-stone-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-stone-400">
                <span>Progress</span>
                <span>{bulkProgress}%</span>
              </div>
              <div className="w-full bg-stone-950 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${bulkProgress}%` }}
                />
              </div>
            </div>

            <button
              disabled={isDispatching || pendingCount === 0}
              onClick={handleBulkDispatch}
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-emerald-100 font-medium text-xs rounded-xl transition"
            >
              {isDispatching ? 'Notifying residents peacefully...' : `Confirm & Send ${pendingCount} Invoices`}
            </button>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />

      {/* Resident Directory Drawer */}
      <TenantDrawer
        isOpen={isTenantDrawerOpen}
        onClose={() => setIsTenantDrawerOpen(false)}
        currentUser={currentUser}
        onTenantUpdated={loadRooms}
      />
    </div>
  );
}
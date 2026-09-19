import React, { useState, useEffect } from 'react';
import { tenantApi } from '../api/client';

export default function TenantDrawer({ isOpen, onClose, currentUser, onTenantUpdated }) {
  const isAdmin = currentUser?.role === 'ROLE_ADMIN' || currentUser?.role === 'ADMIN';

  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    emergencyContact: '',
    roomNumber: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  // Pre-generate 54 valid room options (101-118, 201-218, 301-318)
  const roomOptions = [1, 2, 3].flatMap((floor) =>
    Array.from({ length: 18 }, (_, i) => `${floor}${String(i + 1).padStart(2, '0')}`)
  );

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await tenantApi.getTenants();
      setTenants(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch tenants:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to fetch tenants.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', phone: '', emergencyContact: '', roomNumber: '' });
    setErrorMsg('');
  };

  useEffect(() => {
    if (isOpen) {
      fetchTenants();
      resetForm();
    }
  }, [isOpen]);

  const handleEditClick = (tenant) => {
    setEditingId(tenant.id);
    setFormData({
      name: tenant.name,
      phone: tenant.phone,
      emergencyContact: tenant.emergencyContact || '',
      roomNumber: tenant.assignedRoomNumber && tenant.assignedRoomNumber !== 'Unassigned' ? tenant.assignedRoomNumber : '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    try {
      if (editingId) {
        await tenantApi.updateTenant(editingId, formData);
      } else {
        await tenantApi.createTenant(formData);
      }
      resetForm();
      fetchTenants();
      if (onTenantUpdated) onTenantUpdated();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error saving tenant data.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this resident?')) return;
    try {
      await tenantApi.deleteTenant(id);
      setTenants((prev) => prev.filter((t) => t.id !== id));
      if (onTenantUpdated) onTenantUpdated();
    } catch (err) {
      alert('Failed to remove tenant: ' + (err.response?.data?.message || err.message));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-stone-900 border-l border-white/10 h-full p-6 flex flex-col justify-between shadow-2xl text-stone-200 overflow-y-auto">
        
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🪪</span>
              <div>
                <h3 className="font-serif text-lg text-stone-100">Resident Directory</h3>
                <p className="text-[11px] text-stone-400">
                  {isAdmin ? 'Admin Mode (Full Access)' : 'Caretaker View (Read-Only)'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-100 text-lg transition">✕</button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-rose-950/60 border border-rose-800/40 text-rose-300 text-xs px-3 py-2 rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Form: SIRF ADMIN KO DIKHEGA */}
          {isAdmin ? (
            <div className="bg-stone-950/60 border border-white/5 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-serif text-sm text-stone-200">
                  {editingId ? 'Edit Resident Profile' : 'Register New Resident'}
                </h4>
                {editingId && (
                  <button onClick={resetForm} className="text-[10px] text-amber-400 hover:underline">
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] uppercase text-stone-400 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-stone-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase text-stone-400 block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="919876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-stone-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] uppercase text-stone-400 block mb-1">Emergency Contact</label>
                    <input
                      type="tel"
                      placeholder="Parent/Guardian Phone"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      className="w-full bg-stone-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase text-stone-400 block mb-1">Assign Space</label>
                    <select
                      value={formData.roomNumber}
                      onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                      className="w-full bg-stone-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="">Unassigned</option>
                      {roomOptions.map((r) => (
                        <option key={r} value={r}>Space #{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2 bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-emerald-100 font-medium text-xs rounded-xl transition"
                >
                  {saving ? 'Processing...' : editingId ? 'Update Resident Details' : 'Add Resident to System'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-stone-950/30 border border-white/5 p-3 rounded-xl text-center">
              <p className="text-xs text-stone-400">
                🔒 Adding or modifying residents requires <span className="text-emerald-400">Admin</span> privileges.
              </p>
            </div>
          )}

          {/* Tenant List */}
          <div className="space-y-2">
            <h4 className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">
              Registered Residents ({tenants.length})
            </h4>

            {loading ? (
              <div className="text-center py-8 text-xs text-stone-400 font-serif">
                Loading resident records...
              </div>
            ) : tenants.length === 0 ? (
              <div className="text-center py-8 text-xs text-stone-500">
                No residents found in directory.
              </div>
            ) : (
              <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                {tenants.map((t) => (
                  <div key={t.id} className="bg-stone-950/40 border border-white/5 rounded-xl p-3 flex justify-between items-center text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-stone-200">{t.name}</span>
                        <span className="text-[10px] bg-stone-800 text-emerald-300 px-2 py-0.5 rounded border border-white/5">
                          {t.assignedRoomNumber && t.assignedRoomNumber !== 'Unassigned'
                            ? `Space #${t.assignedRoomNumber}`
                            : 'Unassigned'}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5">{t.phone}</p>
                      {t.emergencyContact && (
                        <p className="text-[10px] text-stone-500">Emergency: {t.emergencyContact}</p>
                      )}
                    </div>

                    {/* Edit & Remove buttons: SIRF ADMIN KO DIKHENGE */}
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(t)}
                          className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] border border-white/5 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-[11px] border border-rose-800/40 transition"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
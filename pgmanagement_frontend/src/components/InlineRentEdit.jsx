import React, { useState } from 'react';

export default function InlineRentEdit({ roomNumber, initialRent, isAdmin, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [rentVal, setRentVal] = useState(initialRent || 0);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (Number(rentVal) <= 0) {
      alert('Rent must be greater than zero.');
      return;
    }
    try {
      setSaving(true);
      await onSave(roomNumber, Number(rentVal));
      setIsEditing(false);
    } catch (err) {
      alert('Failed to update rent: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setRentVal(initialRent);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-1.5 text-stone-300 text-xs">
        <span>Rent: <strong className="text-white font-serif">₹{Number(initialRent).toLocaleString()}</strong></span>
        {isAdmin && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-stone-400 hover:text-emerald-400 text-[11px] p-0.5 transition"
            title="Edit Base Rent"
          >
            ✏️
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 bg-stone-950/80 border border-emerald-500/40 px-1.5 py-0.5 rounded-lg">
      <span className="text-[11px] text-emerald-400 font-bold">₹</span>
      <input
        type="number"
        value={rentVal}
        disabled={saving}
        onChange={(e) => setRentVal(e.target.value)}
        className="w-16 bg-transparent text-white text-xs text-center focus:outline-none"
        autoFocus
      />
      <button
        disabled={saving}
        onClick={handleSave}
        className="text-emerald-400 hover:text-emerald-300 text-xs font-bold px-1"
        title="Save"
      >
        ✓
      </button>
      <button
        disabled={saving}
        onClick={handleCancel}
        className="text-rose-400 hover:text-rose-300 text-xs font-bold px-1"
        title="Cancel"
      >
        ✕
      </button>
    </div>
  );
}
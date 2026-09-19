import React, { useState } from 'react';
import { authApi } from '../api/client';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await authApi.login(username, password);
      const { token, username: user, role } = response.data;

      // Store auth session
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ username: user, role }));

      if (onLoginSuccess) {
        onLoginSuccess({ username: user, role });
      }
      onClose();
    } catch (err) {
      const message =
        err.response?.data?.message || 'Invalid username or password. Please try again.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
      <div className="bg-stone-900 border border-white/10 rounded-3xl max-w-sm w-full p-6 space-y-6 text-stone-200 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-100 transition text-lg"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5 text-center">
          <div className="h-12 w-12 rounded-2xl bg-emerald-700/80 border border-emerald-500/30 flex items-center justify-center font-serif text-white text-xl mx-auto mb-2">
            🔐
          </div>
          <h3 className="font-serif text-xl text-stone-100">Portal Authentication</h3>
          <p className="text-xs text-stone-400">
            Sign in to access administrative billing operations
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-rose-950/60 border border-rose-800/60 p-3 rounded-xl text-xs text-rose-300 text-center">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-stone-400 uppercase tracking-wider text-[10px] font-medium block">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin or caretaker"
              className="w-full bg-stone-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-stone-400 uppercase tracking-wider text-[10px] font-medium block">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-stone-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-emerald-100 font-medium rounded-xl border border-emerald-600/50 shadow-lg shadow-emerald-950/40 transition flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-[10px] text-stone-500">
          Restricted Access • Authorized Living Peace Personnel Only
        </p>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect, useRef } from 'react';
import { Timer, Play, Square, Trash2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Contraction {
  id: string;
  startTime: number;
  endTime: number | null;
  duration: number | null; // seconds
  gap: number | null;       // seconds since previous ended
}

function formatSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${s}s`;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function ContractionTimer() {
  const [contractions, setContractions] = useState<Contraction[]>([]);
  const [active, setActive] = useState<Contraction | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (active) {
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - active.startTime) / 1000));
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsed(0);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [active]);

  function startContraction() {
    const c: Contraction = { id: crypto.randomUUID(), startTime: Date.now(), endTime: null, duration: null, gap: null };
    setActive(c);
  }

  function stopContraction() {
    if (!active) return;
    const endTime = Date.now();
    const duration = Math.floor((endTime - active.startTime) / 1000);

    const prev = contractions[contractions.length - 1];
    const gap = prev?.endTime ? Math.floor((active.startTime - prev.endTime) / 1000) : null;

    const finished: Contraction = { ...active, endTime, duration, gap };
    setContractions((prev) => [...prev, finished]);
    setActive(null);
  }

  function clearAll() {
    if (!confirm('Clear all contractions?')) return;
    setContractions([]);
    setActive(null);
  }

  // Stats
  const recent = contractions.slice(-5);
  const avgDuration = recent.length
    ? Math.round(recent.reduce((s, c) => s + (c.duration ?? 0), 0) / recent.length)
    : null;
  const avgGap = recent.filter((c) => c.gap !== null).length
    ? Math.round(recent.filter((c) => c.gap !== null).reduce((s, c) => s + (c.gap ?? 0), 0) / recent.filter((c) => c.gap !== null).length)
    : null;

  // 5-1-1 rule: contractions ≥5/hr, lasting ≥1 min, for ≥1 hr
  const alert511 = avgGap !== null && avgGap <= 300 && avgDuration !== null && avgDuration >= 45 && contractions.length >= 5;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl text-brand-crimson mb-1">Contraction Timer</h2>
        <p className="text-sm text-gray-500">Tap Start when a contraction begins, Stop when it ends.</p>
      </div>

      {/* Big tap button */}
      <div className="flex flex-col items-center gap-4 py-6">
        {active ? (
          <>
            <div className="text-5xl font-mono font-bold tabular-nums" style={{ color: '#8B1A2B' }}>
              {formatSeconds(elapsed)}
            </div>
            <p className="text-xs text-gray-400 animate-pulse">Contraction in progress…</p>
            <button
              onClick={stopContraction}
              className="w-36 h-36 rounded-full flex flex-col items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
              style={{ backgroundColor: '#8B1A2B' }}
            >
              <Square size={32} className="text-white" fill="white" />
              <span className="text-white font-semibold text-sm">STOP</span>
            </button>
          </>
        ) : (
          <>
            <div className="text-5xl font-mono font-bold tabular-nums text-gray-200 dark:text-gray-700">
              {contractions.length > 0 ? formatSeconds(contractions[contractions.length - 1].duration ?? 0) : '0s'}
            </div>
            <p className="text-xs text-gray-400">
              {contractions.length === 0 ? 'Ready to start tracking' : `Last: ${formatSeconds(contractions[contractions.length - 1].duration ?? 0)}`}
            </p>
            <button
              onClick={startContraction}
              className="w-36 h-36 rounded-full flex flex-col items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
              style={{ backgroundColor: '#C9A84C' }}
            >
              <Play size={32} className="text-white" fill="white" />
              <span className="text-white font-semibold text-sm">START</span>
            </button>
          </>
        )}
      </div>

      {/* Stats row */}
      {contractions.length >= 2 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 text-center">
            <p className="text-2xl font-bold" style={{ color: '#8B1A2B' }}>{contractions.length}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Total</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 text-center">
            <p className="text-2xl font-bold" style={{ color: '#8B1A2B' }}>
              {avgDuration !== null ? formatSeconds(avgDuration) : '—'}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">Avg Duration</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 text-center">
            <p className="text-2xl font-bold" style={{ color: '#8B1A2B' }}>
              {avgGap !== null ? formatSeconds(avgGap) : '—'}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">Avg Gap</p>
          </div>
        </div>
      )}

      {/* 5-1-1 alert */}
      {alert511 && (
        <div className="flex items-start gap-3 p-4 rounded-xl border" style={{ backgroundColor: '#fff5f5', borderColor: '#f87171' }}>
          <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">5-1-1 Pattern Detected</p>
            <p className="text-xs text-red-600 mt-0.5">
              Contractions are ~{formatSeconds(avgGap!)} apart and lasting ~{formatSeconds(avgDuration!)}.
              If this has been going on for an hour, contact your provider or head to the hospital.
            </p>
          </div>
        </div>
      )}

      {/* Log */}
      {contractions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Timer size={14} /> Log
            </h3>
            <button onClick={clearAll} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 size={12} /> Clear
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[...contractions].reverse().map((c, idx) => (
              <div
                key={c.id}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm',
                  idx === 0 ? 'bg-brand-crimson/5 border border-brand-crimson/15' : 'bg-gray-50 dark:bg-gray-800/50'
                )}
              >
                <span className="text-gray-500 text-xs w-16">{formatTime(c.startTime)}</span>
                <span className="font-semibold" style={{ color: '#8B1A2B' }}>
                  {c.duration !== null ? formatSeconds(c.duration) : '—'}
                </span>
                <span className="text-gray-400 text-xs">
                  {c.gap !== null ? `gap ${formatSeconds(c.gap)}` : 'first'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guide */}
      <div className="rounded-xl p-4 border border-brand-gold/25 text-xs text-gray-500 space-y-1" style={{ backgroundColor: '#FAF8F3' }}>
        <p className="font-semibold text-gray-700">When to go to the hospital (5-1-1 rule):</p>
        <p>Contractions every <strong>5 minutes</strong>, lasting <strong>1 minute</strong> each, for at least <strong>1 hour</strong>.</p>
        <p className="text-gray-400">Always call your provider if you're unsure — they'd rather hear from you.</p>
      </div>
    </div>
  );
}

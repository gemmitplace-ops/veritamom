'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Baby, BarChart2, Table2, Pencil, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── WHO Growth Standard Data (0–24 months) ──────────────────────────
// Source: WHO Child Growth Standards 2006
// Percentiles: P3, P15, P50, P85, P97
// Index = age in months (0–24)

const WHO_GIRLS = {
  weight: {
    P3:  [2.4,3.2,4.0,4.6,5.1,5.5,5.8,6.1,6.3,6.6,6.8,7.0,7.2,7.5,7.7,7.9,8.1,8.3,8.5,8.7,8.9,9.0,9.2,9.4,9.6],
    P15: [2.8,3.7,4.6,5.2,5.7,6.1,6.5,6.8,7.0,7.3,7.5,7.8,8.0,8.2,8.4,8.6,8.8,9.0,9.2,9.4,9.6,9.8,10.1,10.3,10.5],
    P50: [3.2,4.2,5.1,5.8,6.4,6.9,7.3,7.6,7.9,8.2,8.5,8.7,9.0,9.2,9.4,9.6,9.8,10.0,10.2,10.4,10.6,10.9,11.1,11.3,11.5],
    P85: [3.7,4.8,5.8,6.6,7.3,7.8,8.3,8.7,9.0,9.4,9.7,10.0,10.3,10.6,10.8,11.1,11.3,11.5,11.8,12.0,12.2,12.5,12.7,13.0,13.2],
    P97: [4.2,5.5,6.6,7.5,8.2,8.8,9.3,9.8,10.2,10.5,10.9,11.2,11.5,11.8,12.1,12.4,12.7,12.9,13.2,13.5,13.7,14.0,14.2,14.5,14.8],
  },
  height: {
    P3:  [45.6,50.0,53.2,55.8,58.0,59.9,61.5,62.7,64.3,65.6,66.5,67.7,68.9,70.0,71.3,72.5,73.7,74.9,76.0,77.2,78.3,79.4,80.5,81.5,82.5],
    P15: [47.6,52.1,55.4,58.0,60.3,62.2,63.8,65.3,66.9,68.2,69.3,70.5,71.8,73.0,74.3,75.5,76.7,77.9,79.1,80.2,81.3,82.5,83.6,84.7,85.7],
    P50: [49.1,53.7,57.1,59.8,62.1,64.0,65.7,67.3,68.7,70.1,71.5,72.8,74.0,75.2,76.4,77.5,78.6,79.7,80.7,81.7,82.7,83.7,84.6,85.5,86.4],
    P85: [50.6,55.3,58.8,61.6,64.0,66.0,67.8,69.4,70.9,72.3,73.7,75.0,76.3,77.5,78.7,79.9,81.0,82.1,83.2,84.2,85.2,86.2,87.2,88.2,89.2],
    P97: [52.3,57.5,61.1,63.9,66.3,68.5,70.4,72.1,73.7,75.1,76.6,77.9,79.3,80.5,81.7,82.9,84.0,85.2,86.2,87.3,88.4,89.4,90.4,91.4,92.4],
  },
  head: {
    P3:  [32.1,34.3,35.9,37.1,38.1,39.0,39.7,40.3,40.9,41.4,41.9,42.3,42.6,42.9,43.2,43.5,43.7,44.0,44.2,44.4,44.6,44.8,45.0,45.2,45.3],
    P15: [33.0,35.4,37.0,38.3,39.3,40.2,40.9,41.6,42.1,42.6,43.1,43.5,43.8,44.1,44.4,44.7,45.0,45.2,45.5,45.7,45.9,46.1,46.3,46.5,46.6],
    P50: [33.9,36.5,38.3,39.5,40.6,41.5,42.2,42.8,43.4,43.9,44.4,44.8,45.1,45.4,45.7,46.0,46.2,46.5,46.7,46.9,47.1,47.3,47.5,47.7,47.8],
    P85: [34.9,37.5,39.4,40.7,41.8,42.7,43.5,44.1,44.7,45.2,45.7,46.1,46.4,46.8,47.1,47.3,47.6,47.9,48.1,48.3,48.5,48.7,48.9,49.1,49.3],
    P97: [35.9,38.5,40.4,41.8,42.9,43.8,44.5,45.2,45.8,46.4,46.9,47.4,47.8,48.1,48.4,48.8,49.1,49.4,49.6,49.9,50.1,50.4,50.6,50.8,51.0],
  },
};

const WHO_BOYS = {
  weight: {
    P3:  [2.5,3.4,4.3,5.0,5.6,6.0,6.4,6.7,6.9,7.1,7.4,7.6,7.8,8.0,8.2,8.4,8.6,8.8,9.0,9.2,9.4,9.6,9.8,10.0,10.2],
    P15: [2.9,3.9,4.9,5.6,6.2,6.7,7.1,7.4,7.7,7.9,8.2,8.4,8.6,8.8,9.0,9.2,9.4,9.6,9.9,10.1,10.3,10.5,10.7,10.9,11.2],
    P50: [3.3,4.5,5.6,6.4,7.0,7.5,7.9,8.3,8.6,8.9,9.2,9.4,9.7,9.9,10.1,10.3,10.5,10.7,11.0,11.2,11.4,11.6,11.8,12.0,12.2],
    P85: [3.9,5.1,6.3,7.2,7.9,8.4,8.9,9.3,9.7,10.0,10.4,10.7,11.0,11.2,11.5,11.7,11.9,12.2,12.4,12.7,12.9,13.1,13.4,13.6,13.8],
    P97: [4.3,5.7,7.0,8.0,8.7,9.3,9.8,10.3,10.7,11.0,11.4,11.7,12.0,12.3,12.6,12.8,13.1,13.4,13.7,14.0,14.2,14.5,14.8,15.1,15.4],
  },
  height: {
    P3:  [46.1,50.8,54.4,57.3,59.7,61.7,63.3,64.8,66.2,67.5,68.7,69.9,71.0,72.1,73.1,74.1,75.0,76.0,76.9,77.7,78.6,79.4,80.2,81.0,81.7],
    P15: [48.1,52.8,56.4,59.4,61.8,63.8,65.5,67.0,68.4,69.7,71.0,72.2,73.3,74.4,75.4,76.4,77.4,78.3,79.2,80.1,81.0,81.8,82.7,83.5,84.3],
    P50: [49.9,54.7,58.4,61.4,63.9,65.9,67.6,69.2,70.6,72.0,73.3,74.5,75.7,76.9,78.0,79.1,80.2,81.2,82.3,83.2,84.2,85.1,86.0,86.9,87.8],
    P85: [51.7,56.6,60.4,63.5,66.0,68.1,69.9,71.5,73.0,74.4,75.8,77.0,78.2,79.4,80.5,81.6,82.7,83.7,84.7,85.7,86.7,87.7,88.6,89.5,90.4],
    P97: [53.4,58.5,62.4,65.5,68.0,70.1,72.0,73.7,75.2,76.7,78.0,79.3,80.5,81.7,82.9,84.0,85.0,86.1,87.1,88.1,89.2,90.1,91.1,92.0,93.0],
  },
  head: {
    P3:  [32.1,35.1,37.0,38.3,39.4,40.2,40.9,41.5,42.0,42.5,42.9,43.3,43.6,43.9,44.2,44.5,44.7,45.0,45.2,45.4,45.6,45.8,46.0,46.2,46.3],
    P15: [33.1,36.2,38.2,39.5,40.6,41.5,42.2,42.8,43.3,43.8,44.2,44.6,45.0,45.3,45.6,45.8,46.1,46.3,46.5,46.8,47.0,47.2,47.3,47.5,47.7],
    P50: [34.5,37.3,39.1,40.5,41.6,42.6,43.3,44.0,44.5,45.0,45.4,45.8,46.2,46.5,46.8,47.1,47.4,47.6,47.9,48.1,48.3,48.5,48.7,48.9,49.0],
    P85: [35.6,38.5,40.4,41.8,42.9,43.8,44.6,45.2,45.8,46.3,46.8,47.2,47.5,47.8,48.1,48.4,48.7,49.0,49.2,49.4,49.7,49.9,50.1,50.3,50.4],
    P97: [36.9,39.8,41.7,43.2,44.3,45.2,46.0,46.7,47.3,47.8,48.3,48.7,49.1,49.4,49.7,50.0,50.3,50.6,50.8,51.1,51.3,51.5,51.7,51.9,52.1],
  },
};

type Metric = 'weight' | 'height' | 'head';
type Sex = 'girl' | 'boy';
type View = 'chart' | 'table';

interface GrowthEntry {
  id: string;
  date: string; // ISO
  ageMonths: number;
  weight: number | null;
  height: number | null;
  head: number | null;
}

interface ChildProfile {
  name: string;
  dob: string; // YYYY-MM-DD
  sex: Sex;
}

const PERCENTILE_COLORS = ['#dc2626','#f97316','#16a34a','#3b82f6','#8b5cf6'];
const PERCENTILE_LABELS = ['P3','P15','P50','P85','P97'];

// ─── SVG Chart ───────────────────────────────────────────────────────

function GrowthChart({ entries, metric, sex }: { entries: GrowthEntry[]; metric: Metric; sex: Sex }) {
  const W = 360; const H = 220;
  const PAD = { top: 16, right: 16, bottom: 32, left: 36 };

  const data = sex === 'girl' ? WHO_GIRLS : WHO_BOYS;
  const curves = data[metric];
  const months = Array.from({ length: 25 }, (_, i) => i);

  const allVals = Object.values(curves).flat();
  const yMin = Math.floor(Math.min(...allVals) * 0.97);
  const yMax = Math.ceil(Math.max(...allVals) * 1.03);
  const xMin = 0; const xMax = 24;

  function xPx(m: number) { return PAD.left + (m / (xMax - xMin)) * (W - PAD.left - PAD.right); }
  function yPx(v: number) { return PAD.top + (1 - (v - yMin) / (yMax - yMin)) * (H - PAD.top - PAD.bottom); }

  function pctPoints(vals: number[]) {
    return months.map((m) => `${xPx(m).toFixed(1)},${yPx(vals[m]).toFixed(1)}`).join(' ');
  }

  const metricUnit = metric === 'weight' ? 'kg' : 'cm';
  const metricLabel = metric === 'weight' ? 'Weight (kg)' : metric === 'height' ? 'Length/Height (cm)' : 'Head Circ. (cm)';

  const validEntries = entries.filter((e) => e[metric] !== null && e.ageMonths >= 0 && e.ageMonths <= 24);

  // Y axis ticks
  const step = metric === 'weight' ? 2 : 10;
  const yTicks: number[] = [];
  for (let v = Math.ceil(yMin / step) * step; v <= yMax; v += step) yTicks.push(v);

  return (
    <div>
      <p className="text-[11px] font-semibold text-gray-500 text-center mb-1">{metricLabel} · WHO 2006 · {sex === 'girl' ? 'Girls' : 'Boys'}</p>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 justify-center mb-2">
        {PERCENTILE_LABELS.map((label, i) => (
          <span key={label} className="flex items-center gap-1 text-[10px] text-gray-500">
            <span className="inline-block w-4 h-0.5 rounded" style={{ backgroundColor: PERCENTILE_COLORS[i] }} />
            {label}
          </span>
        ))}
        <span className="flex items-center gap-1 text-[10px] text-gray-600">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-brand-crimson" /> Your child
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }}>
        {/* Grid lines */}
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={yPx(v)} y2={yPx(v)} stroke="#e5e7eb" strokeWidth="0.5" />
            <text x={PAD.left - 3} y={yPx(v) + 3} textAnchor="end" fontSize="8" fill="#9ca3af">{v}</text>
          </g>
        ))}
        {/* X axis labels */}
        {[0,3,6,9,12,15,18,21,24].map((m) => (
          <text key={m} x={xPx(m)} y={H - 4} textAnchor="middle" fontSize="8" fill="#9ca3af">{m}m</text>
        ))}
        {/* WHO percentile curves */}
        {([curves.P3, curves.P15, curves.P50, curves.P85, curves.P97] as number[][]).map((vals, i) => (
          <polyline
            key={i}
            points={pctPoints(vals)}
            fill="none"
            stroke={PERCENTILE_COLORS[i]}
            strokeWidth={i === 2 ? 1.5 : 0.8}
            strokeDasharray={i === 2 ? undefined : i < 2 ? '3,2' : '3,2'}
            opacity={0.7}
          />
        ))}
        {/* Child's measurements */}
        {validEntries.map((e) => (
          <g key={e.id}>
            <circle
              cx={xPx(e.ageMonths)}
              cy={yPx(e[metric] as number)}
              r={4}
              fill="#8B1A2B"
              stroke="white"
              strokeWidth={1.5}
            />
          </g>
        ))}
        {/* Axes */}
        <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={H - PAD.bottom} stroke="#d1d5db" strokeWidth="1" />
        <line x1={PAD.left} x2={W - PAD.right} y1={H - PAD.bottom} y2={H - PAD.bottom} stroke="#d1d5db" strokeWidth="1" />
      </svg>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────

export function GrowthTracker() {
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [entries, setEntries] = useState<GrowthEntry[]>([]);
  const [view, setView] = useState<View>('chart');
  const [metric, setMetric] = useState<Metric>('weight');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formWeight, setFormWeight] = useState('');
  const [formHeight, setFormHeight] = useState('');
  const [formHead, setFormHead] = useState('');

  // Setup form
  const [setupName, setSetupName] = useState('');
  const [setupDob, setSetupDob] = useState('');
  const [setupSex, setSetupSex] = useState<Sex>('girl');

  useEffect(() => {
    const stored = localStorage.getItem('vm_growth_child');
    if (stored) setChild(JSON.parse(stored));
  }, []);

  const fetchEntries = useCallback(async () => {
    const res = await fetch('/api/baby-logs?type=GROWTH');
    const data = await res.json();
    const parsed: GrowthEntry[] = (data.logs || [])
      .map((log: { id: string; startTime: string; value: string | null }) => {
        try {
          const v = JSON.parse(log.value ?? '{}');
          const dob = child?.dob;
          const ageMonths = dob
            ? Math.round((new Date(log.startTime).getTime() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 30.44))
            : 0;
          return { id: log.id, date: log.startTime, ageMonths, weight: v.weight ?? null, height: v.height ?? null, head: v.head ?? null };
        } catch { return null; }
      })
      .filter(Boolean)
      .sort((a: GrowthEntry, b: GrowthEntry) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setEntries(parsed);
  }, [child]);

  useEffect(() => {
    if (child) fetchEntries();
  }, [child, fetchEntries]);

  function saveChild() {
    const profile: ChildProfile = { name: setupName, dob: setupDob, sex: setupSex };
    localStorage.setItem('vm_growth_child', JSON.stringify(profile));
    setChild(profile);
    setShowSetup(false);
  }

  async function saveEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!formWeight && !formHeight && !formHead) return;
    setLoading(true);
    const value = JSON.stringify({
      weight: formWeight ? parseFloat(formWeight) : null,
      height: formHeight ? parseFloat(formHeight) : null,
      head: formHead ? parseFloat(formHead) : null,
    });
    await fetch('/api/baby-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'GROWTH', startTime: new Date(formDate).toISOString(), value }),
    });
    setFormWeight(''); setFormHeight(''); setFormHead('');
    setShowForm(false);
    setLoading(false);
    fetchEntries();
  }

  // Group entries by year for table
  const byYear: Record<string, GrowthEntry[]> = {};
  for (const e of entries) {
    const yr = new Date(e.date).getFullYear().toString();
    if (!byYear[yr]) byYear[yr] = [];
    byYear[yr].push(e);
  }

  // ── No child set up yet ──
  if (!child && !showSetup) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(201,168,76,0.12)', color: '#C9A84C' }}>
          <Baby size={32} />
        </div>
        <h2 className="font-serif text-2xl text-brand-crimson mb-2">Growth Chart</h2>
        <p className="text-sm text-gray-500 mb-6">Track your child's growth against WHO percentile curves</p>
        <button
          onClick={() => setShowSetup(true)}
          className="px-6 py-3 rounded-full text-white font-medium text-sm"
          style={{ backgroundColor: '#8B1A2B' }}
        >
          Set up child profile
        </button>
      </div>
    );
  }

  // ── Child setup form ──
  if (showSetup) {
    return (
      <div className="space-y-5">
        <h2 className="font-serif text-xl text-brand-crimson">Child Profile</h2>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Name</label>
          <input value={setupName} onChange={(e) => setSetupName(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand-crimson" placeholder="e.g. Mia" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Date of Birth</label>
          <input type="date" value={setupDob} onChange={(e) => setSetupDob(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand-crimson" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Sex</label>
          <div className="grid grid-cols-2 gap-3">
            {(['girl','boy'] as Sex[]).map((s) => (
              <button key={s} onClick={() => setSetupSex(s)}
                className={cn('py-3 rounded-xl border text-sm font-medium transition-all capitalize',
                  setupSex === s ? 'border-brand-crimson text-brand-crimson bg-brand-crimson/5' : 'border-gray-200 text-gray-600'
                )}>
                {s === 'girl' ? '👧 Girl' : '👦 Boy'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={saveChild} disabled={!setupName || !setupDob}
            className="flex-1 py-3 rounded-xl text-white font-medium text-sm disabled:opacity-50"
            style={{ backgroundColor: '#8B1A2B' }}>
            Save Profile
          </button>
          {child && <button onClick={() => setShowSetup(false)} className="px-5 py-3 rounded-xl border border-gray-200 text-sm text-gray-600">Cancel</button>}
        </div>
      </div>
    );
  }

  // ── Main view ──
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-brand-crimson">{child!.name}</h2>
          <p className="text-xs text-gray-400">
            Born {new Date(child!.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {' · '}{child!.sex === 'girl' ? 'Girl' : 'Boy'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSetup(true)} className="p-2 rounded-lg text-gray-400 hover:text-brand-crimson transition-colors"><Pencil size={15} /></button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-white text-xs font-medium"
            style={{ backgroundColor: '#8B1A2B' }}
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* Entry form */}
      {showForm && (
        <form onSubmit={saveEntry} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-gray-700">New Measurement</p>
            <button type="button" onClick={() => setShowForm(false)}><X size={16} className="text-gray-400" /></button>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-crimson" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Weight (kg)</label>
              <input type="number" step="0.1" min="0" max="50" value={formWeight} onChange={(e) => setFormWeight(e.target.value)} placeholder="—" className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:border-brand-crimson" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Height (cm)</label>
              <input type="number" step="0.1" min="0" max="200" value={formHeight} onChange={(e) => setFormHeight(e.target.value)} placeholder="—" className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:border-brand-crimson" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Head (cm)</label>
              <input type="number" step="0.1" min="0" max="60" value={formHead} onChange={(e) => setFormHead(e.target.value)} placeholder="—" className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:border-brand-crimson" />
            </div>
          </div>
          <button type="submit" disabled={loading || (!formWeight && !formHeight && !formHead)}
            className="w-full py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
            style={{ backgroundColor: '#8B1A2B' }}>
            {loading ? 'Saving…' : 'Save Measurement'}
          </button>
        </form>
      )}

      {/* View toggle */}
      <div className="flex gap-2">
        {(['chart','table'] as View[]).map((v) => (
          <button key={v} onClick={() => setView(v)}
            className={cn('flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all border',
              view === v ? 'text-white border-transparent' : 'bg-white dark:bg-gray-900 text-gray-600 border-gray-200'
            )}
            style={view === v ? { backgroundColor: '#8B1A2B' } : {}}>
            {v === 'chart' ? <BarChart2 size={13} /> : <Table2 size={13} />}
            {v}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">No measurements yet.</p>
          <p className="text-xs mt-1">Tap + Add to log your first entry.</p>
        </div>
      ) : view === 'chart' ? (
        <div className="space-y-3">
          {/* Metric tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {(['weight','height','head'] as Metric[]).map((m) => (
              <button key={m} onClick={() => setMetric(m)}
                className={cn('flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize',
                  metric === m ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200'
                )}
                style={metric === m ? { backgroundColor: '#C9A84C' } : {}}>
                {m === 'head' ? 'Head Circ.' : m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <GrowthChart entries={entries} metric={metric} sex={child!.sex} />
          </div>

          {/* Latest values */}
          {entries.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {([
                { key: 'weight', label: 'Weight', unit: 'kg' },
                { key: 'height', label: 'Height', unit: 'cm' },
                { key: 'head', label: 'Head', unit: 'cm' },
              ] as { key: Metric; label: string; unit: string }[]).map(({ key, label, unit }) => {
                const latest = [...entries].reverse().find((e) => e[key] !== null);
                return (
                  <div key={key} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 text-center">
                    <p className="text-lg font-bold" style={{ color: '#8B1A2B' }}>
                      {latest?.[key] ?? '—'}<span className="text-xs font-normal text-gray-400">{latest?.[key] ? unit : ''}</span>
                    </p>
                    <p className="text-[10px] text-gray-400">{label}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // Table view
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="grid grid-cols-4 px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            {['Date','Weight','Height','Head'].map((h) => (
              <p key={h} className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{h}</p>
            ))}
          </div>
          {Object.entries(byYear).sort(([a],[b]) => Number(b)-Number(a)).map(([year, yearEntries]) => (
            <div key={year}>
              <p className="px-4 py-1.5 text-[11px] font-bold text-gray-400 bg-gray-50/70 dark:bg-gray-800/30">{year}</p>
              {yearEntries.map((e) => (
                <div key={e.id} className="grid grid-cols-4 px-4 py-2.5 border-t border-gray-50 dark:border-gray-800/50">
                  <p className="text-xs text-gray-500">{new Date(e.date).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</p>
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{e.weight != null ? `${e.weight} kg` : '—'}</p>
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{e.height != null ? `${e.height} cm` : '—'}</p>
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{e.head != null ? `${e.head} cm` : '—'}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* WHO note */}
      <p className="text-[10px] text-gray-400 text-center">Charts based on WHO Child Growth Standards 2006 · Always discuss measurements with your pediatrician</p>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Baby, BarChart2, Table2, Pencil, X, ChevronDown, Trash2, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── WHO Growth Standard Data (0–24 months) ──────────────────────────
// Source: WHO Child Growth Standards 2006
// Index = age in months (0–24), Percentiles: P3, P15, P50, P85, P97

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

// ─── CDC Growth Charts 2000 (2–20 years) ────────────────────────────
// Source: CDC LMS data files (wtage.csv / statage.csv), percentiles computed
// from L/M/S at 6-month steps, ages 24–240 months. No head-circ reference
// exists for this age range. Index = (ageMonths - 24) / 6.

const CDC_GIRLS = {
  weight: {
    P3:  [10.0,10.7,11.3,12.0,12.7,13.5,14.3,15.1,15.9,16.8,17.7,18.5,19.5,20.4,21.5,22.6,23.9,25.2,26.7,28.2,29.9,31.6,33.3,34.9,36.6,38.1,39.5,40.7,41.7,42.6,43.3,43.8,44.2,44.5,44.8,45.0,45.0],
    P15: [10.8,11.6,12.3,13.1,13.9,14.8,15.7,16.6,17.6,18.6,19.6,20.7,21.8,23.0,24.3,25.7,27.3,28.9,30.7,32.5,34.3,36.2,38.0,39.7,41.3,42.8,44.1,45.3,46.2,47.0,47.6,48.2,48.6,49.0,49.4,49.7,49.9],
    P50: [12.1,13.0,13.9,14.8,15.8,16.8,17.9,19.1,20.2,21.5,22.8,24.1,25.6,27.2,29.0,30.9,32.9,35.0,37.2,39.4,41.6,43.8,45.8,47.7,49.4,50.8,52.0,53.1,53.9,54.6,55.1,55.7,56.2,56.7,57.3,57.8,58.2],
    P85: [13.5,14.7,15.8,17.0,18.3,19.7,21.1,22.5,24.1,25.7,27.4,29.2,31.3,33.5,35.8,38.4,41.1,43.9,46.8,49.6,52.4,55.0,57.5,59.7,61.5,63.1,64.4,65.4,66.2,66.8,67.4,67.9,68.5,69.2,69.9,70.6,71.1],
    P97: [15.0,16.4,17.9,19.5,21.1,22.9,24.8,26.7,28.7,30.9,33.2,35.6,38.3,41.2,44.3,47.6,51.1,54.7,58.4,62.1,65.6,69.0,72.1,75.0,77.5,79.7,81.5,83.0,84.3,85.3,86.1,86.8,87.4,87.9,88.4,88.8,89.0],
  },
  height: {
    P3:  [78.4,82.9,86.6,89.8,92.8,95.9,99.1,102.3,105.5,108.6,111.6,114.4,117.1,119.5,121.7,123.7,125.8,128.0,130.5,133.6,137.1,140.8,144.0,146.4,148.0,149.0,149.7,150.1,150.4,150.6,150.7,150.8,150.9,151.0,151.0,151.1,151.1],
    P15: [81.4,86.1,89.9,93.1,96.3,99.5,102.8,106.2,109.5,112.8,115.9,118.9,121.7,124.2,126.6,128.9,131.2,133.6,136.5,139.8,143.5,147.0,149.9,152.1,153.6,154.5,155.1,155.6,155.8,156.1,156.2,156.3,156.4,156.5,156.5,156.6,156.6],
    P50: [85.0,90.0,93.9,97.4,100.8,104.2,107.7,111.2,114.7,118.2,121.5,124.6,127.6,130.3,132.9,135.4,138.0,140.8,144.0,147.5,151.2,154.5,157.2,159.1,160.4,161.3,161.9,162.3,162.5,162.8,162.9,163.0,163.1,163.2,163.3,163.3,163.3],
    P85: [88.6,93.9,98.1,101.7,105.3,109.0,112.7,116.5,120.2,123.9,127.4,130.7,133.8,136.7,139.5,142.2,145.1,148.2,151.6,155.2,158.8,161.9,164.3,166.0,167.2,168.0,168.6,169.0,169.3,169.5,169.6,169.7,169.8,169.9,170.0,170.0,170.0],
    P97: [91.5,97.1,101.5,105.4,109.2,113.1,117.0,121.0,124.9,128.8,132.4,135.9,139.1,142.2,145.1,148.0,151.0,154.3,157.8,161.5,164.9,167.8,170.0,171.7,172.8,173.6,174.1,174.5,174.8,174.9,175.1,175.2,175.3,175.3,175.4,175.4,175.5],
  },
};

const CDC_BOYS = {
  weight: {
    P3:  [10.4,11.1,11.8,12.5,13.2,14.0,14.8,15.6,16.4,17.3,18.2,19.1,20.0,21.0,22.0,23.0,24.1,25.2,26.5,27.8,29.3,31.0,32.8,34.8,36.9,39.1,41.3,43.5,45.6,47.5,49.2,50.5,51.6,52.5,53.2,53.7,54.0],
    P15: [11.3,12.1,12.8,13.6,14.4,15.3,16.2,17.1,18.1,19.1,20.1,21.1,22.2,23.3,24.5,25.7,27.0,28.5,30.0,31.7,33.5,35.5,37.7,40.0,42.3,44.7,47.1,49.4,51.5,53.4,55.1,56.5,57.6,58.5,59.3,60.0,60.4],
    P50: [12.7,13.5,14.3,15.2,16.2,17.3,18.4,19.5,20.7,21.9,23.1,24.3,25.6,27.0,28.6,30.2,31.9,33.8,35.9,38.1,40.5,43.0,45.6,48.3,51.0,53.7,56.3,58.7,60.9,62.9,64.6,66.0,67.2,68.2,69.1,69.9,70.6],
    P85: [14.2,15.1,16.2,17.3,18.5,19.8,21.2,22.7,24.2,25.7,27.3,29.0,30.8,32.7,34.7,37.0,39.4,42.0,44.7,47.6,50.6,53.7,56.8,59.9,63.0,66.0,68.9,71.5,73.9,76.1,77.9,79.5,80.9,82.0,82.9,83.8,84.7],
    P97: [15.6,16.7,17.9,19.3,20.9,22.5,24.3,26.2,28.1,30.2,32.3,34.7,37.2,39.9,42.8,45.9,49.1,52.5,56.0,59.5,63.0,66.5,70.0,73.4,76.7,79.9,83.0,85.9,88.7,91.3,93.6,95.6,97.1,98.3,99.1,99.8,100.8],
  },
  height: {
    P3:  [79.9,84.2,88.1,91.3,94.3,97.2,100.1,103.0,105.9,108.8,111.7,114.6,117.3,119.8,122.2,124.4,126.5,128.5,130.6,132.9,135.4,138.3,141.5,144.8,148.2,151.5,154.4,156.8,158.7,160.1,161.2,161.9,162.5,162.8,163.1,163.2,163.3],
    P15: [82.8,87.2,91.1,94.6,97.9,101.0,104.1,107.1,110.2,113.2,116.2,119.1,122.0,124.7,127.2,129.6,131.9,134.1,136.3,138.8,141.5,144.5,148.0,151.7,155.4,158.7,161.6,163.8,165.5,166.8,167.6,168.2,168.7,169.0,169.2,169.3,169.4],
    P50: [86.5,91.0,95.0,98.7,102.2,105.6,108.9,112.2,115.4,118.6,121.8,124.9,127.9,130.8,133.5,136.1,138.6,141.1,143.5,146.1,149.1,152.4,156.1,160.0,163.8,167.2,169.9,172.0,173.5,174.6,175.3,175.8,176.2,176.4,176.6,176.7,176.8],
    P85: [90.1,94.9,99.1,102.9,106.6,110.2,113.7,117.1,120.6,124.0,127.4,130.7,133.9,137.0,140.0,142.8,145.5,148.2,150.9,153.7,156.9,160.4,164.3,168.3,172.0,175.3,177.8,179.7,181.1,182.0,182.7,183.2,183.5,183.8,184.0,184.1,184.2],
    P97: [93.0,98.2,102.6,106.5,110.2,113.9,117.5,121.2,124.8,128.4,132.0,135.6,139.0,142.3,145.4,148.4,151.3,154.1,157.0,160.1,163.4,167.1,171.0,174.9,178.5,181.6,184.0,185.7,187.0,187.9,188.6,189.1,189.4,189.7,189.9,190.1,190.2],
  },
};

type Metric = 'weight' | 'height' | 'head';
type View = 'chart' | 'table';
type Band = 'infant' | 'child'; // infant: WHO 0–24m · child: CDC 2–20y

interface ChildProfile {
  id: string;
  name: string;
  dob: string;
  sex: 'GIRL' | 'BOY';
}

interface GrowthEntry {
  id: string;
  date: string;
  ageMonths: number;
  weight: number | null;
  height: number | null;
  head: number | null;
}

const PERCENTILE_COLORS = ['#dc2626','#f97316','#16a34a','#3b82f6','#8b5cf6'];
const PERCENTILE_LABELS = ['3%','15%','50%','85%','97%'];
// z-scores of the five reference curves, for interpolating a child's own
// percentile track between them
const PERCENTILE_Z = [-1.880794, -1.036433, 0, 1.036433, 1.880794];
const Z_CLAMP = 2.326; // ≈ 1st/99th percentile

// Standard normal CDF (Zelen & Severo approximation)
function phi(z: number) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

// Where does value v sit between the five percentile curves? Piecewise-linear
// in z space, extrapolated past the outer curves and clamped.
function zFromValue(curveVals: number[], v: number) {
  let i = 1;
  while (i < curveVals.length - 1 && v > curveVals[i]) i++;
  const z = PERCENTILE_Z[i - 1] +
    ((v - curveVals[i - 1]) / (curveVals[i] - curveVals[i - 1])) * (PERCENTILE_Z[i] - PERCENTILE_Z[i - 1]);
  return Math.max(-Z_CLAMP, Math.min(Z_CLAMP, z));
}

function valueFromZ(curveVals: number[], z: number) {
  let i = 1;
  while (i < PERCENTILE_Z.length - 1 && z > PERCENTILE_Z[i]) i++;
  return curveVals[i - 1] +
    ((z - PERCENTILE_Z[i - 1]) / (PERCENTILE_Z[i] - PERCENTILE_Z[i - 1])) * (curveVals[i] - curveVals[i - 1]);
}

// ─── SVG Chart ───────────────────────────────────────────────────────

function GrowthChart({ entries, metric, sex, band, dob }: { entries: GrowthEntry[]; metric: Metric; sex: 'GIRL' | 'BOY'; band: Band; dob: string }) {
  const W = 360; const H = 220;
  const PAD = { top: 16, right: 16, bottom: 32, left: 36 };
  const isChild = band === 'child';
  const data = isChild
    ? (sex === 'GIRL' ? CDC_GIRLS : CDC_BOYS)
    : (sex === 'GIRL' ? WHO_GIRLS : WHO_BOYS);
  const curves = (data as Record<string, Record<string, number[]>>)[metric];
  const xMin = isChild ? 24 : 0;
  const xMax = isChild ? 240 : 24;
  const agePoints = isChild
    ? Array.from({ length: 37 }, (_, i) => 24 + i * 6)
    : Array.from({ length: 25 }, (_, i) => i);
  const allVals = Object.values(curves).flat();
  const yMin = Math.floor(Math.min(...allVals) * 0.97);
  const yMax = Math.ceil(Math.max(...allVals) * 1.03);
  function xPx(m: number) { return PAD.left + ((m - xMin) / (xMax - xMin)) * (W - PAD.left - PAD.right); }
  function yPx(v: number) { return PAD.top + (1 - (v - yMin) / (yMax - yMin)) * (H - PAD.top - PAD.bottom); }
  function pctPoints(vals: number[]) {
    return agePoints.map((m, i) => `${xPx(m).toFixed(1)},${yPx(vals[i]).toFixed(1)}`).join(' ');
  }
  const metricLabel = metric === 'weight' ? 'Weight (kg)' : metric === 'height' ? 'Length/Height (cm)' : 'Head Circ. (cm)';
  const validEntries = entries.filter((e) => e[metric] !== null && e.ageMonths >= xMin && e.ageMonths <= xMax);
  const span = yMax - yMin;
  const step = [1, 2, 5, 10, 20, 25].find((s) => span / s <= 8) ?? 50;
  const yTicks: number[] = [];
  for (let v = Math.ceil(yMin / step) * step; v <= yMax; v += step) yTicks.push(v);
  const xTicks = isChild
    ? Array.from({ length: 10 }, (_, i) => 24 + i * 24) // 2y..20y
    : [0, 3, 6, 9, 12, 15, 18, 21, 24];

  // ── Tap-to-project: follow the child's current percentile track ──
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursorAge, setCursorAge] = useState<number | null>(null);
  const stepX = isChild ? 6 : 1;

  // Interpolate the five percentile curves at an arbitrary age
  function curveAt(age: number): number[] {
    const t = (age - xMin) / stepX;
    const i = Math.min(Math.floor(t), agePoints.length - 2);
    const f = t - i;
    return PERCENTILE_LABELS.map((_, k) => {
      const vals = Object.values(curves)[k];
      return vals[i] + (vals[i + 1] - vals[i]) * f;
    });
  }

  const latest = [...validEntries].sort((a, b) => a.ageMonths - b.ageMonths).pop();
  const childZ = latest ? zFromValue(curveAt(latest.ageMonths), latest[metric] as number) : null;

  const projPoints = childZ !== null && latest
    ? agePoints.filter((m) => m >= latest.ageMonths)
        .map((m) => `${xPx(m).toFixed(1)},${yPx(valueFromZ(curveAt(m), childZ)).toFixed(1)}`)
        .join(' ')
    : null;

  function handlePointer(e: React.PointerEvent<SVGSVGElement>) {
    if (childZ === null || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const age = xMin + ((x - PAD.left) / (W - PAD.left - PAD.right)) * (xMax - xMin);
    setCursorAge(Math.max(xMin, Math.min(xMax, age)));
  }

  let cursor: { x: number; y: number; lines: string[] } | null = null;
  if (cursorAge !== null && childZ !== null) {
    // cursorAge persists across metric/band/child switches — re-clamp to this chart's range
    const clampedAge = Math.max(xMin, Math.min(xMax, cursorAge));
    const val = valueFromZ(curveAt(clampedAge), childZ);
    const pct = Math.round(phi(childZ) * 100);
    const when = new Date(new Date(dob).getTime() + clampedAge * 30.44 * 24 * 3600 * 1000)
      .toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const totalMonths = Math.round(clampedAge);
    const ageLabel = isChild
      ? `${Math.floor(totalMonths / 12)}y ${totalMonths % 12}m`
      : `${totalMonths}m`;
    const unit = metric === 'weight' ? 'kg' : 'cm';
    cursor = {
      x: xPx(clampedAge),
      y: yPx(val),
      lines: [`${ageLabel} · ${when}`, `${val.toFixed(1)} ${unit}`, `≈ ${pct < 1 ? '<1' : pct > 99 ? '>99' : pct}%`],
    };
  }
  const tipW = 86; const tipH = 38;
  const tipX = cursor ? Math.min(Math.max(cursor.x + 8, PAD.left), W - PAD.right - tipW) : 0;
  const tipY = cursor ? Math.max(cursor.y - tipH - 8, 2) : 0;

  return (
    <div>
      <p className="text-[11px] font-semibold text-gray-500 text-center mb-1">
        {metricLabel} · {isChild ? 'CDC 2000' : 'WHO 2006'} · {sex === 'GIRL' ? 'Girls' : 'Boys'}
      </p>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 justify-center mb-2">
        {PERCENTILE_LABELS.map((label, i) => (
          <span key={label} className="flex items-center gap-1 text-[10px] text-gray-500">
            <span className="inline-block w-4 h-0.5 rounded" style={{ backgroundColor: PERCENTILE_COLORS[i] }} />
            {label}
          </span>
        ))}
        <span className="flex items-center gap-1 text-[10px] text-gray-600">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#8B1A2B' }} /> Your child
        </span>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ maxHeight: 220, touchAction: childZ !== null ? 'none' : 'auto' }}
        onPointerDown={handlePointer}
        onPointerMove={(e) => { if (e.buttons === 1) handlePointer(e); }}
      >
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={yPx(v)} y2={yPx(v)} stroke="#e5e7eb" strokeWidth="0.5" />
            <text x={PAD.left - 3} y={yPx(v) + 3} textAnchor="end" fontSize="8" fill="#9ca3af">{v}</text>
          </g>
        ))}
        {xTicks.map((m) => (
          <text key={m} x={xPx(m)} y={H - 4} textAnchor="middle" fontSize="8" fill="#9ca3af">
            {isChild ? `${m / 12}y` : `${m}m`}
          </text>
        ))}
        {([curves.P3, curves.P15, curves.P50, curves.P85, curves.P97] as number[][]).map((vals, i) => (
          <polyline key={i} points={pctPoints(vals)} fill="none" stroke={PERCENTILE_COLORS[i]}
            strokeWidth={i === 2 ? 1.5 : 0.8} strokeDasharray={i === 2 ? undefined : '3,2'} opacity={0.7} />
        ))}
        {projPoints && (
          <polyline points={projPoints} fill="none" stroke="#8B1A2B" strokeWidth={1.2}
            strokeDasharray="4,3" opacity={0.45} />
        )}
        {validEntries.map((e) => (
          <circle key={e.id} cx={xPx(e.ageMonths)} cy={yPx(e[metric] as number)}
            r={4} fill="#8B1A2B" stroke="white" strokeWidth={1.5} />
        ))}
        <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={H - PAD.bottom} stroke="#d1d5db" strokeWidth="1" />
        <line x1={PAD.left} x2={W - PAD.right} y1={H - PAD.bottom} y2={H - PAD.bottom} stroke="#d1d5db" strokeWidth="1" />
        {cursor && (
          <g>
            <line x1={cursor.x} x2={cursor.x} y1={PAD.top} y2={H - PAD.bottom} stroke="#8B1A2B" strokeWidth="0.7" opacity={0.4} />
            <circle cx={cursor.x} cy={cursor.y} r={4.5} fill="white" stroke="#8B1A2B" strokeWidth={2} />
            <rect x={tipX} y={tipY} width={tipW} height={tipH} rx={5} fill="#1f2937" opacity={0.92} />
            {cursor.lines.map((line, i) => (
              <text key={i} x={tipX + 7} y={tipY + 12 + i * 11} fontSize="8.5"
                fill={i === 0 ? '#d1d5db' : 'white'} fontWeight={i === 0 ? 'normal' : 'bold'}>
                {line}
              </text>
            ))}
          </g>
        )}
      </svg>
      {childZ !== null && (
        <p className="text-[10px] text-gray-400 text-center mt-1.5">
          Tap or drag on the chart to see projected growth along the current percentile
        </p>
      )}
    </div>
  );
}

// ─── Child Setup Form ─────────────────────────────────────────────────

function ChildForm({ onSave, onCancel, initial }: {
  onSave: (name: string, dob: string, sex: 'GIRL' | 'BOY') => Promise<void>;
  onCancel?: () => void;
  initial?: ChildProfile;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [dob, setDob] = useState(initial?.dob ? initial.dob.slice(0, 10) : '');
  const [sex, setSex] = useState<'GIRL' | 'BOY'>(initial?.sex ?? 'GIRL');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !dob) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(name, dob, sex);
    } catch {
      setError('Something went wrong while saving. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <h2 className="font-serif text-xl text-brand-crimson">{initial ? 'Edit Child' : 'Add Child'}</h2>
      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand-crimson" placeholder="e.g. Mia" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Date of Birth</label>
        <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand-crimson" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Sex</label>
        <div className="grid grid-cols-2 gap-3">
          {(['GIRL','BOY'] as const).map((s) => (
            <button key={s} type="button" onClick={() => setSex(s)}
              className={cn('py-3 rounded-xl border text-sm font-medium transition-all',
                sex === s ? 'border-brand-crimson text-brand-crimson bg-brand-crimson/5' : 'border-gray-200 text-gray-600'
              )}>
              {s === 'GIRL' ? '👧 Girl' : '👦 Boy'}
            </button>
          ))}
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">{error}</p>
      )}
      <div className="flex gap-3">
        <button type="submit" disabled={!name || !dob || saving}
          className="flex-1 py-3 rounded-xl text-white font-medium text-sm disabled:opacity-50"
          style={{ backgroundColor: '#8B1A2B' }}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-5 py-3 rounded-xl border border-gray-200 text-sm text-gray-600">Cancel</button>
        )}
      </div>
    </form>
  );
}

// ─── Child Selector ───────────────────────────────────────────────────

function ChildSelector({ children, selected, onSelect, onAdd }: {
  children: ChildProfile[];
  selected: ChildProfile;
  onSelect: (c: ChildProfile) => void;
  onAdd: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 font-serif text-2xl text-brand-crimson">
        {selected.name} <ChevronDown size={16} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-1 z-20">
          {children.map((c) => (
            <button key={c.id} onClick={() => { onSelect(c); setOpen(false); }}
              className={cn('w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800',
                c.id === selected.id ? 'font-semibold text-brand-crimson' : 'text-gray-700 dark:text-gray-300'
              )}>
              {c.name}
            </button>
          ))}
          <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
            <button onClick={() => { onAdd(); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm text-brand-gold hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1.5">
              <Plus size={13} /> Add another child
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────

export function GrowthTracker() {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [entries, setEntries] = useState<GrowthEntry[]>([]);
  const [view, setView] = useState<View>('chart');
  const [metric, setMetric] = useState<Metric>('weight');
  const [showForm, setShowForm] = useState(false);
  const [showChildForm, setShowChildForm] = useState(false);
  const [editingChild, setEditingChild] = useState<ChildProfile | null>(null);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formWeight, setFormWeight] = useState('');
  const [formHeight, setFormHeight] = useState('');
  const [formHead, setFormHead] = useState('');
  const [savingEntry, setSavingEntry] = useState(false);
  const [entryError, setEntryError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/children')
      .then((r) => r.json())
      .then((data) => {
        const list: ChildProfile[] = data.children ?? [];
        setChildren(list);
        if (list.length > 0) setSelectedChild(list[0]);
        setLoadingChildren(false);
      })
      .catch(() => setLoadingChildren(false));
  }, []);

  const fetchEntries = useCallback(async (childId: string, dob: string) => {
    const res = await fetch(`/api/children/${childId}/growth`);
    const data = await res.json();
    const parsed: GrowthEntry[] = (data.logs ?? []).map((log: { id: string; startTime: string; value: string | null }) => {
      try {
        const v = JSON.parse(log.value ?? '{}');
        const ageMonths = Math.round(
          (new Date(log.startTime).getTime() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 30.44)
        );
        return { id: log.id, date: log.startTime, ageMonths, weight: v.weight ?? null, height: v.height ?? null, head: v.head ?? null };
      } catch { return null; }
    }).filter(Boolean);
    setEntries(parsed);
  }, []);

  useEffect(() => {
    if (selectedChild) fetchEntries(selectedChild.id, selectedChild.dob);
  }, [selectedChild, fetchEntries]);

  async function addChild(name: string, dob: string, sex: 'GIRL' | 'BOY') {
    const res = await fetch('/api/children', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, dob, sex }),
    });
    if (!res.ok) throw new Error(`Failed to save child (${res.status})`);
    const data = await res.json();
    const child: ChildProfile = data.child;
    setChildren((prev) => [...prev, child]);
    setSelectedChild(child);
    setShowChildForm(false);
  }

  async function updateChild(name: string, dob: string, sex: 'GIRL' | 'BOY') {
    if (!editingChild) return;
    const res = await fetch(`/api/children/${editingChild.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, dob, sex }),
    });
    if (!res.ok) throw new Error(`Failed to update child (${res.status})`);
    const data = await res.json();
    const updated: ChildProfile = data.child;
    setChildren((prev) => prev.map((c) => c.id === updated.id ? updated : c));
    if (selectedChild?.id === updated.id) setSelectedChild(updated);
    setEditingChild(null);
  }

  async function saveEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedChild || (!formWeight && !formHeight && !formHead)) return;
    setSavingEntry(true);
    setEntryError(null);
    try {
      const res = await fetch(`/api/children/${selectedChild.id}/growth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formDate,
          weight: formWeight ? parseFloat(formWeight) : null,
          height: formHeight ? parseFloat(formHeight) : null,
          head: formHead ? parseFloat(formHead) : null,
        }),
      });
      if (!res.ok) throw new Error(`Failed to save measurement (${res.status})`);
      setFormWeight(''); setFormHeight(''); setFormHead('');
      setShowForm(false);
      fetchEntries(selectedChild.id, selectedChild.dob);
    } catch {
      setEntryError('Something went wrong while saving. Please try again.');
    } finally {
      setSavingEntry(false);
    }
  }

  async function deleteEntry(logId: string) {
    if (!selectedChild) return;
    await fetch(`/api/children/${selectedChild.id}/growth`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logId }),
    });
    setEntries((prev) => prev.filter((e) => e.id !== logId));
  }

  // Pick the reference band from the child's current age: WHO standards cover
  // 0-24 months, CDC charts cover 2-20 years. Head circumference has no
  // reference data beyond infancy, so that tab is hidden in the child band.
  const ageNowMonths = selectedChild
    ? (Date.now() - new Date(selectedChild.dob).getTime()) / (1000 * 60 * 60 * 24 * 30.44)
    : 0;
  const band: Band = ageNowMonths > 24 ? 'child' : 'infant';
  const availableMetrics: Metric[] = band === 'child' ? ['weight', 'height'] : ['weight', 'height', 'head'];
  const activeMetric: Metric = availableMetrics.includes(metric) ? metric : 'weight';

  const byYear: Record<string, GrowthEntry[]> = {};
  for (const e of entries) {
    const yr = new Date(e.date).getFullYear().toString();
    if (!byYear[yr]) byYear[yr] = [];
    byYear[yr].push(e);
  }

  if (loadingChildren) {
    return <div className="py-16 text-center text-gray-400 text-sm">Loading…</div>;
  }

  if (editingChild) {
    return <ChildForm onSave={updateChild} onCancel={() => setEditingChild(null)} initial={editingChild} />;
  }

  if (children.length === 0 || showChildForm) {
    return (
      <div>
        {children.length === 0 && (
          <div className="text-center py-8 mb-6">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(201,168,76,0.12)', color: '#C9A84C' }}>
              <Baby size={32} />
            </div>
            <h2 className="font-serif text-2xl text-brand-crimson mb-2">Growth Chart</h2>
            <p className="text-sm text-gray-500">Track your child&apos;s growth against WHO percentile curves</p>
          </div>
        )}
        {showChildForm && (
          <button onClick={() => setShowChildForm(false)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-crimson mb-4 transition-colors">
            <ChevronLeft size={15} /> Back
          </button>
        )}
        <ChildForm onSave={addChild} onCancel={children.length > 0 ? () => setShowChildForm(false) : undefined} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {children.length > 1 ? (
            <ChildSelector children={children} selected={selectedChild!} onSelect={setSelectedChild} onAdd={() => setShowChildForm(true)} />
          ) : (
            <h2 className="font-serif text-2xl text-brand-crimson">{selectedChild!.name}</h2>
          )}
          <p className="text-xs text-gray-400 mt-0.5">
            Born {new Date(selectedChild!.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {' · '}{selectedChild!.sex === 'GIRL' ? 'Girl' : 'Boy'}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setEditingChild(selectedChild)} className="p-2 rounded-lg text-gray-400 hover:text-brand-crimson transition-colors" title="Edit profile">
            <Pencil size={15} />
          </button>
          {children.length === 1 && (
            <button onClick={() => setShowChildForm(true)} className="p-2 rounded-lg text-gray-400 hover:text-brand-gold transition-colors" title="Add another child">
              <Baby size={15} />
            </button>
          )}
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-white text-xs font-medium"
            style={{ backgroundColor: '#8B1A2B' }}>
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* Entry form */}
      {showForm && (
        <form onSubmit={saveEntry} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">New Measurement</p>
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
          {entryError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">{entryError}</p>
          )}
          <button type="submit" disabled={savingEntry || (!formWeight && !formHeight && !formHead)}
            className="w-full py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
            style={{ backgroundColor: '#8B1A2B' }}>
            {savingEntry ? 'Saving…' : 'Save Measurement'}
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
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {availableMetrics.map((m) => (
              <button key={m} onClick={() => setMetric(m)}
                className={cn('flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                  activeMetric === m ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200'
                )}
                style={activeMetric === m ? { backgroundColor: '#C9A84C' } : {}}>
                {m === 'head' ? 'Head Circ.' : m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <GrowthChart entries={entries} metric={activeMetric} sex={selectedChild!.sex} band={band} dob={selectedChild!.dob} />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {([
              { key: 'weight' as Metric, label: 'Weight', unit: 'kg' },
              { key: 'height' as Metric, label: 'Height', unit: 'cm' },
              { key: 'head' as Metric, label: 'Head', unit: 'cm' },
            ]).map(({ key, label, unit }) => {
              const latest = [...entries].reverse().find((e) => e[key] !== null);
              return (
                <div key={key} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 text-center">
                  <p className="text-lg font-bold" style={{ color: '#8B1A2B' }}>
                    {latest?.[key] ?? '—'}<span className="text-xs font-normal text-gray-400">{latest?.[key] != null ? ` ${unit}` : ''}</span>
                  </p>
                  <p className="text-[10px] text-gray-400">{label}</p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="grid grid-cols-5 px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            {['Date','Age','Weight','Height','Head'].map((h) => (
              <p key={h} className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{h}</p>
            ))}
          </div>
          {Object.entries(byYear).sort(([a],[b]) => Number(b)-Number(a)).map(([year, yearEntries]) => (
            <div key={year}>
              <p className="px-4 py-1.5 text-[11px] font-bold text-gray-400 bg-gray-50/70 dark:bg-gray-800/30">{year}</p>
              {yearEntries.map((e) => (
                <div key={e.id} className="group grid grid-cols-5 px-4 py-2.5 border-t border-gray-50 dark:border-gray-800/50 items-center">
                  <p className="text-xs text-gray-500">{new Date(e.date).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</p>
                  <p className="text-xs text-gray-400">{e.ageMonths}m</p>
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{e.weight != null ? `${e.weight}kg` : '—'}</p>
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{e.height != null ? `${e.height}cm` : '—'}</p>
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 flex-1">{e.head != null ? `${e.head}cm` : '—'}</p>
                    <button type="button" onClick={() => deleteEntry(e.id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-gray-400 text-center">
        Charts based on WHO Child Growth Standards 2006 (birth–2y) and CDC Growth Charts 2000 (2–20y) · Always discuss measurements with your pediatrician
      </p>
    </div>
  );
}

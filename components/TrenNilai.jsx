'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const NAIK = '#178A7C';
const TURUN = '#E4633F';
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

async function ambil(path) {
  try {
    const r = await fetch(path, { cache: 'no-store' });
    const j = r.ok ? await r.json() : [];
    return Array.isArray(j) ? j : [];
  } catch {
    return [];
  }
}

// rata-rata nilai tugas + kuis per bulan, untuk N bulan terakhir
function hitungPerBulan(pengumpulan, hasil, jumlahBulan) {
  const sekarang = new Date();
  const slot = [];
  for (let i = jumlahBulan - 1; i >= 0; i--) {
    const d = new Date(sekarang.getFullYear(), sekarang.getMonth() - i, 1);
    slot.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: BULAN[d.getMonth()], total: 0, n: 0 });
  }
  const masuk = (tanggal, nilai) => {
    if (nilai === null || nilai === undefined || nilai === '' || isNaN(Number(nilai))) return;
    const d = new Date(tanggal);
    if (isNaN(d)) return;
    const s = slot.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
    if (s) { s.total += Number(nilai); s.n += 1; }
  };
  pengumpulan.forEach((p) => masuk(p.dikumpulkanPada, p.nilai));
  hasil.forEach((h) => masuk(h.selesaiPada, h.nilai));
  return slot.map((s) => ({ label: s.label, value: s.n ? Math.round((s.total / s.n) * 10) / 10 : null }));
}

/**
 * Grafik garis naik-turun ala grafik saham.
 * Pakai <TrenNilai /> saja (ambil data sendiri dari database),
 * atau kirim data sendiri: <TrenNilai data={[{label:'Mei', value:78}, ...]} />
 */
export default function TrenNilai({ data, jumlahBulan = 6, tinggi = 240 }) {
  const [seri, setSeri] = useState(data || null);
  const [lebar, setLebar] = useState(560);
  const [aktif, setAktif] = useState(null);
  const kotak = useRef(null);

  useEffect(() => {
    if (data) { setSeri(data); return; }
    let batal = false;
    (async () => {
      const [p, h] = await Promise.all([ambil('/api/pengumpulan'), ambil('/api/hasil')]);
      if (!batal) setSeri(hitungPerBulan(p, h, jumlahBulan));
    })();
    return () => { batal = true; };
  }, [data, jumlahBulan]);

  useEffect(() => {
    const el = kotak.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setLebar(Math.max(280, el.clientWidth)));
    ro.observe(el);
    setLebar(Math.max(280, el.clientWidth));
    return () => ro.disconnect();
  }, []);

  const L = { atas: 26, kanan: 22, bawah: 34, kiri: 38 };
  const W = lebar, H = tinggi;
  const pw = W - L.kiri - L.kanan, ph = H - L.atas - L.bawah;

  const g = useMemo(() => {
    if (!seri) return null;
    const ada = seri.filter((d) => d.value !== null && d.value !== undefined);
    if (ada.length < 2) return { kurang: true };
    const lo = Math.max(0, Math.floor((Math.min(...ada.map((d) => d.value)) - 4) / 5) * 5);
    const hi = Math.min(100, Math.ceil((Math.max(...ada.map((d) => d.value)) + 4) / 5) * 5);
    const x = (i) => L.kiri + (seri.length === 1 ? pw / 2 : (pw * i) / (seri.length - 1));
    const y = (v) => L.atas + ph - ((v - lo) / (hi - lo || 1)) * ph;
    const titik = seri.map((d, i) => (d.value === null || d.value === undefined ? null : { ...d, i, px: x(i), py: y(d.value) }));
    const lurus = titik.filter(Boolean);
    const grid = [];
    const langkah = (hi - lo) / 4;
    for (let k = 0; k <= 4; k++) grid.push(Math.round((lo + langkah * k) * 10) / 10);
    return { titik, lurus, grid, y, lo, hi };
  }, [seri, pw, ph]);

  const wadah = { padding: '8px 18px 14px' };
  if (!seri) return <div style={{ ...wadah, color: 'var(--ink-faint, #93A6A0)', fontSize: 13, padding: 24 }}>Memuat grafik...</div>;
  if (g.kurang) return <div style={{ ...wadah, color: 'var(--ink-faint, #93A6A0)', fontSize: 13, padding: 24 }}>Belum cukup data nilai. Grafik muncul setelah ada nilai di minimal 2 bulan.</div>;

  const { titik, lurus, grid, y } = g;
  const terakhir = lurus[lurus.length - 1];
  const sebelum = lurus[lurus.length - 2];
  const selisih = Math.round((terakhir.value - sebelum.value) * 10) / 10;
  const naik = selisih >= 0;
  const dasar = L.atas + ph;
  const area = `M${lurus[0].px},${dasar} ` + lurus.map((t) => `L${t.px},${t.py}`).join(' ') + ` L${lurus[lurus.length - 1].px},${dasar} Z`;

  const geser = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - r.left;
    let dekat = lurus[0];
    lurus.forEach((t) => { if (Math.abs(t.px - mx) < Math.abs(dekat.px - mx)) dekat = t; });
    setAktif(dekat.i);
  };
  const sorot = aktif !== null ? titik[aktif] : null;
  const sorotSebelum = sorot ? [...lurus].reverse().find((t) => t.i < sorot.i) : null;

  return (
    <div style={wadah}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
        <span style={{ fontSize: 26, fontWeight: 700 }}>{terakhir.value}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: naik ? NAIK : TURUN }}>
          {naik ? '▲' : '▼'} {Math.abs(selisih)} dibanding {sebelum.label}
        </span>
      </div>
      <div ref={kotak} style={{ width: '100%', position: 'relative' }}>
        <svg width={W} height={H} role="img" aria-label="Grafik perkembangan rata-rata nilai per bulan"
          onMouseMove={geser} onMouseLeave={() => setAktif(null)} style={{ display: 'block', overflow: 'visible' }}>
          <defs>
            <linearGradient id="tn-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={naik ? NAIK : TURUN} stopOpacity="0.22" />
              <stop offset="100%" stopColor={naik ? NAIK : TURUN} stopOpacity="0" />
            </linearGradient>
          </defs>
          {grid.map((v) => (
            <g key={v}>
              <line x1={L.kiri} x2={W - L.kanan} y1={y(v)} y2={y(v)} stroke="var(--line, #E1E6E4)" strokeDasharray="3 4" />
              <text x={L.kiri - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="var(--ink-faint, #93A6A0)">{v}</text>
            </g>
          ))}
          <path d={area} fill="url(#tn-area)" />
          {lurus.slice(1).map((t, k) => {
            const a = lurus[k];
            return <line key={t.i} x1={a.px} y1={a.py} x2={t.px} y2={t.py} stroke={t.value >= a.value ? NAIK : TURUN} strokeWidth="2.5" strokeLinecap="round" />;
          })}
          {titik.map((t, i) => (
            <text key={i} x={L.kiri + (seri.length === 1 ? pw / 2 : (pw * i) / (seri.length - 1))} y={H - 10} textAnchor="middle" fontSize="11.5" fill="var(--ink-soft, #5C726C)">{seri[i].label}</text>
          ))}
          {sorot && (
            <line x1={sorot.px} x2={sorot.px} y1={L.atas} y2={dasar} stroke="var(--ink-faint, #93A6A0)" strokeDasharray="3 3" />
          )}
          {lurus.map((t) => {
            const idx = lurus.indexOf(t);
            const warna = idx === 0 ? NAIK : t.value >= lurus[idx - 1].value ? NAIK : TURUN;
            return <circle key={t.i} cx={t.px} cy={t.py} r={sorot && sorot.i === t.i ? 6 : 4} fill="#fff" stroke={warna} strokeWidth="2.5" />;
          })}
          {!sorot && (
            <text x={terakhir.px} y={terakhir.py - 12} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--ink, #152621)">{terakhir.value}</text>
          )}
        </svg>
        {sorot && (
          <div style={{
            position: 'absolute', top: 0, pointerEvents: 'none',
            left: Math.min(Math.max(sorot.px - 62, 0), W - 124), width: 124,
            background: 'var(--tosca-900, #0B4A44)', color: '#fff', borderRadius: 8, padding: '7px 10px', fontSize: 12, boxShadow: '0 4px 14px rgba(0,0,0,.18)',
          }}>
            <div style={{ opacity: 0.75 }}>{sorot.label}</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{sorot.value}</div>
            {sorotSebelum && (
              <div style={{ color: sorot.value >= sorotSebelum.value ? '#7FE0CF' : '#FFB39E', fontWeight: 600 }}>
                {sorot.value >= sorotSebelum.value ? '▲' : '▼'} {Math.abs(Math.round((sorot.value - sorotSebelum.value) * 10) / 10)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
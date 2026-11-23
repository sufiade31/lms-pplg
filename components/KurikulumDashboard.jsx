'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

const MENU_ITEMS = [
  { key: 'beranda', label: 'Beranda' },
  { key: 'mapel', label: 'Mata Pelajaran' },
  { key: 'jadwal', label: 'Jadwal Pelajaran' },
  { key: 'penugasan', label: 'Penugasan Guru' },
  { key: 'aktivitas', label: 'Aktivitas Pembelajaran' },
  { key: 'laporan', label: 'Laporan' },
  { key: 'profil', label: 'Profil' },
];

const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const norm = (s) => String(s || '').trim().toLowerCase();
const inisial = (nama) =>
  String(nama || 'WK').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || 'WK';
const tgl = (d) => {
  if (!d) return '-';
  const x = new Date(d);
  return isNaN(x) ? String(d) : x.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};
// "1-2" -> 2 jam, "3" -> 1 jam
const hitungJam = (jam) => {
  const m = String(jam || '').match(/^\s*(\d+)\s*[-–]\s*(\d+)\s*$/);
  if (m) return Math.max(1, Number(m[2]) - Number(m[1]) + 1);
  return 1;
};
const urutJam = (jam) => Number(String(jam || '').match(/\d+/)?.[0] || 0);

async function ambil(path) {
  try {
    const r = await fetch(path, { cache: 'no-store' });
    if (!r.ok) return [];
    const j = await r.json();
    return Array.isArray(j) ? j : [];
  } catch {
    return [];
  }
}

function cariUser() {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      try {
        const o = JSON.parse(localStorage.getItem(k));
        if (o && typeof o === 'object' && o._id && o.nama) return o;
      } catch {}
    }
  } catch {}
  return null;
}

function csvEscape(v) {
  const s = String(v ?? '');
  return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export default function KurikulumDashboard() {
  const [user, setUser] = useState(null);
  const [siap, setSiap] = useState(false);
  const [data, setData] = useState({ guru: [], siswa: [], kelas: [], tugas: [], materi: [], assessment: [], hasil: [], jadwal: [] });
  const [memuat, setMemuat] = useState(true);

  const [activeSection, setActiveSection] = useState('beranda');
  const [kelasJadwal, setKelasJadwal] = useState('');
  const [laporanModal, setLaporanModal] = useState({ open: false, index: null });
  const [jadwalModal, setJadwalModal] = useState(false);
  const [formJadwal, setFormJadwal] = useState({ hari: 'Senin', jam: '', mapel: '', guru: '' });
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }

  // cek login
  useEffect(() => {
    const u = cariUser();
    if (!u) { window.location.replace('/login'); return; }
    if (u.role === 'guru') { window.location.replace('/guru'); return; }
    if (u.role === 'murid' || u.role === 'siswa') { window.location.replace('/siswa'); return; }
    setUser(u);
    setSiap(true);
  }, []);

  const muat = useCallback(async () => {
    const [guru, siswa, kelas, tugas, materi, assessment, hasil, jadwal] = await Promise.all(
      ['guru', 'siswa', 'kelas', 'tugas', 'materi', 'assessment', 'hasil', 'jadwal'].map((t) => ambil('/api/' + t))
    );
    setData({ guru, siswa, kelas, tugas, materi, assessment, hasil, jadwal });
    setMemuat(false);
  }, []);

  useEffect(() => { if (siap) muat(); }, [siap, muat]);

  const { guru, siswa, kelas, tugas, materi, assessment, hasil, jadwal } = data;

  // ---- turunan data ----
  const daftarKelas = useMemo(() => {
    const s = new Set();
    kelas.forEach((k) => k.nama && s.add(k.nama));
    if (s.size === 0) siswa.forEach((x) => x.kelas && s.add(x.kelas));
    return [...s];
  }, [kelas, siswa]);

  useEffect(() => {
    if (!kelasJadwal && daftarKelas.length) setKelasJadwal(daftarKelas[0]);
  }, [daftarKelas, kelasJadwal]);

  // mapel: dari data guru + semua yang dipakai di tugas/materi/assessment/jadwal
  const mapelList = useMemo(() => {
    const m = new Map();
    const tambah = (nama) => {
      const key = norm(nama);
      if (!key) return null;
      if (!m.has(key)) m.set(key, { nama: String(nama).trim(), guru: new Set() });
      return m.get(key);
    };
    guru.forEach((g) => String(g.mapel || '').split(',').forEach((x) => { const e = tambah(x); if (e && g.nama) e.guru.add(g.nama); }));
    [...tugas, ...materi, ...assessment, ...jadwal].forEach((x) => { const e = tambah(x.mapel); if (e && x.guru) e.guru.add(x.guru); });
    return [...m.values()]
      .sort((a, b) => a.nama.localeCompare(b.nama))
      .map((e, i) => {
        const jam = jadwal.filter((j) => norm(j.mapel) === norm(e.nama)).reduce((n, j) => n + hitungJam(j.jam), 0);
        const huruf = e.nama.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase().padEnd(3, 'X');
        return { kode: `${huruf}-${String(i + 1).padStart(2, '0')}`, nama: e.nama, jam, guru: [...e.guru].join(', ') || '-' };
      });
  }, [guru, tugas, materi, assessment, jadwal]);

  // penugasan: kombinasi guru + mapel + kelas yang benar-benar muncul
  const penugasan = useMemo(() => {
    const s = new Map();
    [...tugas, ...materi, ...assessment, ...jadwal].forEach((x) => {
      if (!x.guru || !x.mapel) return;
      const k = `${norm(x.guru)}|${norm(x.mapel)}|${norm(x.kelas)}`;
      if (!s.has(k)) s.set(k, { guru: x.guru, mapel: x.mapel, kelas: x.kelas || 'Semua' });
    });
    const adaGuru = new Set([...s.values()].map((p) => norm(p.guru)));
    guru.forEach((g) => {
      if (!adaGuru.has(norm(g.nama))) s.set('g|' + norm(g.nama), { guru: g.nama, mapel: g.mapel || '-', kelas: 'Belum ada kelas' });
    });
    return [...s.values()].sort((a, b) => a.guru.localeCompare(b.guru) || a.kelas.localeCompare(b.kelas));
  }, [tugas, materi, assessment, jadwal, guru]);

  const jadwalKelas = useMemo(
    () =>
      jadwal
        .filter((j) => norm(j.kelas) === norm(kelasJadwal))
        .sort((a, b) => HARI.indexOf(a.hari) - HARI.indexOf(b.hari) || urutJam(a.jam) - urutJam(b.jam)),
    [jadwal, kelasJadwal]
  );

  const materiTerbaru = useMemo(
    () => [...materi].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).slice(0, 5),
    [materi]
  );
  const tugasTerbaru = useMemo(() => tugas.slice(0, 5), [tugas]); // API sudah urut terbaru
  const hariIni = new Date().toISOString().slice(0, 10);
  const assessmentBerjalan = useMemo(
    () =>
      assessment
        .filter((a) => !a.deadlineDate || a.deadlineDate >= hariIni)
        .map((a) => {
          const target = norm(a.kelas) === 'semua' ? siswa.length : siswa.filter((s) => norm(s.kelas) === norm(a.kelas)).length;
          const sudah = hasil.filter((h) => String(h.assessmentId) === String(a.id)).length;
          return { ...a, sudah, target };
        }),
    [assessment, siswa, hasil, hariIni]
  );

  // ---- laporan dari data asli ----
  const laporan = useMemo(() => {
    const periode = 'Data per ' + tgl(new Date());

    // 1. jam mengajar per guru
    const jamGuru = new Map();
    guru.forEach((g) => jamGuru.set(norm(g.nama), { nama: g.nama, jam: 0, slot: 0 }));
    jadwal.forEach((j) => {
      const e = jamGuru.get(norm(j.guru)) || { nama: j.guru, jam: 0, slot: 0 };
      e.jam += hitungJam(j.jam); e.slot += 1;
      jamGuru.set(norm(j.guru), e);
    });
    const barisJam = [...jamGuru.values()].filter((e) => e.nama).sort((a, b) => b.jam - a.jam);
    const terjadwal = barisJam.filter((e) => e.jam > 0);
    const rata = terjadwal.length ? Math.round((terjadwal.reduce((n, e) => n + e.jam, 0) / terjadwal.length) * 10) / 10 : 0;
    const diAtas = barisJam.filter((e) => e.jam > 26).length;
    const r1 = {
      judul: 'Laporan Distribusi Jam Mengajar', tipe: 'Beban mengajar per guru', periode,
      ringkasan: terjadwal.length
        ? `Rata-rata beban mengajar ${rata} jam/minggu dari ${terjadwal.length} guru yang sudah terjadwal. ${diAtas} guru di atas 26 jam/minggu, ${barisJam.length - terjadwal.length} guru belum punya jadwal.`
        : 'Belum ada jadwal pelajaran, jadi beban mengajar belum bisa dihitung.',
      head: ['Guru', 'Jam/minggu', 'Jumlah sesi'],
      rows: barisJam.map((e) => [e.nama, e.jam, e.slot]),
    };

    // 2. rekap jadwal + bentrok
    const kunciGuru = new Map(), kunciKelas = new Map();
    let bentrok = 0;
    jadwal.forEach((j) => {
      const a = `${norm(j.guru)}|${j.hari}|${j.jam}`, b = `${norm(j.kelas)}|${j.hari}|${j.jam}`;
      if (kunciGuru.has(a) && kunciGuru.get(a) !== norm(j.kelas)) bentrok++;
      kunciGuru.set(a, norm(j.kelas));
      if (kunciKelas.has(b)) bentrok++;
      kunciKelas.set(b, 1);
    });
    const kelasBerjadwal = new Set(jadwal.map((j) => norm(j.kelas)));
    const tanpa = daftarKelas.filter((k) => !kelasBerjadwal.has(norm(k)));
    const r2 = {
      judul: 'Laporan Jadwal Pelajaran', tipe: 'Rekap jadwal seluruh kelas', periode,
      ringkasan: `${daftarKelas.length - tanpa.length} dari ${daftarKelas.length} kelas sudah punya jadwal. ${bentrok === 0 ? 'Tidak ada bentrok jadwal terdeteksi.' : bentrok + ' bentrok jadwal terdeteksi (guru atau kelas di jam yang sama).'}`,
      head: ['Kelas', 'Hari', 'Jam ke', 'Mata pelajaran', 'Guru'],
      rows: [
        ...[...jadwal].sort((a, b) => a.kelas.localeCompare(b.kelas) || HARI.indexOf(a.hari) - HARI.indexOf(b.hari) || urutJam(a.jam) - urutJam(b.jam))
          .map((j) => [j.kelas, j.hari, j.jam, j.mapel, j.guru]),
        ...tanpa.map((k) => [k, '-', '-', 'Belum ada jadwal', '-']),
      ],
    };

    // 3. aktivitas per guru
    const akt = new Map();
    const hitung = (arr, f) => arr.forEach((x) => {
      const k = norm(x.guru); if (!k) return;
      const e = akt.get(k) || { nama: x.guru, materi: 0, tugas: 0, assessment: 0 };
      e[f]++; akt.set(k, e);
    });
    guru.forEach((g) => akt.set(norm(g.nama), { nama: g.nama, materi: 0, tugas: 0, assessment: 0 }));
    hitung(materi, 'materi'); hitung(tugas, 'tugas'); hitung(assessment, 'assessment');
    const r3 = {
      judul: 'Laporan Aktivitas Pembelajaran', tipe: 'Materi, tugas, dan assessment', periode,
      ringkasan: `Total ${materi.length} materi, ${tugas.length} tugas, dan ${assessment.length} assessment dibuat oleh guru.`,
      head: ['Guru', 'Materi', 'Tugas', 'Assessment'],
      rows: [...akt.values()].sort((a, b) => b.materi + b.tugas + b.assessment - (a.materi + a.tugas + a.assessment))
        .map((e) => [e.nama, e.materi, e.tugas, e.assessment]),
    };
    return [r1, r2, r3];
  }, [guru, jadwal, materi, tugas, assessment, daftarKelas]);

  function unduhLaporan(l) {
    const baris = [[l.judul], [l.tipe + ' - ' + l.periode], [l.ringkasan], [], l.head, ...l.rows];
    const csv = '﻿' + baris.map((r) => r.map(csvEscape).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = l.judul.replace(/\s+/g, '-').toLowerCase() + '.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Laporan sedang diunduh...');
  }

  function cetakLaporan(l) {
    const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const w = window.open('', '_blank');
    if (!w) { showToast('Pop-up diblokir. Izinkan pop-up lalu coba lagi.'); return; }
    w.document.write(`<html><head><title>${esc(l.judul)}</title><style>
      body{font-family:Segoe UI,Arial,sans-serif;padding:28px;color:#152621}
      h1{font-size:20px;margin:0 0 4px}p{font-size:13px;color:#5C726C}
      table{border-collapse:collapse;width:100%;margin-top:14px;font-size:13px}
      th,td{border:1px solid #ccd5d2;padding:7px 10px;text-align:left}th{background:#EFF8F4}
    </style></head><body><h1>${esc(l.judul)}</h1><p>SMK Citra Negara - ${esc(l.tipe)} - ${esc(l.periode)}</p><p>${esc(l.ringkasan)}</p>
    <table><thead><tr>${l.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>
    ${l.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`);
    w.document.close(); w.focus();
    setTimeout(() => w.print(), 300);
    showToast('Menyiapkan dokumen untuk dicetak...');
  }

  async function simpanJadwal() {
    const f = formJadwal;
    if (!kelasJadwal || !f.jam.trim() || !f.mapel || !f.guru) { showToast('Lengkapi jam, mata pelajaran, dan guru.'); return; }
    const r = await fetch('/api/jadwal', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kelas: kelasJadwal, hari: f.hari, jam: f.jam.trim(), mapel: f.mapel, guru: f.guru }),
    });
    if (!r.ok) { showToast('Gagal menyimpan jadwal.'); return; }
    setJadwalModal(false);
    setFormJadwal({ hari: 'Senin', jam: '', mapel: '', guru: '' });
    showToast('Jadwal ditambahkan');
    muat();
  }

  async function hapusJadwal(id) {
    const r = await fetch('/api/jadwal/' + id, { method: 'DELETE' });
    if (!r.ok) { showToast('Gagal menghapus jadwal.'); return; }
    showToast('Jadwal dihapus');
    muat();
  }

  const namaUser = user?.nama || 'Waka Kurikulum';
  const ini = inisial(namaUser);

  if (!siap) return null;

  const kosong = (t) => <div style={{ padding: '14px 0', fontSize: 13, color: 'var(--ink-faint)' }}>{t}</div>;

  return (
    <div className="app">
      <style jsx global>{styles}</style>

      <aside className="sidebar">
        <nav className="menu">
          {MENU_ITEMS.map((item) => (
            <button key={item.key} className={`nav-item${activeSection === item.key ? ' active' : ''}`} onClick={() => setActiveSection(item.key)}>
              <span className="label">{item.label}</span>
            </button>
          ))}
          <div className="nav-divider" />
          <button className="nav-item nav-item-danger" onClick={() => setConfirmLogout(true)}>
            <span className="ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg></span>
            <span className="label">Logout</span>
          </button>
        </nav>
        <div className="profile-mini" onClick={() => setActiveSection('profil')}>
          <div className="avatar-sm">{ini}</div>
          <div>
            <div className="pm-name">{namaUser}</div>
            <div className="pm-role">Kurikulum</div>
          </div>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <div className="topbar-brand">
            <img src="/logo-smk.png" alt="Logo SMK Citra Negara" />
            LMS SMK CITRA NEGARA
          </div>
          <div className="topbar-user">
            <div className="name">{namaUser}</div>
            <div className="avatar-user">{ini}</div>
          </div>
        </div>

        <div className="content">

          {activeSection === 'beranda' && (
            <section>
              <p className="greeting">Selamat datang, {namaUser}</p>
              <p className="greeting-sub">Ringkasan struktur kurikulum sekolah</p>
              <div className="stats-row">
                <div className="stat-card"><div className="stat-label">Total mata pelajaran</div><div className="stat-value">{memuat ? '...' : mapelList.length}</div></div>
                <div className="stat-card"><div className="stat-label">Total guru</div><div className="stat-value">{memuat ? '...' : guru.length}</div></div>
                <div className="stat-card"><div className="stat-label">Total kelas</div><div className="stat-value">{memuat ? '...' : daftarKelas.length}</div></div>
                <div className="stat-card"><div className="stat-label">Jadwal aktif</div><div className="stat-value">{memuat ? '...' : jadwal.length}</div><div className="stat-sub">sesi terdaftar</div></div>
              </div>
              <div className="panel">
                <div className="panel-head"><h2>Aktivitas terbaru</h2></div>
                <div className="panel-body">
                  {materiTerbaru.slice(0, 2).map((a) => (
                    <div className="list-row" key={'m' + a.id}><div><div className="title">Materi "{a.judul}" ditambahkan oleh {a.guru}</div><div className="sub">{a.mapel} · {tgl(a.tanggal)}</div></div></div>
                  ))}
                  {tugasTerbaru.slice(0, 2).map((a) => (
                    <div className="list-row" key={'t' + a.id}><div><div className="title">Tugas "{a.judul}" diberikan oleh {a.guru}</div><div className="sub">{a.mapel} · {a.kelas} · tenggat {tgl(a.deadline)}</div></div></div>
                  ))}
                  {assessment.length > 0 && (() => { const a = assessment[assessment.length - 1]; return (
                    <div className="list-row"><div><div className="title">{a.tipe} "{a.judul}" dibuat oleh {a.guru}</div><div className="sub">{a.mapel} · {a.kelas}</div></div></div>
                  ); })()}
                  {!memuat && materi.length + tugas.length + assessment.length === 0 && kosong('Belum ada aktivitas dari guru.')}
                </div>
              </div>
            </section>
          )}

          {activeSection === 'mapel' && (
            <section>
              <p className="page-title">Mata Pelajaran</p>
              <p className="page-sub">Daftar mata pelajaran dan guru pengampunya (hanya lihat)</p>
              <div className="panel">
                <table>
                  <thead><tr><th>Kode</th><th>Nama mapel</th><th>Jam/minggu</th><th>Guru pengampu</th></tr></thead>
                  <tbody>
                    {mapelList.length === 0 && (
                      <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--ink-faint)' }}>Belum ada mata pelajaran. Isi data guru di dashboard admin.</td></tr>
                    )}
                    {mapelList.map((m) => (
                      <tr key={m.kode}>
                        <td style={{ fontWeight: 600 }}>{m.kode}</td>
                        <td>{m.nama}</td>
                        <td>{m.jam ? `${m.jam} jam` : '-'}</td>
                        <td>{m.guru}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeSection === 'jadwal' && (
            <section>
              <p className="page-title">Jadwal Pelajaran</p>
              <p className="page-sub">Atur dan lihat jadwal pelajaran per kelas</p>
              <div className="panel">
                <div className="panel-head">
                  <h2>Jadwal - {kelasJadwal || '-'}</h2>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select className="btn" style={{ cursor: 'pointer' }} value={kelasJadwal} onChange={(e) => setKelasJadwal(e.target.value)}>
                      {daftarKelas.map((k) => <option key={k}>{k}</option>)}
                    </select>
                    <button className="btn btn-primary" onClick={() => setJadwalModal(true)} disabled={!kelasJadwal}>+ Tambah jadwal</button>
                  </div>
                </div>
                <table>
                  <thead><tr><th>Hari</th><th>Jam ke</th><th>Mata pelajaran</th><th>Guru</th><th /></tr></thead>
                  <tbody>
                    {jadwalKelas.length === 0 && (
                      <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--ink-faint)' }}>Belum ada jadwal untuk kelas ini.</td></tr>
                    )}
                    {jadwalKelas.map((j) => (
                      <tr key={j.id}>
                        <td style={{ fontWeight: 600 }}>{j.hari}</td>
                        <td>Jam ke-{j.jam}</td>
                        <td>{j.mapel}</td>
                        <td>{j.guru}</td>
                        <td style={{ textAlign: 'right' }}><button className="btn" onClick={() => hapusJadwal(j.id)}>Hapus</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeSection === 'penugasan' && (
            <section>
              <p className="page-title">Penugasan Guru</p>
              <p className="page-sub">Guru yang mengajar tiap mata pelajaran di tiap kelas (hanya lihat)</p>
              <div className="panel">
                <table>
                  <thead><tr><th>Guru</th><th>Mata pelajaran</th><th>Kelas</th></tr></thead>
                  <tbody>
                    {penugasan.length === 0 && (
                      <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--ink-faint)' }}>Belum ada penugasan.</td></tr>
                    )}
                    {penugasan.map((p, i) => (
                      <tr key={p.guru + p.mapel + p.kelas + i}>
                        <td style={{ fontWeight: 600 }}>{p.guru}</td>
                        <td>{p.mapel}</td>
                        <td>{p.kelas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeSection === 'aktivitas' && (
            <section>
              <p className="page-title">Aktivitas Pembelajaran</p>
              <p className="page-sub">Pantauan materi, tugas, dan assessment dari seluruh guru (hanya lihat)</p>
              <div className="grid-2">
                <div className="panel">
                  <div className="panel-head"><h2>Materi terbaru</h2></div>
                  <div className="panel-body">
                    {materiTerbaru.length === 0 && kosong('Belum ada materi.')}
                    {materiTerbaru.map((a) => (
                      <div className="list-row" key={a.id}><div><div className="title">{a.judul}</div><div className="sub">{a.mapel} · {a.guru} · {tgl(a.tanggal)}</div></div></div>
                    ))}
                  </div>
                </div>
                <div className="panel">
                  <div className="panel-head"><h2>Tugas yang diberikan</h2></div>
                  <div className="panel-body">
                    {tugasTerbaru.length === 0 && kosong('Belum ada tugas.')}
                    {tugasTerbaru.map((a) => (
                      <div className="list-row" key={a.id}><div><div className="title">{a.judul}</div><div className="sub">{a.mapel} · {a.kelas} · tenggat {tgl(a.deadline)}</div></div></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="panel">
                <div className="panel-head"><h2>Assessment yang sedang berjalan</h2></div>
                <table>
                  <thead><tr><th>Judul</th><th>Guru</th><th>Kelas</th><th>Progres pengerjaan</th><th>Tenggat</th></tr></thead>
                  <tbody>
                    {assessmentBerjalan.length === 0 && (
                      <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--ink-faint)' }}>Tidak ada assessment yang sedang berjalan.</td></tr>
                    )}
                    {assessmentBerjalan.map((a) => (
                      <tr key={a.id}>
                        <td style={{ fontWeight: 600 }}>{a.judul}</td>
                        <td>{a.guru}</td>
                        <td>{a.kelas}</td>
                        <td>{a.sudah} dari {a.target} siswa</td>
                        <td>{a.deadlineDate ? tgl(a.deadlineDate) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeSection === 'laporan' && (
            <section>
              <p className="page-title">Laporan</p>
              <p className="page-sub">Lihat, cetak, atau unduh laporan kurikulum</p>
              <div className="panel">
                {laporan.map((l, i) => (
                  <div className="list-row" style={{ padding: '16px 18px' }} key={l.judul}>
                    <div><div className="title">{l.judul}</div><div className="sub">{l.tipe} · {l.periode}</div></div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn" onClick={() => setLaporanModal({ open: true, index: i })}>Lihat</button>
                      <button className="btn" onClick={() => cetakLaporan(l)}>Cetak</button>
                      <button className="btn btn-primary" onClick={() => unduhLaporan(l)}>Download</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeSection === 'profil' && (
            <section>
              <p className="page-title">Profil</p>
              <p className="page-sub">Data pribadi kamu</p>
              <div className="profile-card">
                <div className="profile-avatar">{ini}</div>
                <div className="field-row"><label>Nama lengkap</label><input type="text" value={user?.nama || ''} placeholder="Belum diisi" readOnly /></div>
                <div className="field-row"><label>Jabatan</label><input type="text" value="Wakil Kepala Sekolah Bidang Kurikulum" readOnly /></div>
                <div className="field-row"><label>Email</label><input type="text" value={user?.email || ''} placeholder="Belum diisi" readOnly /></div>
                <div className="field-row"><label>Peran</label><input type="text" value={user?.role || ''} readOnly /></div>
              </div>
            </section>
          )}

        </div>
      </div>

      {laporanModal.open && laporan[laporanModal.index] && (() => { const l = laporan[laporanModal.index]; return (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setLaporanModal({ open: false, index: null })}>
          <div className="modal" style={{ width: 620 }}>
            <h3>{l.judul}</h3>
            <p className="sub">{l.tipe} · {l.periode}</p>
            <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.6 }}>{l.ringkasan}</p>
            {l.rows.length > 0 && (
              <div style={{ border: '1px solid var(--line)', borderRadius: 10, overflow: 'auto', maxHeight: 280, marginTop: 10 }}>
                <table>
                  <thead><tr>{l.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
                  <tbody>{l.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
                </table>
              </div>
            )}
            <div className="form-actions">
              <button className="btn" onClick={() => setLaporanModal({ open: false, index: null })}>Tutup</button>
            </div>
          </div>
        </div>
      ); })()}

      {jadwalModal && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setJadwalModal(false)}>
          <div className="modal">
            <h3>Tambah jadwal</h3>
            <p className="sub">Kelas {kelasJadwal}</p>
            <div className="field-row"><label>Hari</label>
              <select className="btn" value={formJadwal.hari} onChange={(e) => setFormJadwal({ ...formJadwal, hari: e.target.value })}>
                {HARI.map((h) => <option key={h}>{h}</option>)}
              </select>
            </div>
            <div className="field-row"><label>Jam ke (contoh: 1-2)</label>
              <input type="text" value={formJadwal.jam} onChange={(e) => setFormJadwal({ ...formJadwal, jam: e.target.value })} placeholder="1-2" />
            </div>
            <div className="field-row"><label>Mata pelajaran</label>
              <select className="btn" value={formJadwal.mapel} onChange={(e) => setFormJadwal({ ...formJadwal, mapel: e.target.value })}>
                <option value="">Pilih mata pelajaran</option>
                {mapelList.map((m) => <option key={m.kode}>{m.nama}</option>)}
              </select>
            </div>
            <div className="field-row"><label>Guru</label>
              <select className="btn" value={formJadwal.guru} onChange={(e) => setFormJadwal({ ...formJadwal, guru: e.target.value })}>
                <option value="">Pilih guru</option>
                {guru.map((g) => <option key={g.id}>{g.nama}</option>)}
              </select>
            </div>
            <div className="form-actions">
              <button className="btn" onClick={() => setJadwalModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={simpanJadwal}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {confirmLogout && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setConfirmLogout(false)}>
          <div className="modal small">
            <h3>Keluar dari akun?</h3>
            <p className="sub">Kamu akan diarahkan kembali ke halaman login.</p>
            <div className="form-actions">
              <button className="btn" onClick={() => setConfirmLogout(false)}>Batal</button>
              <button
                className="btn btn-primary"
                style={{ background: 'var(--coral)', borderColor: 'var(--coral)' }}
                onClick={() => {
                  localStorage.removeItem('user');
                  window.location.href = '/login';
                }}
              >
                Ya, keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast show">{toast}</div>}
    </div>
  );
}

const styles = `
:root{
  --bg:#EDEFEE; --surface:#FFFFFF;
  --tosca-900:#0B4A44; --tosca-800:#0E5C54; --tosca-700:#127167; --tosca-600:#178A7C; --tosca-500:#1EA391;
  --tosca-100:#DCF1EA; --tosca-50:#EFF8F4;
  --ink:#152621; --ink-soft:#5C726C; --ink-faint:#93A6A0; --line:#E1E6E4;
  --coral:#E4633F; --coral-100:#FCE7DF; --coral-700:#9E3B21;
  --amber:#C98A1C; --amber-100:#FBEEDA;
  --blue:#2563EB; --blue-100:#DBEAFE;
}
*{box-sizing:border-box;}
body{margin:0;font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:var(--bg);color:var(--ink);}
.app{display:flex;min-height:100vh;}
.sidebar{width:210px;flex-shrink:0;background:var(--tosca-900);color:#EAF4F1;display:flex;flex-direction:column;padding:18px 12px;}
nav.menu{display:flex;flex-direction:column;gap:2px;flex:1;margin-top:4px;}
.nav-item{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:8px;font-size:13.5px;color:#C7E3DC;cursor:pointer;border:none;background:none;text-align:left;width:100%;font-family:inherit;white-space:nowrap;}
.nav-item:hover{background:rgba(255,255,255,0.06);color:#fff;}
.nav-item.active{background:var(--tosca-600);color:#fff;font-weight:600;}
.nav-item-danger{color:#F3B4A2;}
.nav-item-danger:hover{background:rgba(228,99,63,0.18);color:#FFD9CC;}
.nav-divider{height:1px;background:rgba(255,255,255,0.1);margin:12px 6px;}
.profile-mini{display:flex;align-items:center;gap:9px;padding:10px;margin-top:8px;border-radius:9px;background:rgba(255,255,255,0.05);cursor:pointer;}
.profile-mini:hover{background:rgba(255,255,255,0.09);}
.profile-mini .avatar-sm{width:32px;height:32px;border-radius:50%;background:var(--tosca-500);color:var(--tosca-900);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;}
.profile-mini .pm-name{font-size:12.5px;font-weight:700;color:#fff;}
.profile-mini .pm-role{font-size:11px;color:#9FC6BE;}
.main{flex:1;min-width:0;display:flex;flex-direction:column;}
.topbar{height:58px;flex-shrink:0;background:var(--surface);border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;padding:0 22px;}
.topbar-brand{font-size:12px;font-weight:700;color:var(--tosca-700);letter-spacing:0.3px;display:flex;align-items:center;gap:8px;}
.topbar-brand img{width:22px;height:22px;object-fit:contain;}
.topbar-user{display:flex;align-items:center;gap:10px;}
.topbar-user .name{font-size:12.5px;font-weight:700;}
.avatar-user{width:32px;height:32px;border-radius:50%;background:var(--tosca-100);color:var(--tosca-800);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;}
.content{padding:22px;overflow-y:auto;}
.greeting{font-size:15.5px;font-weight:700;margin:0 0 4px;}
.greeting-sub{font-size:12.5px;color:var(--ink-soft);margin:0 0 18px;}
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px;}
.stat-card{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:16px 16px;}
.stat-label{font-size:11.5px;color:var(--ink-soft);}
.stat-value{font-size:23px;font-weight:700;margin-top:6px;}
.stat-sub{font-size:11px;color:var(--tosca-600);margin-top:3px;font-weight:600;}
.panel{background:var(--surface);border:1px solid var(--line);border-radius:12px;overflow:hidden;margin-bottom:16px;}
.panel-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--line);gap:12px;flex-wrap:wrap;}
.panel-head h2{font-size:14.5px;font-weight:700;margin:0;}
.panel-body{padding:14px 18px;}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.list-row{display:flex;align-items:center;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--line);gap:12px;}
.list-row:last-child{border-bottom:none;}
.list-row .title{font-size:13.5px;font-weight:600;}
.list-row .sub{font-size:12px;color:var(--ink-soft);margin-top:2px;}
.btn{display:inline-flex;align-items:center;gap:6px;font-family:inherit;font-size:12.5px;font-weight:600;padding:8px 14px;border-radius:8px;border:1px solid var(--line);background:var(--surface);color:var(--ink);cursor:pointer;white-space:nowrap;}
.btn:hover{background:var(--tosca-50);}
.btn-primary{background:var(--tosca-700);border-color:var(--tosca-700);color:#fff;}
.btn-primary:hover{background:var(--tosca-600);}
.page-title{font-size:18px;font-weight:700;margin:0 0 3px;}
.page-sub{font-size:12.5px;color:var(--ink-soft);margin:0 0 18px;}
table{width:100%;border-collapse:collapse;}
thead th{text-align:left;font-size:11.5px;color:var(--ink-soft);font-weight:600;padding:10px 18px;border-bottom:1px solid var(--line);background:var(--tosca-50);}
tbody td{padding:11px 18px;font-size:13px;border-bottom:1px solid var(--line);vertical-align:middle;}
tbody tr:last-child td{border-bottom:none;}
.profile-card{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:24px;max-width:420px;}
.profile-avatar{width:64px;height:64px;border-radius:50%;background:var(--tosca-100);color:var(--tosca-800);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;margin:0 auto 14px;}
.field-row{display:flex;flex-direction:column;gap:5px;margin-bottom:14px;}
.field-row label{font-size:12px;font-weight:600;color:var(--ink-soft);}
.field-row input{font-family:inherit;font-size:13.5px;padding:9px 11px;border:1px solid var(--line);border-radius:8px;background:var(--tosca-50);outline:none;color:var(--ink);}
.modal-overlay{display:none;position:fixed;inset:0;background:rgba(11,38,33,0.45);align-items:center;justify-content:center;z-index:50;padding:20px;}
.modal-overlay.open{display:flex;}
.modal{background:var(--surface);border-radius:14px;width:460px;max-width:100%;max-height:88vh;overflow-y:auto;padding:22px 22px 18px;}
.modal.small{width:340px;}
.modal h3{margin:0 0 2px;font-size:16px;font-weight:700;}
.modal p.sub{margin:0 0 16px;font-size:12.5px;color:var(--ink-soft);}
.form-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:16px;}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--tosca-900);color:#fff;padding:11px 20px;border-radius:10px;font-size:13px;font-weight:600;z-index:100;box-shadow:0 4px 16px rgba(0,0,0,0.2);}
@media (max-width:1000px){
  .stats-row{grid-template-columns:repeat(2,1fr);}
  .grid-2{grid-template-columns:1fr;}
}
@media (max-width:860px){
  .sidebar{width:64px;}
  .nav-item span.label{display:none;}
}
`;
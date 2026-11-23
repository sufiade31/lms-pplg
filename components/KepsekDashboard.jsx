'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import TrenNilai from '@/components/TrenNilai';

const MENU_ITEMS = [
  { key: 'beranda', label: 'Beranda' },
  { key: 'capaian', label: 'Capaian Belajar' },
  { key: 'aktivitas', label: 'Aktivitas Guru' },
  { key: 'kehadiran', label: 'Kehadiran' },
  { key: 'laporan', label: 'Laporan' },
  { key: 'notifikasi', label: 'Notifikasi' },
  { key: 'profil', label: 'Profil' },
];

const KKM = 75;       // batas nilai dianggap "mencapai target"
const BAIK = 80;      // rata-rata kelas/mapel >= ini dianggap baik

const norm = (s) => String(s || '').trim().toLowerCase();
const rata = (arr) => (arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null);
const inisial = (nama) =>
  String(nama || 'KS').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || 'KS';
const tgl = (d) => {
  if (!d) return '-';
  const x = new Date(d);
  return isNaN(x) ? String(d) : x.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

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

const csvEscape = (v) => {
  const s = String(v ?? '');
  return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

export default function KepsekDashboard() {
  const [user, setUser] = useState(null);
  const [siap, setSiap] = useState(false);
  const [data, setData] = useState({ guru: [], siswa: [], kelas: [], tugas: [], pengumpulan: [], materi: [], assessment: [], hasil: [], pengumuman: [] });
  const [memuat, setMemuat] = useState(true);
  const [activeSection, setActiveSection] = useState('beranda');
  const [laporanModal, setLaporanModal] = useState({ open: false, index: null });
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }

  useEffect(() => {
    const u = cariUser();
    if (!u) { window.location.replace('/login'); return; }
    if (u.role === 'guru') { window.location.replace('/guru'); return; }
    if (u.role === 'murid' || u.role === 'siswa') { window.location.replace('/siswa'); return; }
    setUser(u);
    setSiap(true);
  }, []);

  const muat = useCallback(async () => {
    const nama = ['guru', 'siswa', 'kelas', 'tugas', 'pengumpulan', 'materi', 'assessment', 'hasil', 'pengumuman'];
    const hasilAmbil = await Promise.all(nama.map((t) => ambil('/api/' + t)));
    setData(Object.fromEntries(nama.map((n, i) => [n, hasilAmbil[i]])));
    setMemuat(false);
  }, []);

  useEffect(() => { if (siap) muat(); }, [siap, muat]);

  const { guru, siswa, kelas, tugas, pengumpulan, materi, assessment, hasil, pengumuman } = data;

  const siswaAktif = useMemo(() => siswa.filter((s) => s.status !== 'Pindah'), [siswa]);
  const guruCuti = guru.filter((g) => g.status === 'Cuti').length;

  const daftarKelas = useMemo(() => {
    const s = new Set();
    kelas.forEach((k) => k.nama && s.add(k.nama));
    if (s.size === 0) siswaAktif.forEach((x) => x.kelas && s.add(x.kelas));
    return [...s];
  }, [kelas, siswaAktif]);

  // semua nilai asli: tugas yang sudah dinilai + hasil kuis/ulangan
  const nilaiRows = useMemo(() => {
    const tById = Object.fromEntries(tugas.map((t) => [String(t.id), t]));
    const aById = Object.fromEntries(assessment.map((a) => [String(a.id), a]));
    const rows = [];
    pengumpulan.forEach((p) => {
      if (p.nilai === null || p.nilai === undefined) return;
      const t = tById[String(p.tugasId)]; if (!t) return;
      rows.push({ mapel: t.mapel, kunci: norm(p.siswaNama), nilai: Number(p.nilai) });
    });
    hasil.forEach((h) => {
      if (h.nilai === null || h.nilai === undefined) return;
      const a = aById[String(h.assessmentId)]; if (!a) return;
      rows.push({ mapel: a.mapel, kunci: norm(h.siswaNama), nilai: Number(h.nilai) });
    });
    return rows;
  }, [tugas, assessment, pengumpulan, hasil]);

  const nilaiMapel = useMemo(() => {
    const m = new Map();
    nilaiRows.forEach((r) => {
      const k = norm(r.mapel);
      if (!m.has(k)) m.set(k, { nama: r.mapel, v: [] });
      m.get(k).v.push(r.nilai);
    });
    return [...m.values()].map((e) => ({ nama: e.nama, rata: rata(e.v), n: e.v.length })).sort((a, b) => a.nama.localeCompare(b.nama));
  }, [nilaiRows]);

  const rataSekolah = useMemo(() => rata(nilaiRows.map((r) => r.nilai)), [nilaiRows]);

  const rataSiswa = useMemo(() => {
    const m = new Map();
    nilaiRows.forEach((r) => { if (!m.has(r.kunci)) m.set(r.kunci, []); m.get(r.kunci).push(r.nilai); });
    return new Map([...m].map(([k, v]) => [k, rata(v)]));
  }, [nilaiRows]);

  const statusKelas = useMemo(
    () =>
      daftarKelas.map((k) => {
        const anggota = siswaAktif.filter((s) => norm(s.kelas) === norm(k));
        const punya = anggota.map((s) => rataSiswa.get(norm(s.nama))).filter((v) => v !== undefined && v !== null);
        const r = rata(punya);
        const capai = punya.length ? Math.round((punya.filter((v) => v >= KKM).length / punya.length) * 100) : null;
        return { nama: k, siswa: anggota.length, rata: r, capai, baik: r !== null && r >= BAIK };
      }),
    [daftarKelas, siswaAktif, rataSiswa]
  );

  const aktivitasGuru = useMemo(() => {
    const tugasIdMilik = (nama) => new Set(tugas.filter((t) => norm(t.guru) === norm(nama)).map((t) => String(t.id)));
    return guru.map((g) => {
      const m = materi.filter((x) => norm(x.guru) === norm(g.nama)).length;
      const t = tugas.filter((x) => norm(x.guru) === norm(g.nama)).length;
      const a = assessment.filter((x) => norm(x.guru) === norm(g.nama)).length;
      const ids = tugasIdMilik(g.nama);
      const masuk = pengumpulan.filter((p) => ids.has(String(p.tugasId)));
      const dinilai = masuk.filter((p) => p.nilai !== null && p.nilai !== undefined).length;
      const status = g.status === 'Cuti' ? 'Cuti' : m + t + a === 0 ? 'Belum aktif' : 'Aktif';
      return { nama: g.nama, mapel: g.mapel, materi: m, tugas: t, assessment: a, dinilai, masuk: masuk.length, status };
    });
  }, [guru, materi, tugas, assessment, pengumpulan]);

  const notifikasi = useMemo(() => {
    const out = [];
    const sekarang = Date.now();
    tugas.forEach((t) => {
      if (!t.deadline || new Date(t.deadline).getTime() >= sekarang) return;
      const target = norm(t.kelas) === 'semua' ? siswaAktif.length : siswaAktif.filter((s) => norm(s.kelas) === norm(t.kelas)).length;
      if (!target) return;
      const masuk = pengumpulan.filter((p) => String(p.tugasId) === String(t.id)).length;
      if (masuk / target < 0.6) out.push({ judul: `Tugas "${t.judul}" kurang terkumpul`, detail: `${t.mapel} · ${t.kelas} · baru ${masuk} dari ${target} siswa, tenggat ${tgl(t.deadline)}` });
    });
    aktivitasGuru.filter((g) => g.status === 'Belum aktif').forEach((g) =>
      out.push({ judul: `${g.nama} belum membuat materi, tugas, atau assessment`, detail: g.mapel })
    );
    statusKelas.filter((k) => k.rata !== null && !k.baik).forEach((k) =>
      out.push({ judul: `Kelas ${k.nama} perlu perhatian`, detail: `Rata-rata nilai ${k.rata}, ${k.capai}% siswa mencapai target` })
    );
    return out;
  }, [tugas, pengumpulan, siswaAktif, aktivitasGuru, statusKelas]);

  const laporan = useMemo(() => {
    const periode = 'Data per ' + tgl(new Date());
    return [
      {
        judul: 'Laporan Capaian Belajar', tipe: 'Rata-rata nilai per mata pelajaran', periode,
        ringkasan: rataSekolah === null ? 'Belum ada nilai yang tercatat.' : `Rata-rata nilai sekolah ${rataSekolah} dari ${nilaiRows.length} nilai. ${nilaiMapel.filter((m) => m.rata < BAIK).length} mata pelajaran di bawah ${BAIK}.`,
        head: ['Mata pelajaran', 'Rata-rata', 'Jumlah nilai'],
        rows: nilaiMapel.map((m) => [m.nama, m.rata, m.n]),
      },
      {
        judul: 'Laporan Status Kelas', tipe: 'Capaian per kelas', periode,
        ringkasan: `${statusKelas.length} kelas. ${statusKelas.filter((k) => k.rata !== null && !k.baik).length} kelas perlu perhatian (rata-rata di bawah ${BAIK}).`,
        head: ['Kelas', 'Jumlah siswa', 'Rata-rata nilai', '% mencapai target', 'Status'],
        rows: statusKelas.map((k) => [k.nama, k.siswa, k.rata ?? '-', k.capai === null ? '-' : k.capai + '%', k.rata === null ? 'Belum ada nilai' : k.baik ? 'Baik' : 'Perlu Perhatian']),
      },
      {
        judul: 'Laporan Aktivitas Guru', tipe: 'Materi, tugas, dan assessment', periode,
        ringkasan: `${aktivitasGuru.filter((g) => g.status === 'Aktif').length} dari ${guru.length} guru aktif. Total ${materi.length} materi, ${tugas.length} tugas, ${assessment.length} assessment.`,
        head: ['Guru', 'Mapel', 'Materi', 'Tugas', 'Assessment', 'Tugas dinilai', 'Status'],
        rows: aktivitasGuru.map((g) => [g.nama, g.mapel, g.materi, g.tugas, g.assessment, `${g.dinilai} dari ${g.masuk}`, g.status]),
      },
    ];
  }, [rataSekolah, nilaiRows, nilaiMapel, statusKelas, aktivitasGuru, guru, materi, tugas, assessment]);

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

  const namaUser = user?.nama || 'Kepala Sekolah';
  const ini = inisial(namaUser);

  if (!siap) return null;

  const kosong = (t) => <div style={{ padding: '14px 0', fontSize: 13, color: 'var(--ink-faint)' }}>{t}</div>;
  const angka = (v) => (memuat ? '...' : v);

  return (
    <div className="app">
      <style jsx global>{styles}</style>

      <aside className="sidebar">
        <nav className="menu">
          {MENU_ITEMS.map((item) => (
            <button key={item.key} className={`nav-item${activeSection === item.key ? ' active' : ''}`} onClick={() => setActiveSection(item.key)}>
              <span className="label">{item.label}</span>
              {item.key === 'notifikasi' && notifikasi.length > 0 && <span className="badge">{notifikasi.length}</span>}
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
            <div className="pm-role">Kepala Sekolah</div>
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
              <p className="greeting-sub">Ringkasan kondisi sekolah</p>
              <div className="stats-row">
                <div className="stat-card"><div className="stat-label">Siswa aktif</div><div className="stat-value">{angka(siswaAktif.length)}</div></div>
                <div className="stat-card"><div className="stat-label">Guru</div><div className="stat-value">{angka(guru.length)}</div>{guruCuti > 0 && <div className="stat-sub">{guruCuti} sedang cuti</div>}</div>
                <div className="stat-card"><div className="stat-label">Kelas</div><div className="stat-value">{angka(daftarKelas.length)}</div></div>
                <div className="stat-card"><div className="stat-label">Rata-rata nilai sekolah</div><div className="stat-value">{angka(rataSekolah ?? '-')}</div></div>
              </div>
              <div className="grid-2">
                <div className="panel">
                  <div className="panel-head"><h2>Perlu perhatian</h2></div>
                  <div className="panel-body">
                    {notifikasi.length === 0 && kosong('Tidak ada hal yang perlu perhatian saat ini.')}
                    {notifikasi.slice(0, 4).map((n, i) => (
                      <div className="list-row" key={i}><div><div className="title">{n.judul}</div><div className="sub">{n.detail}</div></div></div>
                    ))}
                  </div>
                </div>
                <div className="panel">
                  <div className="panel-head"><h2>Pengumuman terbaru</h2></div>
                  <div className="panel-body">
                    {pengumuman.filter((p) => p.status === 'Terbit').length === 0 && kosong('Belum ada pengumuman terbit.')}
                    {pengumuman.filter((p) => p.status === 'Terbit').slice(0, 4).map((p) => (
                      <div className="list-row" key={p.id}><div><div className="title">{p.judul}</div><div className="sub">{p.tanggal || '-'} · {p.target}</div></div></div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'capaian' && (
            <section>
              <p className="page-title">Capaian Belajar</p>
              <p className="page-sub">Memantau hasil akademik siswa secara keseluruhan</p>
              <div className="grid-2">
                <div className="panel">
                  <div className="panel-head"><h2>Rata-rata nilai tiap mata pelajaran</h2></div>
                  <div className="panel-body">
                    {nilaiMapel.length === 0 && kosong('Belum ada nilai yang tercatat.')}
                    {nilaiMapel.map((m) => (
                      <div className="bar-row" key={m.nama}>
                        <span className="bar-name">{m.nama}</span>
                        <div className="bar-track"><div className="bar-fill" style={{ width: Math.min(100, m.rata) + '%', background: m.rata >= BAIK ? 'var(--tosca-500)' : 'var(--amber)' }} /></div>
                        <span className="bar-val">{m.rata}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="panel">
                  <div className="panel-head"><h2>Perkembangan rata-rata nilai sekolah</h2></div>
                  <TrenNilai />
                </div>
              </div>
              <div className="panel">
                <div className="panel-head"><h2>Daftar kelas dan status capaian</h2></div>
                <table>
                  <thead><tr><th>Kelas</th><th>Rata-rata nilai</th><th>% mencapai target</th><th>Status</th></tr></thead>
                  <tbody>
                    {statusKelas.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--ink-faint)' }}>Belum ada kelas.</td></tr>}
                    {statusKelas.map((k) => (
                      <tr key={k.nama}>
                        <td style={{ fontWeight: 600 }}>{k.nama}</td>
                        <td>{k.rata ?? '-'}</td>
                        <td>{k.capai === null ? '-' : `${k.capai}% siswa mencapai target`}</td>
                        <td>{k.rata === null ? <span className="pill">Belum ada nilai</span> : k.baik ? <span className="pill pill-ok">Baik</span> : <span className="pill pill-warn">Perlu Perhatian</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeSection === 'aktivitas' && (
            <section>
              <p className="page-title">Aktivitas Guru</p>
              <p className="page-sub">Pantauan materi, tugas, dan assessment dari tiap guru</p>
              <div className="panel">
                <table>
                  <thead><tr><th>Guru</th><th>Mapel</th><th>Materi</th><th>Tugas</th><th>Assessment</th><th>Tugas dinilai</th><th>Status</th></tr></thead>
                  <tbody>
                    {aktivitasGuru.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--ink-faint)' }}>Belum ada data guru.</td></tr>}
                    {aktivitasGuru.map((g) => (
                      <tr key={g.nama}>
                        <td style={{ fontWeight: 600 }}>{g.nama}</td>
                        <td>{g.mapel}</td>
                        <td>{g.materi}</td>
                        <td>{g.tugas}</td>
                        <td>{g.assessment}</td>
                        <td>{g.dinilai} dari {g.masuk}</td>
                        <td><span className={`pill ${g.status === 'Aktif' ? 'pill-ok' : g.status === 'Cuti' ? '' : 'pill-warn'}`}>{g.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeSection === 'kehadiran' && (
            <section>
              <p className="page-title">Kehadiran</p>
              <p className="page-sub">Rekap kehadiran siswa dan guru</p>
              <div className="panel">
                <div className="panel-body" style={{ padding: '28px 22px' }}>
                  <div className="title" style={{ fontSize: 15, fontWeight: 700 }}>Data kehadiran belum tersedia</div>
                  <div className="sub" style={{ marginTop: 6, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                    LMS belum menyimpan data absensi, jadi menu ini belum menampilkan angka. Menu akan terisi setelah fitur absensi (diisi guru) ditambahkan.
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'laporan' && (
            <section>
              <p className="page-title">Laporan</p>
              <p className="page-sub">Lihat, cetak, atau unduh laporan sekolah</p>
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

          {activeSection === 'notifikasi' && (
            <section>
              <p className="page-title">Notifikasi</p>
              <p className="page-sub">Hal yang perlu kamu ketahui</p>
              <div className="panel">
                <div className="panel-body">
                  {notifikasi.length === 0 && kosong('Tidak ada notifikasi.')}
                  {notifikasi.map((n, i) => (
                    <div className="list-row" key={i}><div><div className="title">{n.judul}</div><div className="sub">{n.detail}</div></div></div>
                  ))}
                </div>
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
                <div className="field-row"><label>Jabatan</label><input type="text" value="Kepala Sekolah" readOnly /></div>
                <div className="field-row"><label>Email</label><input type="text" value={user?.email || ''} placeholder="Belum diisi" readOnly /></div>
                <div className="field-row"><label>Peran</label><input type="text" value={user?.role || ''} readOnly /></div>
              </div>
            </section>
          )}

        </div>
      </div>

      {laporanModal.open && laporan[laporanModal.index] && (() => { const l = laporan[laporanModal.index]; return (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setLaporanModal({ open: false, index: null })}>
          <div className="modal" style={{ width: 640 }}>
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

.nav-item .badge{margin-left:auto;background:var(--coral);color:#fff;border-radius:50%;min-width:18px;height:18px;padding:0 4px;font-size:10.5px;font-weight:700;display:flex;align-items:center;justify-content:center;}
.bar-row{display:grid;grid-template-columns:150px 1fr 36px;align-items:center;gap:16px;padding:11px 0;border-bottom:1px solid var(--line);}
.bar-row:last-child{border-bottom:none;}
.bar-name{font-size:13px;font-weight:600;}
.bar-track{height:8px;border-radius:99px;background:var(--tosca-50);overflow:hidden;}
.bar-fill{height:100%;border-radius:99px;}
.bar-val{font-size:13px;font-weight:700;text-align:right;}
.pill{display:inline-block;padding:3px 10px;border-radius:99px;font-size:11.5px;font-weight:600;background:#EEF1F0;color:var(--ink-soft);}
.pill-ok{background:var(--tosca-100);color:var(--tosca-800);}
.pill-warn{background:var(--coral-100);color:var(--coral-700);}
@media (max-width:1000px){
  .stats-row{grid-template-columns:repeat(2,1fr);}
  .grid-2{grid-template-columns:1fr;}
}
@media (max-width:860px){
  .sidebar{width:64px;}
  .nav-item span.label{display:none;}
}
`;
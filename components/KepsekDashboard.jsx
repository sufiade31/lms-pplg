'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const MENU_ITEMS = [
  { key: 'beranda', label: 'Beranda' },
  { key: 'capaian', label: 'Capaian Belajar' },
  { key: 'guru', label: 'Aktivitas Guru' },
  { key: 'kehadiran', label: 'Kehadiran' },
  { key: 'laporan', label: 'Laporan' },
  { key: 'notifikasi', label: 'Notifikasi', badge: 3 },
  { key: 'profil', label: 'Profil' },
];

const ACTIVITY = [
  { t: 'Pak Budiono menambahkan materi baru "Normalisasi Tabel"', m: 'Basis Data · XII PPLG 2 · hari ini' },
  { t: '3 dari 4 siswa sudah mengerjakan Kuis Normalisasi Data', m: 'Basis Data · hari ini' },
  { t: 'Laporan kehadiran mingguan sudah tersedia', m: 'Administrasi · kemarin' },
  { t: 'Rata-rata nilai kelas XI TKJ 2 turun 3 poin bulan ini', m: 'Capaian belajar · kemarin' },
];
const KEHADIRAN_7HARI = [
  { label: 'Sen', value: 92, suffix: '%' }, { label: 'Sel', value: 95, suffix: '%' }, { label: 'Rab', value: 90, suffix: '%' },
  { label: 'Kam', value: 93, suffix: '%' }, { label: 'Jum', value: 88, suffix: '%' }, { label: 'Sab', value: 91, suffix: '%' }, { label: 'Ini', value: 94, suffix: '%' },
];
const MAPEL_CAPAIAN = [
  { mapel: 'Matematika', rata: 79 },
  { mapel: 'Bahasa Indonesia', rata: 84 },
  { mapel: 'Basis Data', rata: 83 },
  { mapel: 'Pemrograman Web', rata: 88 },
  { mapel: 'Bahasa Inggris', rata: 76 },
];
const TREND_NILAI = [
  { label: 'Mei', value: 78 }, { label: 'Jun', value: 80 }, { label: 'Jul', value: 79 }, { label: 'Agu', value: 82 }, { label: 'Sep', value: 83 },
];
const KELAS_CAPAIAN = [
  { kelas: 'XII PPLG 1', rata: 85, capaian: 86, status: 'Baik' },
  { kelas: 'XII PPLG 2', rata: 82, capaian: 81, status: 'Baik' },
  { kelas: 'XI TKJ 2', rata: 78, capaian: 74, status: 'Perlu Perhatian' },
  { kelas: 'X DKV 1', rata: 80, capaian: 79, status: 'Baik' },
];
const GURU_AKTIF = [
  { nama: 'Budiono, S.Pd.', mapel: 'Basis Data, Pemrograman Web', kelas: 'XII PPLG 2', status: 'Mengajar' },
  { nama: 'Siti Nurhaliza, S.Pd.', mapel: 'Matematika', kelas: 'XII PPLG 1', status: 'Mengajar' },
  { nama: 'Rina Amelia, S.Pd.', mapel: 'Fisika', kelas: 'XI TKJ 2', status: 'Tidak ada jadwal' },
  { nama: 'Dewi Lestari, S.Pd.', mapel: 'Bahasa Inggris', kelas: 'X DKV 1', status: 'Mengajar' },
];
const MATERI_TERBARU = [
  { t: 'Normalisasi Tabel', m: 'Basis Data · Budiono, S.Pd. · 28 Agu 2026' },
  { t: 'Fungsi Trigonometri', m: 'Matematika · Siti Nurhaliza, S.Pd. · 28 Agu 2026' },
];
const TUGAS_TERBARU = [
  { t: 'Membuat ERD Toko Online', m: 'Basis Data · tenggat 9 Sep 2026' },
  { t: 'Landing Page Sekolah', m: 'Pemrograman Web · tenggat 7 Sep 2026' },
];
const ASSESSMENT_BERJALAN = [
  { judul: 'Kuis Normalisasi Data', guru: 'Budiono, S.Pd.', kelas: 'XII PPLG 2', progres: '3 dari 4 siswa', deadline: '8 Sep 2026' },
  { judul: 'Ulangan Harian Bab 2', guru: 'Dewi Lestari, S.Pd.', kelas: 'X DKV 1', progres: '12 dari 30 siswa', deadline: '10 Sep 2026' },
];
const LAPORAN_DATA = [
  { judul: 'Laporan Akademik', tipe: 'Rekap nilai & capaian belajar', periode: 'Semester ganjil 2026/2027', ringkasan: 'Rata-rata nilai sekolah 83, dengan 82% siswa mencapai target belajar di seluruh mata pelajaran.' },
  { judul: 'Laporan Kehadiran', tipe: 'Rekap kehadiran siswa & guru', periode: 'Bulan September 2026', ringkasan: 'Rata-rata kehadiran siswa 92%, guru 94% sepanjang bulan berjalan.' },
  { judul: 'Laporan Aktivitas Pembelajaran', tipe: 'Materi, tugas, dan assessment', periode: 'Bulan September 2026', ringkasan: 'Total 18 materi, 24 tugas, dan 9 assessment dibuat oleh guru sepanjang bulan ini.' },
];
const NOTIF_DATA = [
  { tipe: 'Info', judul: 'PTS akan dimulai', tanggal: '21 Sep 2026', isi: 'Penilaian Tengah Semester akan dimulai pada 21 September 2026 untuk seluruh jenjang.' },
  { tipe: 'Peringatan', judul: 'Kehadiran siswa menurun', tanggal: 'hari ini', isi: 'Kehadiran siswa kelas XI TKJ 2 menurun 6% dibanding minggu lalu, perlu ditindaklanjuti wali kelas.' },
  { tipe: 'Pengumuman', judul: 'Libur Hari Raya', tanggal: '2 Sep 2026', isi: 'Sekolah libur mulai 10-14 September 2026, kegiatan belajar mengajar normal kembali 15 September 2026.' },
  { tipe: 'Info', judul: 'Laporan baru tersedia', tanggal: 'kemarin', isi: 'Laporan kehadiran mingguan periode 25-31 Agustus 2026 sudah bisa dilihat di menu Laporan.' },
  { tipe: 'Info', judul: 'Informasi kegiatan sekolah', tanggal: '3 hari lalu', isi: 'Rapat koordinasi seluruh wali kelas akan diadakan pekan depan di ruang guru.' },
];

function Pill({ status, map }) {
  const cls = { Baik: 'pill-tosca', 'Perlu Perhatian': 'pill-coral', Mengajar: 'pill-tosca', 'Tidak ada jadwal': 'pill-amber', Info: 'pill-blue', Peringatan: 'pill-coral', Pengumuman: 'pill-tosca' };
  return <span className={`pill ${cls[status] || 'pill-tosca'}`}>{status}</span>;
}

function BarChart({ data, colorFn }) {
  const max = Math.max(...data.map((d) => d.value), 100);
  return (
    <div className="bar-chart">
      {data.map((d) => {
        const h = Math.max(6, Math.round((d.value / max) * 100));
        const color = colorFn ? colorFn(d.value) : 'var(--tosca-500)';
        return (
          <div className="bar-col" key={d.label}>
            <div className="bar-track">
              <div className="bar" style={{ height: `${h}%`, background: color, position: 'relative' }}>
                <span className="bar-value">{d.value}{d.suffix || ''}</span>
              </div>
            </div>
            <div className="bar-label">{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function KepsekDashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('beranda');
  const [laporanModal, setLaporanModal] = useState({ open: false, index: null });
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }

  const menuInfo = MENU_ITEMS.find((m) => m.key === activeSection);

  return (
    <div className="app">
      <style jsx global>{styles}</style>

      <aside className="sidebar">
        <nav className="menu">
          {MENU_ITEMS.map((item) => (
            <button key={item.key} className={`nav-item${activeSection === item.key ? ' active' : ''}`} onClick={() => setActiveSection(item.key)}>
              <span className="label">{item.label}</span>
              {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
            </button>
          ))}
          <div className="nav-divider" />
          <button className="nav-item nav-item-danger" onClick={() => setConfirmLogout(true)}>
            <span className="ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg></span>
            <span className="label">Logout</span>
          </button>
        </nav>
        <div className="profile-mini" onClick={() => setActiveSection('profil')}>
          <div className="avatar-sm">KS</div>
          <div>
            <div className="pm-name">Kepala Sekolah</div>
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
            <div className="name">Kepala Sekolah</div>
            <div className="avatar-user">KS</div>
          </div>
        </div>

        <div className="content">

          {activeSection === 'beranda' && (
            <section>
              <p className="greeting">Selamat datang, Kepala Sekolah</p>
              <p className="greeting-sub">Ringkasan kondisi sekolah hari ini</p>

              <div className="stats-row">
                <div className="stat-card"><div className="stat-label">Total siswa</div><div className="stat-value">618</div></div>
                <div className="stat-card"><div className="stat-label">Total guru</div><div className="stat-value">42</div></div>
                <div className="stat-card"><div className="stat-label">Total kelas</div><div className="stat-value">21</div></div>
                <div className="stat-card"><div className="stat-label">Kehadiran hari ini</div><div className="stat-value">94%</div><div className="stat-sub">581 dari 618 siswa hadir</div></div>
                <div className="stat-card"><div className="stat-label">Rata-rata nilai</div><div className="stat-value">83</div><div className="stat-sub">Seluruh sekolah</div></div>
              </div>

              <div className="grid-2">
                <div className="panel">
                  <div className="panel-head"><h2>Aktivitas terbaru</h2></div>
                  <div className="panel-body">
                    {ACTIVITY.map((a) => (
                      <div className="list-row" key={a.t}><div><div className="title">{a.t}</div><div className="sub">{a.m}</div></div></div>
                    ))}
                  </div>
                </div>
                <div className="panel">
                  <div className="panel-head"><h2>Kehadiran 7 hari terakhir</h2><p style={{ margin: 0 }}>Persentase siswa hadir</p></div>
                  <div className="panel-body"><BarChart data={KEHADIRAN_7HARI} /></div>
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
                    {MAPEL_CAPAIAN.map((m) => (
                      <div className="list-row" key={m.mapel}>
                        <div className="title" style={{ minWidth: 150 }}>{m.mapel}</div>
                        <div className="progress-wrap" style={{ flex: 1 }}>
                          <div className="progress-bar"><div className="progress-fill" style={{ width: `${m.rata}%`, background: m.rata >= 80 ? 'var(--tosca-500)' : m.rata >= 70 ? 'var(--amber)' : 'var(--coral)' }} /></div>
                          <div className="progress-num">{m.rata}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="panel">
                  <div className="panel-head"><h2>Perkembangan rata-rata nilai sekolah</h2></div>
                  <div className="panel-body"><BarChart data={TREND_NILAI} /></div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-head"><h2>Daftar kelas dan status capaian</h2></div>
                <table>
                  <thead><tr><th>Kelas</th><th>Rata-rata nilai</th><th>% mencapai target</th><th>Status</th></tr></thead>
                  <tbody>
                    {KELAS_CAPAIAN.map((k) => (
                      <tr key={k.kelas}>
                        <td style={{ fontWeight: 600 }}>{k.kelas}</td>
                        <td>{k.rata}</td>
                        <td>{k.capaian}% siswa mencapai target</td>
                        <td><Pill status={k.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeSection === 'guru' && (
            <section>
              <p className="page-title">Aktivitas Guru</p>
              <p className="page-sub">Pantauan kegiatan pembelajaran guru (hanya lihat)</p>

              <div className="panel">
                <div className="panel-head"><h2>Guru yang aktif mengajar hari ini</h2></div>
                <table>
                  <thead><tr><th>Nama guru</th><th>Mata pelajaran</th><th>Kelas diajar</th><th>Status</th></tr></thead>
                  <tbody>
                    {GURU_AKTIF.map((g) => (
                      <tr key={g.nama}>
                        <td style={{ fontWeight: 600 }}>{g.nama}</td>
                        <td>{g.mapel}</td>
                        <td>{g.kelas}</td>
                        <td><Pill status={g.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid-2">
                <div className="panel">
                  <div className="panel-head"><h2>Materi terbaru</h2></div>
                  <div className="panel-body">
                    {MATERI_TERBARU.map((a) => (
                      <div className="list-row" key={a.t}><div><div className="title">{a.t}</div><div className="sub">{a.m}</div></div></div>
                    ))}
                  </div>
                </div>
                <div className="panel">
                  <div className="panel-head"><h2>Tugas yang diberikan</h2></div>
                  <div className="panel-body">
                    {TUGAS_TERBARU.map((a) => (
                      <div className="list-row" key={a.t}><div><div className="title">{a.t}</div><div className="sub">{a.m}</div></div></div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-head"><h2>Assessment yang sedang berjalan</h2></div>
                <table>
                  <thead><tr><th>Judul</th><th>Guru</th><th>Kelas</th><th>Progres pengerjaan</th><th>Tenggat</th></tr></thead>
                  <tbody>
                    {ASSESSMENT_BERJALAN.map((a) => (
                      <tr key={a.judul}>
                        <td style={{ fontWeight: 600 }}>{a.judul}</td>
                        <td>{a.guru}</td>
                        <td>{a.kelas}</td>
                        <td>{a.progres}</td>
                        <td>{a.deadline}</td>
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
              <p className="page-sub">Kedisiplinan kehadiran siswa dan guru hari ini</p>

              <div className="grid-2">
                <div className="panel">
                  <div className="panel-head"><h2>Kehadiran siswa hari ini</h2></div>
                  <div className="panel-body">
                    <div className="kehadiran-box">
                      <div className="kehadiran-stat"><span className="k-label">Hadir</span><span className="k-value" style={{ color: 'var(--tosca-700)' }}>581 siswa (94%)</span></div>
                      <div className="kehadiran-stat"><span className="k-label">Izin</span><span className="k-value" style={{ color: 'var(--blue)' }}>18 siswa</span></div>
                      <div className="kehadiran-stat"><span className="k-label">Sakit</span><span className="k-value" style={{ color: 'var(--amber)' }}>12 siswa</span></div>
                      <div className="kehadiran-stat"><span className="k-label">Tidak hadir</span><span className="k-value" style={{ color: 'var(--coral)' }}>7 siswa</span></div>
                    </div>
                  </div>
                </div>
                <div className="panel">
                  <div className="panel-head"><h2>Kehadiran guru hari ini</h2></div>
                  <div className="panel-body">
                    <div className="kehadiran-box">
                      <div className="kehadiran-stat"><span className="k-label">Hadir</span><span className="k-value" style={{ color: 'var(--tosca-700)' }}>39 guru (93%)</span></div>
                      <div className="kehadiran-stat"><span className="k-label">Izin</span><span className="k-value" style={{ color: 'var(--blue)' }}>2 guru</span></div>
                      <div className="kehadiran-stat"><span className="k-label">Sakit</span><span className="k-value" style={{ color: 'var(--amber)' }}>1 guru</span></div>
                      <div className="kehadiran-stat"><span className="k-label">Tidak hadir</span><span className="k-value" style={{ color: 'var(--coral)' }}>0 guru</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-head"><h2>Grafik kehadiran siswa — 7 hari terakhir</h2></div>
                <div className="panel-body">
                  <BarChart data={KEHADIRAN_7HARI} colorFn={(v) => (v >= 90 ? 'var(--tosca-500)' : v >= 80 ? 'var(--amber)' : 'var(--coral)')} />
                </div>
              </div>
            </section>
          )}

          {activeSection === 'laporan' && (
            <section>
              <p className="page-title">Laporan</p>
              <p className="page-sub">Lihat, cetak, atau unduh laporan sekolah</p>
              <div className="panel">
                {LAPORAN_DATA.map((l, i) => (
                  <div className="list-row" style={{ padding: '16px 18px' }} key={l.judul}>
                    <div><div className="title">{l.judul}</div><div className="sub">{l.tipe} · {l.periode}</div></div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn" onClick={() => setLaporanModal({ open: true, index: i })}>Lihat</button>
                      <button className="btn" onClick={() => showToast('Menyiapkan dokumen untuk dicetak...')}>Cetak</button>
                      <button className="btn btn-primary" onClick={() => showToast('Laporan sedang diunduh...')}>Download</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeSection === 'notifikasi' && (
            <section>
              <p className="page-title">Notifikasi</p>
              <p className="page-sub">Informasi penting yang perlu diperhatikan</p>
              <div className="panel">
                {NOTIF_DATA.map((n) => (
                  <div className="notif-card" key={n.judul}>
                    <span className="notif-tag"><Pill status={n.tipe} /></span>
                    <div><div className="notif-title">{n.judul}</div><div className="notif-meta">{n.tanggal}</div><div className="notif-body">{n.isi}</div></div>
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
                <div className="profile-avatar">KS</div>
                <div className="field-row"><label>Nama lengkap</label><input type="text" placeholder="Belum diisi" readOnly /></div>
                <div className="field-row"><label>NIP</label><input type="text" defaultValue="197508152005012003" readOnly /></div>
                <div className="field-row"><label>Jabatan</label><input type="text" defaultValue="Kepala Sekolah" readOnly /></div>
                <div className="field-row"><label>Email</label><input type="text" defaultValue="kepsek@smkcitranegara.sch.id" readOnly /></div>
                <div className="field-row"><label>No. HP</label><input type="text" defaultValue="0811-2233-4455" readOnly /></div>
              </div>
            </section>
          )}

        </div>
      </div>

      {laporanModal.open && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setLaporanModal({ open: false, index: null })}>
          <div className="modal">
            <h3>{LAPORAN_DATA[laporanModal.index].judul}</h3>
            <p className="sub">{LAPORAN_DATA[laporanModal.index].tipe} · {LAPORAN_DATA[laporanModal.index].periode}</p>
            <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.6 }}>{LAPORAN_DATA[laporanModal.index].ringkasan}</p>
            <div className="form-actions">
              <button className="btn" onClick={() => setLaporanModal({ open: false, index: null })}>Tutup</button>
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
              <button className="btn btn-primary" style={{ background: 'var(--coral)', borderColor: 'var(--coral)' }} onClick={() => router.push('/login')}>Ya, keluar</button>
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
.nav-item{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:8px;font-size:13.5px;color:#C7E3DC;cursor:pointer;border:none;background:none;text-align:left;width:100%;font-family:inherit;white-space:nowrap;position:relative;}
.nav-item:hover{background:rgba(255,255,255,0.06);color:#fff;}
.nav-item.active{background:var(--tosca-600);color:#fff;font-weight:600;}
.nav-item-danger{color:#F3B4A2;}
.nav-item-danger:hover{background:rgba(228,99,63,0.18);color:#FFD9CC;}
.nav-divider{height:1px;background:rgba(255,255,255,0.1);margin:12px 6px;}
.nav-badge{margin-left:auto;background:var(--coral);color:#fff;font-size:10px;font-weight:700;padding:1px 6px;border-radius:100px;}
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
.stats-row{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:20px;}
.stat-card{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:16px 16px;}
.stat-label{font-size:11.5px;color:var(--ink-soft);}
.stat-value{font-size:23px;font-weight:700;margin-top:6px;}
.stat-sub{font-size:11px;color:var(--tosca-600);margin-top:3px;font-weight:600;}
.panel{background:var(--surface);border:1px solid var(--line);border-radius:12px;overflow:hidden;margin-bottom:16px;}
.panel-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--line);gap:12px;flex-wrap:wrap;}
.panel-head h2{font-size:14.5px;font-weight:700;margin:0;}
.panel-head p{font-size:12px;color:var(--ink-soft);margin:2px 0 0;}
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
.pill{display:inline-block;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:600;}
.pill-tosca{background:var(--tosca-100);color:var(--tosca-800);}
.pill-amber{background:var(--amber-100);color:var(--amber);}
.pill-coral{background:var(--coral-100);color:var(--coral-700);}
.pill-blue{background:var(--blue-100);color:var(--blue);}
.page-title{font-size:18px;font-weight:700;margin:0 0 3px;}
.page-sub{font-size:12.5px;color:var(--ink-soft);margin:0 0 18px;}
table{width:100%;border-collapse:collapse;}
thead th{text-align:left;font-size:11.5px;color:var(--ink-soft);font-weight:600;padding:10px 18px;border-bottom:1px solid var(--line);background:var(--tosca-50);}
tbody td{padding:11px 18px;font-size:13px;border-bottom:1px solid var(--line);vertical-align:middle;}
tbody tr:last-child td{border-bottom:none;}
.progress-wrap{display:flex;align-items:center;gap:8px;}
.progress-bar{flex:1;height:8px;border-radius:100px;background:var(--tosca-50);overflow:hidden;}
.progress-fill{height:100%;border-radius:100px;}
.progress-num{font-size:12px;font-weight:700;width:36px;text-align:right;}
.bar-chart{display:flex;align-items:flex-end;gap:10px;height:140px;padding:10px 6px 0;}
.bar-chart .bar-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;}
.bar-chart .bar{width:100%;max-width:34px;border-radius:6px 6px 0 0;background:var(--tosca-500);position:relative;}
.bar-chart .bar-track{flex:1;width:100%;display:flex;align-items:flex-end;justify-content:center;}
.bar-chart .bar-label{font-size:10.5px;color:var(--ink-soft);}
.bar-chart .bar-value{font-size:10px;color:var(--ink-soft);font-weight:700;position:absolute;top:-16px;left:0;right:0;text-align:center;}
.kehadiran-box{display:flex;flex-direction:column;gap:10px;}
.kehadiran-stat{display:flex;justify-content:space-between;align-items:center;padding:9px 12px;background:var(--tosca-50);border-radius:8px;font-size:13px;}
.kehadiran-stat .k-label{color:var(--ink-soft);}
.kehadiran-stat .k-value{font-weight:700;}
.notif-card{display:flex;gap:12px;padding:14px 18px;border-bottom:1px solid var(--line);align-items:flex-start;}
.notif-card:last-child{border-bottom:none;}
.notif-tag{flex-shrink:0;margin-top:1px;}
.notif-title{font-size:13.5px;font-weight:600;}
.notif-meta{font-size:11.5px;color:var(--ink-soft);margin-top:2px;}
.notif-body{font-size:12.5px;color:var(--ink-soft);margin-top:5px;line-height:1.5;}
.profile-card{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:24px;max-width:420px;}
.profile-avatar{width:64px;height:64px;border-radius:50%;background:var(--tosca-100);color:var(--tosca-800);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;margin:0 auto 14px;}
.field-row{display:flex;flex-direction:column;gap:5px;margin-bottom:14px;}
.field-row label{font-size:12px;font-weight:600;color:var(--ink-soft);}
.field-row input{font-family:inherit;font-size:13.5px;padding:9px 11px;border:1px solid var(--line);border-radius:8px;background:var(--tosca-50);outline:none;color:var(--ink);}
.modal-overlay{display:none;position:fixed;inset:0;background:rgba(11,38,33,0.45);align-items:center;justify-content:center;z-index:50;padding:20px;}
.modal-overlay.open{display:flex;}
.modal{background:var(--surface);border-radius:14px;width:480px;max-width:100%;max-height:88vh;overflow-y:auto;padding:22px 22px 18px;}
.modal.small{width:340px;}
.modal h3{margin:0 0 2px;font-size:16px;font-weight:700;}
.modal p.sub{margin:0 0 16px;font-size:12.5px;color:var(--ink-soft);}
.form-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:16px;}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--tosca-900);color:#fff;padding:11px 20px;border-radius:10px;font-size:13px;font-weight:600;z-index:100;box-shadow:0 4px 16px rgba(0,0,0,0.2);}
@media (max-width:1000px){
  .stats-row{grid-template-columns:repeat(3,1fr);}
  .grid-2{grid-template-columns:1fr;}
}
@media (max-width:860px){
  .sidebar{width:64px;}
  .nav-item span.label{display:none;}
  .stats-row{grid-template-columns:repeat(2,1fr);}
}
`;
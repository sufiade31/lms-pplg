'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const MENU_ITEMS = [
  { key: 'beranda', label: 'Beranda' },
  { key: 'mapel', label: 'Mata Pelajaran' },
  { key: 'jadwal', label: 'Jadwal Pelajaran' },
  { key: 'penugasan', label: 'Penugasan Guru' },
  { key: 'aktivitas', label: 'Aktivitas Pembelajaran' },
  { key: 'laporan', label: 'Laporan' },
  { key: 'profil', label: 'Profil' },
];

const KELAS_LIST = ['XII PPLG 1', 'XII PPLG 2', 'XI TKJ 2', 'X DKV 1'];

const MAPEL_DATA = [
  { kode: 'BDT-02', nama: 'Basis Data', jam: 4, guru: 'Budiono, S.Pd.' },
  { kode: 'PWB-03', nama: 'Pemrograman Web', jam: 4, guru: 'Ahmad Fauzan, S.Kom.' },
  { kode: 'MTK-01', nama: 'Matematika', jam: 3, guru: 'Siti Nurhaliza, S.Pd.' },
  { kode: 'FIS-02', nama: 'Fisika', jam: 2, guru: 'Rina Amelia, S.Pd.' },
  { kode: 'BIG-01', nama: 'Bahasa Inggris', jam: 2, guru: 'Dewi Lestari, S.Pd.' },
];
const PENUGASAN_DATA = [
  { guru: 'Budiono, S.Pd.', mapel: 'Basis Data', kelas: 'XII PPLG 2' },
  { guru: 'Ahmad Fauzan, S.Kom.', mapel: 'Pemrograman Web', kelas: 'XII PPLG 2' },
  { guru: 'Siti Nurhaliza, S.Pd.', mapel: 'Matematika', kelas: 'XII PPLG 1' },
  { guru: 'Dewi Lestari, S.Pd.', mapel: 'Bahasa Inggris', kelas: 'X DKV 1' },
];
const JADWAL_DATA = {
  'XII PPLG 2': [
    { hari: 'Senin', jam: '1-2', mapel: 'Basis Data', guru: 'Budiono, S.Pd.' },
    { hari: 'Senin', jam: '3-4', mapel: 'Pemrograman Web', guru: 'Ahmad Fauzan, S.Kom.' },
    { hari: 'Selasa', jam: '1-2', mapel: 'Matematika', guru: 'Siti Nurhaliza, S.Pd.' },
    { hari: 'Rabu', jam: '5-6', mapel: 'Bahasa Inggris', guru: 'Dewi Lestari, S.Pd.' },
  ],
  'XII PPLG 1': [
    { hari: 'Senin', jam: '1-2', mapel: 'Matematika', guru: 'Siti Nurhaliza, S.Pd.' },
    { hari: 'Kamis', jam: '3-4', mapel: 'Basis Data', guru: 'Budiono, S.Pd.' },
  ],
  'XI TKJ 2': [
    { hari: 'Selasa', jam: '3-4', mapel: 'Fisika', guru: 'Rina Amelia, S.Pd.' },
  ],
  'X DKV 1': [
    { hari: 'Rabu', jam: '1-2', mapel: 'Bahasa Inggris', guru: 'Dewi Lestari, S.Pd.' },
  ],
};
const ACTIVITY = [
  { t: 'Mapel "Basis Data Lanjutan" berhasil ditambahkan ke kurikulum', m: 'hari ini' },
  { t: 'Penugasan baru: Dewi Lestari, S.Pd. mengajar Bahasa Inggris di X DKV 1', m: 'kemarin' },
  { t: 'Jadwal kelas XI TKJ 2 diperbarui', m: '2 hari lalu' },
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
  { judul: 'Laporan Distribusi Jam Mengajar', tipe: 'Beban mengajar per guru', periode: 'Semester ganjil 2026/2027', ringkasan: 'Rata-rata beban mengajar guru 22 jam/minggu, 2 guru memiliki beban di atas 26 jam/minggu.' },
  { judul: 'Laporan Jadwal Pelajaran', tipe: 'Rekap jadwal seluruh kelas', periode: 'Semester ganjil 2026/2027', ringkasan: '21 kelas sudah memiliki jadwal lengkap, tidak ada bentrok jadwal terdeteksi.' },
  { judul: 'Laporan Aktivitas Pembelajaran', tipe: 'Materi, tugas, dan assessment', periode: 'Bulan September 2026', ringkasan: 'Total 18 materi, 24 tugas, dan 9 assessment dibuat oleh guru sepanjang bulan ini.' },
];

export default function KurikulumDashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('beranda');
  const [kelasJadwal, setKelasJadwal] = useState(KELAS_LIST[1]);
  const [laporanModal, setLaporanModal] = useState({ open: false, index: null });
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }

  const jadwal = JADWAL_DATA[kelasJadwal] || [];

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
          <div className="avatar-sm">WK</div>
          <div>
            <div className="pm-name">Waka Kurikulum</div>
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
            <div className="name">Waka Kurikulum</div>
            <div className="avatar-user">WK</div>
          </div>
        </div>

        <div className="content">

          {activeSection === 'beranda' && (
            <section>
              <p className="greeting">Selamat datang, Waka Kurikulum</p>
              <p className="greeting-sub">Ringkasan struktur kurikulum sekolah</p>
              <div className="stats-row">
                <div className="stat-card"><div className="stat-label">Total mata pelajaran</div><div className="stat-value">16</div></div>
                <div className="stat-card"><div className="stat-label">Total guru</div><div className="stat-value">42</div></div>
                <div className="stat-card"><div className="stat-label">Total kelas</div><div className="stat-value">21</div></div>
                <div className="stat-card"><div className="stat-label">Jadwal aktif</div><div className="stat-value">Semester ganjil</div><div className="stat-sub">2026/2027</div></div>
              </div>
              <div className="panel">
                <div className="panel-head"><h2>Aktivitas terbaru</h2></div>
                <div className="panel-body">
                  {ACTIVITY.map((a) => (
                    <div className="list-row" key={a.t}><div><div className="title">{a.t}</div><div className="sub">{a.m}</div></div></div>
                  ))}
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
                    {MAPEL_DATA.map((m) => (
                      <tr key={m.kode}>
                        <td style={{ fontWeight: 600 }}>{m.kode}</td>
                        <td>{m.nama}</td>
                        <td>{m.jam} jam</td>
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
              <p className="page-sub">Lihat jadwal pelajaran per kelas</p>
              <div className="panel">
                <div className="panel-head">
                  <h2>Jadwal - {kelasJadwal}</h2>
                  <select className="btn" style={{ cursor: 'pointer' }} value={kelasJadwal} onChange={(e) => setKelasJadwal(e.target.value)}>
                    {KELAS_LIST.map((k) => <option key={k}>{k}</option>)}
                  </select>
                </div>
                <table>
                  <thead><tr><th>Hari</th><th>Jam ke</th><th>Mata pelajaran</th><th>Guru</th></tr></thead>
                  <tbody>
                    {jadwal.length === 0 && (
                      <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--ink-faint)' }}>Belum ada jadwal untuk kelas ini.</td></tr>
                    )}
                    {jadwal.map((j, i) => (
                      <tr key={j.hari + j.jam + i}>
                        <td style={{ fontWeight: 600 }}>{j.hari}</td>
                        <td>Jam ke-{j.jam}</td>
                        <td>{j.mapel}</td>
                        <td>{j.guru}</td>
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
                    {PENUGASAN_DATA.map((p, i) => (
                      <tr key={p.guru + p.kelas + i}>
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

          {activeSection === 'laporan' && (
            <section>
              <p className="page-title">Laporan</p>
              <p className="page-sub">Lihat, cetak, atau unduh laporan kurikulum</p>
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

          {activeSection === 'profil' && (
            <section>
              <p className="page-title">Profil</p>
              <p className="page-sub">Data pribadi kamu</p>
              <div className="profile-card">
                <div className="profile-avatar">WK</div>
                <div className="field-row"><label>Nama lengkap</label><input type="text" placeholder="Belum diisi" readOnly /></div>
                <div className="field-row"><label>NIP</label><input type="text" defaultValue="198002102008011002" readOnly /></div>
                <div className="field-row"><label>Jabatan</label><input type="text" defaultValue="Wakil Kepala Sekolah Bidang Kurikulum" readOnly /></div>
                <div className="field-row"><label>Email</label><input type="text" defaultValue="kurikulum@smkcitranegara.sch.id" readOnly /></div>
                <div className="field-row"><label>No. HP</label><input type="text" defaultValue="0812-9900-1122" readOnly /></div>
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
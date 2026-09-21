'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const MATERI_DATA = [
  { judul: 'Konsep Dasar Basis Data', mapel: 'Basis Data', guru: 'Ahmad Fauzan', tanggal: '2 Sep 2026' },
  { judul: 'Struktur HTML & CSS Lanjutan', mapel: 'Pemrograman Web', guru: 'Rina Amelia', tanggal: '30 Agu 2026' },
  { judul: 'Fungsi Trigonometri', mapel: 'Matematika', guru: 'Siti Nurhaliza', tanggal: '28 Agu 2026' },
];
const INITIAL_ASSESSMENT = [
  { judul: 'Kuis Normalisasi Data', mapel: 'Basis Data', tipe: 'Kuis', deadline: '8 Sep 2026', status: 'Belum' },
  { judul: 'Ulangan Harian Bab 2', mapel: 'Bahasa Inggris', tipe: 'Ulangan Harian', deadline: '10 Sep 2026', status: 'Belum' },
  { judul: 'Kuis Semantic HTML', mapel: 'Pemrograman Web', tipe: 'Kuis', deadline: '1 Sep 2026', status: 'Selesai', nilai: 88 },
];
const INITIAL_TUGAS = [
  { judul: 'Membuat ERD Toko Online', mapel: 'Basis Data', deadline: '9 Sep 2026', status: 'Belum Dikumpulkan' },
  { judul: 'Landing Page Sekolah', mapel: 'Pemrograman Web', deadline: '7 Sep 2026', status: 'Belum Dikumpulkan' },
  { judul: 'Latihan Soal Trigonometri', mapel: 'Matematika', deadline: '3 Sep 2026', status: 'Sudah Dikumpulkan' },
];
const NILAI_DATA = [
  { mapel: 'Basis Data', tugas: 85, kuis: 80, uh: '-', rata: 83 },
  { mapel: 'Pemrograman Web', tugas: 90, kuis: 88, uh: '-', rata: 89 },
  { mapel: 'Matematika', tugas: 78, kuis: '-', uh: 82, rata: 80 },
];
const ADMIN_NOTIF = [
  { judul: 'Libur Hari Raya', tanggal: '2 Sep 2026', isi: 'Sekolah libur mulai 10-14 September 2026, khusus untuk seluruh siswa.' },
  { judul: 'Jadwal Penilaian Tengah Semester', tanggal: '28 Agu 2026', isi: 'PTS dimulai 21 September 2026, cek jadwal lengkap di papan pengumuman kelas.' },
];

const MENU_ITEMS = [
  { key: 'beranda', label: 'Beranda' },
  { key: 'materi', label: 'Materi' },
  { key: 'assessment', label: 'Assessment' },
  { key: 'tugas', label: 'Tugas' },
  { key: 'nilai', label: 'Nilai' },
  { key: 'pengumuman', label: 'Pengumuman' },
  { key: 'profil', label: 'Profil' },
];

function Pill({ status }) {
  const map = { Belum: 'pill-amber', Selesai: 'pill-tosca', 'Belum Dikumpulkan': 'pill-coral', 'Sudah Dikumpulkan': 'pill-tosca' };
  return <span className={`pill ${map[status] || 'pill-tosca'}`}>{status}</span>;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('beranda');

  const [assessmentData, setAssessmentData] = useState(INITIAL_ASSESSMENT);
  const [tugasData, setTugasData] = useState(INITIAL_TUGAS);

  const [modal, setModal] = useState({ open: false, type: null, index: null });
  const [confirmLogout, setConfirmLogout] = useState(false);

  function openMateriModal(judul) {
    setModal({ open: true, type: 'materi', payload: judul });
  }
  function openQuizModal(index) {
    setModal({ open: true, type: 'quiz', index });
  }
  function openUploadModal(index) {
    setModal({ open: true, type: 'upload', index });
  }
  function closeModal() {
    setModal({ open: false, type: null, index: null });
  }

  function submitQuiz() {
    const i = modal.index;
    setAssessmentData((prev) => prev.map((a, idx) => (idx === i ? { ...a, status: 'Selesai', nilai: Math.floor(Math.random() * 21) + 75 } : a)));
    closeModal();
  }
  function submitUpload() {
    const i = modal.index;
    setTugasData((prev) => prev.map((t, idx) => (idx === i ? { ...t, status: 'Sudah Dikumpulkan' } : t)));
    closeModal();
  }

  const tugasBelum = tugasData.filter((t) => t.status === 'Belum Dikumpulkan');
  const assessmentBelum = assessmentData.filter((a) => a.status === 'Belum');
  const tugasNotif = [
    ...tugasBelum.map((t) => ({ judul: `Tugas baru: ${t.judul}`, meta: `${t.mapel} · tenggat ${t.deadline}` })),
    ...assessmentBelum.map((a) => ({ judul: `${a.tipe} baru: ${a.judul}`, meta: `${a.mapel} · tenggat ${a.deadline}` })),
  ];

  return (
    <div className="app">
      <style jsx global>{styles}</style>

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <img src="/logo-smk.png" alt="Logo SMK Citra Negara" />
          </div>
          <div>
            <div className="brand-name">Sistem Manajemen<br />Pembelajaran</div>
            <div className="brand-sub">Siswa</div>
          </div>
        </div>

        <nav className="menu">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`nav-item${activeSection === item.key ? ' active' : ''}`}
              onClick={() => setActiveSection(item.key)}
            >
              <span className="label">{item.label}</span>
            </button>
          ))}
          <div className="nav-divider" />
          <button className="nav-item nav-item-danger" onClick={() => setConfirmLogout(true)}>
            <span className="ic">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            <span className="label">Keluar</span>
          </button>
        </nav>

        <div className="profile-mini" onClick={() => setActiveSection('profil')}>
          <div className="avatar-sm">UP</div>
          <div>
            <div className="pm-name">Upil</div>
            <div className="pm-role">XII PPLG 2</div>
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
            <div className="info">
              <div className="name">Upil</div>
              <div className="kelas">XII PPLG 2</div>
            </div>
            <div className="avatar-user">UP</div>
          </div>
        </div>

        <div className="content">

          {activeSection === 'beranda' && (
            <section>
              <p className="greeting">Selamat datang Upil!!!</p>

              <div className="quick-cards">
                <button className="quick-card" onClick={() => setActiveSection('materi')}>Materi</button>
                <button className="quick-card" onClick={() => setActiveSection('tugas')}>Tugas</button>
                <button className="quick-card" onClick={() => setActiveSection('assessment')}>Assessment</button>
                <button className="quick-card" onClick={() => setActiveSection('nilai')}>Nilai Rata-Rata</button>
              </div>

              <div className="panel">
                <div className="panel-head">
                  <h2>Tugas mendatang</h2>
                  <span className="link" onClick={() => setActiveSection('tugas')}>Lihat semua</span>
                </div>
                <div className="panel-body">
                  {tugasBelum.length === 0 && <div className="panel-body empty">Tidak ada tugas mendatang.</div>}
                  {tugasBelum.slice(0, 3).map((t) => (
                    <div className="list-row" key={t.judul}>
                      <div><div className="title">{t.judul}</div><div className="sub">{t.mapel} · tenggat {t.deadline}</div></div>
                      <Pill status={t.status} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel">
                <div className="panel-head">
                  <h2>Materi terbaru</h2>
                  <span className="link" onClick={() => setActiveSection('materi')}>Lihat semua</span>
                </div>
                <div className="panel-body">
                  {MATERI_DATA.slice(0, 2).map((m) => (
                    <div className="list-row" key={m.judul}>
                      <div><div className="title">{m.judul}</div><div className="sub">{m.mapel} · {m.guru}</div></div>
                      <button className="btn" onClick={() => openMateriModal(m.judul)}>Unduh</button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeSection === 'materi' && (
            <section>
              <p className="page-title">Materi</p>
              <p className="page-sub">Lihat dan unduh materi pelajaran dari guru</p>
              <div className="panel">
                <table>
                  <thead><tr><th>Judul materi</th><th>Mata pelajaran</th><th>Guru</th><th>Tanggal</th><th></th></tr></thead>
                  <tbody>
                    {MATERI_DATA.map((m) => (
                      <tr key={m.judul}>
                        <td style={{ fontWeight: 600 }}>{m.judul}</td>
                        <td>{m.mapel}</td>
                        <td>{m.guru}</td>
                        <td>{m.tanggal}</td>
                        <td><button className="btn btn-primary" onClick={() => openMateriModal(m.judul)}>Unduh PDF</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeSection === 'assessment' && (
            <section>
              <p className="page-title">Assessment</p>
              <p className="page-sub">Kuis dan ulangan harian yang diberikan guru</p>
              <div className="panel">
                <table>
                  <thead><tr><th>Judul</th><th>Mata pelajaran</th><th>Tipe</th><th>Tenggat</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {assessmentData.map((a, i) => (
                      <tr key={a.judul}>
                        <td style={{ fontWeight: 600 }}>{a.judul}</td>
                        <td>{a.mapel}</td>
                        <td>{a.tipe}</td>
                        <td>{a.deadline}</td>
                        <td>
                          <Pill status={a.status} />
                          {a.status === 'Selesai' && <span style={{ fontSize: 12, color: 'var(--ink-soft)', marginLeft: 6 }}>({a.nilai})</span>}
                        </td>
                        <td>
                          {a.status === 'Belum'
                            ? <button className="btn btn-primary" onClick={() => openQuizModal(i)}>Kerjakan</button>
                            : <button className="btn" disabled style={{ opacity: 0.6 }}>Sudah dinilai</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeSection === 'tugas' && (
            <section>
              <p className="page-title">Tugas</p>
              <p className="page-sub">Lihat dan kumpulkan tugas dari guru (foto atau file)</p>
              <div className="panel">
                <table>
                  <thead><tr><th>Judul tugas</th><th>Mata pelajaran</th><th>Tenggat</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {tugasData.map((t, i) => (
                      <tr key={t.judul}>
                        <td style={{ fontWeight: 600 }}>{t.judul}</td>
                        <td>{t.mapel}</td>
                        <td>{t.deadline}</td>
                        <td><Pill status={t.status} /></td>
                        <td>
                          <button className="btn" onClick={() => openUploadModal(i)}>
                            {t.status === 'Belum Dikumpulkan' ? 'Upload tugas' : 'Ganti file'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeSection === 'nilai' && (
            <section>
              <p className="page-title">Nilai</p>
              <p className="page-sub">Rekap nilai tugas, kuis, dan ulangan harian per mata pelajaran</p>
              <div className="panel">
                <table>
                  <thead><tr><th>Mata pelajaran</th><th>Tugas</th><th>Kuis</th><th>Ulangan harian</th><th>Rata-rata</th></tr></thead>
                  <tbody>
                    {NILAI_DATA.map((n) => (
                      <tr key={n.mapel}>
                        <td style={{ fontWeight: 600 }}>{n.mapel}</td>
                        <td>{n.tugas}</td>
                        <td>{n.kuis}</td>
                        <td>{n.uh}</td>
                        <td style={{ fontWeight: 700, color: 'var(--tosca-700)' }}>{n.rata}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeSection === 'pengumuman' && (
            <section>
              <p className="page-title">Pengumuman</p>
              <p className="page-sub">Notifikasi tugas baru dan pengumuman khusus siswa</p>

              <div className="panel">
                <div className="panel-head"><h2>Notifikasi tugas & assessment baru</h2></div>
                <div>
                  {tugasNotif.length === 0 && <div className="panel-body empty">Belum ada tugas/assessment baru.</div>}
                  {tugasNotif.map((n) => (
                    <div className="notif-card" key={n.judul}>
                      <div className="notif-dot" />
                      <div><div className="notif-title">{n.judul}</div><div className="notif-meta">{n.meta}</div></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel">
                <div className="panel-head"><h2>Pengumuman dari admin</h2></div>
                <div>
                  {ADMIN_NOTIF.map((n) => (
                    <div className="notif-card" key={n.judul}>
                      <div className="notif-dot read" />
                      <div>
                        <div className="notif-title">{n.judul}</div>
                        <div className="notif-meta">{n.tanggal}</div>
                        <div className="notif-body">{n.isi}</div>
                      </div>
                    </div>
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
                <div className="profile-avatar">UP</div>
                <div className="field-row"><label>Nama lengkap</label><input type="text" defaultValue="Muhammad Upil" readOnly /></div>
                <div className="field-row"><label>NIS</label><input type="text" defaultValue="2425010" readOnly /></div>
                <div className="field-row"><label>Kelas</label><input type="text" defaultValue="XII PPLG 2" readOnly /></div>
                <div className="field-row"><label>Email</label><input type="text" defaultValue="upil@siswa.smkcitranegara.sch.id" readOnly /></div>
                <div className="field-row"><label>Nomor. HP</label><input type="text" defaultValue="0812-3456-7890" readOnly /></div>
              </div>
            </section>
          )}

        </div>
      </div>

      {modal.open && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            {modal.type === 'materi' && (
              <>
                <h3>Unduh materi</h3>
                <p className="sub">Materi &quot;{modal.payload}&quot; akan diunduh sebagai PDF.</p>
                <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                  (Preview ini belum tersambung ke file asli — nanti tombol ini nyambung ke file PDF yang diupload guru.)
                </p>
                <div className="form-actions">
                  <button className="btn btn-primary" onClick={closeModal}>Tutup</button>
                </div>
              </>
            )}

            {modal.type === 'quiz' && (
              <>
                <h3>{assessmentData[modal.index].judul}</h3>
                <p className="sub">{assessmentData[modal.index].mapel} · {assessmentData[modal.index].tipe}</p>
                <div className="quiz-q">
                  <p>1. Apa kepanjangan dari SQL?</p>
                  <label className="quiz-opt"><input type="radio" name="q1" /> Structured Query Language</label>
                  <label className="quiz-opt"><input type="radio" name="q1" /> System Question Logic</label>
                  <label className="quiz-opt"><input type="radio" name="q1" /> Simple Query Line</label>
                </div>
                <div className="quiz-q">
                  <p>2. Primary key berfungsi untuk?</p>
                  <label className="quiz-opt"><input type="radio" name="q2" /> Mengunci tabel</label>
                  <label className="quiz-opt"><input type="radio" name="q2" /> Identitas unik tiap baris data</label>
                  <label className="quiz-opt"><input type="radio" name="q2" /> Mempercepat internet</label>
                </div>
                <div className="form-actions">
                  <button className="btn" onClick={closeModal}>Batal</button>
                  <button className="btn btn-primary" onClick={submitQuiz}>Kumpulkan jawaban</button>
                </div>
              </>
            )}

            {modal.type === 'upload' && (
              <>
                <h3>Upload tugas: {tugasData[modal.index].judul}</h3>
                <p className="sub">{tugasData[modal.index].mapel} · tenggat {tugasData[modal.index].deadline}</p>
                <div className="field-row" style={{ marginBottom: 0 }}>
                  <label>Pilih file (foto atau dokumen)</label>
                  <input type="file" className="field-input" accept="image/*,.pdf,.doc,.docx" />
                </div>
                <div className="form-actions">
                  <button className="btn" onClick={closeModal}>Batal</button>
                  <button className="btn btn-primary" onClick={submitUpload}>Kumpulkan tugas</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {confirmLogout && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setConfirmLogout(false)}>
          <div className="modal" style={{ width: 340 }}>
            <h3>Keluar dari akun?</h3>
            <p className="sub">Kamu akan diarahkan kembali ke halaman login.</p>
            <div className="form-actions">
              <button className="btn" onClick={() => setConfirmLogout(false)}>Batal</button>
              <button className="btn btn-primary" style={{ background: 'var(--coral)', borderColor: 'var(--coral)' }} onClick={() => router.push('/login')}>Ya, keluar</button>
            </div>
          </div>
        </div>
      )}
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
}
*{box-sizing:border-box;}
body{margin:0;font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:var(--bg);color:var(--ink);}
.app{display:flex;min-height:100vh;}
.sidebar{width:220px;flex-shrink:0;background:var(--tosca-900);color:#EAF4F1;display:flex;flex-direction:column;padding:22px 14px;}
.brand{display:flex;align-items:center;gap:10px;padding:0 6px 20px 6px;margin-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.1);}
.brand-mark{width:36px;height:36px;border-radius:9px;background:var(--tosca-500);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;}
.brand-mark img{width:100%;height:100%;object-fit:contain;}
.brand-name{font-size:13px;font-weight:700;line-height:1.3;}
.brand-sub{font-size:11.5px;color:#9FC6BE;margin-top:1px;}
nav.menu{display:flex;flex-direction:column;gap:2px;flex:1;margin-top:4px;}
.nav-item{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:8px;font-size:13.5px;color:#C7E3DC;cursor:pointer;border:none;background:none;text-align:left;width:100%;font-family:inherit;white-space:nowrap;}
.nav-item .ic{display:flex;align-items:center;flex-shrink:0;}
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
.topbar-brand img{width:24px;height:24px;object-fit:contain;flex-shrink:0;}
.topbar-user{display:flex;align-items:center;gap:10px;}
.topbar-user .info{text-align:right;}
.topbar-user .name{font-size:12.5px;font-weight:700;}
.topbar-user .kelas{font-size:11px;color:var(--ink-soft);}
.avatar-user{width:34px;height:34px;border-radius:50%;background:var(--tosca-100);color:var(--tosca-800);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;}
.content{padding:22px;overflow-y:auto;}
.greeting{font-size:16px;font-weight:700;margin:0 0 16px;}
.quick-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px;}
.quick-card{background:var(--tosca-700);color:#fff;border:none;border-radius:12px;padding:22px 16px;font-size:14.5px;font-weight:700;cursor:pointer;font-family:inherit;text-align:center;}
.quick-card:hover{background:var(--tosca-600);}
.panel{background:var(--surface);border:1px solid var(--line);border-radius:12px;overflow:hidden;margin-bottom:16px;}
.panel-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--line);}
.panel-head h2{font-size:14.5px;font-weight:700;margin:0;}
.panel-head .link{font-size:12.5px;font-weight:600;color:var(--tosca-700);cursor:pointer;}
.panel-body{padding:6px 18px 14px;min-height:60px;}
.panel-body.empty{color:var(--ink-faint);font-size:13px;padding:20px 18px;text-align:center;}
.list-row{display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--line);gap:12px;}
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
.page-title{font-size:18px;font-weight:700;margin:0 0 3px;}
.page-sub{font-size:12.5px;color:var(--ink-soft);margin:0 0 18px;}
table{width:100%;border-collapse:collapse;}
thead th{text-align:left;font-size:11.5px;color:var(--ink-soft);font-weight:600;padding:10px 18px;border-bottom:1px solid var(--line);background:var(--tosca-50);}
tbody td{padding:11px 18px;font-size:13px;border-bottom:1px solid var(--line);vertical-align:middle;}
tbody tr:last-child td{border-bottom:none;}
.notif-card{display:flex;gap:12px;padding:14px 18px;border-bottom:1px solid var(--line);align-items:flex-start;}
.notif-card:last-child{border-bottom:none;}
.notif-dot{width:8px;height:8px;border-radius:50%;background:var(--coral);margin-top:6px;flex-shrink:0;}
.notif-dot.read{background:var(--line);}
.notif-title{font-size:13.5px;font-weight:600;}
.notif-meta{font-size:11.5px;color:var(--ink-soft);margin-top:2px;}
.notif-body{font-size:12.5px;color:var(--ink-soft);margin-top:5px;line-height:1.5;}
.profile-card{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:24px;max-width:420px;}
.profile-avatar{width:64px;height:64px;border-radius:50%;background:var(--tosca-100);color:var(--tosca-800);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;margin:0 auto 14px;}
.field-row{display:flex;flex-direction:column;gap:5px;margin-bottom:14px;}
.field-row label{font-size:12px;font-weight:600;color:var(--ink-soft);}
.field-row input{font-family:inherit;font-size:13.5px;padding:9px 11px;border:1px solid var(--line);border-radius:8px;background:var(--tosca-50);outline:none;color:var(--ink);}
.field-input{width:100%;font-family:inherit;font-size:13.5px;padding:9px 11px;border:1px solid var(--line);border-radius:8px;background:var(--surface);outline:none;color:var(--ink);margin-top:6px;}
.modal-overlay{display:none;position:fixed;inset:0;background:rgba(11,38,33,0.45);align-items:center;justify-content:center;z-index:50;}
.modal-overlay.open{display:flex;}
.modal{background:var(--surface);border-radius:14px;width:420px;max-width:92vw;padding:22px 22px 18px;}
.modal h3{margin:0 0 2px;font-size:16px;font-weight:700;}
.modal p.sub{margin:0 0 16px;font-size:12.5px;color:var(--ink-soft);}
.form-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:16px;}
.quiz-q{margin-bottom:16px;}
.quiz-q p{font-size:13.5px;font-weight:600;margin:0 0 8px;}
.quiz-opt{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--line);border-radius:8px;margin-bottom:6px;cursor:pointer;font-size:13px;}
.quiz-opt:hover{background:var(--tosca-50);}
@media (max-width:860px){
  .sidebar{width:64px;}
  .nav-item span.label{display:none;}
  .quick-cards{grid-template-columns:repeat(2,1fr);}
  .topbar-user .info{display:none;}
}
`;

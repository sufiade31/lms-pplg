'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const MAPEL_OPTIONS = ['Basis Data', 'Pemrograman Web'];
const KELAS_OPTIONS = ['XII PPLG 1', 'XII PPLG 2', 'XI PPLG 1'];

const INITIAL_MATERI = [
  { judul: 'Konsep Dasar Basis Data', mapel: 'Basis Data', kelas: 'XII PPLG 2', tanggal: '2 Sep 2026' },
  { judul: 'Normalisasi Tabel', mapel: 'Basis Data', kelas: 'XII PPLG 2', tanggal: '28 Agu 2026' },
];
const INITIAL_ASSESSMENT = [
  { judul: 'Kuis Normalisasi Data', mapel: 'Basis Data', kelas: 'XII PPLG 2', tipe: 'Kuis', jumlahSoal: 2, totalPoin: 20, deadline: '8 Sep 2026' },
];
const INITIAL_TUGAS = [
  { judul: 'Membuat ERD Toko Online', mapel: 'Basis Data', kelas: 'XII PPLG 2', jenis: 'PDF', deadline: '9 Sep 2026' },
  { judul: 'Latihan Query Dasar', mapel: 'Basis Data', kelas: 'XII PPLG 2', jenis: 'Catatan', deadline: '5 Sep 2026' },
];
const SISWA_KELAS = [
  { nama: 'Muhammad Rizky', nis: '2425001' },
  { nama: 'Anisa Putri', nis: '2425002' },
  { nama: 'Upil (Muhammad Upil)', nis: '2425010' },
  { nama: 'Salsabila Zahra', nis: '2425058' },
];
const STATUS_KUMPUL = {
  'Membuat ERD Toko Online': [
    { nama: 'Muhammad Rizky', kelas: 'XII PPLG 2', status: 'Sudah', waktu: '8 Sep 2026, 20:14' },
    { nama: 'Upil (Muhammad Upil)', kelas: 'XII PPLG 2', status: 'Belum', waktu: '-' },
    { nama: 'Anisa Putri', kelas: 'XII PPLG 2', status: 'Sudah', waktu: '7 Sep 2026, 19:02' },
    { nama: 'Salsabila Zahra', kelas: 'XII PPLG 2', status: 'Belum', waktu: '-' },
  ],
  'Latihan Query Dasar': [
    { nama: 'Muhammad Rizky', kelas: 'XII PPLG 2', status: 'Sudah', waktu: '4 Sep 2026, 08:40' },
    { nama: 'Upil (Muhammad Upil)', kelas: 'XII PPLG 2', status: 'Sudah', waktu: '4 Sep 2026, 21:10' },
    { nama: 'Anisa Putri', kelas: 'XII PPLG 2', status: 'Belum', waktu: '-' },
    { nama: 'Salsabila Zahra', kelas: 'XII PPLG 2', status: 'Sudah', waktu: '5 Sep 2026, 10:00' },
  ],
};
const ADMIN_NOTIF = [
  { judul: 'Himbauan Input Nilai Sebelum Rapor', tanggal: '5 Sep 2026', isi: 'Mohon seluruh guru menyelesaikan input nilai tugas dan ulangan harian sebelum 20 September 2026 untuk keperluan rapor tengah semester.' },
  { judul: 'Libur Hari Raya', tanggal: '2 Sep 2026', isi: 'Sekolah libur mulai 10-14 September 2026. Kegiatan belajar mengajar normal kembali 15 September 2026.' },
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
  const map = { Sudah: 'pill-tosca', Belum: 'pill-coral', PDF: 'pill-blue', Catatan: 'pill-amber' };
  return <span className={`pill ${map[status] || 'pill-tosca'}`}>{status}</span>;
}
function IconEdit() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>;
}
function IconTrash() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>;
}

export default function GuruDashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('beranda');

  const [materiData, setMateriData] = useState(INITIAL_MATERI);
  const [assessmentData, setAssessmentData] = useState(INITIAL_ASSESSMENT);
  const [tugasData, setTugasData] = useState(INITIAL_TUGAS);
  const [nilaiData, setNilaiData] = useState(SISWA_KELAS.map((s) => ({ ...s, tugas: '', kuis: '', uh: '' })));

  const [materiModal, setMateriModal] = useState({ open: false, index: null, judul: '', mapel: MAPEL_OPTIONS[0], kelas: KELAS_OPTIONS[0], catatan: '' });
  const [tugasModal, setTugasModal] = useState({ open: false, index: null, judul: '', mapel: MAPEL_OPTIONS[0], kelas: KELAS_OPTIONS[0], deadline: '', jenis: 'pdf', catatan: '' });
  const [assessmentModal, setAssessmentModal] = useState({ open: false, judul: '', mapel: MAPEL_OPTIONS[0], kelas: KELAS_OPTIONS[0], tipe: 'Kuis', deadline: '', soalList: [] });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, type: null, index: null });
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [filterTugas, setFilterTugas] = useState(tugasData[0]?.judul || '');
  const [toast, setToast] = useState('');

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }

  function hitungAkhir(tugas, kuis, uh) {
    const vals = [tugas, kuis, uh].filter((v) => v !== '' && v !== null && !isNaN(v)).map(Number);
    if (vals.length === 0) return '-';
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }
  function updateNilai(i, field, val) {
    setNilaiData((prev) => prev.map((n, idx) => (idx === i ? { ...n, [field]: val } : n)));
  }

  // ---------- Materi ----------
  function openMateriModal(index) {
    if (index === undefined) {
      setMateriModal({ open: true, index: null, judul: '', mapel: MAPEL_OPTIONS[0], kelas: KELAS_OPTIONS[0], catatan: '' });
    } else {
      const m = materiData[index];
      setMateriModal({ open: true, index, judul: m.judul, mapel: m.mapel, kelas: m.kelas, catatan: '' });
    }
  }
  function saveMateri() {
    if (!materiModal.judul.trim()) { showToast('Judul materi wajib diisi.'); return; }
    const data = { judul: materiModal.judul, mapel: materiModal.mapel, kelas: materiModal.kelas };
    if (materiModal.index !== null) {
      setMateriData((prev) => prev.map((m, i) => (i === materiModal.index ? { ...m, ...data } : m)));
    } else {
      setMateriData((prev) => [{ ...data, tanggal: 'Baru saja' }, ...prev]);
    }
    setMateriModal((s) => ({ ...s, open: false }));
    showToast('Materi berhasil disimpan.');
  }

  // ---------- Tugas ----------
  function openTugasModal(index) {
    if (index === undefined) {
      setTugasModal({ open: true, index: null, judul: '', mapel: MAPEL_OPTIONS[0], kelas: KELAS_OPTIONS[0], deadline: '', jenis: 'pdf', catatan: '' });
    } else {
      const t = tugasData[index];
      setTugasModal({ open: true, index, judul: t.judul, mapel: t.mapel, kelas: t.kelas, deadline: '', jenis: t.jenis === 'PDF' ? 'pdf' : 'catatan', catatan: '' });
    }
  }
  function saveTugas() {
    if (!tugasModal.judul.trim()) { showToast('Judul tugas wajib diisi.'); return; }
    const data = {
      judul: tugasModal.judul, mapel: tugasModal.mapel, kelas: tugasModal.kelas,
      jenis: tugasModal.jenis === 'pdf' ? 'PDF' : 'Catatan',
      deadline: tugasModal.deadline || 'Belum diatur',
    };
    if (tugasModal.index !== null) {
      setTugasData((prev) => prev.map((t, i) => (i === tugasModal.index ? data : t)));
    } else {
      setTugasData((prev) => [data, ...prev]);
    }
    setTugasModal((s) => ({ ...s, open: false }));
    showToast('Tugas berhasil disimpan.');
  }

  // ---------- Assessment ----------
  function openAssessmentModal() {
    setAssessmentModal({
      open: true, judul: '', mapel: MAPEL_OPTIONS[0], kelas: KELAS_OPTIONS[0], tipe: 'Kuis', deadline: '',
      soalList: [{ tipe: 'pg', pertanyaan: '', poin: 10, opsi: ['', '', '', ''], benar: 0 }],
    });
  }
  function tambahSoal() {
    setAssessmentModal((s) => ({ ...s, soalList: [...s.soalList, { tipe: 'pg', pertanyaan: '', poin: 10, opsi: ['', '', '', ''], benar: 0 }] }));
  }
  function hapusSoal(index) {
    setAssessmentModal((s) => ({ ...s, soalList: s.soalList.filter((_, i) => i !== index) }));
  }
  function updateSoal(index, field, value) {
    setAssessmentModal((s) => ({ ...s, soalList: s.soalList.map((soal, i) => (i === index ? { ...soal, [field]: value } : soal)) }));
  }
  function updateOpsi(soalIndex, opsiIndex, value) {
    setAssessmentModal((s) => ({
      ...s,
      soalList: s.soalList.map((soal, i) => (i === soalIndex ? { ...soal, opsi: soal.opsi.map((o, oi) => (oi === opsiIndex ? value : o)) } : soal)),
    }));
  }
  function saveAssessment() {
    if (!assessmentModal.judul.trim()) { showToast('Judul assessment wajib diisi.'); return; }
    const totalPoin = assessmentModal.soalList.reduce((sum, s) => sum + (Number(s.poin) || 0), 0);
    setAssessmentData((prev) => [{
      judul: assessmentModal.judul, mapel: assessmentModal.mapel, kelas: assessmentModal.kelas, tipe: assessmentModal.tipe,
      jumlahSoal: assessmentModal.soalList.length, totalPoin, deadline: assessmentModal.deadline || 'Belum diatur',
    }, ...prev]);
    setAssessmentModal((s) => ({ ...s, open: false }));
    showToast('Assessment berhasil dibuat.');
  }

  // ---------- Hapus umum ----------
  function askDelete(type, index) {
    setConfirmDelete({ open: true, type, index });
  }
  function confirmDeleteYes() {
    const { type, index } = confirmDelete;
    if (type === 'materi') setMateriData((prev) => prev.filter((_, i) => i !== index));
    if (type === 'assessment') setAssessmentData((prev) => prev.filter((_, i) => i !== index));
    if (type === 'tugas') setTugasData((prev) => prev.filter((_, i) => i !== index));
    setConfirmDelete({ open: false, type: null, index: null });
    showToast('Data berhasil dihapus.');
  }

  const menuInfo = MENU_ITEMS.find((m) => m.key === activeSection);
  const statusList = STATUS_KUMPUL[filterTugas] || [];

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
          <div className="avatar-sm">PB</div>
          <div>
            <div className="pm-name">Budiono</div>
            <div className="pm-role">Guru</div>
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
            <div className="name">Pak Budiono, S.Pd.</div>
            <div className="avatar-user">PB</div>
          </div>
        </div>

        <div className="content">

          {activeSection === 'beranda' && (
            <section>
              <p className="greeting">Selamat datang Pak Budiono, S.Pd.!!</p>
              <div className="quick-cards">
                <button className="quick-card" onClick={() => openMateriModal()}><span className="qi">M</span>Buat Materi</button>
                <button className="quick-card" onClick={() => openTugasModal()}><span className="qi">T</span>Buat Tugas</button>
                <button className="quick-card" onClick={openAssessmentModal}><span className="qi">A</span>Buat Assessment</button>
              </div>

              <div className="panel">
                <div className="panel-head">
                  <h2>Aktivitas terbaru</h2>
                  <span className="link" onClick={() => setActiveSection('pengumuman')}>Lihat semua</span>
                </div>
                <div className="panel-body">
                  <div className="list-row"><div><div className="title">Upil mengumpulkan tugas &quot;Latihan Query Dasar&quot;</div><div className="sub">Basis Data · 4 Sep 2026</div></div></div>
                  <div className="list-row"><div><div className="title">3 dari 4 siswa sudah mengerjakan Kuis Normalisasi Data</div><div className="sub">Basis Data · hari ini</div></div></div>
                  <div className="list-row"><div><div className="title">Materi &quot;Normalisasi Tabel&quot; berhasil ditambahkan</div><div className="sub">Basis Data · 28 Agu 2026</div></div></div>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'materi' && (
            <section>
              <div className="panel-head" style={{ border: 'none', padding: '0 0 14px' }}>
                <div><p className="page-title" style={{ margin: 0 }}>Materi</p><p className="page-sub" style={{ margin: '2px 0 0' }}>Kelola materi pelajaran untuk siswa</p></div>
                <button className="btn btn-primary" onClick={() => openMateriModal()}>+ Tambah materi</button>
              </div>
              <div className="panel">
                <table>
                  <thead><tr><th>Judul materi</th><th>Mata pelajaran</th><th>Kelas</th><th>Tanggal</th><th></th></tr></thead>
                  <tbody>
                    {materiData.map((m, i) => (
                      <tr key={m.judul + i}>
                        <td style={{ fontWeight: 600 }}>{m.judul}</td>
                        <td>{m.mapel}</td>
                        <td>{m.kelas}</td>
                        <td>{m.tanggal}</td>
                        <td>
                          <div className="row-actions">
                            <div className="icon-btn" title="Edit" onClick={() => openMateriModal(i)}><IconEdit /></div>
                            <div className="icon-btn danger" title="Hapus" onClick={() => askDelete('materi', i)}><IconTrash /></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeSection === 'assessment' && (
            <section>
              <div className="panel-head" style={{ border: 'none', padding: '0 0 14px' }}>
                <div><p className="page-title" style={{ margin: 0 }}>Assessment</p><p className="page-sub" style={{ margin: '2px 0 0' }}>Buat kuis atau ulangan harian (pilihan ganda / esai)</p></div>
                <button className="btn btn-primary" onClick={openAssessmentModal}>+ Buat assessment</button>
              </div>
              <div className="panel">
                <table>
                  <thead><tr><th>Judul</th><th>Mapel</th><th>Kelas</th><th>Tipe</th><th>Jumlah soal</th><th>Total poin</th><th>Tenggat</th><th></th></tr></thead>
                  <tbody>
                    {assessmentData.map((a, i) => (
                      <tr key={a.judul + i}>
                        <td style={{ fontWeight: 600 }}>{a.judul}</td>
                        <td>{a.mapel}</td>
                        <td>{a.kelas}</td>
                        <td>{a.tipe}</td>
                        <td>{a.jumlahSoal}</td>
                        <td>{a.totalPoin}</td>
                        <td>{a.deadline}</td>
                        <td>
                          <div className="row-actions">
                            <div className="icon-btn danger" title="Hapus" onClick={() => askDelete('assessment', i)}><IconTrash /></div>
                          </div>
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
              <div className="panel-head" style={{ border: 'none', padding: '0 0 14px' }}>
                <div><p className="page-title" style={{ margin: 0 }}>Tugas</p><p className="page-sub" style={{ margin: '2px 0 0' }}>Berikan tugas ke siswa berupa file PDF atau catatan</p></div>
                <button className="btn btn-primary" onClick={() => openTugasModal()}>+ Tambah tugas</button>
              </div>
              <div className="panel">
                <table>
                  <thead><tr><th>Judul tugas</th><th>Mapel</th><th>Kelas</th><th>Jenis</th><th>Tenggat</th><th></th></tr></thead>
                  <tbody>
                    {tugasData.map((t, i) => (
                      <tr key={t.judul + i}>
                        <td style={{ fontWeight: 600 }}>{t.judul}</td>
                        <td>{t.mapel}</td>
                        <td>{t.kelas}</td>
                        <td><Pill status={t.jenis} /></td>
                        <td>{t.deadline}</td>
                        <td>
                          <div className="row-actions">
                            <div className="icon-btn" title="Edit" onClick={() => openTugasModal(i)}><IconEdit /></div>
                            <div className="icon-btn danger" title="Hapus" onClick={() => askDelete('tugas', i)}><IconTrash /></div>
                          </div>
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
              <p className="page-sub">Masukkan nilai tugas, kuis, dan ulangan harian — nilai akhir terhitung otomatis</p>
              <div className="panel">
                <div className="panel-head">
                  <h2>XII PPLG 2 - Basis Data</h2>
                  <button className="btn btn-primary" onClick={() => showToast('Nilai berhasil disimpan.')}>Simpan nilai</button>
                </div>
                <table>
                  <thead><tr><th>Nama siswa</th><th>Tugas</th><th>Kuis</th><th>Ulangan harian</th><th>Nilai akhir</th></tr></thead>
                  <tbody>
                    {nilaiData.map((n, i) => (
                      <tr key={n.nis}>
                        <td style={{ fontWeight: 600 }}>{n.nama}</td>
                        <td><input className="nilai-input" type="number" min="0" max="100" value={n.tugas} onChange={(e) => updateNilai(i, 'tugas', e.target.value)} /></td>
                        <td><input className="nilai-input" type="number" min="0" max="100" value={n.kuis} onChange={(e) => updateNilai(i, 'kuis', e.target.value)} /></td>
                        <td><input className="nilai-input" type="number" min="0" max="100" value={n.uh} onChange={(e) => updateNilai(i, 'uh', e.target.value)} /></td>
                        <td style={{ fontWeight: 700, color: 'var(--tosca-700)' }}>{hitungAkhir(n.tugas, n.kuis, n.uh)}</td>
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
              <p className="page-sub">Status pengumpulan tugas siswa dan himbauan dari admin</p>

              <div className="panel">
                <div className="panel-head">
                  <h2>Status pengumpulan tugas</h2>
                  <select className="btn" style={{ cursor: 'pointer' }} value={filterTugas} onChange={(e) => setFilterTugas(e.target.value)}>
                    {tugasData.map((t) => <option key={t.judul} value={t.judul}>{t.judul}</option>)}
                  </select>
                </div>
                <table>
                  <thead><tr><th>Nama siswa</th><th>Kelas</th><th>Status</th><th>Waktu kumpul</th></tr></thead>
                  <tbody>
                    {statusList.map((d) => (
                      <tr key={d.nama}>
                        <td style={{ fontWeight: 600 }}>{d.nama}</td>
                        <td>{d.kelas}</td>
                        <td><Pill status={d.status} /></td>
                        <td>{d.waktu}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="panel">
                <div className="panel-head"><h2>Himbauan dari admin</h2></div>
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
                <div className="profile-avatar">PB</div>
                <div className="field-row"><label>Nama lengkap</label><input type="text" defaultValue="Budiono, S.Pd." readOnly /></div>
                <div className="field-row"><label>NIP</label><input type="text" defaultValue="198504122010011005" readOnly /></div>
                <div className="field-row"><label>Mata pelajaran diampu</label><input type="text" defaultValue="Basis Data, Pemrograman Web" readOnly /></div>
                <div className="field-row"><label>Email</label><input type="text" defaultValue="budiono@guru.smkcitranegara.sch.id" readOnly /></div>
                <div className="field-row"><label>No. HP</label><input type="text" defaultValue="0813-7788-9900" readOnly /></div>
              </div>
            </section>
          )}

        </div>
      </div>

      {/* Modal Materi */}
      {materiModal.open && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setMateriModal((s) => ({ ...s, open: false }))}>
          <div className="modal">
            <h3>{materiModal.index !== null ? 'Edit materi' : 'Tambah materi'}</h3>
            <p className="sub">Materi akan langsung tersedia untuk siswa di kelas terkait.</p>
            <div className="field-row"><label>Judul materi</label>
              <input type="text" placeholder="Contoh: Konsep Dasar Basis Data" value={materiModal.judul} onChange={(e) => setMateriModal((s) => ({ ...s, judul: e.target.value }))} />
            </div>
            <div className="field-row-2">
              <div className="field-row"><label>Mata pelajaran</label>
                <select value={materiModal.mapel} onChange={(e) => setMateriModal((s) => ({ ...s, mapel: e.target.value }))}>
                  {MAPEL_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="field-row"><label>Kelas</label>
                <select value={materiModal.kelas} onChange={(e) => setMateriModal((s) => ({ ...s, kelas: e.target.value }))}>
                  {KELAS_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div className="field-row"><label>Upload file (opsional)</label><input type="file" accept=".pdf,.ppt,.pptx,.doc,.docx" /></div>
            <div className="field-row"><label>Catatan / ringkasan materi</label>
              <textarea placeholder="Tulis ringkasan materi di sini..." value={materiModal.catatan} onChange={(e) => setMateriModal((s) => ({ ...s, catatan: e.target.value }))} />
            </div>
            <div className="form-actions">
              <button className="btn" onClick={() => setMateriModal((s) => ({ ...s, open: false }))}>Batal</button>
              <button className="btn btn-primary" onClick={saveMateri}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tugas */}
      {tugasModal.open && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setTugasModal((s) => ({ ...s, open: false }))}>
          <div className="modal">
            <h3>{tugasModal.index !== null ? 'Edit tugas' : 'Tambah tugas'}</h3>
            <p className="sub">Tugas berupa file PDF atau catatan teks yang harus dikerjakan siswa.</p>
            <div className="field-row"><label>Judul tugas</label>
              <input type="text" placeholder="Contoh: Membuat ERD Toko Online" value={tugasModal.judul} onChange={(e) => setTugasModal((s) => ({ ...s, judul: e.target.value }))} />
            </div>
            <div className="field-row-2">
              <div className="field-row"><label>Mata pelajaran</label>
                <select value={tugasModal.mapel} onChange={(e) => setTugasModal((s) => ({ ...s, mapel: e.target.value }))}>
                  {MAPEL_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="field-row"><label>Kelas</label>
                <select value={tugasModal.kelas} onChange={(e) => setTugasModal((s) => ({ ...s, kelas: e.target.value }))}>
                  {KELAS_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div className="field-row"><label>Tenggat pengumpulan</label>
              <input type="date" value={tugasModal.deadline} onChange={(e) => setTugasModal((s) => ({ ...s, deadline: e.target.value }))} />
            </div>
            <div className="field-row"><label>Jenis tugas</label>
              <select value={tugasModal.jenis} onChange={(e) => setTugasModal((s) => ({ ...s, jenis: e.target.value }))}>
                <option value="pdf">Upload file PDF</option>
                <option value="catatan">Catatan teks</option>
              </select>
            </div>
            {tugasModal.jenis === 'pdf' ? (
              <div className="field-row"><label>Upload file PDF</label><input type="file" accept=".pdf" /></div>
            ) : (
              <div className="field-row"><label>Isi catatan tugas</label>
                <textarea placeholder="Tulis instruksi tugas di sini..." value={tugasModal.catatan} onChange={(e) => setTugasModal((s) => ({ ...s, catatan: e.target.value }))} />
              </div>
            )}
            <div className="form-actions">
              <button className="btn" onClick={() => setTugasModal((s) => ({ ...s, open: false }))}>Batal</button>
              <button className="btn btn-primary" onClick={saveTugas}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Assessment */}
      {assessmentModal.open && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setAssessmentModal((s) => ({ ...s, open: false }))}>
          <div className="modal" style={{ width: 560 }}>
            <h3>Buat assessment</h3>
            <p className="sub">Tambahkan soal pilihan ganda atau esai, tiap soal punya poin sendiri.</p>
            <div className="field-row"><label>Judul assessment</label>
              <input type="text" placeholder="Contoh: Kuis Normalisasi Data" value={assessmentModal.judul} onChange={(e) => setAssessmentModal((s) => ({ ...s, judul: e.target.value }))} />
            </div>
            <div className="field-row-2">
              <div className="field-row"><label>Mata pelajaran</label>
                <select value={assessmentModal.mapel} onChange={(e) => setAssessmentModal((s) => ({ ...s, mapel: e.target.value }))}>
                  {MAPEL_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="field-row"><label>Kelas</label>
                <select value={assessmentModal.kelas} onChange={(e) => setAssessmentModal((s) => ({ ...s, kelas: e.target.value }))}>
                  {KELAS_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div className="field-row-2">
              <div className="field-row"><label>Tipe</label>
                <select value={assessmentModal.tipe} onChange={(e) => setAssessmentModal((s) => ({ ...s, tipe: e.target.value }))}>
                  <option>Kuis</option>
                  <option>Ulangan Harian</option>
                </select>
              </div>
              <div className="field-row"><label>Tenggat</label>
                <input type="date" value={assessmentModal.deadline} onChange={(e) => setAssessmentModal((s) => ({ ...s, deadline: e.target.value }))} />
              </div>
            </div>

            {assessmentModal.soalList.map((soal, i) => (
              <div className="soal-card" key={i}>
                <div className="soal-card-head">
                  <span>Soal {i + 1}</span>
                  <div className="icon-btn danger" title="Hapus soal" onClick={() => hapusSoal(i)}><IconTrash /></div>
                </div>
                <div className="field-row-2" style={{ marginBottom: 8 }}>
                  <div className="field-row" style={{ marginBottom: 0 }}><label>Tipe soal</label>
                    <select value={soal.tipe} onChange={(e) => updateSoal(i, 'tipe', e.target.value)}>
                      <option value="pg">Pilihan Ganda</option>
                      <option value="esai">Esai</option>
                    </select>
                  </div>
                  <div className="field-row" style={{ marginBottom: 0 }}><label>Poin</label>
                    <input type="number" min="1" value={soal.poin} onChange={(e) => updateSoal(i, 'poin', e.target.value)} />
                  </div>
                </div>
                <div className="field-row"><label>Pertanyaan</label>
                  <textarea style={{ minHeight: 50 }} placeholder="Tulis pertanyaan di sini..." value={soal.pertanyaan} onChange={(e) => updateSoal(i, 'pertanyaan', e.target.value)} />
                </div>
                {soal.tipe === 'pg' && (
                  <div>
                    {soal.opsi.map((op, oi) => (
                      <div className="opsi-row" key={oi}>
                        <input type="radio" name={`benar-${i}`} checked={soal.benar === oi} onChange={() => updateSoal(i, 'benar', oi)} />
                        <input type="text" placeholder={`Opsi ${String.fromCharCode(65 + oi)}`} value={op} onChange={(e) => updateOpsi(i, oi, e.target.value)} />
                      </div>
                    ))}
                    <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '2px 0 0' }}>Pilih radio di samping opsi jawaban yang benar.</p>
                  </div>
                )}
              </div>
            ))}
            <button className="btn" style={{ width: '100%', justifyContent: 'center', marginBottom: 14 }} onClick={tambahSoal}>+ Tambah soal</button>

            <div className="form-actions">
              <button className="btn" onClick={() => setAssessmentModal((s) => ({ ...s, open: false }))}>Batal</button>
              <button className="btn btn-primary" onClick={saveAssessment}>Simpan assessment</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal konfirmasi hapus */}
      {confirmDelete.open && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setConfirmDelete({ open: false, type: null, index: null })}>
          <div className="modal small">
            <h3>Hapus data ini?</h3>
            <p className="sub">Data yang dihapus tidak bisa dikembalikan.</p>
            <div className="form-actions">
              <button className="btn" onClick={() => setConfirmDelete({ open: false, type: null, index: null })}>Batal</button>
              <button className="btn btn-primary" style={{ background: 'var(--coral)', borderColor: 'var(--coral)' }} onClick={confirmDeleteYes}>Ya, hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal logout */}
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
.topbar-user{display:flex;align-items:center;gap:12px;}
.topbar-user .name{font-size:12.5px;font-weight:700;}
.avatar-user{width:32px;height:32px;border-radius:50%;background:var(--tosca-100);color:var(--tosca-800);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;}
.content{padding:22px;overflow-y:auto;}
.greeting{font-size:15.5px;font-weight:700;margin:0 0 16px;}
.quick-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px;}
.quick-card{display:flex;align-items:center;gap:12px;background:var(--tosca-700);color:#fff;border:none;border-radius:12px;padding:18px 18px;font-size:14.5px;font-weight:700;cursor:pointer;font-family:inherit;}
.quick-card:hover{background:var(--tosca-600);}
.quick-card .qi{width:34px;height:34px;border-radius:8px;background:rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.panel{background:var(--surface);border:1px solid var(--line);border-radius:12px;overflow:hidden;margin-bottom:16px;}
.panel-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--line);gap:12px;flex-wrap:wrap;}
.panel-head h2{font-size:14.5px;font-weight:700;margin:0;}
.panel-head .link{font-size:12.5px;font-weight:600;color:var(--tosca-700);cursor:pointer;}
.panel-body{padding:6px 18px 14px;min-height:50px;}
.list-row{display:flex;align-items:center;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--line);gap:12px;}
.list-row:last-child{border-bottom:none;}
.list-row .title{font-size:13.5px;font-weight:600;}
.list-row .sub{font-size:12px;color:var(--ink-soft);margin-top:2px;}
.btn{display:inline-flex;align-items:center;gap:6px;font-family:inherit;font-size:12.5px;font-weight:600;padding:8px 14px;border-radius:8px;border:1px solid var(--line);background:var(--surface);color:var(--ink);cursor:pointer;white-space:nowrap;}
.btn:hover{background:var(--tosca-50);}
.btn-primary{background:var(--tosca-700);border-color:var(--tosca-700);color:#fff;}
.btn-primary:hover{background:var(--tosca-600);}
.icon-btn{width:30px;height:30px;border-radius:7px;border:1px solid var(--line);background:var(--surface);display:flex;align-items:center;justify-content:center;cursor:pointer;}
.icon-btn:hover{background:var(--tosca-50);}
.icon-btn.danger:hover{background:var(--coral-100);border-color:#F0B7A3;}
.row-actions{display:flex;gap:6px;}
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
.nilai-input{width:60px;padding:6px 8px;border:1px solid var(--line);border-radius:6px;font-family:inherit;font-size:13px;text-align:center;}
.nilai-input:focus{border-color:var(--tosca-500);outline:none;}
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
.field-row input, .field-row select, .field-row textarea{font-family:inherit;font-size:13.5px;padding:9px 11px;border:1px solid var(--line);border-radius:8px;background:var(--surface);outline:none;color:var(--ink);}
.field-row input:read-only{background:var(--tosca-50);}
.field-row textarea{resize:vertical;min-height:70px;}
.field-row input:focus, .field-row select:focus, .field-row textarea:focus{border-color:var(--tosca-500);}
.field-row-2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.modal-overlay{display:none;position:fixed;inset:0;background:rgba(11,38,33,0.45);align-items:center;justify-content:center;z-index:50;padding:20px;}
.modal-overlay.open{display:flex;}
.modal{background:var(--surface);border-radius:14px;width:480px;max-width:100%;max-height:88vh;overflow-y:auto;padding:22px 22px 18px;}
.modal.small{width:340px;}
.modal h3{margin:0 0 2px;font-size:16px;font-weight:700;}
.modal p.sub{margin:0 0 16px;font-size:12.5px;color:var(--ink-soft);}
.form-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:16px;}
.soal-card{border:1px solid var(--line);border-radius:10px;padding:14px;margin-bottom:12px;background:var(--tosca-50);}
.soal-card-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;}
.soal-card-head span{font-size:12.5px;font-weight:700;color:var(--tosca-800);}
.opsi-row{display:flex;align-items:center;gap:8px;margin-bottom:6px;}
.opsi-row input[type="text"]{flex:1;padding:7px 9px;font-size:12.5px;border:1px solid var(--line);border-radius:6px;font-family:inherit;}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--tosca-900);color:#fff;padding:11px 20px;border-radius:10px;font-size:13px;font-weight:600;z-index:100;box-shadow:0 4px 16px rgba(0,0,0,0.2);}
@media (max-width:860px){
  .sidebar{width:64px;}
  .nav-item span.label{display:none;}
  .quick-cards{grid-template-columns:1fr;}
}
`;

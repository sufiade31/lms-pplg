
'use client';
 
import { useState } from 'react';
import { useRouter } from 'next/navigation';
 
const INITIAL_GURU = [
  { id: 1, nama: 'Siti Nurhaliza', nip: '198203122010012001', mapel: 'Matematika', kontak: '0812-3456-7890', status: 'Aktif' },
  { id: 2, nama: 'Budi Santoso', nip: '197911052008011003', mapel: 'Bahasa Indonesia', kontak: '0813-2233-4455', status: 'Aktif' },
  { id: 3, nama: 'Rina Amelia', nip: '198507192011012004', mapel: 'Fisika', kontak: '0857-1122-3344', status: 'Aktif' },
  { id: 4, nama: 'Ahmad Fauzan', nip: '198001012006041002', mapel: 'Pemrograman Web', kontak: '0821-9988-7766', status: 'Cuti' },
  { id: 5, nama: 'Dewi Lestari', nip: '199002142015022001', mapel: 'Bahasa Inggris', kontak: '0895-4433-2211', status: 'Aktif' },
];
const INITIAL_SISWA = [
  { id: 1, nama: 'Muhammad Rizky', nis: '2425001', kelas: 'XII RPL 1', gender: 'Laki-laki', status: 'Aktif' },
  { id: 2, nama: 'Anisa Putri', nis: '2425002', kelas: 'XII RPL 1', gender: 'Perempuan', status: 'Aktif' },
  { id: 3, nama: 'Fajar Nugroho', nis: '2425034', kelas: 'XI TKJ 2', gender: 'Laki-laki', status: 'Aktif' },
  { id: 4, nama: 'Salsabila Zahra', nis: '2425058', kelas: 'X DKV 1', gender: 'Perempuan', status: 'Aktif' },
  { id: 5, nama: 'Dimas Prasetyo', nis: '2425071', kelas: 'XI TKJ 2', gender: 'Laki-laki', status: 'Pindah' },
];
const INITIAL_KELAS = [
  { id: 1, nama: 'XII RPL 1', wali: 'Siti Nurhaliza', jumlah: 32, tingkat: 'XII' },
  { id: 2, nama: 'XI TKJ 2', wali: 'Budi Santoso', jumlah: 30, tingkat: 'XI' },
  { id: 3, nama: 'X DKV 1', wali: 'Rina Amelia', jumlah: 28, tingkat: 'X' },
  { id: 4, nama: 'XII RPL 2', wali: 'Ahmad Fauzan', jumlah: 31, tingkat: 'XII' },
];
const MAPEL_DATA = [
  { nama: 'Matematika', kode: 'MTK-01', guru: ['Siti Nurhaliza'] },
  { nama: 'Pemrograman Web', kode: 'PWB-03', guru: ['Ahmad Fauzan', 'Rina Amelia'] },
  { nama: 'Bahasa Indonesia', kode: 'BIN-01', guru: ['Budi Santoso'] },
  { nama: 'Bahasa Inggris', kode: 'BIG-01', guru: ['Dewi Lestari'] },
  { nama: 'Fisika', kode: 'FIS-02', guru: ['Rina Amelia'] },
  { nama: 'Basis Data', kode: 'BDT-02', guru: ['Ahmad Fauzan'] },
];
const INITIAL_PENGUMUMAN = [
  { id: 1, judul: 'Libur Hari Raya', tanggal: '2 Sep 2026', target: 'Semua', status: 'Terbit', isi: 'Sekolah libur mulai tanggal 10 hingga 14 September 2026. Kegiatan belajar mengajar akan kembali normal pada 15 September 2026.' },
  { id: 2, judul: 'Jadwal Penilaian Tengah Semester', tanggal: '28 Agu 2026', target: 'Siswa saja', status: 'Terbit', isi: 'PTS akan dilaksanakan mulai 21 September 2026. Jadwal lengkap dapat dilihat di papan pengumuman kelas masing-masing.' },
  { id: 3, judul: 'Rapat Koordinasi Wali Kelas', tanggal: '25 Agu 2026', target: 'Guru saja', status: 'Draf', isi: 'Rapat koordinasi seluruh wali kelas akan diadakan di ruang guru. Agenda: persiapan PTS dan evaluasi semester.' },
];
 
const MENU_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', title: 'Dashboard', sub: 'Ringkasan aktivitas hari ini' },
  { key: 'guru', label: 'Guru', title: 'Guru', sub: 'Kelola data guru' },
  { key: 'siswa', label: 'Siswa', title: 'Siswa', sub: 'Kelola data siswa' },
  { key: 'kelas', label: 'Kelas', title: 'Kelas', sub: 'Kelola data kelas' },
  { key: 'mapel', label: 'Mata pelajaran', title: 'Mata pelajaran', sub: 'Lihat guru pengampu tiap mata pelajaran' },
  { key: 'pengumuman', label: 'Pengumuman', title: 'Pengumuman', sub: 'Kelola pengumuman sekolah' },
];
 
const FORM_CONFIG = {
  guru: {
    titleAdd: 'Tambah guru baru', titleEdit: 'Edit data guru', sub: 'Perubahan langsung terlihat di daftar guru.',
    fields: [
      { key: 'nama', label: 'Nama lengkap', type: 'text' },
      { key: 'nip', label: 'NIP', type: 'text' },
      { key: 'mapel', label: 'Mata pelajaran', type: 'text' },
      { key: 'kontak', label: 'Nomor kontak', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Aktif', 'Cuti'] },
    ],
  },
  siswa: {
    titleAdd: 'Tambah siswa baru', titleEdit: 'Edit data siswa', sub: 'Perubahan langsung terlihat di daftar siswa.',
    fields: [
      { key: 'nama', label: 'Nama lengkap', type: 'text' },
      { key: 'nis', label: 'NIS', type: 'text' },
      { key: 'kelas', label: 'Kelas', type: 'text' },
      { key: 'gender', label: 'Jenis kelamin', type: 'select', options: ['Laki-laki', 'Perempuan'] },
      { key: 'status', label: 'Status', type: 'select', options: ['Aktif', 'Pindah'] },
    ],
  },
  kelas: {
    titleAdd: 'Tambah kelas baru', titleEdit: 'Edit data kelas', sub: 'Perubahan langsung terlihat di daftar kelas.',
    fields: [
      { key: 'nama', label: 'Nama kelas', type: 'text' },
      { key: 'wali', label: 'Wali kelas', type: 'text' },
      { key: 'jumlah', label: 'Jumlah siswa', type: 'number' },
      { key: 'tingkat', label: 'Tingkat', type: 'text' },
    ],
  },
};
 
function initials(nama) {
  return nama.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}
 
function Pill({ status }) {
  const map = { Aktif: 'pill-tosca', Cuti: 'pill-amber', Pindah: 'pill-coral', Terbit: 'pill-tosca', Draf: 'pill-amber' };
  return <span className={`pill ${map[status] || 'pill-tosca'}`}>{status}</span>;
}
 
export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const router = useRouter();
 
  const [guruData, setGuruData] = useState(INITIAL_GURU);
  const [siswaData, setSiswaData] = useState(INITIAL_SISWA);
  const [kelasData, setKelasData] = useState(INITIAL_KELAS);
  const [pengumumanData, setPengumumanData] = useState(INITIAL_PENGUMUMAN);
  const nextId = { current: { guru: 6, siswa: 6, kelas: 5, pengumuman: 4 } };
 
  const [modal, setModal] = useState({ open: false, type: null, id: null, values: {}, error: '' });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, type: null, id: null });
  const [profileOpen, setProfileOpen] = useState(false);
 
  const [announceOpen, setAnnounceOpen] = useState(false);
  const [announceForm, setAnnounceForm] = useState({ judul: '', isi: '', target: 'Semua', status: 'Draf' });
  const [announceError, setAnnounceError] = useState(false);
 
  const dataMap = {
    guru: [guruData, setGuruData],
    siswa: [siswaData, setSiswaData],
    kelas: [kelasData, setKelasData],
  };
 
  const menuInfo = MENU_ITEMS.find((m) => m.key === activeSection);
 
  function openAddModal(type) {
    setModal({ open: true, type, id: null, values: {}, error: '' });
  }
  function openEditModal(type, record) {
    setModal({ open: true, type, id: record.id, values: { ...record }, error: '' });
  }
  function closeModal() {
    setModal({ open: false, type: null, id: null, values: {}, error: '' });
  }
  function updateModalField(key, value) {
    setModal((m) => ({ ...m, values: { ...m.values, [key]: value } }));
  }
  function saveModal() {
    const cfg = FORM_CONFIG[modal.type];
    for (const f of cfg.fields) {
      const val = modal.values[f.key];
      if (f.type === 'text' && (!val || String(val).trim() === '')) {
        setModal((m) => ({ ...m, error: `${f.label} wajib diisi.` }));
        return;
      }
    }
    const [, setData] = dataMap[modal.type];
    if (modal.id) {
      setData((prev) => prev.map((r) => (r.id === modal.id ? { ...r, ...modal.values } : r)));
    } else {
      const id = nextId.current[modal.type]++;
      setData((prev) => [...prev, { id, ...modal.values }]);
    }
    closeModal();
  }
 
  function askDelete(type, id) {
    setConfirmDelete({ open: true, type, id });
  }
  function confirmDeleteYes() {
    const { type, id } = confirmDelete;
    const [, setData] = dataMap[type];
    setData((prev) => prev.filter((r) => r.id !== id));
    setConfirmDelete({ open: false, type: null, id: null });
  }
 
  function publishAnnouncement() {
    if (!announceForm.judul.trim() || !announceForm.isi.trim()) {
      setAnnounceError(true);
      return;
    }
    const id = nextId.current.pengumuman++;
    setPengumumanData((prev) => [{ id, tanggal: 'Baru saja', ...announceForm }, ...prev]);
    setAnnounceForm({ judul: '', isi: '', target: 'Semua', status: 'Draf' });
    setAnnounceError(false);
    setAnnounceOpen(false);
  }
 
  function AnnounceCard({ p }) {
    return (
      <div className="announce-card">
        <div className="announce-top">
          <div>
            <div className="announce-title">{p.judul}</div>
            <div className="announce-meta">{p.tanggal} · Target: {p.target}</div>
          </div>
          <Pill status={p.status} />
        </div>
        <div className="announce-body">{p.isi}</div>
      </div>
    );
  }
 
  return (
    <div className="app">
      <style jsx global>{styles}</style>
 
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <img src="/logo-smk.png" alt="Logo SMK Citra Negara" />
          </div>
          <div>
            <div className="brand-name">Learning Management System</div>
            <div className="brand-sub">Admin</div>
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
 
          <div className="nav-spacer" />
          <div className="nav-divider" />
 
          <button className="nav-item nav-item-danger" onClick={() => router.push('/login')}>
            <span className="ic">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            <span className="label">Keluar</span>
          </button>
        </nav>
 
        <div className="admin-mini" onClick={() => setProfileOpen(true)} role="button" tabIndex={0}>
          <div className="avatar-sm">AD</div>
          <div>
            <div className="admin-mini-name">Admin</div>
            <div className="admin-mini-role">Administrator</div>
          </div>
        </div>
      </aside>
 
      <div className="main">
        <div className="topbar">
          <div>
            <div className="page-title">{menuInfo.title}</div>
            <div className="page-sub">{menuInfo.sub}</div>
          </div>
          <div className="topbar-right">
            <div className="search-box">
              <input type="text" placeholder="Cari data..." />
            </div>
          </div>
        </div>
 
        <div className="content">
 
          {activeSection === 'dashboard' && (
            <section>
              <div className="stats-row">
                <div className="stat-card">
                  <div className="stat-label">Total guru</div>
                  <div className="stat-value">{guruData.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Total siswa</div>
                  <div className="stat-value">{siswaData.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Total kelas</div>
                  <div className="stat-value">{kelasData.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Mata pelajaran</div>
                  <div className="stat-value">{MAPEL_DATA.length}</div>
                </div>
              </div>
 
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <h2>Pengumuman terbaru</h2>
                    <p>{pengumumanData.filter((p) => p.status === 'Terbit').length} pengumuman aktif untuk seluruh sekolah</p>
                  </div>
                  <button className="btn" onClick={() => setActiveSection('pengumuman')}>Lihat semua</button>
                </div>
                <div style={{ padding: '6px 18px 18px' }}>
                  <div className="announce-list">
                    {pengumumanData.slice(0, 2).map((p) => <AnnounceCard key={p.id} p={p} />)}
                  </div>
                </div>
              </div>
            </section>
          )}
 
          {activeSection === 'guru' && (
            <section className="panel">
              <div className="panel-head">
                <div>
                  <h2>Daftar guru</h2>
                  <p>{guruData.length} guru terdaftar</p>
                </div>
                <button className="btn btn-primary" onClick={() => openAddModal('guru')}>+ Tambah guru</button>
              </div>
              <table>
                <thead><tr><th>Nama</th><th>NIP</th><th>Mata pelajaran</th><th>Kontak</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {guruData.map((g) => (
                    <tr key={g.id}>
                      <td>
                        <div className="name-cell">
                          <div className="avatar">{initials(g.nama)}</div>
                          <div>
                            <div className="name-primary">{g.nama}</div>
                            <div className="name-secondary">{g.nip}</div>
                          </div>
                        </div>
                      </td>
                      <td>{g.nip}</td>
                      <td>{g.mapel}</td>
                      <td>{g.kontak}</td>
                      <td><Pill status={g.status} /></td>
                      <td>
                        <div className="row-actions">
                          <div className="icon-btn" onClick={() => openEditModal('guru', g)}>✎</div>
                          <div className="icon-btn danger" onClick={() => askDelete('guru', g.id)}>🗑</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
 
          {activeSection === 'siswa' && (
            <section className="panel">
              <div className="panel-head">
                <div>
                  <h2>Daftar siswa</h2>
                  <p>{siswaData.length} siswa terdaftar</p>
                </div>
                <button className="btn btn-primary" onClick={() => openAddModal('siswa')}>+ Tambah siswa</button>
              </div>
              <table>
                <thead><tr><th>Nama</th><th>NIS</th><th>Kelas</th><th>Jenis kelamin</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {siswaData.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className="name-cell">
                          <div className="avatar">{initials(s.nama)}</div>
                          <div>
                            <div className="name-primary">{s.nama}</div>
                            <div className="name-secondary">{s.nis}</div>
                          </div>
                        </div>
                      </td>
                      <td>{s.nis}</td>
                      <td>{s.kelas}</td>
                      <td>{s.gender}</td>
                      <td><Pill status={s.status} /></td>
                      <td>
                        <div className="row-actions">
                          <div className="icon-btn" onClick={() => openEditModal('siswa', s)}>✎</div>
                          <div className="icon-btn danger" onClick={() => askDelete('siswa', s.id)}>🗑</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
 
          {activeSection === 'kelas' && (
            <section className="panel">
              <div className="panel-head">
                <div>
                  <h2>Daftar kelas</h2>
                  <p>{kelasData.length} kelas tahun ajaran 2026/2027</p>
                </div>
                <button className="btn btn-primary" onClick={() => openAddModal('kelas')}>+ Tambah kelas</button>
              </div>
              <table>
                <thead><tr><th>Nama kelas</th><th>Wali kelas</th><th>Jumlah siswa</th><th>Tingkat</th><th></th></tr></thead>
                <tbody>
                  {kelasData.map((k) => (
                    <tr key={k.id}>
                      <td className="name-primary">{k.nama}</td>
                      <td>{k.wali}</td>
                      <td>{k.jumlah} siswa</td>
                      <td>{k.tingkat}</td>
                      <td>
                        <div className="row-actions">
                          <div className="icon-btn" onClick={() => openEditModal('kelas', k)}>✎</div>
                          <div className="icon-btn danger" onClick={() => askDelete('kelas', k.id)}>🗑</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
 
          {activeSection === 'mapel' && (
            <section>
              <div className="panel" style={{ marginBottom: 14 }}>
                <div className="panel-head">
                  <div>
                    <h2>Mata pelajaran</h2>
                    <p>Daftar mapel beserta guru pengampu — hanya lihat</p>
                  </div>
                </div>
              </div>
              <div className="mapel-grid">
                {MAPEL_DATA.map((m) => (
                  <div className="mapel-card" key={m.kode}>
                    <h3>{m.nama}</h3>
                    <div className="kode">Kode: {m.kode}</div>
                    <div className="guru-list">
                      {m.guru.map((g) => (
                        <div className="guru-row" key={g}>
                          <div className="avatar" style={{ width: 26, height: 26, fontSize: 10.5 }}>{initials(g)}</div>
                          {g}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
 
          {activeSection === 'pengumuman' && (
            <section>
              <div className="panel-head" style={{ border: 'none', padding: '0 0 14px' }}>
                <div>
                  <h2>Pengumuman</h2>
                  <p>Kelola pengumuman untuk guru dan siswa</p>
                </div>
                <button className="btn btn-primary" onClick={() => setAnnounceOpen((v) => !v)}>+ Buat pengumuman</button>
              </div>
 
              {announceOpen && (
                <div className="announce-form open">
                  <div className="field-row">
                    <label>Judul pengumuman</label>
                    <input
                      type="text"
                      placeholder="Contoh: Libur Hari Raya"
                      value={announceForm.judul}
                      onChange={(e) => setAnnounceForm((f) => ({ ...f, judul: e.target.value }))}
                    />
                  </div>
                  {announceError && <p style={{ color: 'var(--coral)', fontSize: 12.5, margin: '-6px 0 12px' }}>Judul dan isi pengumuman wajib diisi.</p>}
                  <div className="field-row">
                    <label>Isi pengumuman</label>
                    <textarea
                      placeholder="Tulis isi pengumuman di sini..."
                      value={announceForm.isi}
                      onChange={(e) => setAnnounceForm((f) => ({ ...f, isi: e.target.value }))}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="field-row">
                      <label>Target</label>
                      <select value={announceForm.target} onChange={(e) => setAnnounceForm((f) => ({ ...f, target: e.target.value }))}>
                        <option>Semua</option>
                        <option>Per kelas</option>
                        <option>Guru saja</option>
                        <option>Siswa saja</option>
                      </select>
                    </div>
                    <div className="field-row">
                      <label>Status</label>
                      <select value={announceForm.status} onChange={(e) => setAnnounceForm((f) => ({ ...f, status: e.target.value }))}>
                        <option>Draf</option>
                        <option>Terbit</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className="btn" onClick={() => setAnnounceOpen(false)}>Batal</button>
                    <button className="btn btn-primary" onClick={publishAnnouncement}>Simpan pengumuman</button>
                  </div>
                </div>
              )}
 
              <div className="announce-list">
                {pengumumanData.map((p) => <AnnounceCard key={p.id} p={p} />)}
              </div>
            </section>
          )}
 
        </div>
      </div>
 
      {modal.open && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <h3>{modal.id ? FORM_CONFIG[modal.type].titleEdit : FORM_CONFIG[modal.type].titleAdd}</h3>
            <p className="sub">{FORM_CONFIG[modal.type].sub}</p>
            {modal.error && <p style={{ color: 'var(--coral)', fontSize: 12.5, margin: '0 0 10px' }}>{modal.error}</p>}
            <div>
              {FORM_CONFIG[modal.type].fields.map((f) => (
                <div className="field-row" key={f.key}>
                  <label>{f.label}</label>
                  {f.type === 'select' ? (
                    <select value={modal.values[f.key] || f.options[0]} onChange={(e) => updateModalField(f.key, e.target.value)}>
                      {f.options.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type={f.type}
                      value={modal.values[f.key] ?? ''}
                      placeholder={`Masukkan ${f.label.toLowerCase()}`}
                      onChange={(e) => updateModalField(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="form-actions">
              <button className="btn" onClick={closeModal}>Batal</button>
              <button className="btn btn-primary" onClick={saveModal}>Simpan</button>
            </div>
          </div>
        </div>
      )}
 
      {confirmDelete.open && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setConfirmDelete({ open: false, type: null, id: null })}>
          <div className="modal" style={{ width: 340 }}>
            <h3>Hapus data ini?</h3>
            <p className="sub">Data yang dihapus tidak bisa dikembalikan.</p>
            <div className="form-actions">
              <button className="btn" onClick={() => setConfirmDelete({ open: false, type: null, id: null })}>Batal</button>
              <button className="btn btn-primary" style={{ background: 'var(--coral)', borderColor: 'var(--coral)' }} onClick={confirmDeleteYes}>Ya, hapus</button>
            </div>
          </div>
        </div>
      )}
 
      {profileOpen && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setProfileOpen(false)}>
          <div className="modal" style={{ width: 340, textAlign: 'center' }}>
            <div className="avatar-sm" style={{ width: 64, height: 64, fontSize: 22, margin: '0 auto 14px' }}>AD</div>
            <h3>Admin</h3>
            <p className="sub">Administrator</p>
            <div style={{ textAlign: 'left', margin: '18px 0' }}>
              <div className="field-row">
                <label>Nama</label>
                <input type="text" value="Admin" readOnly />
              </div>
              <div className="field-row">
                <label>Email</label>
                <input type="text" value="admin@smkcitranegara.sch.id" readOnly />
              </div>
              <div className="field-row">
                <label>Peran</label>
                <input type="text" value="Administrator" readOnly />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn" onClick={() => setProfileOpen(false)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 
const styles = `
:root{
  --bg:#F3F8F6; --surface:#FFFFFF;
  --tosca-900:#0B4A44; --tosca-800:#0E5C54; --tosca-700:#127167; --tosca-600:#178A7C; --tosca-500:#1EA391;
  --tosca-100:#DCF1EA; --tosca-50:#EFF8F4;
  --ink:#152621; --ink-soft:#5C726C; --line:#DCE7E2;
  --coral:#E4633F; --coral-100:#FCE7DF; --coral-700:#9E3B21;
  --amber:#C98A1C; --amber-100:#FBEEDA;
}
*{box-sizing:border-box;}
body{margin:0;font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:var(--bg);color:var(--ink);}
.app{display:flex;min-height:100vh;}
.sidebar{width:246px;flex-shrink:0;background:var(--tosca-900);color:#EAF4F1;display:flex;flex-direction:column;padding:22px 14px;}
.brand{display:flex;align-items:center;gap:10px;padding:0 10px 22px 10px;margin-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.1);}
.brand-mark{width:32px;height:32px;border-radius:9px;background:var(--tosca-500);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;}
.brand-mark img{width:100%;height:100%;object-fit:contain;}
.brand-name{font-size:13px;font-weight:600;line-height:1.3;}
.brand-sub{font-size:11.5px;color:#9FC6BE;margin-top:1px;}
nav.menu{display:flex;flex-direction:column;gap:2px;margin-top:6px;}
.nav-item{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:8px;font-size:14px;color:#C7E3DC;cursor:pointer;border:none;background:none;text-align:left;width:100%;font-family:inherit;white-space:nowrap;overflow:visible;}
.nav-item:hover{background:rgba(255,255,255,0.06);color:#fff;}
.nav-item.active{background:var(--tosca-600);color:#fff;font-weight:600;}
.nav-item-danger{color:#F3B4A2;}
.nav-item-danger:hover{background:rgba(228,99,63,0.18);color:#FFD9CC;}
.nav-spacer{flex:1;}
.nav-divider{height:1px;background:rgba(255,255,255,0.1);margin:12px 6px;}
.admin-mini{display:flex;align-items:center;gap:9px;padding:10px;margin-top:8px;border-radius:9px;background:rgba(255,255,255,0.05);cursor:pointer;}
.admin-mini:hover{background:rgba(255,255,255,0.09);}
.avatar-sm{width:30px;height:30px;border-radius:50%;background:var(--tosca-500);color:var(--tosca-900);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;}
.admin-mini-name{font-size:12.5px;font-weight:600;color:#fff;}
.admin-mini-role{font-size:11px;color:#9FC6BE;}
.main{flex:1;min-width:0;display:flex;flex-direction:column;}
.topbar{height:66px;flex-shrink:0;background:var(--surface);border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;padding:0 26px;}
.page-title{font-size:19px;font-weight:600;}
.page-sub{font-size:12.5px;color:var(--ink-soft);margin-top:1px;}
.search-box{display:flex;align-items:center;gap:8px;background:var(--tosca-50);border:1px solid var(--line);border-radius:8px;padding:8px 12px;width:230px;}
.search-box input{border:none;background:none;outline:none;font-size:13px;font-family:inherit;width:100%;color:var(--ink);}
.content{padding:26px;overflow-y:auto;}
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px;}
.stat-card{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:16px 18px;}
.stat-label{font-size:12.5px;color:var(--ink-soft);}
.stat-value{font-size:26px;font-weight:700;margin-top:6px;}
.panel{background:var(--surface);border:1px solid var(--line);border-radius:12px;overflow:hidden;}
.panel-head{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid var(--line);}
.panel-head h2{font-size:15px;font-weight:600;margin:0;}
.panel-head p{font-size:12.5px;color:var(--ink-soft);margin:2px 0 0;}
.btn{display:inline-flex;align-items:center;gap:7px;font-family:inherit;font-size:13px;font-weight:600;padding:9px 15px;border-radius:8px;border:1px solid var(--line);background:var(--surface);color:var(--ink);cursor:pointer;}
.btn:hover{background:var(--tosca-50);}
.btn-primary{background:var(--tosca-700);border-color:var(--tosca-700);color:#fff;}
.btn-primary:hover{background:var(--tosca-600);}
table{width:100%;border-collapse:collapse;}
thead th{text-align:left;font-size:12px;color:var(--ink-soft);font-weight:600;padding:10px 18px;border-bottom:1px solid var(--line);background:var(--tosca-50);}
tbody td{padding:12px 18px;font-size:13.5px;border-bottom:1px solid var(--line);vertical-align:middle;}
tbody tr:last-child td{border-bottom:none;}
tbody tr:hover{background:var(--tosca-50);}
.row-actions{display:flex;gap:6px;}
.icon-btn{width:30px;height:30px;border-radius:7px;border:1px solid var(--line);background:var(--surface);display:flex;align-items:center;justify-content:center;cursor:pointer;}
.icon-btn:hover{background:var(--tosca-50);}
.icon-btn.danger:hover{background:var(--coral-100);border-color:#F0B7A3;}
.pill{display:inline-block;padding:3px 10px;border-radius:100px;font-size:11.5px;font-weight:600;}
.pill-tosca{background:var(--tosca-100);color:var(--tosca-800);}
.pill-coral{background:var(--coral-100);color:var(--coral-700);}
.pill-amber{background:var(--amber-100);color:var(--amber);}
.name-cell{display:flex;align-items:center;gap:10px;}
.avatar{width:34px;height:34px;border-radius:50%;flex-shrink:0;background:var(--tosca-100);color:var(--tosca-800);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;}
.name-primary{font-weight:600;font-size:13.5px;}
.name-secondary{font-size:12px;color:var(--ink-soft);}
.mapel-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;}
.mapel-card{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:16px 18px;}
.mapel-card h3{margin:0 0 3px;font-size:14.5px;font-weight:600;}
.mapel-card .kode{font-size:12px;color:var(--ink-soft);margin-bottom:12px;}
.guru-list{display:flex;flex-direction:column;gap:8px;}
.guru-row{display:flex;align-items:center;gap:9px;font-size:13px;}
.announce-list{display:flex;flex-direction:column;gap:12px;}
.announce-card{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:16px 18px;}
.announce-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;}
.announce-title{font-size:14.5px;font-weight:600;}
.announce-meta{font-size:12px;color:var(--ink-soft);margin-top:3px;}
.announce-body{font-size:13.5px;color:var(--ink-soft);margin-top:8px;line-height:1.55;}
.announce-form{background:var(--tosca-50);border:1px solid var(--line);border-radius:12px;padding:16px 18px;margin-bottom:16px;}
.field-row{display:flex;flex-direction:column;gap:5px;margin-bottom:12px;}
.field-row label{font-size:12.5px;font-weight:600;color:var(--ink-soft);}
.field-row input,.field-row select,.field-row textarea{font-family:inherit;font-size:13.5px;padding:9px 11px;border:1px solid var(--line);border-radius:8px;background:var(--surface);outline:none;color:var(--ink);}
.field-row textarea{resize:vertical;min-height:70px;}
.field-row input:focus,.field-row select:focus,.field-row textarea:focus{border-color:var(--tosca-500);}
.form-actions{display:flex;gap:8px;justify-content:flex-end;}
.modal-overlay{display:none;position:fixed;inset:0;background:rgba(11,38,33,0.45);align-items:center;justify-content:center;z-index:50;}
.modal-overlay.open{display:flex;}
.modal{background:var(--surface);border-radius:14px;width:420px;max-width:92vw;padding:22px 22px 18px;}
.modal h3{margin:0 0 2px;font-size:16px;font-weight:600;}
.modal p.sub{margin:0 0 16px;font-size:12.5px;color:var(--ink-soft);}
.login-screen{display:flex;min-height:100vh;align-items:center;justify-content:center;background:var(--tosca-900);}
.login-card{width:360px;background:var(--surface);border-radius:16px;padding:32px 28px;text-align:center;}
.login-card h2{margin:0 0 4px;font-size:18px;}
.login-card p{margin:0 0 22px;font-size:13px;color:var(--ink-soft);}
.login-card input{width:100%;padding:11px 13px;margin-bottom:10px;border-radius:8px;border:1px solid var(--line);font-family:inherit;font-size:13.5px;outline:none;}
.login-card input:focus{border-color:var(--tosca-500);}
.login-card .btn-primary{width:100%;justify-content:center;margin-top:6px;padding:11px;}
.login-note{font-size:11.5px;color:var(--ink-faint,#93A6A0);margin-top:16px;}
@media (max-width:900px){
  .sidebar{width:74px;}
  .brand-name,.brand-sub,.nav-item span.label,.admin-mini-name,.admin-mini-role{display:none;}
  .nav-item{justify-content:center;}
  .admin-mini{justify-content:center;}
  .stats-row{grid-template-columns:repeat(2,1fr);}
  .mapel-grid{grid-template-columns:1fr;}
}
`;

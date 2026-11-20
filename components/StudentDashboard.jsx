'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

// ====== Data contoh (belum dari database) ======
const MATERI = [
  { judul: 'Konsep Dasar Basis Data', mapel: 'Basis Data', guru: 'Ahmad Fauzan', tanggal: '2 Sep 2026', isi: [
    { h: 'Pengertian basis data', p: 'Basis data adalah kumpulan data yang saling berhubungan dan disimpan secara terstruktur sehingga mudah diakses, dikelola, dan diperbarui.' },
    { h: 'Komponen utama', p: 'Data disimpan dalam tabel. Setiap tabel terdiri dari baris (record) dan kolom (field). Primary key menjadi identitas unik tiap baris.' },
    { h: 'Keuntungan menggunakan DBMS', p: 'DBMS membantu mengurangi redundansi data, menjaga konsistensi, serta memudahkan pengaturan hak akses pengguna.' }] },
  { judul: 'Struktur HTML & CSS Lanjutan', mapel: 'Pemrograman Web', guru: 'Rina Amelia', tanggal: '30 Agu 2026', isi: [
    { h: 'Semantic HTML', p: 'Gunakan elemen seperti header, nav, main, section, dan footer agar struktur halaman jelas bagi pengguna maupun mesin pencari.' },
    { h: 'Selector dan specificity', p: 'CSS menentukan aturan mana yang dipakai berdasarkan specificity: inline style, id, class, lalu elemen.' },
    { h: 'Layout dengan Flexbox', p: 'Flexbox memudahkan penataan elemen dalam satu sumbu menggunakan display flex, justify-content, dan align-items.' }] },
  { judul: 'Fungsi Trigonometri', mapel: 'Matematika', guru: 'Siti Nurhaliza', tanggal: '28 Agu 2026', isi: [
    { h: 'Perbandingan trigonometri', p: 'Pada segitiga siku-siku, sin = depan/miring, cos = samping/miring, dan tan = depan/samping.' },
    { h: 'Sudut istimewa', p: 'Nilai sin, cos, dan tan untuk sudut 0, 30, 45, 60, dan 90 derajat perlu dihafal karena sering dipakai dalam soal.' },
    { h: 'Identitas dasar', p: 'Identitas yang paling sering dipakai adalah sin kuadrat ditambah cos kuadrat sama dengan 1.' }] },
];

const ASSESSMENT_AWAL = [
  { judul: 'Kuis Normalisasi Data', mapel: 'Basis Data', tipe: 'Kuis', deadline: '8 Sep 2026', durasi: 30, status: 'Belum' },
  { judul: 'Ulangan Harian Bab 2', mapel: 'Bahasa Inggris', tipe: 'Ulangan Harian', deadline: '10 Sep 2026', durasi: 45, status: 'Belum' },
  { judul: 'Kuis Semantic HTML', mapel: 'Pemrograman Web', tipe: 'Kuis', deadline: '1 Sep 2026', durasi: 20, status: 'Selesai', nilai: 88 },
];

const NILAI = [
  { mapel: 'Basis Data', tugas: 85, kuis: 80, uh: '-', rata: 83 },
  { mapel: 'Pemrograman Web', tugas: 90, kuis: 88, uh: '-', rata: 89 },
  { mapel: 'Matematika', tugas: 78, kuis: '-', uh: 82, rata: 80 },
];

const MENU = [
  { key: 'beranda', label: 'Beranda' },
  { key: 'materi', label: 'Materi' },
  { key: 'assessment', label: 'Assessment' },
  { key: 'tugas', label: 'Tugas' },
  { key: 'nilai', label: 'Nilai' },
  { key: 'pengumuman', label: 'Pengumuman' },
  { key: 'profil', label: 'Profil' },
];

// ====== Helper ======
function fmtTanggal(d) {
  if (!d) return '-';
  const dt = new Date(d);
  if (isNaN(dt)) return String(d);
  return dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtWaktu(s) {
  const x = Math.max(s, 0);
  return String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0');
}

function initials(nama) {
  return (nama || '?').split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

async function api(url, method = 'GET', body) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan pada server.');
  return data;
}

// Mencari data user yang disimpan halaman login (localStorage / sessionStorage).
// Login kamu mengembalikan { _id, nama, email, role }, jadi yang dicari objek JSON dengan _id dan nama.
function getLoginUser() {
  if (typeof window === 'undefined') return null;
  for (const store of [window.localStorage, window.sessionStorage]) {
    try {
      for (let i = 0; i < store.length; i++) {
        const raw = store.getItem(store.key(i));
        if (!raw || raw[0] !== '{') continue;
        const u = JSON.parse(raw);
        if (u && u._id && u.nama) return u;
      }
    } catch (e) { /* abaikan */ }
  }
  return null;
}

function clearLoginUser() {
  if (typeof window === 'undefined') return;
  for (const store of [window.localStorage, window.sessionStorage]) {
    try {
      const hapus = [];
      for (let i = 0; i < store.length; i++) {
        const k = store.key(i);
        const raw = store.getItem(k);
        if (raw && raw[0] === '{') {
          const u = JSON.parse(raw);
          if (u && u._id && u.nama) hapus.push(k);
        }
      }
      hapus.forEach((k) => store.removeItem(k));
    } catch (e) { /* abaikan */ }
  }
}

function Pill({ s }) {
  const map = { Belum: 'pill-amber', Selesai: 'pill-tosca', 'Belum Dikumpulkan': 'pill-coral', 'Sudah Dikumpulkan': 'pill-tosca' };
  return <span className={`pill ${map[s] || 'pill-tosca'}`}>{s}</span>;
}

function Modal({ title, sub, wide, locked, onClose, actions, children }) {
  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && !locked && onClose()}>
      <div className={`modal${wide ? ' wide' : ''}`}>
        <h3>{title}</h3>
        <p className="sub">{sub}</p>
        <div>{children}</div>
        <div className="form-actions">{actions}</div>
      </div>
    </div>
  );
}

function UploadModal({ t, onClose, onSubmit }) {
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  async function kirim() {
    if (!file) { setErr('Pilih file dulu.'); return; }
    setSaving(true);
    setErr('');
    try {
      await onSubmit(t, file);
      onClose();
    } catch (e) {
      setErr(e.message);
      setSaving(false);
    }
  }

  return (
    <Modal
      title={`Upload tugas: ${t.judul}`}
      sub={`${t.mapel} · tenggat ${fmtTanggal(t.deadline)}`}
      onClose={onClose}
      actions={
        <>
          <button className="btn" onClick={onClose}>Batal</button>
          <button className="btn btn-primary" disabled={saving} onClick={kirim}>{saving ? 'Mengirim...' : 'Kumpulkan tugas'}</button>
        </>
      }
    >
      <div className="field-row" style={{ marginBottom: 0 }}>
        <label>Pilih file (foto atau dokumen)</label>
        <input type="file" className="field-input" accept="image/*,.pdf,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </div>
      {t.pg && t.pg.namaFile && <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '10px 0 0' }}>File sebelumnya: {t.pg.namaFile}</p>}
      {err && <p style={{ color: 'var(--coral)', fontSize: 12.5, margin: '10px 0 0' }}>{err}</p>}
    </Modal>
  );
}

function QuizModal({ a, onFinish, onCancel }) {
  const [sisa, setSisa] = useState(a.durasi * 60);
  const selesai = useRef(false);

  useEffect(() => {
    const iv = setInterval(() => setSisa((s) => s - 1), 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (sisa <= 0 && !selesai.current) {
      selesai.current = true;
      onFinish(true);
    }
  }, [sisa]); // eslint-disable-line react-hooks/exhaustive-deps

  function kumpulkan() {
    if (selesai.current) return;
    selesai.current = true;
    onFinish(false);
  }

  return (
    <Modal
      title={a.judul}
      sub={`${a.mapel} · ${a.tipe}`}
      locked
      onClose={onCancel}
      actions={
        <>
          <button className="btn" onClick={onCancel}>Batal</button>
          <button className="btn btn-primary" onClick={kumpulkan}>Kumpulkan jawaban</button>
        </>
      }
    >
      <div className={`quiz-timer${sisa <= 60 ? ' danger' : ''}`}>
        <span>Sisa waktu</span><b>{fmtWaktu(sisa)}</b>
      </div>
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
    </Modal>
  );
}

export default function StudentDashboard() {
  const router = useRouter();
  const [section, setSection] = useState('beranda');
  const [user, setUser] = useState(null);
  const [me, setMe] = useState(null); // data siswa dari koleksi "siswa" (untuk kelas dan NIS)
  const [tugasAll, setTugasAll] = useState([]);
  const [pengumpulan, setPengumpulan] = useState([]);
  const [pengumumanAdmin, setPengumumanAdmin] = useState([]);
  const [assessment, setAssessment] = useState(ASSESSMENT_AWAL);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);

  const kelas = (user && user.kelas) || (me && me.kelas) || '';

  const muat = useCallback(async (u) => {
    try {
      const [t, p, pg, sw] = await Promise.all([
        api('/api/tugas'),
        api('/api/pengumuman'),
        u ? api(`/api/pengumpulan?siswaId=${encodeURIComponent(u._id)}`) : Promise.resolve([]),
        u ? api('/api/siswa') : Promise.resolve([]),
      ]);
      setTugasAll(t);
      setPengumumanAdmin(p.filter((x) => x.status === 'Terbit' && (x.target === 'Semua' || x.target === 'Siswa saja')));
      setPengumpulan(pg.filter((x) => u && x.siswaId === u._id));
      if (u) {
        const nama = (u.nama || '').trim().toLowerCase();
        setMe(sw.find((s) => (s.nama || '').trim().toLowerCase() === nama) || null);
      }
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const u = getLoginUser();
    setUser(u);
    muat(u);
    // Cek tugas baru dari guru tiap 30 detik
    const iv = setInterval(() => muat(u), 30000);
    return () => clearInterval(iv);
  }, [muat]);

  // Tugas untuk kelas siswa ini (atau yang ditujukan ke "Semua")
  const tugas = tugasAll
    .filter((t) => t.kelas === 'Semua' || (kelas && (t.kelas || '').toLowerCase() === kelas.toLowerCase()))
    .map((t) => {
      const pg = pengumpulan.find((x) => x.tugasId === t.id);
      return { ...t, pg, status: pg ? 'Sudah Dikumpulkan' : 'Belum Dikumpulkan' };
    });
  const tugasBelum = tugas.filter((t) => t.status === 'Belum Dikumpulkan');

  async function kumpulkanTugas(t, file) {
    if (!user) throw new Error('Data login tidak ditemukan. Silakan login ulang.');
    const body = {
      tugasId: t.id,
      siswaId: user._id,
      siswaNama: user.nama,
      namaFile: file ? file.name : '',
      dikumpulkanPada: new Date().toISOString(),
    };
    const saved = t.pg
      ? await api(`/api/pengumpulan/${t.pg.id}`, 'PUT', body)
      : await api('/api/pengumpulan', 'POST', body);
    setPengumpulan((prev) => (t.pg ? prev.map((x) => (x.id === saved.id ? saved : x)) : [...prev, saved]));
  }

  function selesaiAssessment(i, otomatis) {
    const a = assessment[i];
    setAssessment((prev) => prev.map((x, idx) => (idx === i ? { ...x, status: 'Selesai', nilai: Math.floor(Math.random() * 21) + 75 } : x)));
    setModal(otomatis ? { type: 'timeout', judul: a.judul } : null);
  }

  function keluar() {
    clearLoginUser();
    router.push('/login');
  }

  const namaUser = user ? user.nama : 'Siswa';
  const ket = kelas || (user ? 'Kelas belum terdeteksi' : '');
  const notifAssessment = assessment.filter((a) => a.status === 'Belum');
  const adaNotif = tugasBelum.length + notifAssessment.length;

  function renderModal() {
    if (!modal) return null;
    const tutup = () => setModal(null);

    if (modal.type === 'materi') {
      const m = MATERI[modal.i];
      return (
        <Modal
          title={m.judul}
          sub={`${m.mapel} · ${m.guru} · ${m.tanggal}`}
          wide
          onClose={tutup}
          actions={
            <>
              <button className="btn" onClick={tutup}>Tutup</button>
              <button className="btn btn-primary" onClick={() => setModal({ type: 'unduh', judul: m.judul })}>Unduh PDF</button>
            </>
          }
        >
          <div className="viewer">
            {m.isi.map((b) => (<div key={b.h}><h5>{b.h}</h5><p>{b.p}</p></div>))}
            <p className="viewer-note">(Materi masih contoh, belum tersambung ke file dari guru.)</p>
          </div>
        </Modal>
      );
    }

    if (modal.type === 'unduh') {
      return (
        <Modal title="Unduh materi" sub={`Materi "${modal.judul}" akan diunduh sebagai PDF.`} onClose={tutup}
          actions={<button className="btn btn-primary" onClick={tutup}>Tutup</button>}>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>(Belum tersambung ke file asli.)</p>
        </Modal>
      );
    }

    if (modal.type === 'tugas') {
      const t = tugas.find((x) => x.id === modal.id);
      if (!t) return null;
      return (
        <Modal
          title={t.judul}
          sub={`${t.mapel} · tenggat ${fmtTanggal(t.deadline)}`}
          wide
          onClose={tutup}
          actions={
            <>
              <button className="btn" onClick={tutup}>Tutup</button>
              <button className="btn btn-primary" onClick={() => setModal({ type: 'upload', id: t.id })}>
                {t.status === 'Belum Dikumpulkan' ? 'Upload tugas' : 'Ganti file'}
              </button>
            </>
          }
        >
          <div className="viewer">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
              <span className={`pill ${t.jenis === 'PDF' ? 'pill-blue' : 'pill-amber'}`}>{t.jenis === 'PDF' ? 'Tugas PDF' : 'Tugas catatan'}</span>
              <Pill s={t.status} />
            </div>
            <h5>Dari guru</h5><p>{t.guru}</p>
            <h5>Instruksi tugas</h5>
            {t.instruksi && t.instruksi.length > 0
              ? <ol>{t.instruksi.map((x, i) => <li key={i}>{x}</li>)}</ol>
              : <p>Tidak ada instruksi tambahan.</p>}
            {t.lampiran && (<><h5>Lampiran</h5><p>{t.lampiran}</p></>)}
            <h5>Batas pengumpulan</h5><p>{fmtTanggal(t.deadline)}</p>
            {t.pg && (<><h5>Pengumpulan kamu</h5><p>{t.pg.namaFile || '(tanpa nama file)'} · {fmtTanggal(t.pg.dikumpulkanPada)}{t.pg.nilai != null ? ` · nilai ${t.pg.nilai}` : ''}</p></>)}
          </div>
        </Modal>
      );
    }

    if (modal.type === 'upload') {
      const t = tugas.find((x) => x.id === modal.id);
      if (!t) return null;
      return <UploadModal t={t} onClose={tutup} onSubmit={kumpulkanTugas} />;
    }

    if (modal.type === 'asesInfo') {
      const a = assessment[modal.i];
      return (
        <Modal title={a.judul} sub={`${a.mapel} · ${a.tipe}`} onClose={tutup}
          actions={
            <>
              <button className="btn" onClick={tutup}>Batal</button>
              <button className="btn btn-primary" onClick={() => setModal({ type: 'quiz', i: modal.i })}>Mulai kerjakan</button>
            </>
          }>
          <p style={{ fontSize: 13, lineHeight: 1.7, margin: '0 0 6px' }}>Waktu pengerjaan: <b>{a.durasi} menit</b><br />Jumlah soal: <b>2</b></p>
          <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.6, margin: 0 }}>Timer mulai berjalan saat kamu klik &quot;Mulai kerjakan&quot;. Jika waktu habis, jawaban otomatis dikumpulkan.</p>
        </Modal>
      );
    }

    if (modal.type === 'quiz') {
      return <QuizModal a={assessment[modal.i]} onFinish={(otomatis) => selesaiAssessment(modal.i, otomatis)} onCancel={tutup} />;
    }

    if (modal.type === 'timeout') {
      return (
        <Modal title="Waktu habis" sub={modal.judul} onClose={tutup} actions={<button className="btn btn-primary" onClick={tutup}>Tutup</button>}>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: 0 }}>Waktu pengerjaan sudah habis, jawaban kamu dikumpulkan otomatis.</p>
        </Modal>
      );
    }

    if (modal.type === 'logout') {
      return (
        <Modal title="Keluar dari akun?" sub="Kamu akan diarahkan kembali ke halaman login." onClose={tutup}
          actions={
            <>
              <button className="btn" onClick={tutup}>Batal</button>
              <button className="btn btn-primary" onClick={keluar}>Ya, keluar</button>
            </>
          } />
      );
    }
    return null;
  }

  const barisTugas = (t) => (
    <tr key={t.id}>
      <td style={{ fontWeight: 600 }}>{t.judul}</td>
      <td>{t.mapel}</td>
      <td>{fmtTanggal(t.deadline)}</td>
      <td><Pill s={t.status} /></td>
      <td>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => setModal({ type: 'tugas', id: t.id })}>Lihat</button>
          <button className={`btn${t.status === 'Belum Dikumpulkan' ? ' btn-primary' : ''}`} onClick={() => setModal({ type: 'upload', id: t.id })}>
            {t.status === 'Belum Dikumpulkan' ? 'Upload tugas' : 'Ganti file'}
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="app">
      <style jsx global>{styles}</style>

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><img src="/logo-smk.png" alt="Logo SMK Citra Negara" /></div>
          <div>
            <div className="brand-name">Sistem Manajemen<br />Pembelajaran</div>
            <div className="brand-sub">Siswa</div>
          </div>
        </div>
        <nav className="menu">
          {MENU.map((m) => (
            <button key={m.key} className={`nav-item${section === m.key ? ' active' : ''}`} onClick={() => setSection(m.key)}>
              <span className="label">{m.label}</span>
            </button>
          ))}
          <div className="nav-divider" />
          <button className="nav-item nav-item-danger" onClick={() => setModal({ type: 'logout' })}>
            <span className="ic">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            </span>
            <span className="label">Keluar</span>
          </button>
        </nav>
        <div className="profile-mini" onClick={() => setSection('profil')}>
          <div className="avatar-sm">{initials(namaUser)}</div>
          <div>
            <div className="pm-name">{namaUser}</div>
            <div className="pm-role">{ket}</div>
          </div>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <div className="topbar-brand">
            <img src="/logo-smk.png" alt="" />
            LMS SMK CITRA NEGARA
          </div>
          <div className="topbar-user">
            <div className="info">
              <div className="name">{namaUser}</div>
              <div className="kelas">{ket}</div>
            </div>
            <div className="avatar-user">{initials(namaUser)}</div>
          </div>
        </div>

               <div className="content">
          {error && <div className="error-banner">Gagal mengambil data dari database: {error}</div>}
          {!loading && !user && (
            <div className="warn-banner">Data login tidak ditemukan di browser, jadi tugas tidak bisa dikumpulkan. Silakan login ulang.</div>
          )}
          {!loading && user && !kelas && !['admin', 'guru', 'kepsek', 'kurikulum'].includes(user.role) && (
            <div className="warn-banner">Kelasmu belum terdeteksi. Pastikan namamu terdaftar di menu Siswa (admin) dengan kelas yang benar. Sementara ini hanya tugas untuk &quot;Semua&quot; yang tampil.</div>
          )}
          {loading && <p style={{ color: 'var(--ink-soft)', fontSize: 13.5 }}>Memuat data...</p>}

          {section === 'beranda' && (
            <section>
              <p className="greeting">Selamat datang {namaUser}!!!</p>
              <div className="quick-cards">
                <button className="quick-card" onClick={() => setSection('materi')}>Materi</button>
                <button className="quick-card" onClick={() => setSection('tugas')}>Tugas</button>
                <button className="quick-card" onClick={() => setSection('assessment')}>Assessment</button>
                <button className="quick-card" onClick={() => setSection('nilai')}>Nilai Rata-Rata</button>
              </div>
              <div className="panel">
                <div className="panel-head">
                  <h2>Tugas mendatang</h2>
                  <span className="link" onClick={() => setSection('tugas')}>Lihat semua</span>
                </div>
                <div className="panel-body">
                  {tugasBelum.length === 0
                    ? <div className="panel-body empty" style={{ padding: '10px 0' }}>Tidak ada tugas mendatang.</div>
                    : tugasBelum.slice(0, 3).map((t) => (
                      <div className="list-row" key={t.id}>
                        <div><div className="title">{t.judul}</div><div className="sub">{t.mapel} · tenggat {fmtTanggal(t.deadline)}</div></div>
                        <Pill s={t.status} />
                      </div>
                    ))}
                </div>
              </div>
              <div className="panel">
                <div className="panel-head">
                  <h2>Materi terbaru</h2>
                  <span className="link" onClick={() => setSection('materi')}>Lihat semua</span>
                </div>
                <div className="panel-body">
                  {MATERI.slice(0, 2).map((m, i) => (
                    <div className="list-row" key={m.judul}>
                      <div><div className="title">{m.judul}</div><div className="sub">{m.mapel} · {m.guru}</div></div>
                      <button className="btn" onClick={() => setModal({ type: 'materi', i })}>Lihat</button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {section === 'materi' && (
            <section>
              <p className="page-title">Materi</p>
              <p className="page-sub">Lihat dan unduh materi pelajaran dari guru</p>
              <div className="panel">
                <table>
                  <thead><tr><th>Judul materi</th><th>Mata pelajaran</th><th>Guru</th><th>Tanggal</th><th></th></tr></thead>
                  <tbody>
                    {MATERI.map((m, i) => (
                      <tr key={m.judul}>
                        <td style={{ fontWeight: 600 }}>{m.judul}</td>
                        <td>{m.mapel}</td>
                        <td>{m.guru}</td>
                        <td>{m.tanggal}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn" onClick={() => setModal({ type: 'materi', i })}>Lihat</button>
                            <button className="btn btn-primary" onClick={() => setModal({ type: 'unduh', judul: m.judul })}>Unduh PDF</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {section === 'assessment' && (
            <section>
              <p className="page-title">Assessment</p>
              <p className="page-sub">Kuis dan ulangan harian yang diberikan guru</p>
              <div className="panel">
                <table>
                  <thead><tr><th>Judul</th><th>Mata pelajaran</th><th>Tipe</th><th>Tenggat</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {assessment.map((a, i) => (
                      <tr key={a.judul}>
                        <td style={{ fontWeight: 600 }}>{a.judul}</td>
                        <td>{a.mapel}</td>
                        <td>{a.tipe}</td>
                        <td>{a.deadline}</td>
                        <td><Pill s={a.status} />{a.status === 'Selesai' && <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}> ({a.nilai})</span>}</td>
                        <td>
                          {a.status === 'Belum'
                            ? <button className="btn btn-primary" onClick={() => setModal({ type: 'asesInfo', i })}>Kerjakan</button>
                            : <button className="btn" disabled style={{ opacity: 0.6, cursor: 'default' }}>Sudah dinilai</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {section === 'tugas' && (
            <section>
              <p className="page-title">Tugas</p>
              <p className="page-sub">Lihat dan kumpulkan tugas dari guru (foto atau file)</p>
              <div className="panel">
                <table>
                  <thead><tr><th>Judul tugas</th><th>Mata pelajaran</th><th>Tenggat</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {tugas.map(barisTugas)}
                    {!loading && tugas.length === 0 && (
                      <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--ink-faint)', padding: 24 }}>Belum ada tugas dari guru.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {section === 'nilai' && (
            <section>
              <p className="page-title">Nilai</p>
              <p className="page-sub">Rekap nilai tugas, kuis, dan ulangan harian per mata pelajaran</p>
              <div className="panel">
                <table>
                  <thead><tr><th>Mata pelajaran</th><th>Tugas</th><th>Kuis</th><th>Ulangan harian</th><th>Rata-rata</th></tr></thead>
                  <tbody>
                    {NILAI.map((n) => (
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

          {section === 'pengumuman' && (
            <section>
              <p className="page-title">Pengumuman</p>
              <p className="page-sub">Notifikasi tugas baru dan pengumuman khusus siswa</p>
              <div className="panel">
                <div className="panel-head"><h2>Notifikasi tugas &amp; assessment baru</h2></div>
                <div>
                  {adaNotif === 0 && <div className="panel-body empty">Belum ada tugas/assessment baru.</div>}
                  {tugasBelum.map((t) => (
                    <div className="notif-card" key={t.id}>
                      <div className="notif-dot" />
                      <div><div className="notif-title">Tugas baru: {t.judul}</div><div className="notif-meta">{t.mapel} · tenggat {fmtTanggal(t.deadline)}</div></div>
                    </div>
                  ))}
                  {notifAssessment.map((a) => (
                    <div className="notif-card" key={a.judul}>
                      <div className="notif-dot" />
                      <div><div className="notif-title">{a.tipe} baru: {a.judul}</div><div className="notif-meta">{a.mapel} · tenggat {a.deadline}</div></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="panel">
                <div className="panel-head"><h2>Pengumuman dari admin</h2></div>
                <div>
                  {pengumumanAdmin.length === 0 && <div className="panel-body empty">Belum ada pengumuman.</div>}
                  {pengumumanAdmin.map((n) => (
                    <div className="notif-card" key={n.id}>
                      <div className="notif-dot read" />
                      <div><div className="notif-title">{n.judul}</div><div className="notif-meta">{n.tanggal}</div><div className="notif-body">{n.isi}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {section === 'profil' && (
            <section>
              <p className="page-title">Profil</p>
              <p className="page-sub">Data pribadi kamu</p>
              <div className="profile-card">
                <div className="profile-avatar">{initials(namaUser)}</div>
                <div className="field-row"><label>Nama lengkap</label><input type="text" value={namaUser} readOnly /></div>
                <div className="field-row"><label>NIS</label><input type="text" value={(me && me.nis) || '-'} readOnly /></div>
                <div className="field-row"><label>Kelas</label><input type="text" value={kelas || '-'} readOnly /></div>
                <div className="field-row"><label>Email</label><input type="text" value={(user && user.email) || '-'} readOnly /></div>
              </div>
            </section>
          )}
        </div>
      </div>

      {renderModal()}
    </div>
  );
}

const styles = `:root{
    --bg:#EDEFEE;
    --surface:#FFFFFF;
    --tosca-900:#0B4A44;
    --tosca-800:#0E5C54;
    --tosca-700:#127167;
    --tosca-600:#178A7C;
    --tosca-500:#1EA391;
    --tosca-100:#DCF1EA;
    --tosca-50:#EFF8F4;
    --ink:#152621;
    --ink-soft:#5C726C;
    --ink-faint:#93A6A0;
    --line:#E1E6E4;
    --coral:#E4633F;
    --coral-100:#FCE7DF;
    --coral-700:#9E3B21;
    --amber:#C98A1C;
    --amber-100:#FBEEDA;
    --blue:#2563EB;
    --blue-100:#DBEAFE;
  }
  *{box-sizing:border-box;}
  body{margin:0;font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;}
  .app{display:flex;min-height:100vh;}

  .sidebar{width:220px;flex-shrink:0;background:var(--tosca-900);color:#EAF4F1;display:flex;flex-direction:column;padding:22px 14px;}
  .brand{display:flex;align-items:center;gap:10px;padding:0 6px 20px 6px;margin-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.1);}
  .brand-mark{width:36px;height:36px;border-radius:9px;background:var(--tosca-500);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;font-weight:700;font-size:14px;color:var(--tosca-900);}
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
  .quick-card{background:var(--tosca-700);color:#fff;border:none;border-radius:12px;padding:22px 16px;font-size:14.5px;font-weight:700;cursor:pointer;font-family:inherit;text-align:center;transition:transform .12s ease;}
  .quick-card:hover{background:var(--tosca-600);}

  .panel{background:var(--surface);border:1px solid var(--line);border-radius:12px;overflow:hidden;margin-bottom:16px;}
  .panel-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--line);}
  .panel-head h2{font-size:14.5px;font-weight:700;margin:0;}
  .panel-head a, .panel-head .link{font-size:12.5px;font-weight:600;color:var(--tosca-700);cursor:pointer;text-decoration:none;}
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
  .pill-blue{background:var(--blue-100);color:var(--blue);}

  .section{display:none;}
  .section.active{display:block;}
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

  .modal-overlay{display:none;position:fixed;inset:0;background:rgba(11,38,33,0.45);align-items:center;justify-content:center;z-index:50;}
  .modal-overlay.open{display:flex;}
  .modal{background:var(--surface);border-radius:14px;width:420px;max-width:92vw;padding:22px 22px 18px;}
  .modal h3{margin:0 0 2px;font-size:16px;font-weight:700;}
  .modal p.sub{margin:0 0 16px;font-size:12.5px;color:var(--ink-soft);}
  .form-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:16px;}
  .field-input{width:100%;font-family:inherit;font-size:13.5px;padding:9px 11px;border:1px solid var(--line);border-radius:8px;background:var(--surface);outline:none;color:var(--ink);margin-top:6px;}

  .quiz-q{margin-bottom:16px;}
  .quiz-q p{font-size:13.5px;font-weight:600;margin:0 0 8px;}
  .quiz-opt{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--line);border-radius:8px;margin-bottom:6px;cursor:pointer;font-size:13px;}
  .quiz-opt:hover{background:var(--tosca-50);}
  .quiz-opt input{margin:0;}

  @media (max-width:860px){
    .sidebar{width:64px;}
    .nav-item span.label{display:none;}
    .quick-cards{grid-template-columns:repeat(2,1fr);}
    .topbar-user .info{display:none;}
  }
  .modal{max-height:90vh;overflow-y:auto;}
  .modal.wide{width:580px;}
  .viewer{background:var(--tosca-50);border:1px solid var(--line);border-radius:10px;padding:16px 20px;max-height:52vh;overflow-y:auto;}
  .viewer h5{margin:0 0 4px;font-size:13.5px;font-weight:700;color:var(--tosca-800);}
  .viewer p{font-size:13px;line-height:1.65;margin:0 0 12px;}
  .viewer ol{margin:0 0 12px;padding-left:20px;font-size:13px;line-height:1.65;}
  .viewer .viewer-note{font-size:11.5px;color:var(--ink-faint);margin:6px 0 0;}
  .quiz-timer{position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;background:var(--tosca-50);border:1px solid var(--line);border-radius:8px;padding:9px 12px;margin-bottom:14px;font-size:12.5px;color:var(--ink-soft);}
  .quiz-timer b{font-size:15px;font-weight:700;color:var(--tosca-800);font-variant-numeric:tabular-nums;}
  .quiz-timer.danger{background:var(--coral-100);border-color:var(--coral);}
  .quiz-timer.danger b{color:var(--coral-700);}
.error-banner{background:var(--coral-100);color:var(--coral-700);border:1px solid #F0B7A3;border-radius:8px;padding:10px 14px;font-size:13px;margin-bottom:16px;}
.warn-banner{background:var(--amber-100);color:#7A5410;border:1px solid #EBCF9A;border-radius:8px;padding:10px 14px;font-size:13px;margin-bottom:16px;}
.btn:disabled{opacity:0.6;cursor:not-allowed;}
`;
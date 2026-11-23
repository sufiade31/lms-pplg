'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

// ====== Konstanta ======
const MAPEL = ["Basis Data", "Pemrograman Web", "Matematika", "Bahasa Indonesia", "Bahasa Inggris", "Fisika", "Kimia", "IPAS", "PPKn", "Sejarah Indonesia", "Pendidikan Agama", "Seni Budaya", "PJOK", "Produk Kreatif dan Kewirausahaan"];
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

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
async function uploadFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Gagal mengunggah file.');
  return data; // { id, nama }
}
const rataRata = (arr) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null);

const pad = (n) => String(n).padStart(2, '0');
const norm = (s) => (s || '').trim().toLowerCase();
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function fmtTanggal(d) {
  if (!d) return '-';
  const dt = new Date(d);
  if (isNaN(dt)) return String(d);
  return `${dt.getDate()} ${BULAN[dt.getMonth()]} ${dt.getFullYear()}`;
}
function fmtWaktu(d) {
  if (!d) return '-';
  const dt = new Date(d);
  if (isNaN(dt)) return String(d);
  return `${dt.getDate()} ${BULAN[dt.getMonth()]} ${dt.getFullYear()}, ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}
function fmtDateOnly(s) {
  if (!s) return 'Belum diatur';
  const p = s.split('-');
  if (p.length !== 3) return s;
  return `${Number(p[2])} ${BULAN[Number(p[1]) - 1]} ${p[0]}`;
}
function toDateInput(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function toTimeInput(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return '23:59';
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
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

// Mencari data user yang disimpan halaman login (objek JSON dengan _id dan nama)
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
  const map = { Sudah: 'pill-tosca', Belum: 'pill-coral', PDF: 'pill-blue', Catatan: 'pill-amber' };
  return <span className={`pill ${map[s] || 'pill-tosca'}`}>{s}</span>;
}

const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
);
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
);

function Overlay({ onClose, children }) {
  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      {children}
    </div>
  );
}

function Err({ children }) {
  if (!children) return null;
  return <p style={{ color: 'var(--coral)', fontSize: 12.5, margin: '0 0 10px' }}>{children}</p>;
}

// ====== Modal Materi ======
function MateriModal({ edit, kelasOpsi, defaultMapel, onClose, onSave }) {
  const [judul, setJudul] = useState(edit ? edit.judul : '');
  const [mapel, setMapel] = useState(edit ? edit.mapel : defaultMapel);
  const [kelas, setKelas] = useState(edit ? edit.kelas : kelasOpsi[0]);
  const [catatan, setCatatan] = useState(edit ? edit.catatan || '' : '');
  const [file, setFile] = useState(null);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  async function simpan() {
    if (!judul.trim()) { setErr('Judul materi wajib diisi.'); return; }
    if (!file && !catatan.trim() && !(edit && edit.fileId)) { setErr('Isi catatan atau upload file materi.'); return; }
    setSaving(true);
    setErr('');
    try {
      await onSave({ judul: judul.trim(), mapel, kelas, catatan: catatan.trim() }, file);
    } catch (e) {
      setErr(e.message);
      setSaving(false);
    }
  }

  return (
    <Overlay onClose={onClose}>
      <div className="modal">
        <h3>{edit ? 'Edit materi' : 'Tambah materi'}</h3>
        <p className="sub">Materi akan langsung tersedia untuk siswa di kelas terkait.</p>
        <Err>{err}</Err>
        <div className="field-row"><label>Judul materi</label><input type="text" value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="Contoh: Konsep Dasar Basis Data" /></div>
        <div className="field-row-2">
          <div className="field-row"><label>Mata pelajaran</label>
            <select value={mapel} onChange={(e) => setMapel(e.target.value)}>
              {!MAPEL.includes(mapel) && <option>{mapel}</option>}
              {MAPEL.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="field-row"><label>Kelas</label>
            <select value={kelas} onChange={(e) => setKelas(e.target.value)}>
              {!kelasOpsi.includes(kelas) && <option>{kelas}</option>}
              {kelasOpsi.map((k) => <option key={k}>{k}</option>)}
            </select>
          </div>
        </div>
        <div className="field-row"><label>Upload file (opsional, maks 8 MB)</label>
          <input type="file" accept=".pdf,.ppt,.pptx,.doc,.docx,image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          {edit && edit.namaFile && !file && <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>File saat ini: {edit.namaFile} (pilih file baru untuk mengganti)</span>}
        </div>
        <div className="field-row"><label>Catatan / ringkasan materi</label><textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Tulis ringkasan materi di sini..." /></div>
        <div className="form-actions">
          <button className="btn" onClick={onClose}>Batal</button>
          <button className="btn btn-primary" onClick={simpan} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
        </div>
      </div>
    </Overlay>
  );
}

// ====== Modal Tugas (tersambung database) ======
function PeriksaModal({ pg, nama, tugas, onClose, onSave }) {
  const [nilai, setNilai] = useState(pg.nilai ?? '');
  const [komentar, setKomentar] = useState(pg.komentar || '');
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  const nm = (pg.namaFile || '').toLowerCase();
  const url = pg.fileId ? `/api/berkas/${pg.fileId}` : '';
  const isGambar = /\.(png|jpe?g|gif|webp)$/.test(nm);
  const isPdf = /\.pdf$/.test(nm);

  async function simpan() {
    const n = nilai === '' ? null : Number(nilai);
    if (n !== null && (isNaN(n) || n < 0 || n > 100)) { setErr('Nilai harus antara 0 sampai 100.'); return; }
    setSaving(true);
    setErr('');
    try { await onSave(pg, n, komentar.trim()); onClose(); } catch (e) { setErr(e.message); setSaving(false); }
  }

  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 720 }}>
        <h3>Periksa tugas: {nama}</h3>
        <p className="sub">{tugas ? tugas.judul : ''} · dikumpulkan {fmtWaktu(pg.dikumpulkanPada)}</p>
        {!url && <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Siswa ini mengumpulkan sebelum fitur penyimpanan file aktif, jadi isi file tidak tersedia (nama file: {pg.namaFile || '-'}). Minta siswa upload ulang.</p>}
        {url && (
          <>
            <div style={{ border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden', marginBottom: 10, background: '#f7faf9' }}>
              {isPdf && <iframe src={url} title="Pratinjau" style={{ width: '100%', height: 420, border: 0 }} />}
              {isGambar && <img src={url} alt={pg.namaFile} style={{ width: '100%', maxHeight: 420, objectFit: 'contain', display: 'block' }} />}
              {!isPdf && !isGambar && <p style={{ padding: 16, margin: 0, fontSize: 13 }}>Pratinjau tidak tersedia untuk jenis file ini. Silakan unduh untuk membukanya.</p>}
            </div>
            <p style={{ margin: '0 0 14px', fontSize: 13 }}>
              <a href={url} target="_blank" rel="noreferrer" style={{ color: 'var(--tosca-600)', fontWeight: 600 }}>Buka di tab baru</a>
              {' · '}
              <a href={`${url}?unduh=1`} style={{ color: 'var(--tosca-600)', fontWeight: 600 }}>Unduh {pg.namaFile}</a>
            </p>
          </>
        )}
        <div className="field-row">
          <label>Nilai (0-100)</label>
          <input className="field-input" type="number" min="0" max="100" value={nilai} onChange={(e) => setNilai(e.target.value)} />
        </div>
        <div className="field-row">
          <label>Komentar untuk siswa (opsional)</label>
          <textarea className="field-input" rows={3} value={komentar} onChange={(e) => setKomentar(e.target.value)} />
        </div>
        {err && <p style={{ color: 'var(--coral)', fontSize: 12.5, margin: '0 0 8px' }}>{err}</p>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn" onClick={onClose}>Tutup</button>
          <button className="btn btn-primary" disabled={saving} onClick={simpan}>{saving ? 'Menyimpan...' : 'Simpan nilai'}</button>
        </div>
      </div>
    </div>
  );
}

function TugasModal({ edit, kelasOpsi, defaultMapel, onClose, onSave }) {
  const [judul, setJudul] = useState(edit ? edit.judul : '');
  const [mapel, setMapel] = useState(edit ? edit.mapel : defaultMapel);
  const [kelas, setKelas] = useState(edit ? edit.kelas : kelasOpsi[0]);
  const [tanggal, setTanggal] = useState(edit ? toDateInput(edit.deadline) : '');
  const [jam, setJam] = useState(edit ? toTimeInput(edit.deadline) : '23:59');
  const [jenis, setJenis] = useState(edit ? (edit.jenis === 'PDF' ? 'pdf' : 'catatan') : 'pdf');
  const [fileName, setFileName] = useState(edit ? edit.lampiran || '' : '');
  const [catatan, setCatatan] = useState(edit ? (edit.instruksi || []).join('\n') : '');
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  async function simpan() {
    if (!judul.trim()) { setErr('Judul tugas wajib diisi.'); return; }
    if (!tanggal) { setErr('Batas pengumpulan wajib diisi.'); return; }
    const batas = new Date(`${tanggal}T${jam || '23:59'}:00`);
    if (isNaN(batas)) { setErr('Tanggal atau jam tidak valid.'); return; }
    setSaving(true);
    setErr('');
    try {
      await onSave({
        judul: judul.trim(),
        mapel,
        kelas,
        deadline: batas.toISOString(),
        jenis: jenis === 'pdf' ? 'PDF' : 'Catatan',
        lampiran: jenis === 'pdf' ? fileName : '',
        instruksi: jenis === 'catatan' ? catatan.split('\n').map((x) => x.trim()).filter(Boolean) : [],
      });
    } catch (e) {
      setErr(e.message);
      setSaving(false);
    }
  }

  return (
    <Overlay onClose={onClose}>
      <div className="modal">
        <h3>{edit ? 'Edit tugas' : 'Tambah tugas'}</h3>
        <p className="sub">Tugas langsung muncul di dashboard siswa sesuai kelasnya.</p>
        <Err>{err}</Err>
        <div className="field-row"><label>Judul tugas</label><input type="text" value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="Contoh: Membuat ERD Toko Online" /></div>
        <div className="field-row-2">
          <div className="field-row"><label>Mata pelajaran</label>
            <select value={mapel} onChange={(e) => setMapel(e.target.value)}>
              {!MAPEL.includes(mapel) && <option>{mapel}</option>}
              {MAPEL.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="field-row"><label>Kelas</label>
            <select value={kelas} onChange={(e) => setKelas(e.target.value)}>
              {!kelasOpsi.includes(kelas) && <option>{kelas}</option>}
              {kelasOpsi.map((k) => <option key={k}>{k}</option>)}
            </select>
          </div>
        </div>
        <div className="field-row-2">
          <div className="field-row"><label>Batas pengumpulan (tanggal)</label><input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} /></div>
          <div className="field-row"><label>Batas jam</label><input type="time" value={jam} onChange={(e) => setJam(e.target.value)} /></div>
        </div>
        <div className="field-row"><label>Jenis tugas</label>
          <select value={jenis} onChange={(e) => setJenis(e.target.value)}>
            <option value="pdf">Upload file PDF</option>
            <option value="catatan">Catatan teks</option>
          </select>
        </div>
        {jenis === 'pdf' ? (
          <div className="field-row">
            <label>Upload file PDF</label>
            <input type="file" accept=".pdf" onChange={(e) => setFileName(e.target.files?.[0]?.name || fileName)} />
            {fileName && <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Lampiran: {fileName}</span>}
          </div>
        ) : (
          <div className="field-row"><label>Isi catatan tugas (satu langkah per baris)</label>
            <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Tulis instruksi tugas di sini..." />
          </div>
        )}
        <div className="form-actions">
          <button className="btn" onClick={onClose}>Batal</button>
          <button className="btn btn-primary" onClick={simpan} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
        </div>
      </div>
    </Overlay>
  );
}

// ====== Modal hasil assessment (nilai + jawaban siswa) ======
function HasilModal({ a, daftar, onClose, onSave }) {
  const [draft, setDraft] = useState({});
  const [err, setErr] = useState('');
  const [bukaId, setBukaId] = useState('');

  async function simpan(h) {
    const v = draft[h.id];
    if (v === undefined || v === '') return;
    const n = Number(v);
    if (isNaN(n) || n < 0 || n > 100) { setErr('Nilai harus antara 0 sampai 100.'); return; }
    try { await onSave(h, n); setErr(''); } catch (e) { setErr(e.message); }
  }

  return (
    <Overlay onClose={onClose}>
      <div className="modal" style={{ width: 640 }}>
        <h3>Hasil: {a.judul}</h3>
        <p className="sub">{a.mapel} · {a.kelas} · {a.tipe}. Soal pilihan ganda dinilai otomatis; soal esai perlu kamu periksa lalu ubah nilainya.</p>
        <Err>{err}</Err>
        {daftar.length === 0 && <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Belum ada siswa yang mengerjakan.</p>}
        {daftar.map((h) => (
          <div key={h.id} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <b style={{ flex: 1, minWidth: 120 }}>{h.siswaNama}</b>
              {h.perluDinilai && <span className="pill pill-amber">Ada esai</span>}
              <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{fmtWaktu(h.selesaiPada)}</span>
              <input className="nilai-input" type="number" min="0" max="100" defaultValue={h.nilai ?? ''} onChange={(e) => setDraft((d) => ({ ...d, [h.id]: e.target.value }))} />
              <button className="btn" onClick={() => simpan(h)}>Simpan</button>
              <button className="btn" onClick={() => setBukaId(bukaId === h.id ? '' : h.id)}>{bukaId === h.id ? 'Tutup jawaban' : 'Lihat jawaban'}</button>
            </div>
            {bukaId === h.id && (
              <div style={{ marginTop: 10, fontSize: 13 }}>
                {a.soal.map((s, i) => {
                  const j = (h.jawaban || [])[i];
                  return (
                    <div key={i} style={{ marginBottom: 8 }}>
                      <div><b>{i + 1}.</b> {s.tanya} <span style={{ color: 'var(--ink-soft)' }}>({s.poin} poin)</span></div>
                      {s.tipe === 'pg' ? (
                        <div style={{ color: j === s.benar ? 'var(--tosca-700)' : 'var(--coral)' }}>
                          Jawaban: {typeof j === 'number' && j >= 0 ? s.opsi[j] : '(kosong)'} {j === s.benar ? '✓ benar' : `✗ (benar: ${s.opsi[s.benar]})`}
                        </div>
                      ) : (
                        <div style={{ background: '#f7faf9', borderRadius: 8, padding: '6px 10px', whiteSpace: 'pre-wrap' }}>{j ? String(j) : '(kosong)'}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        <div className="form-actions"><button className="btn" onClick={onClose}>Tutup</button></div>
      </div>
    </Overlay>
  );
}

// ====== Modal Assessment ======
const SOAL_BARU = () => ({ tipe: 'pg', poin: 10, tanya: '', opsi: ['', '', '', ''], benar: -1 });

function AssessmentModal({ edit, kelasOpsi, defaultMapel, onClose, onSave }) {
  const [judul, setJudul] = useState(edit ? edit.judul : '');
  const [mapel, setMapel] = useState(edit ? edit.mapel : defaultMapel);
  const [kelas, setKelas] = useState(edit ? edit.kelas : kelasOpsi[0]);
  const [tipe, setTipe] = useState(edit ? edit.tipe : 'Kuis');
  const [durasi, setDurasi] = useState(edit ? String(edit.durasi || '') : '');
  const [deadline, setDeadline] = useState(edit ? edit.deadlineDate || '' : '');
  const [saving, setSaving] = useState(false);
  const [soal, setSoal] = useState(edit && edit.soal && edit.soal.length ? edit.soal.map((s) => ({ ...s, opsi: [...s.opsi, '', '', '', ''].slice(0, 4) })) : [SOAL_BARU()]);
  const [err, setErr] = useState('');

  const ubahSoal = (i, patch) => setSoal((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const ubahOpsi = (i, k, val) => setSoal((prev) => prev.map((s, idx) => (idx === i ? { ...s, opsi: s.opsi.map((o, kk) => (kk === k ? val : o)) } : s)));

  function simpan() {
    if (!judul.trim()) { setErr('Judul assessment wajib diisi.'); return; }
    const d = Number(durasi);
    if (!d || d < 1) { setErr('Waktu pengerjaan wajib diisi (minimal 1 menit).'); return; }
    if (soal.length === 0) { setErr('Tambahkan minimal 1 soal.'); return; }
    for (let n = 0; n < soal.length; n++) {
      const s = soal[n];
      if (!s.tanya.trim()) { setErr(`Pertanyaan soal ${n + 1} belum diisi.`); return; }
      if (s.tipe === 'pg') {
        if (s.opsi.filter((o) => o.trim()).length < 2) { setErr(`Soal ${n + 1} minimal punya 2 opsi jawaban.`); return; }
        if (s.benar < 0 || !s.opsi[s.benar].trim()) { setErr(`Pilih jawaban yang benar untuk soal ${n + 1}.`); return; }
      }
    }
    const rapi = soal.map((s) => ({ ...s, poin: Number(s.poin) || 0, tanya: s.tanya.trim(), opsi: s.tipe === 'pg' ? s.opsi.map((o) => o.trim()) : ['', '', '', ''], benar: s.tipe === 'pg' ? s.benar : -1 }));
    setSaving(true);
    setErr('');
    Promise.resolve(onSave({
      judul: judul.trim(), mapel, kelas, tipe, jumlahSoal: rapi.length,
      totalPoin: rapi.reduce((sum, s) => sum + s.poin, 0), durasi: Math.round(d), deadlineDate: deadline, soal: rapi,
    })).catch((e) => { setErr(e.message); setSaving(false); });
  }

  return (
    <Overlay onClose={onClose}>
      <div className="modal" style={{ width: 560 }}>
        <h3>{edit ? 'Edit assessment' : 'Buat assessment'}</h3>
        <p className="sub">Tambahkan soal pilihan ganda atau esai, tiap soal punya poin sendiri.</p>
        <Err>{err}</Err>
        <div className="field-row"><label>Judul assessment</label><input type="text" value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="Contoh: Kuis Normalisasi Data" /></div>
        <div className="field-row-2">
          <div className="field-row"><label>Mata pelajaran</label>
            <select value={mapel} onChange={(e) => setMapel(e.target.value)}>{MAPEL.map((m) => <option key={m}>{m}</option>)}</select>
          </div>
          <div className="field-row"><label>Kelas</label>
            <select value={kelas} onChange={(e) => setKelas(e.target.value)}>
              {!kelasOpsi.includes(kelas) && <option>{kelas}</option>}
              {kelasOpsi.map((k) => <option key={k}>{k}</option>)}
            </select>
          </div>
        </div>
        <div className="field-row-2">
          <div className="field-row"><label>Tipe</label>
            <select value={tipe} onChange={(e) => setTipe(e.target.value)}><option>Kuis</option><option>Ulangan Harian</option></select>
          </div>
          <div className="field-row"><label>Waktu pengerjaan (menit)</label><input type="number" min="1" max="300" value={durasi} onChange={(e) => setDurasi(e.target.value)} placeholder="Contoh: 30" /></div>
        </div>
        <div className="field-row"><label>Tenggat</label><input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></div>

        {soal.map((s, i) => (
          <div className="soal-card" key={i}>
            <div className="soal-card-head">
              <span>Soal {i + 1}</span>
              <div className="icon-btn danger" title="Hapus soal" onClick={() => setSoal((prev) => prev.filter((_, idx) => idx !== i))}><IconTrash /></div>
            </div>
            <div className="field-row-2" style={{ marginBottom: 8 }}>
              <div className="field-row" style={{ marginBottom: 0 }}><label>Tipe soal</label>
                <select value={s.tipe} onChange={(e) => ubahSoal(i, { tipe: e.target.value })}>
                  <option value="pg">Pilihan Ganda</option>
                  <option value="esai">Esai</option>
                </select>
              </div>
              <div className="field-row" style={{ marginBottom: 0 }}><label>Poin</label><input type="number" min="1" value={s.poin} onChange={(e) => ubahSoal(i, { poin: e.target.value })} /></div>
            </div>
            <div className="field-row"><label>Pertanyaan</label><textarea value={s.tanya} onChange={(e) => ubahSoal(i, { tanya: e.target.value })} placeholder="Tulis pertanyaan di sini..." style={{ minHeight: 50 }} /></div>
            {s.tipe === 'pg' && (
              <div>
                {s.opsi.map((o, k) => (
                  <div className="opsi-row" key={k}>
                    <input type="radio" name={`benar-${i}`} checked={s.benar === k} onChange={() => ubahSoal(i, { benar: k })} />
                    <input type="text" value={o} onChange={(e) => ubahOpsi(i, k, e.target.value)} placeholder={`Opsi ${'ABCD'[k]}`} />
                  </div>
                ))}
                <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '2px 0 0' }}>Pilih radio di samping opsi jawaban yang benar.</p>
              </div>
            )}
          </div>
        ))}
        <button className="btn" style={{ width: '100%', justifyContent: 'center', marginBottom: 14 }} onClick={() => setSoal((prev) => [...prev, SOAL_BARU()])}>+ Tambah soal</button>

        <div className="form-actions">
          <button className="btn" onClick={onClose}>Batal</button>
          <button className="btn btn-primary" onClick={simpan} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan assessment'}</button>
        </div>
      </div>
    </Overlay>
  );
}

// ====== Halaman utama ======
export default function GuruDashboard() {
  const router = useRouter();
  const [section, setSection] = useState('beranda');
  const [user, setUser] = useState(null);

  // Data dari database
  const [tugasAll, setTugasAll] = useState([]);
  const [pengumpulan, setPengumpulan] = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [guruList, setGuruList] = useState([]);
  const [pengumumanAdmin, setPengumumanAdmin] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [materiAll, setMateriAll] = useState([]);
  const [assessmentAll, setAssessmentAll] = useState([]);
  const [hasil, setHasil] = useState([]);
  const [nilaiDb, setNilaiDb] = useState([]);
  const [nilaiEdit, setNilaiEdit] = useState({});
  const [mapelNilai, setMapelNilai] = useState('');

  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');
  const [filterTugasId, setFilterTugasId] = useState('');
  const [nilaiDraft, setNilaiDraft] = useState({});
  const [kelasNilai, setKelasNilai] = useState('');

  const muat = useCallback(async () => {
    try {
      const [t, pg, sw, k, g, pu, mt, as, hs, nl] = await Promise.all([
        api('/api/tugas'), api('/api/pengumpulan'), api('/api/siswa'), api('/api/kelas'), api('/api/guru'), api('/api/pengumuman'),
        api('/api/materi'), api('/api/assessment'), api('/api/hasil'), api('/api/nilai'),
      ]);
      setMateriAll(mt);
      setAssessmentAll(as);
      setHasil(hs);
      setNilaiDb(nl);
      setTugasAll(t);
      setPengumpulan(pg);
      setSiswaList(sw);
      setKelasList(k);
      setGuruList(g);
      setPengumumanAdmin(pu.filter((x) => x.status === 'Terbit' && (x.target === 'Semua' || x.target === 'Guru saja')));
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setUser(getLoginUser());
    muat();
    const iv = setInterval(muat, 30000);
    return () => clearInterval(iv);
  }, [muat]);

  function tampilToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }

  const namaGuru = user ? user.nama : 'Guru';
  const dataGuru = guruList.find((g) => norm(g.nama) === norm(namaGuru)) || null;
  const mapelGuru = (dataGuru && dataGuru.mapel) || MAPEL[0];
  const kelasOpsi = ['Semua', ...kelasList.map((k) => k.nama)];

  const tugasSaya = tugasAll.filter((t) => !user || norm(t.guru) === norm(user.nama));
  const materi = materiAll.filter((m) => !user || norm(m.guru) === norm(user.nama));
  const assessment = assessmentAll.filter((a) => !user || norm(a.guru) === norm(user.nama));
  const tugasDipilih = tugasSaya.find((t) => t.id === filterTugasId) || tugasSaya[0] || null;

  // Baris status pengumpulan untuk tugas yang dipilih
  let barisStatus = [];
  if (tugasDipilih) {
    const pgT = pengumpulan.filter((p) => p.tugasId === tugasDipilih.id);
    const target = siswaList.filter((s) => tugasDipilih.kelas === 'Semua' || norm(s.kelas) === norm(tugasDipilih.kelas));
    barisStatus = target.map((s) => ({ nama: s.nama, kelas: s.kelas, pg: pgT.find((p) => norm(p.siswaNama) === norm(s.nama)) }));
    pgT.filter((p) => !target.some((s) => norm(s.nama) === norm(p.siswaNama)))
      .forEach((p) => barisStatus.push({ nama: p.siswaNama || p.siswaId, kelas: '-', pg: p }));
  }

  const aktivitas = [...pengumpulan]
    .sort((a, b) => new Date(b.dikumpulkanPada) - new Date(a.dikumpulkanPada))
    .slice(0, 4)
    .map((p) => {
      const t = tugasAll.find((x) => x.id === p.tugasId);
      return { id: p.id, teks: `${p.siswaNama || 'Siswa'} mengumpulkan tugas "${t ? t.judul : '(tugas dihapus)'}"`, meta: `${t ? t.mapel : '-'} - ${fmtWaktu(p.dikumpulkanPada)}` };
    });

  // ----- Aksi Tugas (database) -----
  async function simpanTugas(data) {
    if (!user) throw new Error('Data login tidak ditemukan. Silakan login ulang.');
    const edit = modal && modal.edit;
    if (edit) {
      const saved = await api(`/api/tugas/${edit.id}`, 'PUT', { ...data, guru: edit.guru });
      setTugasAll((prev) => prev.map((x) => (x.id === saved.id ? saved : x)));
    } else {
      const saved = await api('/api/tugas', 'POST', { ...data, guru: user.nama });
      setTugasAll((prev) => [saved, ...prev]);
    }
    setModal(null);
    tampilToast('Tugas berhasil disimpan.');
  }

  async function hapus() {
    const { kind, id } = modal;
    try {
      if (kind === 'tugas') {
        await api(`/api/tugas/${id}`, 'DELETE');
        const terkait = pengumpulan.filter((p) => p.tugasId === id);
        await Promise.all(terkait.map((p) => api(`/api/pengumpulan/${p.id}`, 'DELETE').catch(() => null)));
        setTugasAll((prev) => prev.filter((x) => x.id !== id));
        setPengumpulan((prev) => prev.filter((p) => p.tugasId !== id));
      }
      if (kind === 'materi') {
        await api(`/api/materi/${id}`, 'DELETE');
        setMateriAll((prev) => prev.filter((x) => x.id !== id));
      }
      if (kind === 'assessment') {
        await api(`/api/assessment/${id}`, 'DELETE');
        const terkait = hasil.filter((h) => h.assessmentId === id);
        await Promise.all(terkait.map((h) => api(`/api/hasil/${h.id}`, 'DELETE').catch(() => null)));
        setAssessmentAll((prev) => prev.filter((x) => x.id !== id));
        setHasil((prev) => prev.filter((h) => h.assessmentId !== id));
      }
      tampilToast('Data berhasil dihapus.');
    } catch (e) {
      setError(e.message);
    }
    setModal(null);
  }

  async function simpanPeriksa(p, nilai, komentar) {
    const saved = await api(`/api/pengumpulan/${p.id}`, 'PUT', { tugasId: p.tugasId, siswaId: p.siswaId, siswaNama: p.siswaNama, namaFile: p.namaFile, nilai, komentar });
    setPengumpulan((prev) => prev.map((x) => (x.id === saved.id ? saved : x)));
    setError('');
    tampilToast('Nilai dan komentar tersimpan.');
  }

  // ----- Materi & Assessment (database) -----
  async function simpanMateri(data, file) {
    if (!user) throw new Error('Data login tidak ditemukan. Silakan login ulang.');
    const edit = modal && modal.edit;
    let fileId = edit ? edit.fileId || '' : '';
    let namaFile = edit ? edit.namaFile || '' : '';
    if (file) {
      const up = await uploadFile(file);
      fileId = up.id;
      namaFile = up.nama;
    }
    const payload = { ...data, fileId, namaFile };
    if (edit) {
      const saved = await api(`/api/materi/${edit.id}`, 'PUT', { ...payload, guru: edit.guru });
      setMateriAll((prev) => prev.map((x) => (x.id === saved.id ? saved : x)));
    } else {
      const saved = await api('/api/materi', 'POST', { ...payload, guru: user.nama });
      setMateriAll((prev) => [...prev, saved]);
    }
    setModal(null);
    tampilToast('Materi berhasil disimpan.');
  }

  async function simpanAssessment(data) {
    if (!user) throw new Error('Data login tidak ditemukan. Silakan login ulang.');
    const edit = modal && modal.edit;
    if (edit) {
      const saved = await api(`/api/assessment/${edit.id}`, 'PUT', { ...data, guru: edit.guru });
      setAssessmentAll((prev) => prev.map((x) => (x.id === saved.id ? saved : x)));
    } else {
      const saved = await api('/api/assessment', 'POST', { ...data, guru: user.nama });
      setAssessmentAll((prev) => [...prev, saved]);
    }
    setModal(null);
    tampilToast('Assessment berhasil disimpan.');
  }

  async function simpanNilaiHasil(h, n) {
    const saved = await api(`/api/hasil/${h.id}`, 'PUT', { assessmentId: h.assessmentId, siswaId: h.siswaId, siswaNama: h.siswaNama, nilai: n, perluDinilai: false });
    setHasil((prev) => prev.map((x) => (x.id === saved.id ? saved : x)));
    tampilToast('Nilai assessment tersimpan.');
  }

  // ----- Nilai (database) -----
  const mapelNilaiOpsi = Array.from(new Set([mapelGuru, ...tugasSaya.map((t) => t.mapel), ...assessment.map((a) => a.mapel)]));
  const mapelAktif = mapelNilai && mapelNilaiOpsi.includes(mapelNilai) ? mapelNilai : mapelGuru;
  const kelasNilaiAktif = kelasNilai || (kelasList[0] && kelasList[0].nama) || '';
  const siswaNilai = siswaList.filter((s) => norm(s.kelas) === norm(kelasNilaiAktif));

  // Nilai otomatis dari tugas yang sudah dinilai dan hasil kuis / ulangan harian
  function nilaiOtomatis(s, mapel) {
    const idTugas = tugasSaya.filter((t) => t.mapel === mapel).map((t) => t.id);
    const tv = pengumpulan.filter((p) => idTugas.includes(p.tugasId) && norm(p.siswaNama) === norm(s.nama) && p.nilai != null).map((p) => p.nilai);
    const hv = (tipe) => hasil
      .filter((h) => norm(h.siswaNama) === norm(s.nama) && h.nilai != null && assessment.some((a) => a.id === h.assessmentId && a.mapel === mapel && a.tipe === tipe))
      .map((h) => h.nilai);
    return { tugas: rataRata(tv), kuis: rataRata(hv('Kuis')), uh: rataRata(hv('Ulangan Harian')) };
  }
  const nilaiTersimpan = (s) => nilaiDb.find((n) => (n.siswaId === s.id || norm(n.siswaNama) === norm(s.nama)) && n.mapel === mapelAktif);
  const ubahNilai = (id, field, val) => setNilaiEdit((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: val } }));
  function nilaiEfektif(s) {
    const auto = nilaiOtomatis(s, mapelAktif);
    const db = nilaiTersimpan(s) || {};
    const ed = nilaiEdit[s.id] || {};
    const out = {};
    ['tugas', 'kuis', 'uh'].forEach((f) => {
      const manual = ed[f] !== undefined ? ed[f] : db[f];
      out[f] = manual !== undefined && manual !== null && manual !== '' ? Number(manual) : auto[f];
    });
    return { out, auto, db, ed };
  }
  function hitungAkhir(out) {
    const vals = [out.tugas, out.kuis, out.uh].filter((v) => v !== null && v !== undefined && !isNaN(v));
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : '-';
  }
  async function simpanSemuaNilai() {
    if (!user) { setError('Data login tidak ditemukan. Silakan login ulang.'); return; }
    try {
      for (const s of siswaNilai) {
        const ed = nilaiEdit[s.id];
        if (!ed) continue;
        const db = nilaiTersimpan(s);
        const ambil = (f) => {
          const v = ed[f] !== undefined ? ed[f] : db ? db[f] : null;
          return v === '' || v === undefined || v === null ? null : Number(v);
        };
        const body = { siswaId: s.id, siswaNama: s.nama, kelas: s.kelas, mapel: mapelAktif, guru: user.nama, tugas: ambil('tugas'), kuis: ambil('kuis'), uh: ambil('uh') };
        const saved = db ? await api(`/api/nilai/${db.id}`, 'PUT', body) : await api('/api/nilai', 'POST', body);
        setNilaiDb((prev) => (db ? prev.map((x) => (x.id === saved.id ? saved : x)) : [...prev, saved]));
      }
      setNilaiEdit({});
      setError('');
      tampilToast('Nilai berhasil disimpan.');
    } catch (e) {
      setError(e.message);
    }
  }

  function keluar() {
    clearLoginUser();
    router.push('/login');
  }

  function renderModal() {
    if (!modal) return null;
    const tutup = () => setModal(null);

    if (modal.type === 'materi') {
      return <MateriModal edit={modal.edit} kelasOpsi={kelasOpsi} defaultMapel={mapelGuru} onClose={tutup} onSave={simpanMateri} />;
    }
    if (modal.type === 'hasil') {
      const a = assessmentAll.find((x) => x.id === modal.id);
      if (!a) return null;
      return <HasilModal a={a} daftar={hasil.filter((h) => h.assessmentId === a.id)} onClose={tutup} onSave={simpanNilaiHasil} />;
    }
    if (modal.type === 'periksa') {
      return <PeriksaModal pg={modal.pg} nama={modal.nama} tugas={modal.tugas} onClose={tutup} onSave={simpanPeriksa} />;
    }
    if (modal.type === 'tugas') {
      return <TugasModal edit={modal.edit} kelasOpsi={kelasOpsi} defaultMapel={mapelGuru} onClose={tutup} onSave={simpanTugas} />;
    }
    if (modal.type === 'assessment') {
      return <AssessmentModal edit={modal.edit} kelasOpsi={kelasOpsi} defaultMapel={mapelGuru} onClose={tutup} onSave={simpanAssessment} />;
    }
    if (modal.type === 'hapus') {
      return (
        <Overlay onClose={tutup}>
          <div className="modal small">
            <h3>Hapus data ini?</h3>
            <p className="sub">{modal.kind === 'tugas' ? 'Tugas akan hilang dari dashboard siswa, beserta data pengumpulannya.' : 'Data yang dihapus tidak bisa dikembalikan.'}</p>
            <div className="form-actions">
              <button className="btn" onClick={tutup}>Batal</button>
              <button className="btn btn-primary" style={{ background: 'var(--coral)', borderColor: 'var(--coral)' }} onClick={hapus}>Ya, hapus</button>
            </div>
          </div>
        </Overlay>
      );
    }
    if (modal.type === 'logout') {
      return (
        <Overlay onClose={tutup}>
          <div className="modal small">
            <h3>Keluar dari akun?</h3>
            <p className="sub">Kamu akan diarahkan kembali ke halaman login.</p>
            <div className="form-actions">
              <button className="btn" onClick={tutup}>Batal</button>
              <button className="btn btn-primary" style={{ background: 'var(--coral)', borderColor: 'var(--coral)' }} onClick={keluar}>Ya, keluar</button>
            </div>
          </div>
        </Overlay>
      );
    }
    return null;
  }

  const kosong = (n, teks) => <tr><td colSpan={n} style={{ textAlign: 'center', color: 'var(--ink-faint)' }}>{teks}</td></tr>;

  return (
    <div className="app">
      <style jsx global>{styles}</style>

      <aside className="sidebar">
        <nav className="menu">
          {MENU.map((m) => (
            <button key={m.key} className={`nav-item${section === m.key ? ' active' : ''}`} onClick={() => setSection(m.key)}>
              <span className="label">{m.label}</span>
            </button>
          ))}
          <div className="nav-divider" />
          <button className="nav-item nav-item-danger" onClick={() => setModal({ type: 'logout' })}>
            <span className="ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg></span>
            <span className="label">Logout</span>
          </button>
        </nav>
        <div className="profile-mini" onClick={() => setSection('profil')}>
          <div className="avatar-sm">{initials(namaGuru)}</div>
          <div>
            <div className="pm-name">{namaGuru}</div>
            <div className="pm-role">Guru</div>
          </div>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <div className="topbar-brand"><img src="/logo-smk.png" alt="" />LMS SMK CITRA NEGARA</div>
          <div className="topbar-user">
            <div className="name">{namaGuru}</div>
            <div className="avatar-user">{initials(namaGuru)}</div>
          </div>
        </div>

        <div className="content">
          {error && <div className="error-banner">Gagal mengambil data dari database: {error}</div>}
          {!loading && !user && (
            <div className="warn-banner">Data login tidak ditemukan di browser, jadi tugas tidak bisa dibuat. Silakan login ulang.</div>
          )}

          {section === 'beranda' && (
            <section>
              <p className="greeting">Selamat datang {namaGuru}!!</p>
              <div className="quick-cards">
                <button className="quick-card" onClick={() => setModal({ type: 'materi' })}><span className="qi">M</span>Buat Materi</button>
                <button className="quick-card" onClick={() => setModal({ type: 'tugas' })}><span className="qi">T</span>Buat Tugas</button>
                <button className="quick-card" onClick={() => setModal({ type: 'assessment' })}><span className="qi">A</span>Buat Assessment</button>
              </div>
              <div className="panel">
                <div className="panel-head">
                  <h2>Aktivitas terbaru</h2>
                  <span className="link" onClick={() => setSection('pengumuman')}>Lihat semua</span>
                </div>
                <div className="panel-body">
                  {aktivitas.length === 0 && <div className="panel-body empty" style={{ padding: '10px 0' }}>Belum ada siswa yang mengumpulkan tugas.</div>}
                  {aktivitas.map((a) => (
                    <div className="list-row" key={a.id}><div><div className="title">{a.teks}</div><div className="sub">{a.meta}</div></div></div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {section === 'materi' && (
            <section>
              <div className="panel-head" style={{ border: 'none', padding: '0 0 14px' }}>
                <div><p className="page-title" style={{ margin: 0 }}>Materi</p><p className="page-sub" style={{ margin: '2px 0 0' }}>Kelola materi pelajaran untuk siswa</p></div>
                <button className="btn btn-primary" onClick={() => setModal({ type: 'materi' })}>+ Tambah materi</button>
              </div>
              <div className="panel">
                <table>
                  <thead><tr><th>Judul materi</th><th>Mata pelajaran</th><th>Kelas</th><th>File</th><th>Tanggal</th><th></th></tr></thead>
                  <tbody>
                    {materi.map((m) => (
                      <tr key={m.id}>
                        <td style={{ fontWeight: 600 }}>{m.judul}</td><td>{m.mapel}</td><td>{m.kelas}</td><td>{m.fileId ? <a href={`/api/berkas/${m.fileId}`} target="_blank" rel="noreferrer" style={{ color: 'var(--tosca-600)', fontWeight: 600 }}>{m.namaFile || 'Buka'}</a> : '-'}</td><td>{fmtTanggal(m.tanggal)}</td>
                        <td><div className="row-actions">
                          <div className="icon-btn" title="Edit" onClick={() => setModal({ type: 'materi', edit: m })}><IconEdit /></div>
                          <div className="icon-btn danger" title="Hapus" onClick={() => setModal({ type: 'hapus', kind: 'materi', id: m.id })}><IconTrash /></div>
                        </div></td>
                      </tr>
                    ))}
                    {materi.length === 0 && kosong(6, 'Belum ada materi.')}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {section === 'assessment' && (
            <section>
              <div className="panel-head" style={{ border: 'none', padding: '0 0 14px' }}>
                <div><p className="page-title" style={{ margin: 0 }}>Assessment</p><p className="page-sub" style={{ margin: '2px 0 0' }}>Buat kuis atau ulangan harian (pilihan ganda / esai)</p></div>
                <button className="btn btn-primary" onClick={() => setModal({ type: 'assessment' })}>+ Buat assessment</button>
              </div>
              <div className="panel">
                <table>
                  <thead><tr><th>Judul</th><th>Mapel</th><th>Kelas</th><th>Tipe</th><th>Jumlah soal</th><th>Total poin</th><th>Waktu</th><th>Tenggat</th><th></th></tr></thead>
                  <tbody>
                    {assessment.map((a) => (
                      <tr key={a.id}>
                        <td style={{ fontWeight: 600 }}>{a.judul}</td><td>{a.mapel}</td><td>{a.kelas}</td><td>{a.tipe}</td>
                        <td>{a.jumlahSoal}</td><td>{a.totalPoin}</td><td>{a.durasi ? `${a.durasi} menit` : '-'}</td><td>{fmtDateOnly(a.deadlineDate)}</td>
                        <td><div className="row-actions">
                          <button className="btn" onClick={() => setModal({ type: 'hasil', id: a.id })}>Hasil ({hasil.filter((h) => h.assessmentId === a.id).length})</button>
                          <div className="icon-btn" title="Edit" onClick={() => setModal({ type: 'assessment', edit: a })}><IconEdit /></div>
                          <div className="icon-btn danger" title="Hapus" onClick={() => setModal({ type: 'hapus', kind: 'assessment', id: a.id })}><IconTrash /></div>
                        </div></td>
                      </tr>
                    ))}
                    {assessment.length === 0 && kosong(9, 'Belum ada assessment.')}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {section === 'tugas' && (
            <section>
              <div className="panel-head" style={{ border: 'none', padding: '0 0 14px' }}>
                <div><p className="page-title" style={{ margin: 0 }}>Tugas</p><p className="page-sub" style={{ margin: '2px 0 0' }}>Berikan tugas ke siswa berupa file PDF atau catatan</p></div>
                <button className="btn btn-primary" onClick={() => setModal({ type: 'tugas' })}>+ Tambah tugas</button>
              </div>
              <div className="panel">
                <table>
                  <thead><tr><th>Judul tugas</th><th>Mapel</th><th>Kelas</th><th>Jenis</th><th>Tenggat</th><th>Terkumpul</th><th></th></tr></thead>
                  <tbody>
                    {tugasSaya.map((t) => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: 600 }}>{t.judul}</td><td>{t.mapel}</td><td>{t.kelas}</td>
                        <td><Pill s={t.jenis} /></td><td>{fmtWaktu(t.deadline)}</td>
                        <td>{pengumpulan.filter((p) => p.tugasId === t.id).length} siswa</td>
                        <td><div className="row-actions">
                          <div className="icon-btn" title="Edit" onClick={() => setModal({ type: 'tugas', edit: t })}><IconEdit /></div>
                          <div className="icon-btn danger" title="Hapus" onClick={() => setModal({ type: 'hapus', kind: 'tugas', id: t.id })}><IconTrash /></div>
                        </div></td>
                      </tr>
                    ))}
                    {!loading && tugasSaya.length === 0 && kosong(7, 'Belum ada tugas.')}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {section === 'nilai' && (
            <section>
              <p className="page-title">Nilai</p>
              <p className="page-sub">Nilai tugas, kuis, dan ulangan harian terisi otomatis dari tugas yang sudah kamu nilai dan hasil assessment. Ketik angka untuk menimpa nilai otomatis.</p>
              <div className="panel">
                <div className="panel-head">
                  <h2>Kelas</h2>
                  <select className="btn" style={{ cursor: 'pointer' }} value={kelasNilaiAktif} onChange={(e) => setKelasNilai(e.target.value)}>
                    {kelasList.map((k) => <option key={k.id}>{k.nama}</option>)}
                  </select>
                  <select className="btn" style={{ cursor: 'pointer' }} value={mapelAktif} onChange={(e) => setMapelNilai(e.target.value)}>
                    {mapelNilaiOpsi.map((m) => <option key={m}>{m}</option>)}
                  </select>
                  <button className="btn btn-primary" onClick={simpanSemuaNilai}>Simpan nilai</button>
                </div>
                <table>
                  <thead><tr><th>Nama siswa</th><th>Tugas</th><th>Kuis</th><th>Ulangan harian</th><th>Nilai akhir</th></tr></thead>
                  <tbody>
                    {siswaNilai.map((s) => {
                      const { out, auto, db, ed } = nilaiEfektif(s);
                      return (
                        <tr key={s.id}>
                          <td style={{ fontWeight: 600 }}>{s.nama}</td>
                          {['tugas', 'kuis', 'uh'].map((f) => (
                            <td key={f}><input className="nilai-input" type="number" min="0" max="100"
                              value={ed[f] !== undefined ? ed[f] : (db[f] ?? '')}
                              placeholder={auto[f] != null ? String(auto[f]) : '-'}
                              onChange={(e) => ubahNilai(s.id, f, e.target.value)} /></td>
                          ))}
                          <td style={{ fontWeight: 700, color: 'var(--tosca-800)' }}>{hitungAkhir(out)}</td>
                        </tr>
                      );
                    })}
                    {siswaNilai.length === 0 && kosong(5, 'Belum ada siswa di kelas ini.')}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {section === 'pengumuman' && (
            <section>
              <p className="page-title">Pengumuman</p>
              <p className="page-sub">Status pengumpulan tugas siswa dan himbauan dari admin</p>
              <div className="panel">
                <div className="panel-head">
                  <h2>Status pengumpulan tugas</h2>
                  <select className="btn" style={{ cursor: 'pointer' }} value={tugasDipilih ? tugasDipilih.id : ''} onChange={(e) => setFilterTugasId(e.target.value)}>
                    {tugasSaya.map((t) => <option key={t.id} value={t.id}>{t.judul}</option>)}
                  </select>
                </div>
                <table>
                  <thead><tr><th>Nama siswa</th><th>Kelas</th><th>Status</th><th>Waktu kumpul</th><th>File</th><th>Nilai</th><th>Aksi</th></tr></thead>
                  <tbody>
                    {barisStatus.map((b, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{b.nama}</td>
                        <td>{b.kelas}</td>
                        <td><Pill s={b.pg ? 'Sudah' : 'Belum'} /></td>
                        <td>{b.pg ? fmtWaktu(b.pg.dikumpulkanPada) : '-'}</td>
                        <td>{b.pg ? (b.pg.fileId ? <a href={`/api/berkas/${b.pg.fileId}`} target="_blank" rel="noreferrer" style={{ color: 'var(--tosca-600)', fontWeight: 600 }}>{b.pg.namaFile || 'Buka file'}</a> : (b.pg.namaFile || '-')) : '-'}</td>
                        <td>{b.pg ? (b.pg.nilai != null ? <b>{b.pg.nilai}</b> : <span style={{ color: 'var(--ink-soft)' }}>Belum dinilai</span>) : '-'}</td>
                        <td>{b.pg ? <button className="btn btn-primary" onClick={() => setModal({ type: 'periksa', pg: b.pg, nama: b.nama, tugas: tugasDipilih })}>{b.pg.nilai != null ? 'Edit nilai' : 'Periksa & nilai'}</button> : '-'}</td>
                      </tr>
                    ))}
                    {barisStatus.length === 0 && kosong(7, tugasDipilih ? 'Belum ada data.' : 'Belum ada tugas.')}
                  </tbody>
                </table>
              </div>
              <div className="panel">
                <div className="panel-head"><h2>Himbauan dari admin</h2></div>
                <div>
                  {pengumumanAdmin.length === 0 && <div className="panel-body empty">Belum ada himbauan.</div>}
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
                <div className="profile-avatar">{initials(namaGuru)}</div>
                <div className="field-row"><label>Nama lengkap</label><input type="text" value={namaGuru} readOnly /></div>
                <div className="field-row"><label>NIP</label><input type="text" value={(dataGuru && dataGuru.nip) || '-'} readOnly /></div>
                <div className="field-row"><label>Mata pelajaran diampu</label><input type="text" value={(dataGuru && dataGuru.mapel) || '-'} readOnly /></div>
                <div className="field-row"><label>Email</label><input type="text" value={(user && user.email) || '-'} readOnly /></div>
                <div className="field-row"><label>No. HP</label><input type="text" value={(dataGuru && dataGuru.kontak) || '-'} readOnly /></div>
              </div>
            </section>
          )}
        </div>
      </div>

      {renderModal()}
      {toast && <div className="toast show">{toast}</div>}
    </div>
  );
}

const styles = `:root{
    --bg:#EDEFEE; --surface:#FFFFFF;
    --tosca-900:#0B4A44; --tosca-800:#0E5C54; --tosca-700:#127167; --tosca-600:#178A7C; --tosca-500:#1EA391;
    --tosca-100:#DCF1EA; --tosca-50:#EFF8F4;
    --ink:#152621; --ink-soft:#5C726C; --ink-faint:#93A6A0; --line:#E1E6E4;
    --coral:#E4633F; --coral-100:#FCE7DF; --coral-700:#9E3B21;
    --amber:#C98A1C; --amber-100:#FBEEDA;
    --blue:#2563EB; --blue-100:#DBEAFE;
  }
  *{box-sizing:border-box;}
  body{margin:0;font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;}
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
  .topbar-brand{font-size:12px;font-weight:700;color:var(--tosca-800);letter-spacing:0.3px;display:flex;align-items:center;gap:8px;}
  .topbar-brand img{width:22px;height:22px;object-fit:contain;}
  .topbar-user{display:flex;align-items:center;gap:12px;}
  .bell{width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;border:1px solid var(--line);cursor:pointer;position:relative;font-size:14px;}
  .bell .dot{position:absolute;top:6px;right:7px;width:6px;height:6px;border-radius:50%;background:var(--coral);}
  .topbar-user .name{font-size:12.5px;font-weight:700;}
  .avatar-user{width:32px;height:32px;border-radius:50%;background:var(--tosca-100);color:var(--tosca-800);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;}

  .content{padding:22px;overflow-y:auto;}
  .greeting{font-size:15.5px;font-weight:700;margin:0 0 16px;}

  .quick-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px;}
  .quick-card{display:flex;align-items:center;gap:12px;background:var(--tosca-700);color:#fff;border:none;border-radius:12px;padding:18px 18px;font-size:14.5px;font-weight:700;cursor:pointer;font-family:inherit;}
  .quick-card:hover{background:var(--tosca-600);}
  .quick-card .qi{width:34px;height:34px;border-radius:8px;background:rgba(255,255,255,0.16);display:flex;align-items:center;justify-content:center;flex-shrink:0;}

  .panel{background:var(--surface);border:1px solid var(--line);border-radius:12px;overflow:hidden;margin-bottom:16px;}
  .panel-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--line);gap:12px;flex-wrap:wrap;}
  .panel-head h2{font-size:14.5px;font-weight:700;margin:0;}
  .panel-head p{font-size:12px;color:var(--ink-soft);margin:2px 0 0;}
  .panel-head .link{font-size:12.5px;font-weight:600;color:var(--tosca-800);cursor:pointer;}
  .panel-body{padding:6px 18px 14px;min-height:50px;}
  .panel-body.empty{color:var(--ink-faint);font-size:13px;padding:20px 18px;text-align:center;}

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

  .section{display:none;}
  .section.active{display:block;}
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

  .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--tosca-900);color:#fff;padding:11px 20px;border-radius:10px;font-size:13px;font-weight:600;z-index:100;display:none;box-shadow:0 4px 16px rgba(0,0,0,0.2);}
  .toast.show{display:block;}

  @media (max-width:860px){
    .sidebar{width:64px;}
    .nav-item span.label{display:none;}
    .sidebar-logo span{display:none;}
    .quick-cards{grid-template-columns:1fr;}
  }
.error-banner{background:var(--coral-100);color:var(--coral-700);border:1px solid #F0B7A3;border-radius:8px;padding:10px 14px;font-size:13px;margin-bottom:16px;}
.warn-banner{background:var(--amber-100);color:#7A5410;border:1px solid #EBCF9A;border-radius:8px;padding:10px 14px;font-size:13px;margin-bottom:16px;}
.btn:disabled{opacity:0.6;cursor:not-allowed;}
.panel-head p.page-title{font-size:18px;font-weight:700;color:var(--ink);margin:0 0 3px;}
.panel-head p.page-sub{font-size:12.5px;margin:0 !important;}
`;
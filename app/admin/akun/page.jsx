'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const css = `
:root{--hijau-900:#08332F;--hijau-800:#0B4A44;--hijau-600:#14796C;--hijau-100:#DDEFEA;--hijau-50:#EFF7F4;--emas:#E9B93B;--ink:#0F1F1D;--ink-soft:#4A5E5A;--garis:#C9DAD5;--merah:#B3361A;--merah-bg:#FCEBE5;
--judul:"Bahnschrift SemiCondensed","Bahnschrift","Arial Narrow",system-ui,sans-serif;--isi:"Segoe UI Variable Text","Segoe UI",system-ui,-apple-system,Roboto,sans-serif;}
*{box-sizing:border-box;}
body{margin:0;font-family:var(--isi);color:var(--ink);background:var(--hijau-50);}
:focus-visible{outline:3px solid var(--emas);outline-offset:2px;}
.rp{max-width:760px;margin:0 auto;padding:36px 20px 60px;}
.rp a.balik{color:var(--hijau-800);font-weight:600;text-decoration:none;font-size:14.5px;}
.rp h1{font-family:var(--judul);font-size:34px;color:var(--hijau-900);margin:14px 0 6px;line-height:1.1;}
.rp .sub{color:var(--ink-soft);margin:0 0 24px;}
.kartu{background:#fff;border:1px solid var(--garis);border-radius:16px;padding:24px;margin-bottom:16px;}
.field{margin-bottom:14px;}
.field label{display:block;font-size:13.5px;font-weight:600;margin-bottom:6px;}
.input{width:100%;height:44px;padding:0 12px;border:1.5px solid var(--garis);border-radius:10px;font:inherit;font-size:15px;background:#fff;}
.input:focus{outline:none;border-color:var(--hijau-600);box-shadow:0 0 0 4px rgba(20,121,108,.15);}
.btn{height:44px;padding:0 18px;border-radius:10px;border:2px solid transparent;font:inherit;font-weight:700;font-size:14.5px;cursor:pointer;}
.btn-utama{background:var(--hijau-800);color:#fff;}
.btn-utama:hover:not(:disabled){background:var(--hijau-600);}
.btn-garis{background:#fff;border-color:var(--garis);color:var(--hijau-800);}
.btn-garis:hover{background:var(--hijau-100);}
.btn:disabled{opacity:.7;cursor:progress;}
.galat{background:var(--merah-bg);color:var(--merah);border-radius:10px;padding:10px 13px;font-size:14px;margin-bottom:14px;}
.sukses{background:var(--hijau-100);color:var(--hijau-900);border-radius:10px;padding:12px 14px;font-size:14.5px;margin-bottom:14px;line-height:1.6;}
.sukses code{background:#fff;padding:2px 8px;border-radius:6px;font-size:15px;font-weight:700;letter-spacing:.04em;}
.kepala{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;}
.kepala h2{margin:0;font-family:var(--judul);font-size:22px;color:var(--hijau-900);}
.baris{border-top:1px solid var(--hijau-100);padding:16px 0 4px;}
.baris:first-of-type{border-top:0;padding-top:0;}
.info b{font-size:16px;}
.info span{display:block;color:var(--ink-soft);font-size:13.5px;}
.aksi{display:flex;gap:8px;margin:12px 0;flex-wrap:wrap;}
.aksi .input{flex:1;min-width:170px;font-family:ui-monospace,Consolas,monospace;letter-spacing:.04em;}
.kosong{color:var(--ink-soft);text-align:center;padding:26px 0 10px;}
.sel{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
@media(max-width:560px){.sel{grid-template-columns:1fr;}}
.tag{display:inline-block;padding:2px 9px;border-radius:99px;font-size:12px;font-weight:700;background:var(--hijau-100);color:var(--hijau-800);}
.tag-admin{background:#FFF1CC;color:#7A5A00;}
.hapus{color:var(--merah);}
`;

const PERAN = [
  { v: 'siswa', t: 'Siswa' },
  { v: 'guru', t: 'Guru' },
  { v: 'kepsek', t: 'Kepala Sekolah' },
  { v: 'kurikulum', t: 'Kurikulum' },
  { v: 'admin', t: 'Admin' },
];
const namaPeran = (r) => (PERAN.find((p) => p.v === r) || { t: r }).t;

export default function AkunAdmin() {
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [daftar, setDaftar] = useState(null); // null = belum masuk
  const [form, setForm] = useState({ nama: '', email: '', password: '', role: 'siswa', kelas: '' });
  const [saran, setSaran] = useState([]);
  const [kelasSiswa, setKelasSiswa] = useState({}); // nama(huruf kecil) -> kelas
  const [namaGuru, setNamaGuru] = useState([]);
  const [daftarKelas, setDaftarKelas] = useState([]);
  const [edit, setEdit] = useState(null); // akun yang sedang diubah
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  // saran nama + daftar kelas dari data siswa, guru, dan kelas
  async function muatSaran() {
    try {
      const [g, s, k] = await Promise.all([fetch('/api/guru'), fetch('/api/siswa'), fetch('/api/kelas')]);
      const dg = g.ok ? await g.json() : [];
      const ds = s.ok ? await s.json() : [];
      const dk = k.ok ? await k.json() : [];
      setSaran([...new Set([...dg, ...ds].map((x) => x.nama).filter(Boolean))]);
      setKelasSiswa(Object.fromEntries(ds.filter((x) => x.nama).map((x) => [x.nama.trim().toLowerCase(), x.kelas || ''])));
      setNamaGuru(dg.map((x) => (x.nama || '').trim().toLowerCase()));
      setDaftarKelas([...new Set([...dk.map((x) => x.nama), ...ds.map((x) => x.kelas)].filter(Boolean))]);
    } catch {}
  }
  useEffect(() => { muatSaran(); }, []);

  async function panggil(body) {
    const res = await fetch('/api/akun', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminEmail, adminPassword, ...body }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan pada server.');
    return data;
  }

  async function masuk(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try { setDaftar(await panggil({ aksi: 'daftar' })); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function buat(e) {
    e.preventDefault();
    setLoading(true); setError(''); setInfo('');
    try {
      const a = await panggil({ aksi: 'buat', ...form });
      setInfo(`Akun ${a.nama} dibuat. Login dengan email ${a.email} dan password yang baru kamu isi.`);
      setForm({ nama: '', email: '', password: '', role: form.role, kelas: '' });
      muatSaran();
      setDaftar(await panggil({ aksi: 'daftar' }));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function simpanEdit(e) {
    e.preventDefault();
    setLoading(true); setError(''); setInfo('');
    try {
      await panggil({ aksi: 'ubah', id: edit.id, nama: edit.nama, email: edit.email, role: edit.role, password: edit.password, kelas: edit.kelas });
      setInfo(`Akun ${edit.nama} diperbarui.` + (edit.password ? ' Password baru sudah berlaku.' : ''));
      setEdit(null);
      muatSaran();
      setDaftar(await panggil({ aksi: 'daftar' }));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  // petunjuk kelas: akun siswa memakai kelas dari data siswa (dicocokkan lewat nama)
  function petunjuk(nama, role, kelasDipilih) {
    const k = String(nama || '').trim().toLowerCase();
    if (!k) return null;
    if (role === 'siswa') {
      if (kelasDipilih) return { ok: true, t: `Kelas ${kelasDipilih} akan disimpan ke data siswa.` };
      return k in kelasSiswa
        ? (kelasSiswa[k] ? { ok: true, t: `Kelas terdeteksi: ${kelasSiswa[k]}` } : { ok: false, t: 'Nama ada di data siswa, tapi kelasnya masih kosong. Isi kelas di data siswa.' })
        : { ok: false, t: 'Nama ini belum ada di data siswa, jadi kelas tidak akan terdeteksi. Tambahkan dulu di data siswa.' };
    }
    if (role === 'guru') {
      return namaGuru.includes(k) ? { ok: true, t: 'Nama cocok dengan data guru.' } : { ok: false, t: 'Nama ini belum ada di data guru. Tambahkan dulu di data guru.' };
    }
    return null;
  }

  async function hapus(a) {
    if (!window.confirm(`Hapus akun ${a.nama} (${a.email})?`)) return;
    setError(''); setInfo('');
    try {
      await panggil({ aksi: 'hapus', id: a.id });
      setDaftar(await panggil({ aksi: 'daftar' }));
    } catch (err) { setError(err.message); }
  }

  return (
    <div className="rp">
      <style>{css}</style>
      <Link className="balik" href="/admin">&larr; Kembali ke admin</Link>
      <h1>Akun pengguna</h1>
      <p className="sub">Buat akun login untuk siswa, guru, kepala sekolah, dan kurikulum.</p>

      {daftar === null ? (
        <form className="kartu" onSubmit={masuk}>
          <p style={{ marginTop: 0 }}>Masukkan email dan password <b>admin</b> untuk melanjutkan.</p>
          {error && <div className="galat" role="alert">{error}</div>}
          <div className="field"><label htmlFor="ae">Email admin</label>
            <input id="ae" className="input" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} autoComplete="username" required /></div>
          <div className="field"><label htmlFor="ap">Password admin</label>
            <input id="ap" type="password" className="input" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} autoComplete="current-password" required /></div>
          <button className="btn btn-utama" disabled={loading}>{loading ? 'Memeriksa...' : 'Masuk'}</button>
        </form>
      ) : (
        <>
          <form className="kartu" onSubmit={buat}>
            <div className="kepala"><h2>Buat akun baru</h2></div>
            {error && <div className="galat" role="alert">{error}</div>}
            {info && <div className="sukses">{info}</div>}
            <div className="sel">
              <div className="field"><label htmlFor="n">Nama (sama persis dengan data siswa/guru)</label>
                <input id="n" list="saran-nama" className="input" value={form.nama} onChange={(e) => { const v = e.target.value; setForm({ ...form, nama: v, kelas: kelasSiswa[v.trim().toLowerCase()] || form.kelas }); }} required />
                <datalist id="saran-nama">{saran.map((s) => <option key={s} value={s} />)}</datalist>
                {(() => { const h = petunjuk(form.nama, form.role, form.kelas); return h ? <div style={{ fontSize: 12.5, marginTop: 6, color: h.ok ? 'var(--hijau-800)' : 'var(--merah)' }}>{h.t}</div> : null; })()}</div>
              <div className="field"><label htmlFor="r">Peran</label>
                <select id="r" className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {PERAN.map((p) => <option key={p.v} value={p.v}>{p.t}</option>)}
                </select></div>
              {form.role === 'siswa' && (
                <div className="field"><label htmlFor="k">Kelas</label>
                  <select id="k" className="input" value={form.kelas} onChange={(e) => setForm({ ...form, kelas: e.target.value })} required>
                    <option value="">Pilih kelas</option>
                    {daftarKelas.map((k) => <option key={k} value={k}>{k}</option>)}
                  </select></div>
              )}
              <div className="field"><label htmlFor="e">Email untuk login</label>
                <input id="e" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="off" required /></div>
              <div className="field"><label htmlFor="p">Password (minimal 6 karakter)</label>
                <input id="p" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="off" required /></div>
            </div>
            <button className="btn btn-utama" disabled={loading}>{loading ? 'Menyimpan...' : 'Buat akun'}</button>
          </form>

          <div className="kartu">
            <div className="kepala"><h2>Akun yang sudah ada ({daftar.length})</h2></div>
            {daftar.length === 0 && <div className="kosong">Belum ada akun.</div>}
            {daftar.map((a) => (
              <div className="baris" key={a.id}>
                {edit && edit.id === a.id ? (
                  <form onSubmit={simpanEdit}>
                    <div className="sel">
                      <div className="field"><label>Nama</label>
                        <input className="input" list="saran-nama" value={edit.nama} onChange={(e) => setEdit({ ...edit, nama: e.target.value })} required />
                        {(() => { const h = petunjuk(edit.nama, edit.role, edit.kelas); return h ? <div style={{ fontSize: 12.5, marginTop: 6, color: h.ok ? 'var(--hijau-800)' : 'var(--merah)' }}>{h.t}</div> : null; })()}</div>
                      <div className="field"><label>Peran</label>
                        <select className="input" value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value })}>
                          {PERAN.map((p) => <option key={p.v} value={p.v}>{p.t}</option>)}
                        </select></div>
                      {edit.role === 'siswa' && (
                        <div className="field"><label>Kelas</label>
                          <select className="input" value={edit.kelas} onChange={(e) => setEdit({ ...edit, kelas: e.target.value })} required>
                            <option value="">Pilih kelas</option>
                            {daftarKelas.map((k) => <option key={k} value={k}>{k}</option>)}
                          </select></div>
                      )}
                      <div className="field"><label>Email untuk login</label>
                        <input className="input" value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} required /></div>
                      <div className="field"><label>Password baru (kosongkan kalau tidak diganti)</label>
                        <input className="input" value={edit.password} onChange={(e) => setEdit({ ...edit, password: e.target.value })} autoComplete="off" placeholder="minimal 6 karakter" /></div>
                    </div>
                    <div className="aksi">
                      <button className="btn btn-utama" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan perubahan'}</button>
                      <button type="button" className="btn btn-garis" onClick={() => setEdit(null)}>Batal</button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                    <div className="info"><b>{a.nama}</b> <span className={`tag ${a.role === 'admin' ? 'tag-admin' : ''}`}>{namaPeran(a.role)}</span><span>{a.email}{a.role === 'siswa' || a.role === 'murid' ? ' · ' + (kelasSiswa[String(a.nama).trim().toLowerCase()] || 'kelas belum diisi') : ''}</span></div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" className="btn btn-garis" onClick={() => { setError(''); setInfo(''); setEdit({ id: a.id, nama: a.nama, email: a.email, role: a.role === 'murid' ? 'siswa' : a.role, password: '', kelas: kelasSiswa[String(a.nama).trim().toLowerCase()] || '' }); }}>Ubah</button>
                      <button type="button" className="btn btn-garis hapus" onClick={() => hapus(a)}>Hapus</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
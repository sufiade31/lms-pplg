'use client';

import { useState } from 'react';

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
`;

function buatPassword() {
  const huruf = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  const arr = new Uint32Array(8);
  crypto.getRandomValues(arr);
  arr.forEach((n) => { s += huruf[n % huruf.length]; });
  return s;
}

const fmt = (d) => new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function ResetPasswordAdmin() {
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [daftar, setDaftar] = useState(null); // null = belum masuk
  const [pwBaru, setPwBaru] = useState({});
  const [error, setError] = useState('');
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  async function panggil(body) {
    const res = await fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminEmail, adminPassword, ...body }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan pada server.');
    return data;
  }

  async function muat() {
    setLoading(true);
    setError('');
    try {
      const d = await panggil({ aksi: 'daftar' });
      setDaftar(d);
      setPwBaru((prev) => {
        const next = { ...prev };
        d.forEach((x) => { if (!next[x.id]) next[x.id] = buatPassword(); });
        return next;
      });
    } catch (e) {
      setError(e.message);
      setDaftar(null);
    }
    setLoading(false);
  }

  async function setel(r) {
    setLoading(true);
    setError('');
    setInfo(null);
    try {
      await panggil({ aksi: 'setel', email: r.email, passwordBaru: pwBaru[r.id] });
      setInfo({ nama: r.nama || r.email, email: r.email, password: pwBaru[r.id] });
      setDaftar((prev) => prev.filter((x) => x.id !== r.id));
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  async function abaikan(r) {
    setError('');
    try {
      await panggil({ aksi: 'hapus', id: r.id });
      setDaftar((prev) => prev.filter((x) => x.id !== r.id));
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="rp">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <a className="balik" href="/admin">&larr; Kembali ke dashboard admin</a>
      <h1>Permintaan reset password</h1>
      <p className="sub">Guru dan siswa yang lupa password mengirim permintaan dari halaman login. Buatkan password baru di sini, lalu sampaikan langsung ke yang bersangkutan.</p>

      {error && <div className="galat" role="alert">{error}</div>}
      {info && (
        <div className="sukses">
          Password <b>{info.nama}</b> ({info.email}) sudah diganti menjadi <code>{info.password}</code>.<br />
          Catat dan sampaikan sekarang, password ini tidak akan ditampilkan lagi.
        </div>
      )}

      {daftar === null ? (
        <form className="kartu" onSubmit={(e) => { e.preventDefault(); muat(); }}>
          <p style={{ margin: '0 0 14px', color: 'var(--ink-soft)', fontSize: 14.5 }}>Konfirmasi dengan akun admin kamu untuk membuka daftar.</p>
          <div className="field"><label htmlFor="ae">Email admin</label><input id="ae" className="input" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} autoComplete="username" /></div>
          <div className="field"><label htmlFor="ap">Password admin</label><input id="ap" className="input" type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} autoComplete="current-password" /></div>
          <button className="btn btn-utama" disabled={loading || !adminEmail || !adminPassword}>{loading ? 'Memeriksa...' : 'Buka daftar'}</button>
        </form>
      ) : (
        <div className="kartu">
          <div className="kepala">
            <h2>Menunggu ({daftar.length})</h2>
            <button className="btn btn-garis" onClick={muat} disabled={loading}>Muat ulang</button>
          </div>
          {daftar.length === 0 && <div className="kosong">Tidak ada permintaan reset password.</div>}
          {daftar.map((r) => (
            <div className="baris" key={r.id}>
              <div className="info"><b>{r.nama || '(tanpa nama)'}</b> <span style={{ display: 'inline' }}>&middot; {r.role || '-'}</span><span>{r.email} &middot; diminta {fmt(r.diminta)}</span></div>
              <div className="aksi">
                <input className="input" value={pwBaru[r.id] || ''} onChange={(e) => setPwBaru((p) => ({ ...p, [r.id]: e.target.value }))} aria-label={`Password baru untuk ${r.email}`} />
                <button className="btn btn-garis" onClick={() => setPwBaru((p) => ({ ...p, [r.id]: buatPassword() }))}>Acak</button>
                <button className="btn btn-utama" onClick={() => setel(r)} disabled={loading}>Setel password</button>
                <button className="btn btn-garis" onClick={() => abaikan(r)}>Abaikan</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
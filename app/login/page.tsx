'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ====== Sesuaikan jika perlu ======
const NAMA_SEKOLAH = 'SMK Citra Negara';
const STORAGE_KEY = 'user'; // nama kunci penyimpanan data login di browser
const TUJUAN: Record<string, string> = {
  admin: '/admin',
  guru: '/guru',
  murid: '/siswa',
  siswa: '/siswa',
  kepsek: '/admin',     // ganti jika kepala sekolah punya halaman sendiri
  kurikulum: '/admin',  // ganti jika kurikulum punya halaman sendiri
};

const css = `
:root{
  --hijau-900:#08332F; --hijau-800:#0B4A44; --hijau-600:#14796C; --hijau-100:#DDEFEA; --hijau-50:#EFF7F4;
  --emas:#E9B93B; --ink:#0F1F1D; --ink-soft:#4A5E5A; --garis:#C9DAD5; --merah:#B3361A; --merah-bg:#FCEBE5;
  --judul:"Bahnschrift SemiCondensed","Bahnschrift","Arial Narrow",system-ui,sans-serif;
  --isi:"Segoe UI Variable Text","Segoe UI",system-ui,-apple-system,Roboto,sans-serif;
}
*{box-sizing:border-box;}
body{margin:0;font-family:var(--isi);color:var(--ink);background:#fff;-webkit-font-smoothing:antialiased;}
:focus-visible{outline:3px solid var(--emas);outline-offset:2px;}

.login{min-height:100vh;display:grid;grid-template-columns:minmax(380px,0.95fr) 1.05fr;}

/* Sisi kiri: identitas sekolah */
.sisi{position:relative;background:var(--hijau-900);color:#E2F2EE;padding:44px 52px;display:flex;flex-direction:column;overflow:hidden;}
.sisi::before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px);background-size:44px 44px;mask-image:linear-gradient(180deg,#000 0%,transparent 85%);-webkit-mask-image:linear-gradient(180deg,#000 0%,transparent 85%);}
.sisi > *{position:relative;}
.merek{display:flex;align-items:center;gap:14px;text-decoration:none;color:#fff;font-family:var(--judul);font-weight:700;font-size:21px;}
.logo-chip{width:48px;height:48px;border-radius:12px;background:#fff;display:grid;place-items:center;flex-shrink:0;}
.logo-chip img{width:36px;height:36px;object-fit:contain;}
.moto{margin:auto 0;padding:56px 0 40px;}
.moto h1{margin:0;font-family:var(--judul);font-weight:700;font-size:clamp(44px,5.4vw,76px);line-height:1.02;letter-spacing:-0.015em;color:#fff;}
.moto h1 span{display:block;}
.moto h1 span + span{color:#BFE3DA;}
.moto h1 span + span + span{color:var(--emas);}
.moto p{margin:26px 0 0;max-width:36ch;color:#A9CFC7;font-size:16.5px;line-height:1.65;}
.sisi small{color:#7FAFA5;font-size:13px;}

/* Sisi kanan: formulir */
.form-sisi{display:flex;align-items:center;justify-content:center;padding:40px 28px;background:var(--hijau-50);}
.kartu{width:min(420px,100%);background:#fff;border:1px solid var(--garis);border-radius:18px;padding:38px 36px 32px;box-shadow:0 30px 60px -34px rgba(8,51,47,.45);}
.kartu h2{margin:0;font-family:var(--judul);font-size:34px;color:var(--hijau-900);line-height:1.1;}
.kartu .sub{margin:8px 0 26px;color:var(--ink-soft);font-size:15px;}
.field{margin-bottom:18px;}
.field label{display:block;font-size:13.5px;font-weight:600;color:var(--ink);margin-bottom:7px;}
.input-wrap{position:relative;}
.input{width:100%;height:48px;padding:0 14px;border:1.5px solid var(--garis);border-radius:10px;font:inherit;font-size:15px;color:var(--ink);background:#fff;transition:border-color .15s,box-shadow .15s;}
.input::placeholder{color:#8AA39E;}
.input:hover{border-color:#9FBDB5;}
.input:focus{outline:none;border-color:var(--hijau-600);box-shadow:0 0 0 4px rgba(20,121,108,.15);}
.input.salah{border-color:var(--merah);}
.input.pakai-tombol{padding-right:54px;}
.lihat{position:absolute;right:6px;top:6px;width:38px;height:36px;padding:0;border:0;border-radius:8px;background:transparent;font-size:19px;line-height:1;cursor:pointer;}
.lihat:hover{background:var(--hijau-100);}
.galat{display:flex;gap:10px;align-items:flex-start;background:var(--merah-bg);color:var(--merah);border-radius:10px;padding:11px 13px;font-size:14px;line-height:1.5;margin-bottom:18px;}
.galat svg{flex-shrink:0;margin-top:2px;}
.masuk{width:100%;height:50px;border:0;border-radius:10px;background:var(--hijau-800);color:#fff;font:inherit;font-size:16px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:background .15s;}
.masuk:hover:not(:disabled){background:var(--hijau-600);}
.masuk:disabled{opacity:.75;cursor:progress;}
.spin{width:17px;height:17px;border-radius:50%;border:2.5px solid rgba(255,255,255,.4);border-top-color:#fff;animation:putar .7s linear infinite;}
@keyframes putar{to{transform:rotate(360deg);}}
.bantuan{margin:22px 0 0;padding-top:18px;border-top:1px solid var(--hijau-100);display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:13.5px;color:var(--ink-soft);}
.bantuan a{color:var(--hijau-800);font-weight:600;text-decoration:none;}
.bantuan a:hover{text-decoration:underline;}

.tautan{border:0;background:none;padding:0;font:inherit;font-size:13.5px;font-weight:600;color:var(--hijau-800);cursor:pointer;}
.tautan:hover{text-decoration:underline;}
.latar{position:fixed;inset:0;background:rgba(8,51,47,.55);display:flex;align-items:center;justify-content:center;padding:20px;z-index:50;}
.modal{width:min(400px,100%);background:#fff;border-radius:16px;padding:28px 26px 22px;box-shadow:0 30px 60px -20px rgba(0,0,0,.5);}
.modal h2{margin:0 0 8px;font-family:var(--judul);font-size:28px;color:var(--hijau-900);}
.modal .sub{margin:0 0 20px;color:var(--ink-soft);font-size:15px;line-height:1.6;}
.batal{width:100%;margin-top:8px;height:44px;border:0;background:none;font:inherit;font-weight:600;color:var(--ink-soft);cursor:pointer;border-radius:10px;}
.batal:hover{background:var(--hijau-50);}

@media (max-width:860px){
  .login{grid-template-columns:1fr;}
  .sisi{padding:28px 24px 30px;}
  .moto{padding:30px 0 6px;margin:0;}
  .moto h1{font-size:40px;}
  .moto h1 span{display:inline;}
  .moto h1 span::after{content:" ";}
  .moto p{display:none;}
  .sisi small{display:none;}
  .form-sisi{padding:28px 16px 40px;align-items:flex-start;}
  .kartu{padding:30px 22px 26px;margin-top:-8px;}
}
@media (prefers-reduced-motion:reduce){.spin{animation-duration:2s;} .input,.masuk{transition:none;}}
`;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [lihat, setLihat] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lupa, setLupa] = useState(false);
  const [emailLupa, setEmailLupa] = useState('');
  const [lupaStatus, setLupaStatus] = useState(''); // '', 'kirim', 'ok', atau pesan galat

  async function kirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    if (!email.trim() || !password) {
      setError('Isi email dan password dulu.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Gagal masuk. Coba lagi sebentar lagi.');
        setLoading(false);
        return;
      }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (err) { /* abaikan */ }
      router.push(TUJUAN[data.role] || '/');
    } catch (err) {
      setError('Tidak bisa terhubung ke server. Periksa koneksi internet atau pastikan server berjalan.');
      setLoading(false);
    }
  }

  async function kirimLupa(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!emailLupa.trim() || !emailLupa.includes('@')) { setLupaStatus('Isi email dengan benar.'); return; }
    setLupaStatus('kirim');
    try {
      const res = await fetch('/api/lupa-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLupa.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      setLupaStatus(res.ok ? 'ok' : data.error || 'Gagal mengirim permintaan. Coba lagi.');
    } catch (err) {
      setLupaStatus('Tidak bisa terhubung ke server.');
    }
  }

  function bukaLupa() { setEmailLupa(email); setLupaStatus(''); setLupa(true); }

  return (
    <div className="login">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <aside className="sisi">
        <Link className="merek" href="/">
          <span className="logo-chip">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-smk.png" alt="" />
          </span>
          {NAMA_SEKOLAH}
        </Link>
        <div className="moto">
          <h1><span>Belajar,</span><span>Berkarya,</span><span>Berprestasi.</span></h1>
          <p>Masuk untuk melihat materi, mengumpulkan tugas, mengerjakan kuis, dan mengecek nilaimu.</p>
        </div>
        <small>&copy; {new Date().getFullYear()} {NAMA_SEKOLAH}</small>
      </aside>

      <main className="form-sisi">
        <div className="kartu">
          <h2>Masuk ke LMS</h2>
          <p className="sub">Gunakan akun yang diberikan sekolah.</p>

          <form onSubmit={kirim} noValidate>
            {error && (
              <div className="galat" role="alert">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                <span>{error}</span>
              </div>
            )}

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email" className={`input${error ? ' salah' : ''}`} type="email" inputMode="email" autoComplete="username"
                placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <input
                  id="password" className={`input pakai-tombol${error ? ' salah' : ''}`} type={lihat ? 'text' : 'password'} autoComplete="current-password"
                  placeholder="Masukkan password" value={password} onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className="lihat" onClick={() => setLihat((v) => !v)} aria-pressed={lihat} aria-label={lihat ? 'Sembunyikan password' : 'Tampilkan password'} title={lihat ? 'Sembunyikan password' : 'Tampilkan password'}>
                  {lihat ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button className="masuk" type="submit" disabled={loading}>
              {loading ? (<><span className="spin" aria-hidden="true" />Memeriksa akun...</>) : 'Masuk'}
            </button>
          </form>

          <div className="bantuan">
            <button type="button" className="tautan" onClick={bukaLupa}>Lupa password?</button>
            <Link href="/">Kembali ke beranda</Link>
          </div>
        </div>
      </main>

      {lupa && (
        <div className="latar" onClick={(e) => e.target === e.currentTarget && setLupa(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="judul-lupa">
            <h2 id="judul-lupa">Lupa password</h2>
            {lupaStatus === 'ok' ? (
              <>
                <p className="sub">Jika email itu terdaftar, permintaanmu sudah masuk ke admin. Admin akan membuatkan password baru dan menyampaikannya langsung kepadamu.</p>
                <button className="masuk" type="button" onClick={() => setLupa(false)}>Kembali ke halaman masuk</button>
              </>
            ) : (
              <form onSubmit={kirimLupa} noValidate>
                <p className="sub">Masukkan email akunmu. Admin sekolah akan membuatkan password baru.</p>
                {lupaStatus && lupaStatus !== 'kirim' && (
                  <div className="galat" role="alert"><span>{lupaStatus}</span></div>
                )}
                <div className="field">
                  <label htmlFor="email-lupa">Email</label>
                  <input id="email-lupa" className="input" type="email" inputMode="email" autoComplete="email" placeholder="nama@email.com" value={emailLupa} onChange={(e) => setEmailLupa(e.target.value)} autoFocus />
                </div>
                <button className="masuk" type="submit" disabled={lupaStatus === 'kirim'}>
                  {lupaStatus === 'kirim' ? (<><span className="spin" aria-hidden="true" />Mengirim...</>) : 'Kirim permintaan'}
                </button>
                <button className="batal" type="button" onClick={() => setLupa(false)}>Batal</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { logoSekolah } from '../assets';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login gagal.');
        return;
      }

      localStorage.setItem('user', JSON.stringify(data));

      const rolePaths: Record<string, string> = {
        admin: '/admin',
        guru: '/guru',
        kepsek: '/kepsek',
        kurikulum: '/kurikulum',
        siswa: '/siswa',
      };

      router.push(rolePaths[data.role] || '/login');
      router.refresh();
    } catch (err) {
      setError('Terjadi kesalahan. Coba lagi.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F8F6] px-4 py-8">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="bg-white p-8 md:p-12">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0D9488]/10 p-1.5">
              <img src={logoSekolah} alt="Logo SMK Citra Negara" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-lg font-bold leading-tight text-[#0D9488]">LMS</p>
              <p className="text-xs font-semibold leading-tight text-black">SMK CITRA NEGARA</p>
              <p className="text-[11px] leading-tight text-[#6B7280]">Belajar, Berkarya, Berprestasi</p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-black">Email/username</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email atau username"
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-black outline-none transition-colors focus:border-[#0D9488] focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-black">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-black outline-none transition-colors focus:border-[#0D9488] focus:bg-white"
              />
            </div>

            {error && <p className="text-xs font-medium text-red-600">{error}</p>}

            <button
              type="submit"
              className="w-full rounded-xl bg-[#0D9488] px-4 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
            >
              Login
            </button>
          </form>

          <p className="mt-8 text-center text-[11px] text-[#9CA3AF]">© 2026 SMK Citra Negara</p>
        </div>
      </div>
    </div>
  );
}
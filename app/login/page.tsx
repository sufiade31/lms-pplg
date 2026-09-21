'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const emailVal = email.trim().toLowerCase();
    const passVal = password.trim();

    if (emailVal === 'admin' && passVal === 'admin123') {
      router.push('/admin');
    } else if (emailVal === 'upil' && passVal === '123') {
      router.push('/siswa');
    }  else if (emailVal === 'budiono' && passVal === '123') {
      router.push('/guru');
      setError('Email atau password salah.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F8F6] px-4 py-8">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
        {/* SISI KIRI - ILUSTRASI */}
        <div className="relative hidden overflow-hidden md:block">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 400 520"
            preserveAspectRatio="xMidYMax slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#134E4A" />
                <stop offset="100%" stopColor="#0D9488" />
              </linearGradient>
              <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
              <linearGradient id="roof" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#134E4A" />
                <stop offset="100%" stopColor="#0B3B37" />
              </linearGradient>
            </defs>

            <rect width="400" height="520" fill="url(#sky)" />

            <circle cx="335" cy="70" r="34" fill="#FDE68A" opacity="0.9" />
            <circle cx="335" cy="70" r="50" fill="#FDE68A" opacity="0.15" />

            <g opacity="0.25" fill="#FFFFFF">
              <ellipse cx="70" cy="60" rx="30" ry="12" />
              <ellipse cx="95" cy="55" rx="22" ry="10" />
              <ellipse cx="45" cy="55" rx="18" ry="9" />
            </g>

            <g>
              <rect x="34" y="270" width="8" height="46" fill="#78350F" />
              <circle cx="38" cy="255" r="26" fill="#15803D" />
              <circle cx="24" cy="268" r="18" fill="#16A34A" />
              <circle cx="52" cy="268" r="18" fill="#16A34A" />
            </g>
            <g>
              <rect x="358" y="278" width="8" height="42" fill="#78350F" />
              <circle cx="362" cy="264" r="22" fill="#15803D" />
              <circle cx="350" cy="274" r="15" fill="#16A34A" />
              <circle cx="374" cy="274" r="15" fill="#16A34A" />
            </g>

            <polygon points="90,150 310,150 200,90" fill="url(#roof)" />
            <rect x="95" y="146" width="210" height="10" rx="2" fill="#0B3B37" />

            <rect x="100" y="156" width="200" height="150" fill="#F8FAFC" />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <rect key={i} x={112 + i * 32} y="168" width="14" height="128" fill="#E2E8F0" />
            ))}

            {[0, 1, 2, 3, 4].map((i) => (
              <rect
                key={i}
                x={134 + i * 32}
                y="190"
                width="10"
                height="70"
                rx="2"
                fill="#5EEAD4"
                opacity={i % 2 === 0 ? 0.95 : 0.7}
              />
            ))}

            <rect x="170" y="306" width="60" height="8" fill="#CBD5E1" />
            <rect x="160" y="314" width="80" height="8" fill="#94A3B8" />
            <rect x="150" y="322" width="100" height="8" fill="#64748B" />

            <line x1="200" y1="90" x2="200" y2="55" stroke="#F8FAFC" strokeWidth="3" />
            <polygon points="200,55 200,68 224,61" fill="#FBBF24" />

            <polygon points="0,330 400,330 400,520 0,520" fill="url(#ground)" />
            <polygon points="0,330 400,330 400,346 0,346" fill="#78350F" opacity="0.25" />

            <g stroke="#FEF3C7" strokeWidth="3" fill="none" opacity="0.85">
              <line x1="200" y1="330" x2="200" y2="520" />
              <ellipse cx="200" cy="420" rx="42" ry="30" />
              <polygon points="40,340 100,340 84,470 24,470" />
              <polygon points="360,340 300,340 316,470 376,470" />
            </g>
          </svg>

          <div className="absolute bottom-5 left-6 right-6 text-white/90">
            <p className="text-xs font-semibold uppercase tracking-widest">SMK Citra Negara</p>
            <p className="text-[11px] text-white/70">Belajar, Berkarya, Berprestasi</p>
          </div>
        </div>

        {/* SISI KANAN - FORM LOGIN */}
        <div className="bg-white p-8 md:p-12">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0D9488]/10 p-1.5">
              <img src="/logo-smk.png" alt="Logo SMK Citra Negara" className="h-full w-full object-contain" />
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
                placeholder="Masukkan email atau username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-black outline-none transition-colors focus:border-[#0D9488] focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-black">Password</label>
              <input
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-black outline-none transition-colors focus:border-[#0D9488] focus:bg-white"
              />
            </div>

            {error && (
              <p className="text-xs font-medium text-red-500">{error}</p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-[#0D9488] px-4 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
            >
              Login
            </button>
          </form>

          <p className="mt-8 text-center text-[11px] text-[#9CA3AF]">
            © 2026 SMK Citra Negara
          </p>
        </div>
      </div>
    </div>
  );
}
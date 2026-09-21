import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F8F6] p-4 md:p-8">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-[28px] bg-[#0D9488] text-white shadow-xl">
        <div className="absolute top-6 right-6 md:top-8 md:right-8 h-12 w-12 md:h-14 md:w-14 rounded-full bg-white/15 p-1.5">
          <img src="/logo-smk.png" alt="Logo SMK Citra Negara" className="h-full w-full object-contain" />
        </div>

        <div className="relative px-6 py-12 md:px-14 md:py-16">
          <div className="max-w-lg">
            <p className="text-xs md:text-sm font-semibold uppercase tracking-widest text-white/70">
              Learning Management System
            </p>
            <h1 className="mt-3 text-3xl md:text-4xl font-bold italic leading-tight">
              Belajar jadi lebih rapi, satu ruang untuk semuanya.
            </h1>
            <p className="mt-2 text-sm text-white/60">SMK Citra Negara</p>

            <p className="mt-6 text-sm leading-relaxed text-white/85">
              LMS adalah sebuah aplikasi web atau platform digital yang berfungsi seperti
              &ldquo;sekolah atau kampus virtual&rdquo;. Semua proses belajar-mengajar yang
              biasanya dilakukan tatap muka, dipindahkan dan dikelola di dalam sistem ini
              secara otomatis.
            </p>

            <Link
              href="/login"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0D9488] transition-transform hover:scale-[1.03]"
            >
              Lanjut Belajar
              <span>→</span>
            </Link>
          </div>

          {/* Ilustrasi orang belajar pakai laptop */}
          <svg
            className="pointer-events-none absolute bottom-0 right-2 hidden h-64 w-64 md:block lg:h-72 lg:w-72"
            viewBox="0 0 300 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse cx="150" cy="270" rx="110" ry="14" fill="rgba(0,0,0,0.08)" />
            <rect x="30" y="210" width="70" height="14" rx="3" fill="#FFFFFF" opacity="0.9" />
            <rect x="35" y="196" width="60" height="14" rx="3" fill="#FDE68A" />
            <rect x="30" y="182" width="70" height="14" rx="3" fill="#FFFFFF" opacity="0.9" />
            <path d="M110 190 L120 230 L150 230 L158 190 Z" fill="#0F766E" />
            <path d="M118 190 Q134 150 150 190" stroke="#34D399" strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M124 190 Q134 160 144 190" stroke="#34D399" strokeWidth="6" fill="none" strokeLinecap="round" />
            <rect x="90" y="230" width="160" height="10" rx="3" fill="#0B4A44" />
            <rect x="150" y="196" width="70" height="44" rx="4" fill="#F9FAFB" />
            <rect x="156" y="202" width="58" height="30" rx="2" fill="#0D9488" />
            <rect x="150" y="240" width="70" height="6" rx="2" fill="#E5E7EB" />
            <circle cx="205" cy="150" r="20" fill="#FBCFE8" />
            <path d="M185 150 Q205 130 225 150" fill="#1F2937" />
            <path d="M180 230 Q182 185 205 178 Q228 185 230 230 Z" fill="#3B82F6" />
            <rect x="195" y="200" width="20" height="34" rx="6" fill="#F472B6" />
          </svg>
        </div>
      </div>
    </div>
  );
}
import { fotoSekolah, logoSekolah, ilustrasiBelajar } from "./assets";
export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      {/* Latar: foto sekolah layar penuh */}
      <img src={fotoSekolah} alt="Gedung SMK Citra Negara" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B4A44]/90 via-[#0B4A44]/70 to-[#0B4A44]/25"></div>

      {/* Logo */}
      <div className="absolute right-6 top-6 z-10 h-12 w-12 rounded-full bg-white/90 p-1.5 shadow-lg md:right-10 md:top-8 md:h-14 md:w-14">
        <img src={logoSekolah} alt="Logo SMK Citra Negara" className="h-full w-full object-contain" />
      </div>

      <main className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-24 md:grid-cols-2 md:px-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/75 md:text-sm">Learning Management System</p>
          <h1 className="mt-3 text-3xl font-bold italic leading-tight md:text-5xl">Belajar jadi lebih rapi, satu ruang untuk semuanya.</h1>
          <p className="mt-3 text-sm text-white/70">SMK Citra Negara</p>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-white/90">
            LMS adalah sebuah aplikasi web atau platform digital yang berfungsi seperti
            “sekolah atau kampus virtual”. Semua proses belajar-mengajar yang
            biasanya dilakukan tatap muka, dipindahkan dan dikelola di dalam sistem ini
            secara otomatis.
          </p>
          <a href="/login" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#0D9488] shadow-lg transition-transform hover:scale-[1.03]">
            Lanjut Belajar <span>→</span>
          </a>
        </div>

        <div className="overflow-hidden rounded-3xl shadow-2xl ring-4 ring-white/30">
          <img src={ilustrasiBelajar} alt="Ilustrasi belajar dengan laptop" className="block h-full w-full object-cover" />
        </div>
      </main>
    </div>
  );
}
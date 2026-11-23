import Link from 'next/link';

// ====== Ganti data sekolah di sini ======
const SEKOLAH = {
  nama: 'SMK Citra Negara',
  alamat: 'Isi alamat sekolah di sini',
  telepon: 'Isi nomor telepon',
  email: 'Isi email sekolah',
  jamLayanan: 'Senin - Jumat, 07.00 - 15.00 WIB',
};

const JURUSAN = [
  {
    kode: 'PPLG',
    nama: 'Pengembangan Perangkat Lunak dan Gim',
    isi: 'Belajar menulis program, merancang basis data, membangun situs web, dan membuat gim lewat proyek nyata.',
    bidang: ['Pemrograman web', 'Basis data', 'Aplikasi dan gim'],
  },
  {
    kode: 'TJKT',
    nama: 'Teknik Jaringan Komputer dan Telekomunikasi',
    isi: 'Belajar membangun jaringan, mengelola server, dan merawat perangkat komputer serta telekomunikasi.',
    bidang: ['Jaringan komputer', 'Administrasi server', 'Telekomunikasi'],
  },
  {
    kode: 'MPLB',
    nama: 'Manajemen Perkantoran dan Layanan Bisnis',
    isi: 'Belajar mengelola administrasi kantor, kearsipan, korespondensi, dan melayani pelanggan.',
    bidang: ['Administrasi', 'Kearsipan', 'Layanan pelanggan'],
  },
  {
    kode: 'Perhotelan',
    nama: 'Perhotelan',
    isi: 'Belajar melayani tamu, mengelola kamar, dan menyiapkan hidangan sesuai standar industri hotel.',
    bidang: ['Layanan tamu', 'Tata graha', 'Tata hidangan'],
  },
  {
    kode: 'Pemasaran',
    nama: 'Pemasaran',
    isi: 'Belajar memasarkan produk, berjualan secara langsung dan online, serta mengelola usaha.',
    bidang: ['Penjualan', 'Pemasaran digital', 'Kewirausahaan'],
  },
];

const FITUR = [
  ['Materi', 'Guru mengunggah materi, siswa membaca atau mengunduhnya kapan saja.'],
  ['Tugas', 'Tugas dari guru langsung muncul di kelas yang dituju. Siswa mengumpulkan file dari rumah.'],
  ['Assessment', 'Kuis dan ulangan harian dikerjakan online dengan batas waktu. Pilihan ganda dinilai otomatis.'],
  ['Nilai', 'Nilai tugas, kuis, dan ulangan harian terkumpul per mata pelajaran.'],
  ['Pengumuman', 'Kabar dari sekolah sampai ke guru dan siswa tanpa lewat grup percakapan.'],
];

const PERAN = [
  ['Siswa', 'Lihat tugas dan tenggatnya, unggah jawaban, kerjakan kuis, lalu cek nilai.'],
  ['Guru', 'Buat materi, tugas, dan kuis. Periksa file siswa, beri nilai dan komentar.'],
  ['Admin', 'Kelola data guru, siswa, dan kelas, serta menerbitkan pengumuman sekolah.'],
];

const css = `
:root{
  --hijau-900:#08332F; --hijau-800:#0B4A44; --hijau-600:#14796C; --hijau-100:#DDEFEA; --hijau-50:#EFF7F4;
  --emas:#E9B93B; --ink:#0F1F1D; --ink-soft:#4A5E5A; --garis:#C9DAD5; --putih:#FFFFFF;
  --judul:"Bahnschrift SemiCondensed","Bahnschrift","Arial Narrow",system-ui,sans-serif;
  --isi:"Segoe UI Variable Text","Segoe UI",system-ui,-apple-system,Roboto,sans-serif;
}
*{box-sizing:border-box;}
html{scroll-behavior:smooth;}
body{margin:0;font-family:var(--isi);color:var(--ink);background:var(--putih);line-height:1.65;-webkit-font-smoothing:antialiased;}
a{color:inherit;}
:focus-visible{outline:3px solid var(--emas);outline-offset:3px;border-radius:4px;}
.wrap{width:min(1120px,100% - 40px);margin-inline:auto;}
h1,h2,h3{font-family:var(--judul);margin:0;letter-spacing:-0.01em;line-height:1.08;}

/* Navigasi */
.nav{position:sticky;top:0;z-index:20;background:rgba(255,255,255,0.94);backdrop-filter:blur(8px);border-bottom:1px solid var(--garis);}
.nav .wrap{display:flex;align-items:center;gap:28px;height:68px;}
.merek{display:flex;align-items:center;gap:12px;text-decoration:none;font-family:var(--judul);font-weight:700;font-size:19px;color:var(--hijau-800);}
.merek img{width:38px;height:38px;object-fit:contain;}
.nav-link{margin-left:auto;display:flex;gap:26px;font-size:14.5px;}
.nav-link a{text-decoration:none;color:var(--ink-soft);}
.nav-link a:hover{color:var(--hijau-800);}
.btn{display:inline-flex;align-items:center;justify-content:center;padding:11px 22px;border-radius:8px;font-weight:600;font-size:15px;text-decoration:none;border:2px solid transparent;transition:background .15s,color .15s,border-color .15s;}
.btn-utama{background:var(--hijau-800);color:#fff;}
.btn-utama:hover{background:var(--hijau-600);}
.btn-garis{border-color:var(--hijau-800);color:var(--hijau-800);}
.btn-garis:hover{background:var(--hijau-100);}
.btn-emas{background:var(--emas);color:var(--hijau-900);}
.btn-emas:hover{background:#F3CB60;}
.nav .btn{padding:9px 18px;font-size:14.5px;}

/* Hero */
.hero{background:var(--hijau-50);border-bottom:1px solid var(--garis);position:relative;overflow:hidden;}
.hero::before{content:"";position:absolute;inset:0;background-image:linear-gradient(var(--hijau-100) 1px,transparent 1px),linear-gradient(90deg,var(--hijau-100) 1px,transparent 1px);background-size:44px 44px;opacity:.7;mask-image:linear-gradient(90deg,transparent 0%,#000 55%);-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 55%);}
.hero .wrap{position:relative;display:grid;grid-template-columns:1.05fr 1fr;gap:56px;align-items:center;padding:84px 0 92px;}
.hero h1{font-size:clamp(40px,6vw,68px);font-weight:700;color:var(--hijau-900);max-width:12ch;}
.hero p.lead{font-size:18px;color:var(--ink-soft);max-width:46ch;margin:22px 0 30px;}
.aksi{display:flex;gap:12px;flex-wrap:wrap;}

/* Tiruan dashboard siswa */
.layar{background:var(--putih);border:1px solid var(--garis);border-radius:14px;box-shadow:0 30px 60px -28px rgba(8,51,47,.45);overflow:hidden;}
.layar-atas{display:flex;align-items:center;gap:7px;padding:11px 14px;background:var(--hijau-800);}
.layar-atas i{width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,.35);display:block;}
.layar-atas span{margin-left:8px;color:#CFE8E2;font-size:12px;}
.layar-isi{display:grid;grid-template-columns:128px 1fr;}
.layar-menu{background:var(--hijau-900);padding:14px 10px;display:flex;flex-direction:column;gap:4px;}
.layar-menu div{color:#A9CFC7;font-size:12.5px;padding:7px 10px;border-radius:6px;}
.layar-menu .aktif{background:var(--hijau-600);color:#fff;font-weight:600;}
.layar-utama{padding:16px 16px 18px;}
.layar-utama h4{margin:0 0 10px;font-family:var(--judul);font-size:17px;color:var(--hijau-900);}
.baris{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 0;border-top:1px solid var(--hijau-100);}
.baris b{display:block;font-size:13.5px;}
.baris small{color:var(--ink-soft);font-size:12px;}
.pil{font-size:11.5px;font-weight:600;padding:3px 10px;border-radius:99px;white-space:nowrap;}
.pil-belum{background:#FBE3D8;color:#9A3A14;}
.pil-sudah{background:var(--hijau-100);color:var(--hijau-800);}

/* Bagian umum */
section.bagian{padding:88px 0;}
.bagian h2{font-size:clamp(30px,4vw,44px);color:var(--hijau-900);max-width:20ch;}
.bagian .pengantar{color:var(--ink-soft);font-size:17px;max-width:56ch;margin:14px 0 0;}

/* Jurusan: grid 6 kolom, dua panel besar di atas, tiga panel di bawah */
.jurusan{display:grid;grid-template-columns:repeat(6,1fr);margin-top:44px;border-radius:16px;overflow:hidden;border:1px solid var(--garis);}
.panel{grid-column:span 2;padding:34px 30px 38px;border-top:1px solid var(--garis);}
.panel:nth-child(-n+2){grid-column:span 3;border-top:0;padding:40px 36px 44px;}
.panel:nth-child(n+4){border-left:1px solid var(--garis);}
.panel .kode{font-family:var(--judul);font-weight:700;line-height:1;font-size:40px;margin-bottom:12px;}
.panel:nth-child(-n+2) .kode{font-size:64px;}
.panel h3{font-size:20px;margin:0 0 10px;}
.panel p{margin:0 0 16px;max-width:44ch;}
.panel ul{margin:0;padding:0;list-style:none;display:flex;gap:8px;flex-wrap:wrap;}
.panel li{font-size:13px;padding:4px 11px;border-radius:99px;background:var(--hijau-100);color:var(--hijau-800);}
.panel .kode{color:var(--hijau-600);}
.panel.gelap{background:var(--hijau-800);color:#E2F2EE;border-top:0;}
.panel.gelap .kode{color:var(--emas);}
.panel.gelap li{background:rgba(255,255,255,.12);color:#E2F2EE;}
.panel.terang{background:var(--hijau-50);}

/* Fitur: daftar baris, bukan kartu */
.fitur{margin-top:40px;border-top:2px solid var(--hijau-800);}
.fitur div{display:grid;grid-template-columns:220px 1fr;gap:24px;padding:22px 0;border-bottom:1px solid var(--garis);}
.fitur h3{font-size:26px;color:var(--hijau-800);}
.fitur p{margin:0;color:var(--ink-soft);max-width:60ch;}

/* Peran */
.peran-bg{background:var(--hijau-50);border-block:1px solid var(--garis);}
.peran{display:grid;grid-template-columns:repeat(3,1fr);margin-top:40px;}
.peran div{padding:4px 32px 4px 0;}
.peran div + div{padding-left:32px;border-left:1px solid var(--garis);}
.peran h3{font-size:28px;color:var(--hijau-800);margin-bottom:10px;}
.peran p{margin:0;color:var(--ink-soft);}

/* Penutup */
.penutup{background:var(--hijau-900);color:#E2F2EE;padding:76px 0;}
.penutup .wrap{display:flex;align-items:center;justify-content:space-between;gap:32px;flex-wrap:wrap;}
.penutup h2{color:#fff;font-size:clamp(28px,4vw,40px);max-width:22ch;}
.penutup p{margin:12px 0 0;color:#B7D8D0;max-width:48ch;}

/* Kontak */
.kontak{display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:40px;padding:56px 0 40px;}
.kontak h3{font-size:18px;color:var(--hijau-800);margin-bottom:10px;}
.kontak p{margin:0 0 4px;color:var(--ink-soft);font-size:15px;}
.kaki{border-top:1px solid var(--garis);padding:18px 0 26px;color:var(--ink-soft);font-size:13.5px;}

@media (max-width:900px){
  .hero .wrap{grid-template-columns:1fr;padding:56px 0 64px;gap:44px;}
  .jurusan{grid-template-columns:1fr;}
  .panel,.panel:nth-child(-n+2){grid-column:auto;}
  .panel:nth-child(n+4){border-left:0;}
  .panel:nth-child(2){border-top:1px solid var(--garis);}
  .peran{grid-template-columns:1fr;gap:28px;}
  .peran div,.peran div + div{padding:0;border:0;}
  .peran div + div{border-top:1px solid var(--garis);padding-top:24px;}
  .kontak{grid-template-columns:1fr;gap:24px;}
}
@media (max-width:720px){
  .nav-link{display:none;}
  .nav .btn{margin-left:auto;}
  .fitur div{grid-template-columns:1fr;gap:6px;}
  section.bagian{padding:60px 0;}
  .layar-isi{grid-template-columns:1fr;}
  .layar-menu{display:none;}
  .panel{padding:30px 24px 34px;}
}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto;} .btn{transition:none;}}
`;

export const metadata = {
  title: `${SEKOLAH.nama} - Sistem Manajemen Pembelajaran`,
  description: `Belajar, mengumpulkan tugas, dan melihat nilai secara online di ${SEKOLAH.nama}.`,
};

export default function BerandaSekolah() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <header className="nav">
        <div className="wrap">
          <a className="merek" href="#atas">
            <img src="/logo-smk.png" alt="" />
            {SEKOLAH.nama}
          </a>
          <nav className="nav-link" aria-label="Menu utama">
            <a href="#jurusan">Jurusan</a>
            <a href="#fitur">Fitur belajar</a>
            <a href="#peran">Untuk siapa</a>
            <a href="#kontak">Kontak</a>
          </nav>
          <Link className="btn btn-utama" href="/login">Masuk</Link>
        </div>
      </header>

      <main id="atas">
        <div className="hero">
          <div className="wrap">
            <div>
              <h1>Belajar dan mengumpulkan tugas dari mana saja</h1>
              <p className="lead">
                Sistem pembelajaran online {SEKOLAH.nama}. Siswa melihat materi dan tugas dari guru, mengunggah jawaban, mengerjakan kuis, lalu mengecek nilai di satu tempat.
              </p>
              <div className="aksi">
                <Link className="btn btn-utama" href="/login">Masuk ke LMS</Link>
                <a className="btn btn-garis" href="#jurusan">Kenali jurusan kami</a>
              </div>
            </div>

            <div className="layar" aria-hidden="true">
              <div className="layar-atas"><i /><i /><i /><span>Dashboard siswa</span></div>
              <div className="layar-isi">
                <div className="layar-menu">
                  <div>Beranda</div><div>Materi</div><div>Assessment</div><div className="aktif">Tugas</div><div>Nilai</div>
                </div>
                <div className="layar-utama">
                  <h4>Tugas</h4>
                  <div className="baris"><div><b>Membuat ERD Toko Online</b><small>Basis Data, tenggat 30 Des</small></div><span className="pil pil-belum">Belum dikumpulkan</span></div>
                  <div className="baris"><div><b>Layout dengan Flexbox</b><small>Pemrograman Web, tenggat 22 Des</small></div><span className="pil pil-sudah">Sudah dikumpulkan</span></div>
                  <div className="baris"><div><b>Konfigurasi Router</b><small>Jaringan Dasar, tenggat 18 Des</small></div><span className="pil pil-sudah">Nilai 88</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="bagian wrap" id="jurusan">
          <h2>Lima jurusan, satu sistem belajar</h2>
          <p className="pengantar">Kelas disusun per jurusan. Materi, tugas, dan kuis dari guru otomatis sampai ke kelas yang tepat.</p>
          <div className="jurusan">
            {JURUSAN.map((j, i) => (
              <div className={`panel${i === 0 ? ' gelap' : i === 1 ? ' terang' : ''}`} key={j.kode}>
                <div className="kode">{j.kode}</div>
                {j.nama !== j.kode && <h3>{j.nama}</h3>}
                <p>{j.isi}</p>
                <ul>{j.bidang.map((b) => <li key={b}>{b}</li>)}</ul>
              </div>
            ))}
          </div>
        </section>

        <div className="peran-bg">
          <section className="bagian wrap" id="fitur">
            <h2>Semua yang dipakai belajar ada di LMS</h2>
            <div className="fitur">
              {FITUR.map(([judul, isi]) => (
                <div key={judul}><h3>{judul}</h3><p>{isi}</p></div>
              ))}
            </div>
          </section>
        </div>

        <section className="bagian wrap" id="peran">
          <h2>Satu sistem untuk siswa, guru, dan admin</h2>
          <div className="peran">
            {PERAN.map(([judul, isi]) => (
              <div key={judul}><h3>{judul}</h3><p>{isi}</p></div>
            ))}
          </div>
        </section>

        <div className="penutup">
          <div className="wrap">
            <div>
              <h2>Sudah punya akun? Masuk dan lihat tugasmu hari ini.</h2>
              <p>Lupa kata sandi atau belum punya akun? Hubungi admin sekolah.</p>
            </div>
            <Link className="btn btn-emas" href="/login">Masuk ke LMS</Link>
          </div>
        </div>
      </main>

      <footer className="wrap" id="kontak">
        <div className="kontak">
          <div>
            <h3>{SEKOLAH.nama}</h3>
            <p>{SEKOLAH.alamat}</p>
          </div>
          <div>
            <h3>Hubungi sekolah</h3>
            <p>{SEKOLAH.telepon}</p>
            <p>{SEKOLAH.email}</p>
          </div>
          <div>
            <h3>Jam layanan</h3>
            <p>{SEKOLAH.jamLayanan}</p>
          </div>
        </div>
        <div className="kaki">&copy; {new Date().getFullYear()} {SEKOLAH.nama}. Sistem Manajemen Pembelajaran.</div>
      </footer>
    </>
  );
}
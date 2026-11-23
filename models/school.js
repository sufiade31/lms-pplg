import mongoose from 'mongoose';

const opts = {
  timestamps: true,
  toJSON: {
    versionKey: false,
    transform: (_, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.createdAt;
      delete ret.updatedAt;
    },
  },
};

const Guru = new mongoose.Schema({
  nama: { type: String, required: true },
  nip: { type: String, required: true },
  mapel: { type: String, required: true },
  kontak: { type: String, required: true },
  status: { type: String, enum: ['Aktif', 'Cuti'], default: 'Aktif' },
}, opts);

const Siswa = new mongoose.Schema({
  nama: { type: String, required: true },
  nis: { type: String, required: true },
  kelas: { type: String, required: true },
  gender: { type: String, enum: ['Laki-laki', 'Perempuan'], default: 'Laki-laki' },
  status: { type: String, enum: ['Aktif', 'Pindah'], default: 'Aktif' },
}, opts);

const Kelas = new mongoose.Schema({
  nama: { type: String, required: true },
  wali: { type: String, required: true },
  jumlah: { type: Number, default: 0 },
  tingkat: { type: String, required: true },
}, opts);

const Pengumuman = new mongoose.Schema({
  judul: { type: String, required: true },
  isi: { type: String, required: true },
  tanggal: { type: String },
  target: { type: String, default: 'Semua' },
  status: { type: String, enum: ['Draf', 'Terbit'], default: 'Draf' },
}, opts);

// Tugas yang dibuat guru. kelas = nama kelas (mis. "XII RPL 1") atau "Semua".
const Tugas = new mongoose.Schema({
  judul: { type: String, required: true },
  mapel: { type: String, required: true },
  kelas: { type: String, required: true, default: 'Semua' },
  guru: { type: String, required: true },
  deadline: { type: Date, required: true },
  jenis: { type: String, enum: ['PDF', 'Catatan'], default: 'Catatan' },
  lampiran: { type: String, default: '' },
  instruksi: { type: [String], default: [] },
}, opts);

// Satu baris = satu siswa mengumpulkan satu tugas.
// Siswa yang belum punya baris di sini berarti statusnya "Belum Dikumpulkan".
const Pengumpulan = new mongoose.Schema({
  tugasId: { type: String, required: true },
  siswaId: { type: String, required: true },
  siswaNama: { type: String, default: '' },
  namaFile: { type: String, default: '' },
  catatan: { type: String, default: '' },
  dikumpulkanPada: { type: Date, default: Date.now },
  nilai: { type: Number, default: null },
  fileId: { type: String, default: '' },     // id file di koleksi berkas
  komentar: { type: String, default: '' },   // komentar guru
}, opts);
Pengumpulan.index({ tugasId: 1, siswaId: 1 }, { unique: true });

// Isi file yang diunggah siswa (disimpan langsung di MongoDB, maks 8 MB per file)
const Berkas = new mongoose.Schema({
  nama: { type: String, default: '' },
  tipe: { type: String, default: 'application/octet-stream' },
  ukuran: { type: Number, default: 0 },
  data: { type: Buffer, required: true },
}, { timestamps: true });

// Materi dari guru (file disimpan di koleksi berkas)
const Materi = new mongoose.Schema({
  judul: { type: String, required: true },
  mapel: { type: String, required: true },
  kelas: { type: String, required: true, default: 'Semua' },
  guru: { type: String, required: true },
  catatan: { type: String, default: '' },
  fileId: { type: String, default: '' },
  namaFile: { type: String, default: '' },
  tanggal: { type: Date, default: Date.now },
}, opts);

// Kuis / ulangan harian buatan guru
const Assessment = new mongoose.Schema({
  judul: { type: String, required: true },
  mapel: { type: String, required: true },
  kelas: { type: String, required: true, default: 'Semua' },
  guru: { type: String, required: true },
  tipe: { type: String, enum: ['Kuis', 'Ulangan Harian'], default: 'Kuis' },
  durasi: { type: Number, default: 30 },
  deadlineDate: { type: String, default: '' },
  jumlahSoal: { type: Number, default: 0 },
  totalPoin: { type: Number, default: 0 },
  soal: { type: [mongoose.Schema.Types.Mixed], default: [] },
}, opts);

// Hasil pengerjaan assessment oleh siswa (satu siswa satu kali)
const Hasil = new mongoose.Schema({
  assessmentId: { type: String, required: true },
  siswaId: { type: String, required: true },
  siswaNama: { type: String, default: '' },
  jawaban: { type: [mongoose.Schema.Types.Mixed], default: [] },
  nilai: { type: Number, default: null },
  perluDinilai: { type: Boolean, default: false },
  selesaiPada: { type: Date, default: Date.now },
}, opts);
Hasil.index({ assessmentId: 1, siswaId: 1 }, { unique: true });

// Nilai yang diisi guru per siswa per mapel (kosong = pakai nilai otomatis)
const NilaiGuru = new mongoose.Schema({
  siswaId: { type: String, required: true },
  siswaNama: { type: String, default: '' },
  kelas: { type: String, default: '' },
  mapel: { type: String, required: true },
  guru: { type: String, default: '' },
  tugas: { type: Number, default: null },
  kuis: { type: Number, default: null },
  uh: { type: Number, default: null },
}, opts);
NilaiGuru.index({ siswaId: 1, mapel: 1 }, { unique: true });

// Permintaan reset password dari halaman login (hanya dibaca lewat route admin)
const ResetPw = new mongoose.Schema({
  email: { type: String, required: true },
  nama: { type: String, default: '' },
  role: { type: String, default: '' },
  status: { type: String, enum: ['Menunggu'], default: 'Menunggu' },
  diminta: { type: Date, default: Date.now },
}, opts);

// Jadwal pelajaran per kelas (diisi oleh kurikulum)
const Jadwal = new mongoose.Schema({
  kelas: { type: String, required: true },
  hari: { type: String, required: true },
  jam: { type: String, required: true },
  mapel: { type: String, required: true },
  guru: { type: String, required: true },
}, opts);

const m = mongoose.models;

export const BerkasModel = m.Berkas || mongoose.model('Berkas', Berkas);
export const ResetPwModel = m.ResetPw || mongoose.model('ResetPw', ResetPw);

export const MODELS = {
  guru: m.Guru || mongoose.model('Guru', Guru),
  siswa: m.Siswa || mongoose.model('Siswa', Siswa),
  kelas: m.Kelas || mongoose.model('Kelas', Kelas),
  pengumuman: m.Pengumuman || mongoose.model('Pengumuman', Pengumuman),
  tugas: m.Tugas || mongoose.model('Tugas', Tugas),
  pengumpulan: m.Pengumpulan || mongoose.model('Pengumpulan', Pengumpulan),
  materi: m.Materi || mongoose.model('Materi', Materi),
  assessment: m.Assessment || mongoose.model('Assessment', Assessment),
  hasil: m.Hasil || mongoose.model('Hasil', Hasil),
  nilai: m.NilaiGuru || mongoose.model('NilaiGuru', NilaiGuru),
  jadwal: m.Jadwal || mongoose.model('Jadwal', Jadwal),
};
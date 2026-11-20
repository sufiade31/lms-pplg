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
}, opts);
Pengumpulan.index({ tugasId: 1, siswaId: 1 }, { unique: true });

const m = mongoose.models;

export const MODELS = {
  guru: m.Guru || mongoose.model('Guru', Guru),
  siswa: m.Siswa || mongoose.model('Siswa', Siswa),
  kelas: m.Kelas || mongoose.model('Kelas', Kelas),
  pengumuman: m.Pengumuman || mongoose.model('Pengumuman', Pengumuman),
  tugas: m.Tugas || mongoose.model('Tugas', Tugas),
  pengumpulan: m.Pengumpulan || mongoose.model('Pengumpulan', Pengumpulan),
};
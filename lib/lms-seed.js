import LmsDoc from '../models/LmsDoc';

export const AWAL = {
  tugas: [
    {id:'seed-erd', createdAt:1000000000002, judul:'Membuat ERD Toko Online', mapel:'Basis Data', kelas:'XII PPLG 2', jenis:'PDF', deadlineDate:'2026-09-09', deadlineTime:'', fileName:'Lembar_Tugas_ERD.pdf',
     catatan:'Buat ERD untuk sistem toko online dengan minimal 5 entitas (pelanggan, produk, pesanan, detail pesanan, pembayaran).\nCantumkan atribut, primary key, serta relasi beserta kardinalitasnya.\nKumpulkan dalam format PDF atau foto yang jelas dan terbaca.'},
    {id:'seed-query', createdAt:1000000000001, judul:'Latihan Query Dasar', mapel:'Basis Data', kelas:'XII PPLG 2', jenis:'Catatan', deadlineDate:'2026-09-05', deadlineTime:'', fileName:'',
     catatan:'Kerjakan latihan query dasar (SELECT, WHERE, ORDER BY) pada tabel siswa.\nKumpulkan hasil query beserta screenshot outputnya.'},
  ],
  pengumpulan: [
    {id:'seed-erd_2425001', tugasId:'seed-erd', nis:'2425001', nama:'Muhammad Rizky', fileName:'', waktu:'8 Sep 2026, 20:14'},
    {id:'seed-erd_2425002', tugasId:'seed-erd', nis:'2425002', nama:'Anisa Putri', fileName:'', waktu:'7 Sep 2026, 19:02'},
    {id:'seed-query_2425001', tugasId:'seed-query', nis:'2425001', nama:'Muhammad Rizky', fileName:'', waktu:'4 Sep 2026, 08:40'},
    {id:'seed-query_2425010', tugasId:'seed-query', nis:'2425010', nama:'Upil (Muhammad Upil)', fileName:'', waktu:'4 Sep 2026, 21:10'},
    {id:'seed-query_2425058', tugasId:'seed-query', nis:'2425058', nama:'Salsabila Zahra', fileName:'', waktu:'5 Sep 2026, 10:00'},
  ],
  assessment: [
    {id:'seed-kuis', createdAt:1000000000003, judul:'Kuis Normalisasi Data', mapel:'Basis Data', kelas:'XII PPLG 2', tipe:'Kuis', jumlahSoal:2, totalPoin:20, durasi:30, deadlineDate:'2026-09-08', deadlineTime:'',
     soal:[
       {tipe:'pg', poin:10, tanya:'Apa tujuan utama normalisasi basis data?', opsi:['Mengurangi redundansi data','Mempercepat koneksi internet','Memperbesar ukuran tabel','Menghapus primary key'], benar:0},
       {tipe:'esai', poin:10, tanya:'Jelaskan perbedaan 1NF dan 2NF beserta contohnya.', opsi:[], benar:-1},
     ]},
  ],
  hasil: [],
  nilai: [{id:'2425010', nis:'2425010', tugas:85, kuis:80, uh:''}],
};

export const BOLEH = Object.keys(AWAL);

export async function pastikanSeed() {
  if ((await LmsDoc.estimatedDocumentCount()) > 0) return;
  const docs = [];
  for (const [koleksi, list] of Object.entries(AWAL)) {
    for (const { id, ...data } of list) docs.push({ koleksi, docId: id, data });
  }
  if (docs.length) await LmsDoc.insertMany(docs, { ordered: false }).catch(() => {});
}
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { MODELS } from '@/models/school';

const ROLE = ['admin', 'guru', 'siswa', 'murid', 'kepsek', 'kurikulum'];

// Semua aksi hanya untuk admin: admin menyertakan email dan password-nya sendiri.
async function cekAdmin(email, password) {
  const admin = await User.findOne({ email: String(email || '').trim().toLowerCase() });
  if (!admin || admin.role !== 'admin') return null;
  if (!(await admin.matchPassword(String(password || '')))) return null;
  return admin;
}

// Kelas siswa disimpan di data siswa (dicocokkan lewat nama), karena dashboard siswa membacanya dari sana.
const esc = (t) => String(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
async function simpanKelas(nama, kelas) {
  if (!kelas) return;
  const Siswa = MODELS.siswa;
  const ada = await Siswa.findOne({ nama: new RegExp('^' + esc(nama) + '$', 'i') });
  if (ada) { ada.kelas = kelas; await ada.save(); }
  else await Siswa.create({ nama, nis: '-', kelas });
}

const ringkas = (u) => ({ id: String(u._id), nama: u.nama, email: u.email, role: u.role });

// POST /api/akun
//   { adminEmail, adminPassword, aksi: 'daftar' }
//   { adminEmail, adminPassword, aksi: 'buat', nama, email, password, role, kelas }   (kelas khusus siswa)
//   { adminEmail, adminPassword, aksi: 'ubah', id, nama, email, role, password, kelas }   (password kosong = tidak diubah)
//   { adminEmail, adminPassword, aksi: 'hapus', id }
export async function POST(request) {
  try {
    await connectDB();
    const b = await request.json();
    const admin = await cekAdmin(b.adminEmail, b.adminPassword);
    if (!admin) return Response.json({ error: 'Email atau password admin salah.' }, { status: 401 });

    if (b.aksi === 'daftar') {
      const semua = await User.find({}).sort({ role: 1, nama: 1 });
      return Response.json(semua.map(ringkas));
    }

    if (b.aksi === 'buat') {
      const nama = String(b.nama || '').trim();
      const email = String(b.email || '').trim().toLowerCase();
      const password = String(b.password || '');
      const role = String(b.role || '') === 'murid' ? 'siswa' : String(b.role || '');
      if (!nama || !email) return Response.json({ error: 'Nama dan email wajib diisi.' }, { status: 400 });
      if (password.length < 6) return Response.json({ error: 'Password minimal 6 karakter.' }, { status: 400 });
      if (!ROLE.includes(role)) return Response.json({ error: 'Peran tidak dikenal.' }, { status: 400 });
      if (await User.findOne({ email })) return Response.json({ error: 'Email itu sudah dipakai akun lain.' }, { status: 409 });

      const baru = await User.create({ nama, email, password, role });

      // pastikan password bisa dipakai login (model User harus meng-hash password saat save)
      const cek = await User.findById(baru._id);
      if (!(await cek.matchPassword(password))) {
        await User.deleteOne({ _id: baru._id });
        return Response.json({ error: 'Akun gagal dibuat: password tidak bisa dipakai login. Periksa apakah models/User.js meng-hash password di pre("save").' }, { status: 500 });
      }
      if (role === 'siswa') await simpanKelas(nama, String(b.kelas || '').trim());
      return Response.json(ringkas(baru), { status: 201 });
    }

    if (b.aksi === 'ubah') {
      const user = await User.findById(b.id);
      if (!user) return Response.json({ error: 'Akun tidak ditemukan.' }, { status: 404 });

      const nama = String(b.nama ?? user.nama).trim();
      const email = String(b.email ?? user.email).trim().toLowerCase();
      const role = String(b.role ?? user.role) === 'murid' ? 'siswa' : String(b.role ?? user.role);
      const passwordBaru = String(b.password || '');
      if (!nama || !email) return Response.json({ error: 'Nama dan email wajib diisi.' }, { status: 400 });
      if (!ROLE.includes(role)) return Response.json({ error: 'Peran tidak dikenal.' }, { status: 400 });
      if (passwordBaru && passwordBaru.length < 6) return Response.json({ error: 'Password baru minimal 6 karakter.' }, { status: 400 });
      if (String(user._id) === String(admin._id) && role !== 'admin') {
        return Response.json({ error: 'Peran akun admin yang sedang dipakai tidak bisa diubah.' }, { status: 400 });
      }
      const dobel = await User.findOne({ email });
      if (dobel && String(dobel._id) !== String(user._id)) return Response.json({ error: 'Email itu sudah dipakai akun lain.' }, { status: 409 });

      const passwordLama = user.password;
      user.nama = nama;
      user.email = email;
      user.role = role;
      if (passwordBaru) user.password = passwordBaru;
      await user.save();

      if (passwordBaru) {
        const cek = await User.findById(user._id);
        if (!(await cek.matchPassword(passwordBaru))) {
          if (passwordLama) await User.updateOne({ _id: user._id }, { $set: { password: passwordLama } });
          return Response.json({ error: 'Password baru tidak bisa dipakai login. Password lama dikembalikan.' }, { status: 500 });
        }
      }
      if (role === 'siswa') await simpanKelas(nama, String(b.kelas || '').trim());
      return Response.json(ringkas(user));
    }

    if (b.aksi === 'hapus') {
      if (String(b.id) === String(admin._id)) return Response.json({ error: 'Akun admin yang sedang dipakai tidak bisa dihapus.' }, { status: 400 });
      await User.findByIdAndDelete(b.id);
      return Response.json({ ok: true });
    }

    return Response.json({ error: 'Aksi tidak dikenal.' }, { status: 400 });
  } catch (e) {
    console.error('POST /api/akun error:', e);
    return Response.json({ error: e.message || 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
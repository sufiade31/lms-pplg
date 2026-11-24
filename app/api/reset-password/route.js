import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { ResetPwModel } from '@/models/school';

// Semua aksi di sini hanya untuk admin. Admin harus menyertakan email dan password-nya sendiri.
async function cekAdmin(email, password) {
  const admin = await User.findOne({ email: String(email || '').trim().toLowerCase() });
  if (!admin || admin.role !== 'admin') return null;
  if (!(await admin.matchPassword(String(password || '')))) return null;
  return admin;
}

// POST /api/reset-password
//   { adminEmail, adminPassword, aksi: 'daftar' }
//   { adminEmail, adminPassword, aksi: 'setel', email, passwordBaru }
//   { adminEmail, adminPassword, aksi: 'hapus', id }
export async function POST(request) {
  try {
    await connectDB();
    const b = await request.json();
    const admin = await cekAdmin(b.adminEmail, b.adminPassword);
    if (!admin) return Response.json({ error: 'Email atau password admin salah.' }, { status: 401 });

    if (b.aksi === 'daftar') {
      const daftar = await ResetPwModel.find({ status: 'Menunggu' }).sort({ diminta: 1 });
      return Response.json(daftar);
    }

    if (b.aksi === 'hapus') {
      await ResetPwModel.findByIdAndDelete(b.id);
      return Response.json({ ok: true });
    }

    if (b.aksi === 'setel') {
      const baru = String(b.passwordBaru || '');
      if (baru.length < 6) return Response.json({ error: 'Password baru minimal 6 karakter.' }, { status: 400 });
      const user = await User.findOne({ email: String(b.email || '').trim().toLowerCase() });
      if (!user) return Response.json({ error: 'Akun dengan email itu tidak ditemukan.' }, { status: 404 });

      const lama = user.password;
      user.password = baru;
      await user.save();

      // Pastikan password baru benar-benar bisa dipakai login (model User harus meng-hash password saat save)
      const cek = await User.findById(user._id);
      if (!(await cek.matchPassword(baru))) {
        if (lama) await User.updateOne({ _id: user._id }, { $set: { password: lama } });
        return Response.json({ error: 'Password baru tidak bisa dipakai login. Periksa apakah models/User.js meng-hash password di pre("save"). Password lama dikembalikan.' }, { status: 500 });
      }

      await ResetPwModel.deleteMany({ email: user.email });
      return Response.json({ ok: true });
    }

    return Response.json({ error: 'Aksi tidak dikenal.' }, { status: 400 });
  } catch (e) {
    console.error('POST /api/reset-password error:', e);
    return Response.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
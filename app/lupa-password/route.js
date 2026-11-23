import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { ResetPwModel } from '@/models/school';

// POST /api/lupa-password  { email }
// Dipakai halaman login. Jawabannya selalu sama, supaya orang lain tidak bisa menebak email mana yang terdaftar.
export async function POST(request) {
  try {
    await connectDB();
    const { email } = await request.json();
    const alamat = String(email || '').trim().toLowerCase();
    if (!alamat || !alamat.includes('@')) {
      return Response.json({ error: 'Isi email dengan benar.' }, { status: 400 });
    }
    const user = await User.findOne({ email: alamat });
    if (user) {
      await ResetPwModel.findOneAndUpdate(
        { email: alamat },
        { email: alamat, nama: user.nama, role: user.role, status: 'Menunggu', diminta: new Date() },
        { upsert: true, new: true }
      );
    }
    return Response.json({ ok: true });
  } catch (e) {
    console.error('POST /api/lupa-password error:', e);
    return Response.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
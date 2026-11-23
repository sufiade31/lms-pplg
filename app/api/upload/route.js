import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { BerkasModel } from '@/models/school';

export const runtime = 'nodejs';
const MAKS = 8 * 1024 * 1024; // 8 MB

// POST /api/upload  (multipart/form-data, field "file") -> { id, nama }
export async function POST(req) {
  try {
    await connectDB();
    const form = await req.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'File tidak ditemukan.' }, { status: 400 });
    }
    if (file.size > MAKS) {
      return NextResponse.json({ error: 'Ukuran file maksimal 8 MB.' }, { status: 413 });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const doc = await BerkasModel.create({
      nama: file.name,
      tipe: file.type || 'application/octet-stream',
      ukuran: file.size,
      data: buf,
    });
    return NextResponse.json({ id: String(doc._id), nama: doc.nama }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
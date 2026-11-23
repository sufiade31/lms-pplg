import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { BerkasModel } from '@/models/school';

export const runtime = 'nodejs';

// GET /api/berkas/:id            -> tampil di browser (PDF/gambar langsung terbuka)
// GET /api/berkas/:id?unduh=1    -> paksa download
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const doc = await BerkasModel.findById(id);
    if (!doc) return NextResponse.json({ error: 'File tidak ditemukan.' }, { status: 404 });
    const unduh = new URL(req.url).searchParams.get('unduh');
    return new NextResponse(doc.data, {
      headers: {
        'Content-Type': doc.tipe,
        'Content-Disposition': `${unduh ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(doc.nama)}`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
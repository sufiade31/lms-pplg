import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { MODELS } from '@/models/school';

export async function GET(req, { params }) {
  try {
    const { type } = await params;
    const Model = MODELS[type];
    if (!Model) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await connectDB();

    // Saringan lewat alamat, mis. /api/pengumpulan?siswaId=123
    const filter = {};
    for (const [key, value] of new URL(req.url).searchParams) {
      if (Model.schema.path(key)) filter[key] = value;
    }

    const sort = type === 'pengumuman' || type === 'tugas' ? { createdAt: -1 } : { createdAt: 1 };
    return NextResponse.json(await Model.find(filter).sort(sort));
  } catch (e) {
    console.error('GET /api/[type] error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const { type } = await params;
    const Model = MODELS[type];
    if (!Model) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await connectDB();
    const { id, _id, ...data } = await req.json();
    const created = await Model.create(data);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error('POST /api/[type] error:', e);
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
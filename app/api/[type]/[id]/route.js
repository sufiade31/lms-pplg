import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { MODELS } from '@/models/school';

export async function PUT(req, { params }) {
  try {
    const { type, id } = await params;
    const Model = MODELS[type];
    if (!Model) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await connectDB();
    const { id: _a, _id: _b, ...data } = await req.json();
    const updated = await Model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!updated) return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e) {
    console.error('PUT /api/[type]/[id] error:', e);
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(_, { params }) {
  try {
    const { type, id } = await params;
    const Model = MODELS[type];
    if (!Model) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await connectDB();
    await Model.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/[type] error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
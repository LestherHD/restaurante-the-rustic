import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Table from '@/models/Table';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const table = await Table.findByIdAndUpdate(id, body, { new: true });

    if (!table) {
      return NextResponse.json({ error: 'Mesa no encontrada' }, { status: 404 });
    }

    return NextResponse.json(table);
  } catch (error) {
    console.error('Error al actualizar mesa:', error);
    return NextResponse.json({ error: 'Error al actualizar mesa' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const table = await Table.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!table) {
      return NextResponse.json({ error: 'Mesa no encontrada' }, { status: 404 });
    }

    return NextResponse.json(table);
  } catch (error) {
    console.error('Error al eliminar mesa:', error);
    return NextResponse.json({ error: 'Error al eliminar mesa' }, { status: 500 });
  }
}

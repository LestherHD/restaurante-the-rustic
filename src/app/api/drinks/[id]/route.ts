import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Drink from '@/models/Drink';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const drink = await Drink.findById(id);

    if (!drink) {
      return NextResponse.json({ error: 'Bebida no encontrada' }, { status: 404 });
    }

    return NextResponse.json(drink);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener bebida' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const drink = await Drink.findByIdAndUpdate(id, body, { new: true });

    if (!drink) {
      return NextResponse.json({ error: 'Bebida no encontrada' }, { status: 404 });
    }

    return NextResponse.json(drink);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar bebida' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const drink = await Drink.findByIdAndDelete(id);

    if (!drink) {
      return NextResponse.json({ error: 'Bebida no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Bebida eliminada' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar bebida' }, { status: 500 });
  }
}

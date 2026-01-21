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

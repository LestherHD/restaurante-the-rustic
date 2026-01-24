import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Table from '@/models/Table';

export async function GET() {
  try {
    await dbConnect();
    const tables = await Table.find({ isActive: true }).sort({ level: 1, number: 1 });
    return NextResponse.json(tables);
  } catch (error) {
    console.error('Error al obtener mesas:', error);
    return NextResponse.json({ error: 'Error al obtener mesas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    const table = await Table.create(body);
    return NextResponse.json(table, { status: 201 });
  } catch (error) {
    console.error('Error al crear mesa:', error);
    return NextResponse.json({ error: 'Error al crear mesa' }, { status: 500 });
  }
}

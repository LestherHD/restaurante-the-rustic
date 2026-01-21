import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Drink from '@/models/Drink';

export async function GET() {
  try {
    await dbConnect();
    const drinks = await Drink.find({}).sort({ createdAt: -1 });
    return NextResponse.json(drinks);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener bebidas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Asegurar que totalUnits se calcule correctamente
    const drinkData = {
      ...body,
      totalUnits: (body.totalBoxes || 0) * (body.unitsPerBox || 1)
    };
    
    const drink = await Drink.create(drinkData);
    return NextResponse.json(drink, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear bebida' }, { status: 500 });
  }
}

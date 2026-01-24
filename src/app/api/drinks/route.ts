import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Drink from '@/models/Drink';
import { logAudit } from '@/lib/auditLog';
import { getUsernameForAudit } from '@/lib/auth';

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
    
    // Registrar en auditoría
    const username = await getUsernameForAudit();
    await logAudit({
      username,
      action: 'create',
      module: 'drinks',
      description: `Creó la bebida "${drink.name}"`,
      targetId: drink._id.toString(),
      targetName: drink.name,
      newValue: {
        name: drink.name,
        brand: drink.brand,
        presentation: drink.presentation,
        salePrice: drink.salePrice,
        costPerBox: drink.costPerBox,
        totalBoxes: drink.totalBoxes,
        totalUnits: drink.totalUnits,
      },
    });
    
    return NextResponse.json(drink, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear bebida' }, { status: 500 });
  }
}

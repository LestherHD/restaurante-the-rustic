import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Drink from '@/models/Drink';
import InventoryMovement from '@/models/InventoryMovement';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { drinkId, boxesToAdd, createdBy, reason } = body;

    const drink = await Drink.findById(drinkId);
    if (!drink) {
      return NextResponse.json({ error: 'Bebida no encontrada' }, { status: 404 });
    }

    const previousBoxes = drink.totalBoxes;
    const previousUnits = drink.totalUnits;

    // Actualizar cajas y unidades
    drink.totalBoxes += boxesToAdd;
    drink.totalUnits += (boxesToAdd * drink.unitsPerBox);

    await drink.save();

    // Registrar movimiento
    await InventoryMovement.create({
      drinkId: drink._id,
      drinkName: drink.name,
      type: boxesToAdd > 0 ? 'add' : 'subtract',
      boxesChanged: boxesToAdd,
      unitsChanged: boxesToAdd * drink.unitsPerBox,
      previousBoxes,
      newBoxes: drink.totalBoxes,
      previousUnits,
      newUnits: drink.totalUnits,
      reason: reason || 'Ajuste de inventario',
      createdBy: createdBy || 'Admin',
    });

    return NextResponse.json({
      success: true,
      drink
    });

  } catch (error) {
    console.error('Error en movimiento de inventario:', error);
    return NextResponse.json(
      { error: 'Error al actualizar inventario' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const drinkId = searchParams.get('drinkId');

    const query = drinkId ? { drinkId } : {};
    const movements = await InventoryMovement.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json(movements);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener movimientos' },
      { status: 500 }
    );
  }
}

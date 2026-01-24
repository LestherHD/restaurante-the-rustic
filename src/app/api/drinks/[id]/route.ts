import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Drink from '@/models/Drink';
import { logAudit } from '@/lib/auditLog';
import { getUsernameForAudit } from '@/lib/auth';

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
    
    // Obtener datos anteriores para auditoría
    const previousDrink = await Drink.findById(id);
    
    const drink = await Drink.findByIdAndUpdate(id, body, { new: true });

    if (!drink) {
      return NextResponse.json({ error: 'Bebida no encontrada' }, { status: 404 });
    }

    // Detectar cambios importantes
    const changes: string[] = [];
    if (previousDrink) {
      if (previousDrink.salePrice !== drink.salePrice) {
        changes.push(`precio de Q${previousDrink.salePrice} a Q${drink.salePrice}`);
      }
      if (previousDrink.costPerBox !== drink.costPerBox) {
        changes.push(`costo de Q${previousDrink.costPerBox} a Q${drink.costPerBox}`);
      }
      if (previousDrink.isActive !== drink.isActive) {
        changes.push(`estado a ${drink.isActive ? 'activo' : 'inactivo'}`);
      }
    }

    // Registrar en auditoría
    await logAudit({
      username: 'Admin', // TODO: Obtener del usuario autenticado
      action: changes.some(c => c.includes('precio')) ? 'price_change' : 'update',
      module: 'drinks',
      description: `Actualizó "${drink.name}"${changes.length ? ': ' + changes.join(', ') : ''}`,
      targetId: drink._id.toString(),
      targetName: drink.name,
      previousValue: previousDrink ? {
        salePrice: previousDrink.salePrice,
        costPerBox: previousDrink.costPerBox,
        isActive: previousDrink.isActive,
      } : undefined,
      newValue: {
        salePrice: drink.salePrice,
        costPerBox: drink.costPerBox,
        isActive: drink.isActive,
      },
    });

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
    const drink = await Drink.findById(id);

    if (!drink) {
      return NextResponse.json({ error: 'Bebida no encontrada' }, { status: 404 });
    }

    // Guardar info antes de eliminar
    const drinkName = drink.name;
    const drinkData = {
      name: drink.name,
      brand: drink.brand,
      presentation: drink.presentation,
      salePrice: drink.salePrice,
      totalUnits: drink.totalUnits,
    };

    await Drink.findByIdAndDelete(id);

    // Registrar en auditoría
    const username = await getUsernameForAudit();
    await logAudit({
      username,
      action: 'delete',
      module: 'drinks',
      description: `Eliminó la bebida "${drinkName}"`,
      targetId: id,
      targetName: drinkName,
      previousValue: drinkData,
    });

    return NextResponse.json({ message: 'Bebida eliminada' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar bebida' }, { status: 500 });
  }
}

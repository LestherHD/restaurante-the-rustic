import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Ingredient from '@/models/Ingredient';
import { logAudit } from '@/lib/auditLog';

// GET - Obtener un ingrediente específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const ingredient = await Ingredient.findById(params.id);

    if (!ingredient) {
      return NextResponse.json({ error: 'Ingrediente no encontrado' }, { status: 404 });
    }

    return NextResponse.json(ingredient);
  } catch (error) {
    console.error('Error al obtener ingrediente:', error);
    return NextResponse.json({ error: 'Error al obtener ingrediente' }, { status: 500 });
  }
}

// PUT - Actualizar ingrediente
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    
    const { name, category, stockMinimo, preferredUnit } = body;

    const ingredient = await Ingredient.findByIdAndUpdate(
      params.id,
      {
        name: name?.trim(),
        category,
        stockMinimo,
        preferredUnit,
      },
      { new: true, runValidators: true }
    );

    if (!ingredient) {
      return NextResponse.json({ error: 'Ingrediente no encontrado' }, { status: 404 });
    }

    // Log de auditoría
    await logAudit({
      action: 'UPDATE',
      entity: 'Ingredient',
      entityId: ingredient._id.toString(),
      details: `Ingrediente actualizado: ${ingredient.name}`,
    });

    return NextResponse.json(ingredient);
  } catch (error) {
    console.error('Error al actualizar ingrediente:', error);
    return NextResponse.json({ error: 'Error al actualizar ingrediente' }, { status: 500 });
  }
}

// DELETE - Eliminar ingrediente (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const ingredient = await Ingredient.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    );

    if (!ingredient) {
      return NextResponse.json({ error: 'Ingrediente no encontrado' }, { status: 404 });
    }

    // Log de auditoría
    await logAudit({
      action: 'DELETE',
      entity: 'Ingredient',
      entityId: ingredient._id.toString(),
      details: `Ingrediente eliminado: ${ingredient.name}`,
    });

    return NextResponse.json({ message: 'Ingrediente eliminado' });
  } catch (error) {
    console.error('Error al eliminar ingrediente:', error);
    return NextResponse.json({ error: 'Error al eliminar ingrediente' }, { status: 500 });
  }
}

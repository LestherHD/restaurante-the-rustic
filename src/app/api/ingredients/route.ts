import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Ingredient, { UNIT_CONVERSIONS } from '@/models/Ingredient';
import { logAudit } from '@/lib/auditLog';

// GET - Listar todos los ingredientes
export async function GET() {
  try {
    await connectDB();
    const ingredients = await Ingredient.find({ isActive: true }).sort({ name: 1 });
    
    // Calcular alertas
    const ingredientsWithAlerts = ingredients.map(ing => ({
      ...ing.toObject(),
      isLowStock: ing.stockActual <= ing.stockMinimo,
      stockInPreferredUnit: ing.stockActual / UNIT_CONVERSIONS[ing.preferredUnit as keyof typeof UNIT_CONVERSIONS],
    }));

    return NextResponse.json(ingredientsWithAlerts);
  } catch (error) {
    console.error('Error al obtener ingredientes:', error);
    return NextResponse.json({ error: 'Error al obtener ingredientes' }, { status: 500 });
  }
}

// POST - Crear nuevo ingrediente
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    const { name, category, stockMinimo, preferredUnit } = body;

    // Validaciones
    if (!name || !category || stockMinimo === undefined) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Verificar que no exista
    const exists = await Ingredient.findOne({ name: name.trim() });
    if (exists) {
      return NextResponse.json(
        { error: 'Ya existe un ingrediente con ese nombre' },
        { status: 400 }
      );
    }

    const ingredient = await Ingredient.create({
      name: name.trim(),
      category,
      stockMinimo,
      preferredUnit: preferredUnit || 'oz',
      stockActual: 0,
      cxo: 0,
    });

    // Log de auditoría
    await logAudit({
      username: 'admin',
      action: 'create',
      module: 'ingredients',
      description: `Ingrediente creado: ${ingredient.name}`,
      targetId: ingredient._id.toString(),
      targetName: ingredient.name,
    });

    return NextResponse.json(ingredient, { status: 201 });
  } catch (error) {
    console.error('Error al crear ingrediente:', error);
    return NextResponse.json({ error: 'Error al crear ingrediente' }, { status: 500 });
  }
}

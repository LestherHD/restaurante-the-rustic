import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Ingredient, { UNIT_CONVERSIONS } from '@/models/Ingredient';
import { logAudit } from '@/lib/auditLog';

// POST - Añadir stock con conversión de unidades y cálculo de CXO promedio
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    
    const { quantityPurchased, unitPurchased, totalCost, supplier } = body;

    // Validaciones
    if (!quantityPurchased || !unitPurchased || totalCost === undefined) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Validar que la unidad sea válida
    if (!(unitPurchased in UNIT_CONVERSIONS)) {
      return NextResponse.json(
        { error: 'Unidad de medida no válida' },
        { status: 400 }
      );
    }

    const ingredient = await Ingredient.findById(params.id);
    if (!ingredient) {
      return NextResponse.json({ error: 'Ingrediente no encontrado' }, { status: 404 });
    }

    // Conversión a onzas
    const conversionFactor = UNIT_CONVERSIONS[unitPurchased as keyof typeof UNIT_CONVERSIONS];
    const quantityInOz = quantityPurchased * conversionFactor;
    const newCostPerOz = totalCost / quantityInOz;

    // Cálculo de CXO promedio ponderado
    const oldTotalValue = ingredient.stockActual * ingredient.cxo;
    const newTotalValue = quantityInOz * newCostPerOz;
    const newStockTotal = ingredient.stockActual + quantityInOz;
    
    const averageCxo = newStockTotal > 0 
      ? (oldTotalValue + newTotalValue) / newStockTotal 
      : newCostPerOz;

    // Crear entrada en historial
    const stockEntry = {
      date: new Date(),
      quantity: quantityInOz,
      unitPurchased,
      quantityPurchased,
      totalCost,
      costPerOz: newCostPerOz,
      supplier: supplier || '',
    };

    // Actualizar ingrediente
    ingredient.stockActual = newStockTotal;
    ingredient.cxo = averageCxo;
    ingredient.stockEntries.push(stockEntry);
    await ingredient.save();

    // Log de auditoría
    await logAudit({
      action: 'UPDATE',
      entity: 'Ingredient',
      entityId: ingredient._id.toString(),
      details: `Stock añadido: ${quantityPurchased} ${unitPurchased} (${quantityInOz.toFixed(2)} oz) - Costo: $${totalCost.toFixed(2)} - Nuevo CXO: $${averageCxo.toFixed(4)}`,
    });

    return NextResponse.json({
      success: true,
      ingredient,
      stockEntry: {
        quantityAdded: quantityInOz,
        newStock: newStockTotal,
        oldCxo: ingredient.cxo,
        newCxo: averageCxo,
      }
    });
  } catch (error) {
    console.error('Error al añadir stock:', error);
    return NextResponse.json({ error: 'Error al añadir stock' }, { status: 500 });
  }
}

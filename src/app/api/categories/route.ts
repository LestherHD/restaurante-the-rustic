import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import { logAudit } from '@/lib/auditLog';
import { getUsernameForAudit } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find().sort({ name: 1 });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const category = await Category.create(body);
    
    // Registrar en auditoría
    const username = await getUsernameForAudit();
    await logAudit({
      username,
      action: 'create',
      module: 'categories',
      description: `Creó la categoría "${category.name}"`,
      targetId: category._id.toString(),
      targetName: category.name,
      newValue: {
        name: category.name,
        isActive: category.isActive,
        isVisibleToPublic: category.isVisibleToPublic,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Ya existe una categoría con ese nombre' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Error al crear categoría' },
      { status: 500 }
    );
  }
}

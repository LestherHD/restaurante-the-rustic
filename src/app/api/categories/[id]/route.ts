import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import { logAudit } from '@/lib/auditLog';
import { getUsernameForAudit } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;
    const body = await request.json();

    const previousCategory = await Category.findById(id);
    if (!previousCategory) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    const category = await Category.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    // Registrar en auditoría
    const username = await getUsernameForAudit();
    await logAudit({
      username,
      action: 'update',
      module: 'categories',
      description: `Actualizó la categoría "${category?.name}"`,
      targetId: id,
      targetName: category?.name,
      previousValue: {
        name: previousCategory.name,
        isActive: previousCategory.isActive,
        isVisibleToPublic: previousCategory.isVisibleToPublic,
      },
      newValue: {
        name: category?.name,
        isActive: category?.isActive,
        isVisibleToPublic: category?.isVisibleToPublic,
      },
    });

    return NextResponse.json(category);
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Ya existe una categoría con ese nombre' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Error al actualizar categoría' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    await Category.findByIdAndDelete(id);

    // Registrar en auditoría
    const username = await getUsernameForAudit();
    await logAudit({
      username,
      action: 'delete',
      module: 'categories',
      description: `Eliminó la categoría "${category.name}"`,
      targetId: id,
      targetName: category.name,
      previousValue: {
        name: category.name,
        isActive: category.isActive,
        isVisibleToPublic: category.isVisibleToPublic,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar categoría' },
      { status: 500 }
    );
  }
}

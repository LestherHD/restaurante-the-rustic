import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    // Si se actualiza el username, verificar que no exista
    if (body.username) {
      const existingUser = await User.findOne({
        username: body.username.toLowerCase(),
        _id: { $ne: id }
      });
      if (existingUser) {
        return NextResponse.json(
          { error: 'El nombre de usuario ya existe' },
          { status: 400 }
        );
      }
    }

    // No actualizar password si está vacío
    if (body.password === '') {
      delete body.password;
    }

    const user = await User.findByIdAndUpdate(id, body, { new: true }).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 });
  }
}

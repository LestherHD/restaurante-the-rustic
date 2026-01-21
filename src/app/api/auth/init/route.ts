import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();

    // Crear usuario admin por defecto
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        name: 'Administrador',
        isActive: true,
      });
    }

    // Crear usuario mesero por defecto
    const waiterExists = await User.findOne({ username: 'mesero1' });
    if (!waiterExists) {
      await User.create({
        username: 'mesero1',
        password: 'mesero123',
        role: 'waiter',
        name: 'Mesero 1',
        isActive: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Usuarios creados correctamente',
      credentials: {
        admin: { username: 'admin', password: 'admin123' },
        waiter: { username: 'mesero1', password: 'mesero123' },
      },
    });

  } catch (error) {
    console.error('Error al crear usuarios:', error);
    return NextResponse.json(
      { error: 'Error al crear usuarios' },
      { status: 500 }
    );
  }
}

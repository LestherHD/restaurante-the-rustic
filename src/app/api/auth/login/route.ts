import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { username, password, role } = await request.json();

    console.log('\n=== LOGIN ATTEMPT ===');
    console.log('Username:', username);
    console.log('Role:', role);
    console.log('Password length:', password.length);

    // Buscar usuario
    const user = await User.findOne({
      username: username.toLowerCase(),
      role,
      isActive: true
    });

    console.log('User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('DB Password:', user.password);
      console.log('Input Password:', password);
      console.log('Match:', user.password === password);
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar contraseña (sin encriptación por simplicidad - en producción usa bcrypt)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Crear sesión simple
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });

    // Guardar en cookie
    response.cookies.set('auth-user', JSON.stringify({
      id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
    }), {
      httpOnly: false, // Permitir acceso desde JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return response;

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    );
  }
}

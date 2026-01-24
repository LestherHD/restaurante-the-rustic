import { NextResponse } from 'next/server';
import { logAudit } from '@/lib/auditLog';
import { getAuthUser } from '@/lib/auth';

export async function POST() {
  // Obtener usuario antes de cerrar sesión
  const user = await getAuthUser();
  
  const response = NextResponse.json({ success: true });

  response.cookies.delete('auth-user');

  // Registrar cierre de sesión en auditoría
  if (user) {
    await logAudit({
      username: user.username,
      action: 'logout',
      module: 'auth',
      description: `${user.name} (${user.role === 'admin' ? 'Administrador' : 'Mesero'}) cerró sesión`,
      metadata: {
        role: user.role,
        userId: user.id,
      },
    });
  }

  return response;
}

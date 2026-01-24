import { cookies } from 'next/headers';

interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: string;
}

/**
 * Obtiene el usuario autenticado desde las cookies
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('auth-user');
    
    if (!authCookie) {
      return null;
    }

    const user = JSON.parse(authCookie.value);
    return user;
  } catch (error) {
    console.error('Error al obtener usuario autenticado:', error);
    return null;
  }
}

/**
 * Obtiene el nombre de usuario para auditoría
 */
export async function getUsernameForAudit(): Promise<string> {
  const user = await getAuthUser();
  return user?.username || 'Sistema';
}

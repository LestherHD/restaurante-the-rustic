import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuditLogs } from '@/lib/auditLog';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || undefined;
    const module = searchParams.get('module') || undefined;
    const action = searchParams.get('action') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;

    const logs = await getAuditLogs({
      username,
      module: module as any,
      action: action as any,
      limit,
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error al obtener logs:', error);
    return NextResponse.json(
      { error: 'Error al obtener logs de auditoría' },
      { status: 500 }
    );
  }
}

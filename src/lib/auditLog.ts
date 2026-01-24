import AuditLog from '@/models/AuditLog';

interface LogAuditParams {
  username: string;
  userId?: string;
  action: 'create' | 'update' | 'delete' | 'inventory_movement' | 'price_change' | 'other';
  module: 'drinks' | 'ingredients' | 'categories' | 'dishes' | 'recipes' | 'orders' | 'users' | 'other';
  description: string;
  targetId?: string;
  targetName?: string;
  previousValue?: any;
  newValue?: any;
  metadata?: any;
}

/**
 * Registra una acción en el log de auditoría
 */
export async function logAudit(params: LogAuditParams) {
  try {
    await AuditLog.create({
      username: params.username,
      userId: params.userId,
      action: params.action,
      module: params.module,
      description: params.description,
      targetId: params.targetId,
      targetName: params.targetName,
      previousValue: params.previousValue,
      newValue: params.newValue,
      metadata: params.metadata,
    });
  } catch (error) {
    console.error('Error al registrar auditoría:', error);
    // No lanzar error para no afectar la operación principal
  }
}

/**
 * Obtiene el historial de auditoría con filtros
 */
export async function getAuditLogs(filters?: {
  username?: string;
  module?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  try {
    const query: any = {};

    if (filters?.username) query.username = filters.username;
    if (filters?.module) query.module = filters.module;
    if (filters?.action) query.action = filters.action;
    
    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(filters?.limit || 100);

    return logs;
  } catch (error) {
    console.error('Error al obtener logs de auditoría:', error);
    return [];
  }
}

/**
 * Obtiene el historial de un elemento específico
 */
export async function getTargetHistory(targetId: string) {
  try {
    const logs = await AuditLog.find({ targetId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    return logs;
  } catch (error) {
    console.error('Error al obtener historial:', error);
    return [];
  }
}

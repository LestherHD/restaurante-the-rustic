import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  // Usuario que realizó la acción
  username: string;
  userId?: string;

  // Tipo de acción
  action: 'create' | 'update' | 'delete' | 'inventory_movement' | 'price_change' | 'login' | 'logout' | 'other';
  
  // Módulo afectado
  module: 'drinks' | 'ingredients' | 'categories' | 'dishes' | 'recipes' | 'orders' | 'users' | 'auth' | 'other';
  
  // Descripción de la acción
  description: string;
  
  // ID del elemento afectado
  targetId?: string;
  targetName?: string;
  
  // Valores antes y después (para updates)
  previousValue?: any;
  newValue?: any;
  
  // Metadata adicional
  metadata?: {
    ip?: string;
    userAgent?: string;
    [key: string]: any;
  };
  
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    username: {
      type: String,
      required: [true, 'El nombre de usuario es requerido'],
      trim: true,
    },
    userId: {
      type: String,
      trim: true,
    },
    action: {
      type: String,
      required: [true, 'La acción es requerida'],
      enum: ['create', 'update', 'delete', 'inventory_movement', 'price_change', 'login', 'logout', 'other'],
    },
    module: {
      type: String,
      required: [true, 'El módulo es requerido'],
      enum: ['drinks', 'ingredients', 'categories', 'dishes', 'recipes', 'orders', 'users', 'auth', 'other'],
    },
    description: {
      type: String,
      required: [true, 'La descripción es requerida'],
      trim: true,
    },
    targetId: {
      type: String,
      trim: true,
    },
    targetName: {
      type: String,
      trim: true,
    },
    previousValue: {
      type: Schema.Types.Mixed,
    },
    newValue: {
      type: Schema.Types.Mixed,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Índices para búsquedas rápidas
AuditLogSchema.index({ username: 1, createdAt: -1 });
AuditLogSchema.index({ module: 1, createdAt: -1 });
AuditLogSchema.index({ targetId: 1 });

// Eliminar del cache si existe
if (mongoose.models.AuditLog) {
  delete mongoose.models.AuditLog;
}

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

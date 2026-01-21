import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  orderId?: mongoose.Types.ObjectId;
  date: Date;
  createdBy: string;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'El tipo es requerido'],
    },
    amount: {
      type: Number,
      required: [true, 'El monto es requerido'],
      min: [0, 'El monto no puede ser negativo'],
    },
    category: {
      type: String,
      required: [true, 'La categoría es requerida'],
      enum: [
        'Ventas',
        'Compra de inventario',
        'Salarios',
        'Servicios',
        'Mantenimiento',
        'Otros gastos',
      ],
    },
    description: {
      type: String,
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

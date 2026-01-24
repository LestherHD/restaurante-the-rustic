import mongoose, { Schema, Document } from 'mongoose';

export interface ITable extends Document {
  number: string;
  capacity: number;
  level: string;
  type: 'table' | 'bar';
  position: {
    x: number;
    y: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TableSchema = new Schema<ITable>(
  {
    number: {
      type: String,
      required: true,
      unique: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, 'La capacidad debe ser al menos 1'],
      max: [20, 'La capacidad máxima es 20'],
    },
    level: {
      type: String,
      required: true,
      default: 'Primer Nivel',
    },
    type: {
      type: String,
      enum: ['table', 'bar'],
      default: 'table',
    },
    position: {
      x: {
        type: Number,
        required: true,
        default: 0,
      },
      y: {
        type: Number,
        required: true,
        default: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Table || mongoose.model<ITable>('Table', TableSchema);

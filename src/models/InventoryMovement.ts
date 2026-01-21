import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryMovement extends Document {
  drinkId: mongoose.Types.ObjectId;
  drinkName: string;
  type: 'add' | 'subtract' | 'sale' | 'adjustment';
  boxesChanged: number;
  unitsChanged: number;
  previousBoxes: number;
  newBoxes: number;
  previousUnits: number;
  newUnits: number;
  reason: string;
  createdBy: string;
  createdAt: Date;
}

const InventoryMovementSchema = new Schema<IInventoryMovement>(
  {
    drinkId: {
      type: Schema.Types.ObjectId,
      ref: 'Drink',
      required: true,
    },
    drinkName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['add', 'subtract', 'sale', 'adjustment'],
      required: true,
    },
    boxesChanged: {
      type: Number,
      required: true,
    },
    unitsChanged: {
      type: Number,
      required: true,
    },
    previousBoxes: {
      type: Number,
      required: true,
    },
    newBoxes: {
      type: Number,
      required: true,
    },
    previousUnits: {
      type: Number,
      required: true,
    },
    newUnits: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
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

export default mongoose.models.InventoryMovement || mongoose.model<IInventoryMovement>('InventoryMovement', InventoryMovementSchema);

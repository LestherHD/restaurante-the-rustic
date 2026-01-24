import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  isActive: boolean;
  isVisibleToPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'El nombre de la categoría es requerido'],
      trim: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVisibleToPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índice para búsquedas rápidas
CategorySchema.index({ name: 1 });
CategorySchema.index({ isActive: 1, isVisibleToPublic: 1 });

// Eliminar del cache si existe
if (mongoose.models.Category) {
  delete mongoose.models.Category;
}

export default mongoose.model<ICategory>('Category', CategorySchema);

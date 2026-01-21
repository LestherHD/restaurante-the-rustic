import mongoose, { Schema, Document } from 'mongoose';

export interface IDrink extends Document {
  name: string;
  brand: string;
  presentation: string;
  category: string;
  image?: string;

  // Inventario en cajas
  unitsPerBox: number;
  totalBoxes: number;
  totalUnits: number;
  lowStockAlert: number;

  // Costos y precios
  costPerBox: number;
  costPerUnit: number;
  salePrice: number;
  profitMargin: number;

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DrinkSchema = new Schema<IDrink>(
  {
    name: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'La marca es requerida'],
      trim: true,
    },
    presentation: {
      type: String,
      required: [true, 'La presentación es requerida'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'La categoría es requerida'],
      enum: ['Refrescos', 'Jugos', 'Cervezas', 'Vinos', 'Licores', 'Café', 'Té', 'Agua', 'Otros'],
    },
    image: {
      type: String,
      default: '/images/default-drink.webp',
    },

    // Inventario
    unitsPerBox: {
      type: Number,
      required: [true, 'Las unidades por caja son requeridas'],
      min: [1, 'Debe haber al menos 1 unidad por caja'],
    },
    totalBoxes: {
      type: Number,
      default: 0,
      min: [0, 'Las cajas no pueden ser negativas'],
    },
    totalUnits: {
      type: Number,
      default: 0,
      min: [0, 'Las unidades no pueden ser negativas'],
    },
    lowStockAlert: {
      type: Number,
      default: 10,
      min: [0, 'La alerta no puede ser negativa'],
    },

    // Costos
    costPerBox: {
      type: Number,
      required: [true, 'El costo por caja es requerido'],
      min: [0, 'El costo no puede ser negativo'],
    },
    costPerUnit: {
      type: Number,
      default: 0,
    },
    salePrice: {
      type: Number,
      required: [true, 'El precio de venta es requerido'],
      min: [0, 'El precio no puede ser negativo'],
    },
    profitMargin: {
      type: Number,
      default: 0,
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

// Calcular automáticamente antes de guardar
DrinkSchema.pre('save', function() {
  // Calcular costo por unidad
  this.costPerUnit = this.costPerBox / this.unitsPerBox;

  // Calcular margen de ganancia
  if (this.costPerUnit > 0) {
    this.profitMargin = ((this.salePrice - this.costPerUnit) / this.costPerUnit) * 100;
  }

  // IMPORTANTE: Calcular totalUnits automáticamente basado en totalBoxes
  this.totalUnits = this.totalBoxes * this.unitsPerBox;
});

// Eliminar el modelo del cache si existe para forzar recarga
if (mongoose.models.Drink) {
  delete mongoose.models.Drink;
}

export default mongoose.model<IDrink>('Drink', DrinkSchema);

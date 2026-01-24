import mongoose from 'mongoose';

// Factores de conversión a onzas
export const UNIT_CONVERSIONS = {
  oz: 1,
  lb: 16,
  kg: 35.274,
  g: 0.035274,
  l: 33.814,
  ml: 0.033814,
  gal: 128,
  unit: 1, // Para items unitarios
};

export type UnitType = keyof typeof UNIT_CONVERSIONS;

// Historial de entradas de stock
const StockEntrySchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  quantity: { type: Number, required: true }, // En oz
  unitPurchased: { type: String, required: true }, // lb, kg, etc
  quantityPurchased: { type: Number, required: true }, // Cantidad comprada en unidad original
  totalCost: { type: Number, required: true },
  costPerOz: { type: Number, required: true },
  supplier: { type: String, default: '' },
});

const IngredientSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Carnes', 'Vegetales', 'Lácteos', 'Condimentos', 'Otros']
  },
  stockActual: { type: Number, default: 0 }, // En oz
  stockMinimo: { type: Number, required: true }, // En oz
  cxo: { type: Number, default: 0 }, // Costo por onza actual (promedio)
  preferredUnit: { 
    type: String, 
    default: 'oz',
    enum: Object.keys(UNIT_CONVERSIONS)
  }, // Unidad preferida para mostrar
  stockEntries: [StockEntrySchema], // Historial
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

// Índices para búsqueda rápida
IngredientSchema.index({ category: 1 });
IngredientSchema.index({ stockActual: 1, stockMinimo: 1 }); // Para alertas

export default mongoose.models.Ingredient || mongoose.model('Ingredient', IngredientSchema);

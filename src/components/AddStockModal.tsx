'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';

interface AddStockModalProps {
  ingredient: {
    _id: string;
    name: string;
    category: string;
    stockActual: number;
    cxo: number;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const units = [
  { value: 'oz', label: 'Onzas (oz)' },
  { value: 'lb', label: 'Libras (lb)' },
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'g', label: 'Gramos (g)' },
  { value: 'l', label: 'Litros (l)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'gal', label: 'Galones (gal)' },
  { value: 'unit', label: 'Unidades' },
];

export default function AddStockModal({ ingredient, onClose, onSuccess }: AddStockModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    quantityPurchased: '',
    unitPurchased: 'lb',
    totalCost: '',
    supplier: '',
  });

  const calculatePreview = () => {
    if (!formData.quantityPurchased || !formData.totalCost) return null;

    const conversions: Record<string, number> = {
      oz: 1, lb: 16, kg: 35.274, g: 0.035274,
      l: 33.814, ml: 0.033814, gal: 128, unit: 1,
    };

    const qty = parseFloat(formData.quantityPurchased);
    const cost = parseFloat(formData.totalCost);
    const factor = conversions[formData.unitPurchased];
    const qtyInOz = qty * factor;
    const costPerOz = cost / qtyInOz;

    return {
      qtyInOz: qtyInOz.toFixed(2),
      costPerOz: costPerOz.toFixed(4),
    };
  };

  const preview = calculatePreview();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/ingredients/${ingredient._id}/add-stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantityPurchased: parseFloat(formData.quantityPurchased),
          totalCost: parseFloat(formData.totalCost),
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        alert(data.error || 'Error al añadir stock');
      }
    } catch (error) {
      alert('Error al añadir stock');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-3 sm:p-4 border-b">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Añadir Stock</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{ingredient.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 transition">
            <X size={20} />
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-4">
            {/* Stock Actual */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs font-medium text-gray-600 mb-3">Stock Actual</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Stock</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {(ingredient.stockActual || 0).toFixed(2)} oz
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">CXO</p>
                  <p className="text-lg font-semibold text-gray-900">
                    Q{(ingredient.cxo || 0).toFixed(4)}
                  </p>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.quantityPurchased}
                    onChange={(e) => setFormData({ ...formData, quantityPurchased: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Unidad
                  </label>
                  <select
                    required
                    value={formData.unitPurchased}
                    onChange={(e) => setFormData({ ...formData, unitPurchased: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  >
                    {units.map(unit => (
                      <option key={unit.value} value={unit.value}>{unit.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Costo Total
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">Q</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.totalCost}
                    onChange={(e) => setFormData({ ...formData, totalCost: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Proveedor (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  placeholder="Nombre del proveedor"
                />
              </div>

              {/* Vista previa */}
              {preview && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    Vista Previa
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Cantidad</p>
                      <p className="font-semibold text-gray-900">{preview.qtyInOz} oz</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Costo/oz</p>
                      <p className="font-semibold text-gray-900">Q{preview.costPerOz}</p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer con Botones */}
        <div className="border-t p-3 sm:p-4">
          <div className="flex gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-xs sm:text-sm font-medium transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              <Save size={14} className="sm:w-4 sm:h-4" />
              {isLoading ? 'Guardando...' : 'Añadir Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

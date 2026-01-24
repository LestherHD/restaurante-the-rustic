'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Package, DollarSign, Save } from 'lucide-react';
import Link from 'next/link';

interface Ingredient {
  _id: string;
  name: string;
  category: string;
  stockActual: number;
  stockMinimo: number;
  cxo: number;
  preferredUnit: string;
}

export default function AddStockPage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [formData, setFormData] = useState({
    quantityPurchased: '',
    unitPurchased: 'lb',
    totalCost: '',
    supplier: '',
  });

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

  useEffect(() => {
    fetchIngredient();
  }, []);

  const fetchIngredient = async () => {
    try {
      const response = await fetch(`/api/ingredients/${params.id}`);
      const data = await response.json();
      setIngredient(data);
    } catch (error) {
      console.error('Error al cargar ingrediente:', error);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/ingredients/${params.id}/add-stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantityPurchased: parseFloat(formData.quantityPurchased),
          totalCost: parseFloat(formData.totalCost),
        }),
      });

      if (response.ok) {
        router.push('/admin/ingredients');
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

  if (!ingredient) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto">
          <div className="text-center text-gray-500">Cargando...</div>
        </div>
      </div>
    );
  }

  const preview = calculatePreview();

  return (
    <div className="p-8">
      <Link
        href="/admin/ingredients"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Volver a Bodega
      </Link>

      <div className="bg-white rounded-xl shadow-2xl max-w-3xl mx-auto overflow-hidden">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
          <h1 className="text-2xl font-bold text-white">📦 Añadir Stock</h1>
          <p className="text-indigo-100 mt-1">{ingredient.name} - {ingredient.category}</p>
        </div>

        {/* Contenido */}
        <div className="p-8 space-y-6">
          {/* Info actual con diseño mejorado */}
          <div className="bg-indigo-50 p-6 rounded-xl border-2 border-indigo-200">
            <p className="text-sm font-semibold text-indigo-900 mb-4">📊 Stock Actual</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-xs font-medium text-gray-600 mb-1">Stock Actual</p>
                <p className="text-3xl font-bold text-indigo-900">
                  {(ingredient.stockActual || 0).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">onzas</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-xs font-medium text-gray-600 mb-1">CXO Actual</p>
                <p className="text-3xl font-bold text-green-900">
                  Q{(ingredient.cxo || 0).toFixed(4)}
                </p>
                <p className="text-xs text-gray-500 mt-1">por onza</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Cantidad Comprada
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.quantityPurchased}
                  onChange={(e) => setFormData({ ...formData, quantityPurchased: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 text-lg font-semibold shadow-sm"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Unidad de Compra
                </label>
                <select
                  required
                  value={formData.unitPurchased}
                  onChange={(e) => setFormData({ ...formData, unitPurchased: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-semibold shadow-sm"
                >
                  {units.map(unit => (
                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Costo Total de la Compra
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl font-bold">Q</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.totalCost}
                  onChange={(e) => setFormData({ ...formData, totalCost: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 text-lg font-semibold shadow-sm"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Proveedor (Opcional)
              </label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 shadow-sm"
                placeholder="Nombre del proveedor"
              />
            </div>

            {/* Vista previa del cálculo mejorada */}
            {preview && (
              <div className="bg-green-50 p-6 rounded-xl border-2 border-green-300">
                <p className="text-sm font-bold text-green-900 mb-4 flex items-center gap-2">
                  📈 Vista Previa del Cálculo
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs font-medium text-gray-600 mb-1">Cantidad en Onzas</p>
                    <p className="text-3xl font-bold text-green-900">{preview.qtyInOz}</p>
                    <p className="text-xs text-gray-500 mt-1">oz</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs font-medium text-gray-600 mb-1">Costo por Onza</p>
                    <p className="text-3xl font-bold text-green-900">Q{preview.costPerOz}</p>
                    <p className="text-xs text-gray-500 mt-1">por oz</p>
                  </div>
                </div>
                <p className="text-xs text-green-700 mt-4 text-center bg-white p-2 rounded-lg">
                  💡 El CXO final será un promedio ponderado con el stock existente
                </p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Link
                href="/admin/ingredients"
                className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 font-semibold text-lg transition shadow-md hover:shadow-lg text-center"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold text-lg flex items-center justify-center gap-2 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
              >
                <Save size={22} />
                {isLoading ? 'Añadiendo...' : 'Añadir Stock'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

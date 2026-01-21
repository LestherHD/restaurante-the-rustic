'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Save, Package } from 'lucide-react';
import Image from 'next/image';

export default function NewDrinkPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    presentation: '',
    category: 'Refrescos',
    unitsPerBox: 0,
    totalBoxes: 0,
    costPerBox: 0,
    salePrice: 0,
    lowStockAlert: 10,
    image: '',
  });

  const categories = ['Refrescos', 'Jugos', 'Cervezas', 'Vinos', 'Licores', 'Café', 'Té', 'Agua', 'Otros'];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, image: data.path }));
      }
    } catch (error) {
      alert('Error al subir la imagen');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/drinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/drinks');
      } else {
        alert('Error al crear la bebida');
      }
    } catch (error) {
      alert('Error al crear la bebida');
    } finally {
      setIsLoading(false);
    }
  };

  const costPerUnit = formData.unitsPerBox > 0 ? formData.costPerBox / formData.unitsPerBox : 0;
  const profitMargin = costPerUnit > 0 ? ((formData.salePrice - costPerUnit) / costPerUnit) * 100 : 0;
  const totalUnits = formData.totalBoxes * formData.unitsPerBox;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nueva Bebida</h1>
            <p className="text-sm text-gray-600">Agregar bebida al inventario</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen del Producto
            </label>
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Preview" width={128} height={128} className="object-cover" />
                ) : (
                  <Upload className="text-gray-400" size={32} />
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleImageUpload}
                  className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p className="text-xs text-gray-500 mt-1">PNG o JPG (se convertirá a WebP)</p>
              </div>
            </div>
          </div>

          {/* Información Básica */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                placeholder="Ej: Agua Ciel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca *
              </label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                placeholder="Ej: Ciel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Presentación *
              </label>
              <input
                type="text"
                required
                value={formData.presentation}
                onChange={(e) => setFormData({ ...formData, presentation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                placeholder="Ej: Botella 600ml"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Inventario */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package size={20} /> Inventario por Cajas
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidades por Caja *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.unitsPerBox || ''}
                  onChange={(e) => setFormData({ ...formData, unitsPerBox: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  placeholder="Ej: 24"
                />
                <p className="text-xs text-gray-500 mt-1">¿Cuántas unidades trae una caja?</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cajas Iniciales
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.totalBoxes || ''}
                  onChange={(e) => setFormData({ ...formData, totalBoxes: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Stock inicial</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alerta Stock Bajo
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.lowStockAlert || ''}
                  onChange={(e) => setFormData({ ...formData, lowStockAlert: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  placeholder="10"
                />
                <p className="text-xs text-gray-500 mt-1">Unidades mínimas</p>
              </div>
            </div>

            {formData.unitsPerBox > 0 && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  📦 Total: <strong>{formData.totalBoxes} cajas</strong> = <strong>{totalUnits} unidades</strong>
                </p>
              </div>
            )}
          </div>

          {/* Costos y Precios */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Costos y Precios</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Costo por Caja *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.costPerBox || ''}
                    onChange={(e) => setFormData({ ...formData, costPerBox: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio de Venta (unidad) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.salePrice || ''}
                    onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Cálculos Automáticos */}
            {formData.unitsPerBox > 0 && formData.costPerBox > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Costo por Unidad</p>
                  <p className="text-lg font-bold text-gray-900">Q{costPerUnit.toFixed(2)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Ganancia por Unidad:</p>
                  <p className="text-lg font-bold text-green-600">
                    Q{(formData.salePrice - costPerUnit).toFixed(2)}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${profitMargin >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className={`text-xs ${profitMargin >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    Margen de Ganancia
                  </p>
                  <p className={`text-lg font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profitMargin.toFixed(2)}%
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center justify-center gap-2 disabled:bg-gray-400"
            >
              <Save size={20} />
              {isLoading ? 'Guardando...' : 'Guardar Bebida'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

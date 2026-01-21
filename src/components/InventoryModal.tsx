'use client';

import { useState } from 'react';
import { X, Plus, Minus, Save } from 'lucide-react';

interface InventoryModalProps {
  drink: {
    _id: string;
    name: string;
    totalBoxes: number;
    totalUnits: number;
    unitsPerBox: number;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function InventoryModal({ drink, onClose, onSuccess }: InventoryModalProps) {
  const [boxesToAdd, setBoxesToAdd] = useState(0);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Calcular cajas completas y unidades sueltas actuales
  const currentCompleteBoxes = Math.floor(drink.totalUnits / drink.unitsPerBox);
  const currentLooseUnits = drink.totalUnits % drink.unitsPerBox;

  // Calcular nuevo total después del movimiento
  const newTotalUnits = drink.totalUnits + (boxesToAdd * drink.unitsPerBox);
  const newCompleteBoxes = Math.floor(newTotalUnits / drink.unitsPerBox);
  const newLooseUnits = newTotalUnits % drink.unitsPerBox;

  // Límite mínimo: no se pueden quitar más cajas completas de las que hay
  const minBoxesToRemove = -currentCompleteBoxes;

  const handleSubmit = async () => {
    if (boxesToAdd === 0) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/drinks/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drinkId: drink._id,
          boxesToAdd,
          reason: reason || 'Ajuste de inventario',
          createdBy: 'Admin',
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        console.error('Error al actualizar inventario:', error);
      }
    } catch (error) {
      console.error('Error al actualizar inventario:', error);
      alert('Error al actualizar inventario: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header Fijo */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-xl">
          <h2 className="text-2xl font-bold text-white">📦 Movimiento de Inventario</h2>
          <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition">
            <X size={28} />
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="space-y-6">{/* Bebida */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Bebida</p>
            <p className="text-xl font-bold text-gray-900">{drink.name}</p>
          </div>

          <div className="bg-indigo-50 p-6 rounded-xl border-2 border-indigo-200">
            <p className="text-sm font-semibold text-indigo-900 mb-4">📊 Stock Actual</p>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-xs font-medium text-gray-600 mb-1">Cajas Completas</p>
                <p className="text-3xl font-bold text-indigo-900">{currentCompleteBoxes}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-xs font-medium text-gray-600 mb-1">Unidades Sueltas</p>
                <p className="text-3xl font-bold text-purple-900">{currentLooseUnits}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-xs font-medium text-gray-600 mb-1">Total Unidades</p>
                <p className="text-3xl font-bold text-gray-900">{drink.totalUnits}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-900 mb-3">
              Cajas a Agregar/Quitar
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setBoxesToAdd(Math.max(boxesToAdd - 1, minBoxesToRemove))}
                className="w-16 h-16 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition flex items-center justify-center shadow-md hover:shadow-lg"
              >
                <Minus size={32} />
              </button>
              <input
                type="number"
                value={boxesToAdd}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setBoxesToAdd(Math.max(value, minBoxesToRemove));
                }}
                className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl text-center text-3xl font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              />
              <button
                type="button"
                onClick={() => setBoxesToAdd(boxesToAdd + 1)}
                className="w-16 h-16 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition flex items-center justify-center shadow-md hover:shadow-lg"
              >
                <Plus size={32} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              💡 Usa números negativos para quitar cajas (máximo {currentCompleteBoxes} disponibles)
            </p>
          </div>

          {boxesToAdd !== 0 && (
            <div className={`p-6 rounded-xl border-2 ${boxesToAdd > 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
              <p className={`text-sm mb-4 font-bold flex items-center gap-2 ${boxesToAdd > 0 ? 'text-green-700' : 'text-red-700'}`}>
                {boxesToAdd > 0 ? '📈' : '📉'} Nuevo Stock
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">Cajas Completas</p>
                  <p className={`text-3xl font-bold ${boxesToAdd > 0 ? 'text-green-900' : 'text-red-900'}`}>
                    {newCompleteBoxes}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ({boxesToAdd > 0 ? '+' : ''}{boxesToAdd} cajas)
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">Unidades Sueltas</p>
                  <p className={`text-3xl font-bold ${boxesToAdd > 0 ? 'text-green-900' : 'text-red-900'}`}>
                    {newLooseUnits}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">Total Unidades</p>
                  <p className={`text-3xl font-bold ${boxesToAdd > 0 ? 'text-green-900' : 'text-red-900'}`}>
                    {newTotalUnits}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ({boxesToAdd > 0 ? '+' : ''}{boxesToAdd * drink.unitsPerBox})
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Razón del movimiento
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              placeholder="Ej: Compra de inventario, Ajuste por merma, etc."
            />
          </div>
          </div>
        </div>

        {/* Footer Fijo con Botones */}
        <div className="border-t bg-gray-50 p-6 rounded-b-xl">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 font-semibold text-lg transition shadow-md hover:shadow-lg"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || boxesToAdd === 0}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold text-lg flex items-center justify-center gap-2 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
            >
              <Save size={22} />
              {isLoading ? 'Guardando...' : 'Guardar Movimiento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

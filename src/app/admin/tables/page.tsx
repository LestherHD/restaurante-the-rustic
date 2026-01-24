'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, GripVertical } from 'lucide-react';

interface Table {
  _id: string;
  number: string;
  capacity: number;
  level: string;
  type: 'table' | 'bar';
  position: { x: number; y: number };
  isActive: boolean;
}

export default function TablesAdminPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [levels, setLevels] = useState<string[]>(['Primer Nivel']);
  const [selectedLevel, setSelectedLevel] = useState('Primer Nivel');
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [isAddingLevel, setIsAddingLevel] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [draggedTable, setDraggedTable] = useState<Table | null>(null);
  const [newLevel, setNewLevel] = useState('');
  const [newTable, setNewTable] = useState({
    number: '',
    capacity: 4,
    level: 'Primer Nivel',
    type: 'table' as 'table' | 'bar',
    position: { x: 0, y: 0 },
  });

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    const uniqueLevels = Array.from(new Set(tables.map(t => t.level)));
    if (uniqueLevels.length > 0) {
      setLevels(uniqueLevels);
    }
  }, [tables]);

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables');
      const data = await response.json();
      setTables(data);
    } catch (error) {
      console.error('Error al cargar mesas:', error);
    }
  };

  const handleCreateTable = async () => {
    try {
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTable, level: selectedLevel }),
      });

      if (response.ok) {
        await fetchTables();
        setIsAddingTable(false);
        setNewTable({
          number: '',
          capacity: 4,
          level: selectedLevel,
          type: 'table',
          position: { x: 0, y: 0 },
        });
        alert('Mesa creada exitosamente');
      } else {
        alert('Error al crear mesa');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear mesa');
    }
  };

  const handleUpdateTable = async (table: Table) => {
    try {
      const response = await fetch(`/api/tables/${table._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(table),
      });

      if (response.ok) {
        await fetchTables();
        setEditingTable(null);
        alert('Mesa actualizada exitosamente');
      } else {
        alert('Error al actualizar mesa');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar mesa');
    }
  };

  const handleDeleteTable = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta mesa?')) return;

    try {
      const response = await fetch(`/api/tables/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTables();
        alert('Mesa eliminada exitosamente');
      } else {
        alert('Error al eliminar mesa');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar mesa');
    }
  };

  const handleDragStart = (table: Table) => {
    setDraggedTable(table);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, gridX: number, gridY: number) => {
    e.preventDefault();
    if (!draggedTable) return;

    const updatedTable = {
      ...draggedTable,
      position: { x: gridX, y: gridY },
    };

    await handleUpdateTable(updatedTable);
    setDraggedTable(null);
  };

  const handleAddLevel = () => {
    if (newLevel.trim() && !levels.includes(newLevel)) {
      setLevels([...levels, newLevel]);
      setSelectedLevel(newLevel);
      setNewLevel('');
      setIsAddingLevel(false);
    }
  };

  const filteredTables = tables.filter(t => t.level === selectedLevel);

  const getTableAtPosition = (x: number, y: number) => {
    return filteredTables.find(t => t.position.x === x && t.position.y === y);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestión de Mesas</h1>
            <p className="text-slate-600 mt-1">Configura las mesas y niveles del restaurante</p>
          </div>
          <button
            onClick={() => setIsAddingTable(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Nueva Mesa
          </button>
        </div>

        {/* Selector de niveles */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Niveles del Restaurante</h2>
            <button
              onClick={() => setIsAddingLevel(true)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus size={16} />
              Agregar Nivel
            </button>
          </div>

          {isAddingLevel && (
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                placeholder="Nombre del nivel"
                value={newLevel}
                onChange={(e) => setNewLevel(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
              />
              <button
                onClick={handleAddLevel}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Agregar
              </button>
              <button
                onClick={() => {
                  setIsAddingLevel(false);
                  setNewLevel('');
                }}
                className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300"
              >
                Cancelar
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  selectedLevel === level
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de mesas drag & drop */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold text-slate-900 mb-4">
            Layout de Mesas - {selectedLevel}
          </h2>
          <p className="text-sm text-slate-500 mb-4">Arrastra las mesas para reorganizarlas</p>

          <div className="grid grid-cols-6 gap-3 bg-slate-50 p-6 rounded-lg border-2 border-dashed border-slate-300">
            {Array.from({ length: 6 * 5 }, (_, index) => {
              const gridX = index % 6;
              const gridY = Math.floor(index / 6);
              const table = getTableAtPosition(gridX, gridY);

              return (
                <div
                  key={index}
                  className="aspect-square border-2 border-slate-200 rounded-lg bg-white flex items-center justify-center relative hover:border-blue-300 transition"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, gridX, gridY)}
                >
                  {table ? (
                    <div
                      draggable
                      onDragStart={() => handleDragStart(table)}
                      className="w-full h-full cursor-move bg-blue-50 border-2 border-blue-500 rounded-lg flex flex-col items-center justify-center hover:bg-blue-100 transition group"
                    >
                      <GripVertical size={16} className="text-blue-400 mb-1 opacity-0 group-hover:opacity-100" />
                      <span className="text-lg font-bold text-slate-900">{table.number}</span>
                      <span className="text-xs text-slate-500">{table.capacity}p</span>
                      {table.type === 'bar' && (
                        <span className="text-xs text-orange-600 font-semibold">Barra</span>
                      )}
                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => setEditingTable(table)}
                          className="bg-white p-1 rounded shadow-sm hover:bg-slate-100"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteTable(table._id)}
                          className="bg-white p-1 rounded shadow-sm hover:bg-red-50 text-red-600"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-300 text-xs">Vacío</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-50 border-2 border-blue-500 rounded" />
              <span>Mesa ocupada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border-2 border-slate-200 rounded" />
              <span>Espacio vacío</span>
            </div>
          </div>
        </div>

        {/* Lista de mesas */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
          <h2 className="font-semibold text-slate-900 mb-4">Mesas en {selectedLevel}</h2>
          <div className="space-y-2">
            {filteredTables.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No hay mesas en este nivel</p>
            ) : (
              filteredTables.map((table) => (
                <div
                  key={table._id}
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <div>
                    <span className="font-semibold text-slate-900">Mesa {table.number}</span>
                    <span className="text-slate-500 ml-3">
                      {table.capacity} personas • {table.type === 'bar' ? 'Barra' : 'Mesa'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingTable(table)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteTable(table._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Crear Mesa */}
      {isAddingTable && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Nueva Mesa</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Número</label>
                <input
                  type="text"
                  value={newTable.number}
                  onChange={(e) => setNewTable({ ...newTable, number: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                  placeholder="Ej: 1, 2, B1 (para barra)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Capacidad</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={newTable.capacity}
                  onChange={(e) => setNewTable({ ...newTable, capacity: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                <select
                  value={newTable.type}
                  onChange={(e) => setNewTable({ ...newTable, type: e.target.value as 'table' | 'bar' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                >
                  <option value="table">Mesa</option>
                  <option value="bar">Barra</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateTable}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Crear Mesa
              </button>
              <button
                onClick={() => {
                  setIsAddingTable(false);
                  setNewTable({
                    number: '',
                    capacity: 4,
                    level: selectedLevel,
                    type: 'table',
                    position: { x: 0, y: 0 },
                  });
                }}
                className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-300 font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Mesa */}
      {editingTable && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Editar Mesa</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Número</label>
                <input
                  type="text"
                  value={editingTable.number}
                  onChange={(e) => setEditingTable({ ...editingTable, number: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Capacidad</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={editingTable.capacity}
                  onChange={(e) => setEditingTable({ ...editingTable, capacity: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                <select
                  value={editingTable.type}
                  onChange={(e) => setEditingTable({ ...editingTable, type: e.target.value as 'table' | 'bar' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                >
                  <option value="table">Mesa</option>
                  <option value="bar">Barra</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleUpdateTable(editingTable)}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Guardar
              </button>
              <button
                onClick={() => setEditingTable(null)}
                className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-300 font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

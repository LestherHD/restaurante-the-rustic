'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, Calendar, User, Activity, Clock, FileText, Eye, X } from 'lucide-react';

interface AuditLog {
  _id: string;
  username: string;
  action: string;
  module: string;
  description: string;
  targetName?: string;
  createdAt: string;
  previousValue?: any;
  newValue?: any;
  metadata?: any;
}

export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, selectedModule, selectedAction, selectedUser]);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/audit');
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Error al cargar logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    if (selectedModule !== 'all') {
      filtered = filtered.filter(log => log.module === selectedModule);
    }

    if (selectedAction !== 'all') {
      filtered = filtered.filter(log => log.action === selectedAction);
    }

    if (selectedUser !== 'all') {
      filtered = filtered.filter(log => log.username === selectedUser);
    }

    setFilteredLogs(filtered);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'inventory_movement': return 'bg-purple-100 text-purple-800';
      case 'price_change': return 'bg-orange-100 text-orange-800';
      case 'login': return 'bg-emerald-100 text-emerald-800';
      case 'logout': return 'bg-slate-100 text-slate-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create': return 'Creación';
      case 'update': return 'Actualización';
      case 'delete': return 'Eliminación';
      case 'inventory_movement': return 'Movimiento';
      case 'price_change': return 'Precio';
      case 'login': return 'Inicio Sesión';
      case 'logout': return 'Cierre Sesión';
      default: return action;
    }
  };

  const getModuleLabel = (module: string) => {
    switch (module) {
      case 'drinks': return 'Bebidas';
      case 'ingredients': return 'Ingredientes';
      case 'categories': return 'Categorías';
      case 'dishes': return 'Platos';
      case 'recipes': return 'Recetas';
      case 'orders': return 'Órdenes';
      case 'users': return 'Usuarios';
      case 'auth': return 'Autenticación';
      default: return module;
    }
  };

  const uniqueUsers = Array.from(new Set(logs.map(log => log.username)));

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const sanitizeValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity size={28} />
            Registro de Auditoría
          </h1>
          <p className="text-gray-600 mt-1">Historial completo de actividades del sistema</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={20} className="text-gray-600" />
            <h2 className="font-semibold text-gray-900">Filtros</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Módulo
              </label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
              >
                <option value="all">Todos</option>
                <option value="drinks">Bebidas</option>
                <option value="ingredients">Ingredientes</option>
                <option value="categories">Categorías</option>
                <option value="dishes">Platos</option>
                <option value="recipes">Recetas</option>
                <option value="orders">Órdenes</option>
                <option value="users">Usuarios</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Acción
              </label>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
              >
                <option value="all">Todas</option>
                <option value="create">Creación</option>
                <option value="update">Actualización</option>
                <option value="delete">Eliminación</option>
                <option value="inventory_movement">Movimiento de Inventario</option>
                <option value="price_change">Cambio de Precio</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
              >
                <option value="all">Todos</option>
                {uniqueUsers.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total de Registros</p>
            <p className="text-3xl font-bold text-gray-900">{filteredLogs.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Creaciones</p>
            <p className="text-3xl font-bold text-green-600">
              {filteredLogs.filter(l => l.action === 'create').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Modificaciones</p>
            <p className="text-3xl font-bold text-blue-600">
              {filteredLogs.filter(l => l.action === 'update').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Eliminaciones</p>
            <p className="text-3xl font-bold text-red-600">
              {filteredLogs.filter(l => l.action === 'delete').length}
            </p>
          </div>
        </div>

        {/* Tabla de Logs */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">Cargando registros...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No hay registros con los filtros seleccionados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      <Clock size={14} className="inline mr-1" />
                      FECHA Y HORA
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      <User size={14} className="inline mr-1" />
                      USUARIO
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      MÓDULO
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      ACCIÓN
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      DESCRIPCIÓN
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                      DETALLES
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(log.createdAt).toLocaleString('es-GT', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                          {log.username}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                          {getModuleLabel(log.module)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {getActionLabel(log.action)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {log.description}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleViewDetails(log)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-xs font-medium"
                          title="Ver detalles completos"
                        >
                          <Eye size={14} />
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de Detalles */}
        {showDetailsModal && selectedLog && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDetailsModal(false)}>
            <div
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b bg-gradient-to-r from-indigo-600 to-indigo-700 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText size={24} />
                    Detalles del Registro
                  </h3>
                  <p className="text-indigo-100 text-sm mt-1">
                    ID: {selectedLog._id}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Datos de la Orden (si aplica) */}
                {selectedLog.module === 'orders' && selectedLog.newValue && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <FileText size={18} className="text-blue-600" />
                      Detalles de la Orden
                    </h4>
                    <div className="space-y-3">
                      {selectedLog.newValue.orderNumber && (
                        <div className="bg-white rounded p-3 border border-blue-100">
                          <p className="text-xs text-blue-600 mb-1">Número de Orden</p>
                          <p className="font-mono font-bold text-blue-900">
                            {sanitizeValue(selectedLog.newValue.orderNumber)}
                          </p>
                        </div>
                      )}
                      {selectedLog.newValue.mesero && (
                        <div className="bg-white rounded p-3 border border-blue-100">
                          <p className="text-xs text-blue-600 mb-1">Mesero</p>
                          <p className="font-semibold text-blue-900">
                            {sanitizeValue(selectedLog.newValue.mesero)}
                          </p>
                        </div>
                      )}
                      {selectedLog.newValue.mesa && (
                        <div className="bg-white rounded p-3 border border-blue-100">
                          <p className="text-xs text-blue-600 mb-1">Mesa</p>
                          <p className="font-semibold text-blue-900">
                            {sanitizeValue(selectedLog.newValue.mesa)}
                          </p>
                        </div>
                      )}
                      {selectedLog.newValue.items && Array.isArray(selectedLog.newValue.items) && (
                        <div className="bg-white rounded p-3 border border-blue-100">
                          <p className="text-xs text-blue-600 mb-2">Items de la Orden</p>
                          <div className="space-y-2">
                            {selectedLog.newValue.items.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between bg-blue-50 p-2 rounded">
                                <div>
                                  <p className="font-medium text-blue-900">
                                    {item.cantidad || item.quantity}x {item.bebida || item.drinkName}
                                  </p>
                                  <p className="text-xs text-blue-600">
                                    Q{(item.precio || item.price)?.toFixed(2)} c/u
                                  </p>
                                </div>
                                <p className="font-bold text-blue-900">
                                  Q{(item.subtotal)?.toFixed(2)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedLog.newValue.total !== undefined && (
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded p-3 border border-blue-800">
                          <p className="text-xs text-blue-100 mb-1">Total</p>
                          <p className="text-2xl font-bold text-white">
                            Q{Number(selectedLog.newValue.total).toFixed(2)}
                          </p>
                        </div>
                      )}
                      {selectedLog.newValue.estado && (
                        <div className="bg-white rounded p-3 border border-blue-100">
                          <p className="text-xs text-blue-600 mb-1">Estado</p>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            selectedLog.newValue.estado === 'Abierta' ? 'bg-yellow-100 text-yellow-800' :
                            selectedLog.newValue.estado === 'Pagada' || selectedLog.newValue.estado === 'pagada' ? 'bg-green-100 text-green-800' :
                            selectedLog.newValue.estado === 'cancelada' ? 'bg-red-100 text-red-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {sanitizeValue(selectedLog.newValue.estado)}
                          </span>
                        </div>
                      )}
                      {selectedLog.newValue.notas && (
                        <div className="bg-white rounded p-3 border border-blue-100">
                          <p className="text-xs text-blue-600 mb-1">Notas</p>
                          <p className="text-blue-900 italic">
                            {sanitizeValue(selectedLog.newValue.notas)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t bg-slate-50 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-semibold transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

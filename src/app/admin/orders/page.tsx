'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, Eye, RefreshCw } from 'lucide-react';

interface Order {
  _id: string;
  orderNumber: string;
  items: Array<{
    drinkId: string;
    drinkName: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  total: number;
  status: string;
  waiterName: string;
  tableNumber?: string;
  notes?: string;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  };

  const statusColors: { [key: string]: string } = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    preparing: 'bg-blue-100 text-blue-700 border-blue-300',
    ready: 'bg-green-100 text-green-700 border-green-300',
    delivered: 'bg-gray-100 text-gray-700 border-gray-300',
    cancelled: 'bg-red-100 text-red-700 border-red-300',
  };

  const statusLabels: { [key: string]: string } = {
    pending: 'Pendiente',
    preparing: 'Preparando',
    ready: 'Listo',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart size={28} />
                Órdenes
              </h1>
              <p className="text-gray-600 mt-1">Gestión de pedidos</p>
            </div>
            <button
              onClick={fetchOrders}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <RefreshCw size={20} />
              Actualizar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid gap-4">{orders.length > 0 ? (
          orders.map(order => (
            <div key={order._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">Orden #{order.orderNumber}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Mesero:</strong> {order.waiterName}</p>
                    {order.tableNumber && <p><strong>Mesa:</strong> {order.tableNumber}</p>}
                    <p><strong>Total:</strong> <span className="text-lg font-bold text-purple-600">Q{order.total.toFixed(2)}</span></p>
                    <p><strong>Fecha:</strong> {new Date(order.createdAt).toLocaleString('es-GT')}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(order._id, 'preparing')}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Marcar Preparando
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(order._id, 'ready')}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Marcar Listo
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(order._id, 'delivered')}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Marcar Entregado
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Eye size={18} />
                    Ver Detalles
                  </button>
                </div>
              </div>

              {order.notes && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm"><strong>Notas:</strong> {order.notes}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No hay órdenes registradas</p>
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Detalles de Orden #{selectedOrder.orderNumber}</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${statusColors[selectedOrder.status]}`}>
                    {statusLabels[selectedOrder.status]}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-xl font-bold text-purple-600">Q{selectedOrder.total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mesero</p>
                  <p className="font-medium">{selectedOrder.waiterName}</p>
                </div>
                {selectedOrder.tableNumber && (
                  <div>
                    <p className="text-sm text-gray-600">Mesa</p>
                    <p className="font-medium">{selectedOrder.tableNumber}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3">Productos</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.drinkName}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} x Q{item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-bold">Q{item.subtotal.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium mb-1">Notas:</p>
                  <p className="text-sm">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="text-sm text-gray-600">
                <p><strong>Fecha de creación:</strong> {new Date(selectedOrder.createdAt).toLocaleString('es-GT')}</p>
              </div>
            </div>

            <div className="p-6 border-t">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
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

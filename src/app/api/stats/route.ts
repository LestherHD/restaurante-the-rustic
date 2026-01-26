import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Order from '@/models/Order';
import Drink from '@/models/Drink';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await dbConnect();

    // Obtener todas las transacciones
    const incomeTransactions = await Transaction.find({ type: 'income' });
    const expenseTransactions = await Transaction.find({ type: 'expense' });

    const totalRevenue = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const balance = totalRevenue - totalExpenses;

    // Obtener estadísticas de bebidas
    const totalDrinks = await Drink.countDocuments();
    const activeDrinks = await Drink.countDocuments({ isActive: true });

    // Obtener bebidas con stock bajo
    const lowStockItems = await Drink.find({
      $expr: { $lte: ['$totalUnits', '$lowStockAlert'] },
      isActive: true
    })
      .select('name totalUnits lowStockAlert')
      .limit(10)
      .lean();

    const lowStockDrinks = lowStockItems.length;

    // Obtener órdenes
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({
      paymentStatus: { $ne: 'paid' },
      status: { $ne: 'cancelled' }
    });

    // Obtener órdenes recientes (últimas 10)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderNumber total status paymentStatus waiterName createdAt')
      .lean();

    // Formatear las órdenes recientes
    const formattedOrders = recentOrders.map(order => ({
      _id: order._id.toString(),
      orderNumber: order.orderNumber,
      total: order.total,
      status: order.status || 'pending',
      waiterName: order.waiterName || 'N/A',
      createdAt: order.createdAt.toISOString(),
    }));

    return NextResponse.json({
      totalDrinks,
      activeDrinks,
      lowStockDrinks,
      totalOrders,
      pendingOrders,
      totalRevenue,
      totalExpenses,
      balance,
      recentOrders: formattedOrders,
      lowStockItems: lowStockItems.map(item => ({
        _id: item._id.toString(),
        name: item.name,
        totalUnits: item.totalUnits,
        lowStockAlert: item.lowStockAlert,
      })),
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 });
  }
}

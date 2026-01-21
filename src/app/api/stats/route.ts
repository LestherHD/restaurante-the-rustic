import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Order from '@/models/Order';
import Drink from '@/models/Drink';

export async function GET() {
  try {
    await dbConnect();

    // Obtener transacciones
    const incomeTransactions = await Transaction.find({ type: 'income' });
    const expenseTransactions = await Transaction.find({ type: 'expense' });

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Obtener órdenes del día
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const totalOrders = await Order.countDocuments({
      createdAt: { $gte: today }
    });

    // Obtener bebidas con stock bajo
    const lowStockItems = await Drink.countDocuments({
      stock: { $lt: 10 },
      isActive: true
    });

    return NextResponse.json({
      totalIncome,
      totalExpenses,
      totalOrders,
      lowStockItems,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Drink from '@/models/Drink';

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today';

    // Calcular fechas según el período
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'all':
        startDate = new Date(0); // Desde el principio
        break;
      default:
        startDate = new Date(now.setHours(0, 0, 0, 0));
    }

    // Obtener órdenes del período
    const orders = await Order.find({
      createdAt: { $gte: startDate },
      status: { $ne: 'cancelled' }
    }).sort({ createdAt: -1 });

    // Calcular totales generales
    let totalRevenue = 0;
    let totalCost = 0;
    const drinkSalesMap = new Map<string, {
      drinkId: string;
      drinkName: string;
      totalQuantity: number;
      totalRevenue: number;
      totalCost: number;
    }>();

    // Procesar cada orden
    for (const order of orders) {
      totalRevenue += order.total;

      // Procesar items de la orden
      for (const item of order.items) {
        // Obtener información de costo de la bebida ACTUAL (nota: idealmente se debería guardar en la orden)
        const drink = await Drink.findById(item.drinkId);
        const itemCost = drink ? (drink.costPerUnit * item.quantity) : 0;
        totalCost += itemCost;

        // Agregar o actualizar estadísticas por bebida
        const drinkIdStr = item.drinkId.toString();
        const existing = drinkSalesMap.get(drinkIdStr);
        if (existing) {
          existing.totalQuantity += item.quantity;
          existing.totalRevenue += item.subtotal;
          existing.totalCost += itemCost;
        } else {
          drinkSalesMap.set(drinkIdStr, {
            drinkId: drinkIdStr,
            drinkName: item.drinkName,
            totalQuantity: item.quantity,
            totalRevenue: item.subtotal,
            totalCost: itemCost,
          });
        }
      }
    }

    // Convertir mapa a array y calcular ganancias
    const drinkSales = Array.from(drinkSalesMap.values()).map(sale => ({
      ...sale,
      profit: sale.totalRevenue - sale.totalCost,
      profitMargin: sale.totalRevenue > 0
        ? ((sale.totalRevenue - sale.totalCost) / sale.totalRevenue) * 100
        : 0,
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);

    const totalProfit = totalRevenue - totalCost;
    const totalItemsSold = drinkSales.reduce((sum, sale) => sum + sale.totalQuantity, 0);

    return NextResponse.json({
      totalRevenue,
      totalCost,
      totalProfit,
      totalOrders: orders.length,
      totalItemsSold,
      drinkSales,
    });

  } catch (error) {
    console.error('Error al obtener datos de contabilidad:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos de contabilidad' },
      { status: 500 }
    );
  }
}

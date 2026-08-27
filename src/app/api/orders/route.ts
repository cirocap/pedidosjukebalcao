import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerNumber, customerName, items } = body as {
      customerNumber: string;
      customerName: string;
      items: {
        itemName: string;
        category: string;
        price: number;
        quantity: number;
        removedIngredients: string[];
        notes?: string;
      }[];
    };

    if (!customerNumber || !customerName || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Dados incompletos" },
        { status: 400 }
      );
    }

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const [order] = await db
      .insert(orders)
      .values({
        customerNumber,
        customerName,
        total,
        status: "pendente",
      })
      .returning();

    const orderItemsData = items.map((item) => ({
      orderId: order.id,
      itemName: item.itemName,
      category: item.category,
      price: item.price,
      quantity: item.quantity,
      removedIngredients: item.removedIngredients || [],
      notes: item.notes || null,
    }));

    await db.insert(orderItems).values(orderItemsData);

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Erro ao criar pedido" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query;
    if (status) {
      query = await db
        .select()
        .from(orders)
        .where(eq(orders.status, status))
        .orderBy(desc(orders.createdAt));
    } else {
      query = await db
        .select()
        .from(orders)
        .orderBy(desc(orders.createdAt));
    }

    const ordersWithItems = await Promise.all(
      query.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));
        return { ...order, items };
      })
    );

    return NextResponse.json(ordersWithItems);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pedidos" },
      { status: 500 }
    );
  }
}

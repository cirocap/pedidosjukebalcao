import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const allProducts = await db
      .select()
      .from(products)
      .where(eq(products.active, true))
      .orderBy(asc(products.sortOrder));
    return NextResponse.json(allProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Erro ao buscar produtos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      price,
      category,
      ingredients,
      duploPrice,
      isSandwich,
      sortOrder,
    } = body as {
      name: string;
      price: number;
      category: string;
      ingredients?: string[];
      duploPrice?: number | null;
      isSandwich?: boolean;
      sortOrder?: number;
    };

    if (!name || !price || !category) {
      return NextResponse.json(
        { error: "Nome, preço e categoria são obrigatórios" },
        { status: 400 }
      );
    }

    const [product] = await db
      .insert(products)
      .values({
        name,
        price,
        category,
        ingredients: ingredients || [],
        duploPrice: duploPrice ?? null,
        isSandwich: isSandwich ?? false,
        sortOrder: sortOrder ?? 0,
        active: true,
      })
      .returning();

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Erro ao criar produto" },
      { status: 500 }
    );
  }
}

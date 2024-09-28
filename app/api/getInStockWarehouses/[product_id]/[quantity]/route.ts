import { NextRequest, NextResponse } from "next/server";
const { helpers } = require("../../../db");

export async function GET(
  req: NextRequest,
  { params }: { params: { product_id: string; quantity: string } },
) {
  try {
    const { product_id, quantity } = params;

    // Fetch the warehouses with the product in stock
    const response = await helpers.getInStockWarehouses(product_id, quantity);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Failed to get warehouse stock:", error);
    return NextResponse.json(
      { error: "Failed to get warehouse stock." },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";

export async function PATCH(req: NextRequest) {
  try {
    const { product_id, new_price } = await req.json();

    // Call the helper function to update the product price
    await updateProductPriceByProductId(product_id, new_price);

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed updating product price in productprice table" },
      { status: 500 },
    );
  }
}

async function updateProductPriceByProductId(product_id: any, new_price: any) {
  try {
    const response = await pool.query(
      `
        UPDATE productprice
        SET current_price = $1
        WHERE product_id = $2`,
      [new_price, product_id],
    );
  } catch (error) {
    console.error("Error updating product price in productprice table:", error);
  }
}

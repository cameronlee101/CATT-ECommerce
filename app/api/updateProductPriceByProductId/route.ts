import { NextRequest, NextResponse } from "next/server";
const db = require("@/app/api/db");

export async function PATCH(req: NextRequest) {
  try {
    const { product_id, new_price } = await req.json();

    // Call the helper function to update the product price
    await db.updateProductPriceByProductId(product_id, new_price);

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed updating product price in productprice table" },
      { status: 500 },
    );
  }
}

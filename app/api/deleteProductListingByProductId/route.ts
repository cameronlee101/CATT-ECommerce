import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";

export async function DELETE(req: NextRequest) {
  try {
    const { product_id } = await req.json();

    await deleteProductListingByProductId(product_id);

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to delete product listing" },
      { status: 500 },
    );
  }
}

async function deleteProductListingByProductId(product_id: any) {
  try {
    await pool.query(
      `
      UPDATE product
      SET active = false
      WHERE product_id = $1;`,
      [product_id],
    );
  } catch (error) {
    console.error("Error deleting product listing:", error);
  }
}

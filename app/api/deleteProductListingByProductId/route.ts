import { NextRequest, NextResponse } from "next/server";
const db = require("@/app/api/db");

export async function DELETE(req: NextRequest) {
  try {
    const { product_id } = await req.json();

    await db.deleteProductListingByProductId(product_id);

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to delete product listing" },
      { status: 500 },
    );
  }
}

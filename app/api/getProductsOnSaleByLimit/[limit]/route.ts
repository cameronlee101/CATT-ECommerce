import { NextRequest, NextResponse } from "next/server";
const db = require("@/app/api/db");

export async function GET(
  req: NextRequest,
  { params }: { params: { limit: string } },
) {
  const limit = params.limit ? parseInt(params.limit) : -1; // -1 is unlimited

  try {
    const products = await db.getProductsOnSaleByLimit(limit);

    if (products.length > 0) {
      return NextResponse.json(products, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "Products not found!" },
        { status: 404 },
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server failed to get products!" },
      { status: 500 },
    );
  }
}

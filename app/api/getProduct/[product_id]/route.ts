import { NextRequest, NextResponse } from "next/server";
const { helpers } = require("../../db");

export async function GET(
  req: NextRequest,
  { params }: { params: { product_id: string } },
) {
  if (!params.product_id) {
    return NextResponse.json({ error: "Invalid product ID!" }, { status: 400 });
  }

  let product_id = parseInt(params.product_id);

  try {
    // Check for non-positive product_id
    if (product_id <= 0) {
      return NextResponse.json(
        { error: "Invalid product ID!" },
        { status: 400 },
      );
    }

    const response = await helpers.getProductInfoByPid(product_id);

    if (response.length === 0) {
      return NextResponse.json(
        { error: "Product not found!" },
        { status: 404 },
      );
    } else {
      return NextResponse.json(response, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Server failed to get product!" },
      { status: 500 },
    );
  }
}

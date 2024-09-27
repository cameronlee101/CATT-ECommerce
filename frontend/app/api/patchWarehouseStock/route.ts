import { NextRequest, NextResponse } from "next/server";
const { helpers } = require("../db");

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    let { warehouse_id, product_id, quantity } = body;

    if (!warehouse_id) {
      return NextResponse.json(
        { error: "Invalid warehouse id!" },
        { status: 400 },
      );
    }
    warehouse_id = parseInt(warehouse_id);

    if (!product_id) {
      return NextResponse.json(
        { error: "Invalid product id!" },
        { status: 400 },
      );
    }
    product_id = parseInt(product_id);

    if (!quantity) {
      return NextResponse.json({ error: "Invalid quantity!" }, { status: 400 });
    }
    quantity = parseInt(quantity);

    const response = await helpers.patchWarehouseStock(
      warehouse_id,
      product_id,
      quantity,
    );

    if (response === 1) {
      return NextResponse.json(
        { success: "Warehouse quantity modified successfully!" },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { error: "Warehouse quantity is less than desired quantity!" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Server failed to modify warehouse quantity!" },
      { status: 500 },
    );
  }
}

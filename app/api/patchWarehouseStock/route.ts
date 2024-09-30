import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";

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

    const response = await patchWarehouseStock(
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

//Updates the stock quantity of a specific product in a warehouse.
//Parameters:warehouse_id (Integer),product_id (Integer),quantity (Integer)
//Returns:
//1 if the operation is successful.
//-1 if the current quantity is less than the requested quantity.
//0 if the product is not found in the warehouse.

async function patchWarehouseStock(
  warehouse_id: any,
  product_id: any,
  quantity: number,
) {
  try {
    let response = await pool.query(
      `SELECT quantity FROM warehousestock WHERE warehouse_id = $1 AND product_id = $2;`,
      [warehouse_id, product_id],
    );
    if (response.rows[0].quantity >= quantity) {
      await pool.query(
        `UPDATE warehousestock SET quantity = quantity - $3 WHERE warehouse_id = $1 AND product_id = $2;`,
        [warehouse_id, product_id, quantity],
      );
      return 1;
    }
    return 0;
  } catch (error) {
    console.error("Error adjusting warehouse stock:", error);
  }
}

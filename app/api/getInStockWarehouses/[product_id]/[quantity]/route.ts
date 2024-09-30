import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";

export async function GET(
  req: NextRequest,
  { params }: { params: { product_id: string; quantity: string } },
) {
  try {
    const { product_id, quantity } = params;

    // Fetch the warehouses with the product in stock
    const response = await getInStockWarehouses(product_id, quantity);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Failed to get warehouse stock:", error);
    return NextResponse.json(
      { error: "Failed to get warehouse stock." },
      { status: 500 },
    );
  }
}

//Retrieves warehouses that have a specified quantity of a particular product in stock.
//Parameters:product_id (Integer),quantity (Integer)
//Returns: A list of warehouses meeting the criteria or logs an error if the operation fails.

async function getInStockWarehouses(product_id: any, quantity: any) {
  try {
    const response = await pool.query(
      `SELECT * 
      FROM warehousestock whs
      JOIN warehouse wh
      ON whs.warehouse_id = wh.warehouse_id
      WHERE product_id = $1 AND quantity >= $2;`,
      [product_id, quantity],
    );
    return response.rows;
  } catch (error) {
    console.error("Error getting warehouse stock:", error);
  }
}

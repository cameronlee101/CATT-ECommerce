import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";

export async function GET(
  req: NextRequest,
  { params }: { params: { warehouse_id: string } },
) {
  try {
    const { warehouse_id } = params;

    // Fetch the warehouse info based on the warehouse_id
    const response = await getWarehouseInfo(warehouse_id);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Failed to get warehouse info:", error);
    return NextResponse.json(
      { error: "Failed to get warehouse info." },
      { status: 500 },
    );
  }
}

//Fetches detailed information for a specific warehouse by its ID.
//Parameters:warehouse_id (Integer)
//Returns: Detailed information for the specified warehouse
async function getWarehouseInfo(warehouse_id: any) {
  try {
    const response = await pool.query(
      `SELECT * 
      FROM warehouse
      WHERE warehouse_id = $1;`,
      [warehouse_id],
    );
    return response.rows;
  } catch (error) {
    console.error("Error getting warehouse info:", error);
  }
}

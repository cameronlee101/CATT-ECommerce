import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";

export async function GET(req: NextRequest) {
  try {
    // Fetch all warehouse info using the helper function
    const response = await getAllWarehouseInfo();

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Failed to get all warehouse info:", error);
    return NextResponse.json(
      { error: "Failed to get all warehouse info." },
      { status: 500 },
    );
  }
}

// Retrieves information for all warehouses in the database.
//Parameters: None.
//Returns: A list containing information for all warehouses

async function getAllWarehouseInfo() {
  try {
    const response = await pool.query(
      `SELECT * 
      FROM warehouse;`,
    );
    response.rows = response.rows.filter((row) => row.warehouse_id !== -1);
    return response.rows;
  } catch (error) {
    console.error("Error getting all warehouse info:", error);
  }
}

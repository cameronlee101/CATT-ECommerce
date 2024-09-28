import { NextRequest, NextResponse } from "next/server";
const db = require("@/app/api/db");

export async function GET(
  req: NextRequest,
  { params }: { params: { warehouse_id: string } },
) {
  try {
    const { warehouse_id } = params;

    // Fetch the warehouse info based on the warehouse_id
    const response = await db.getWarehouseInfo(warehouse_id);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Failed to get warehouse info:", error);
    return NextResponse.json(
      { error: "Failed to get warehouse info." },
      { status: 500 },
    );
  }
}

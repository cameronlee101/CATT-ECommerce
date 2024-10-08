import { NextRequest, NextResponse } from "next/server";
const db = require("@/app/api/db");

export async function GET(req: NextRequest) {
  try {
    // Fetch all warehouse info using the helper function
    const response = await db.getAllWarehouseInfo();

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Failed to get all warehouse info:", error);
    return NextResponse.json(
      { error: "Failed to get all warehouse info." },
      { status: 500 },
    );
  }
}

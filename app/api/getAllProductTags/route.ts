import { NextResponse } from "next/server";
const db = require("@/app/api/db");

export async function GET() {
  try {
    const tags = await db.getAllProductTags();
    return NextResponse.json(tags, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product tags" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
const { helpers } = require("../db");

export async function GET() {
  try {
    const tags = await helpers.getAllProductTags();
    return NextResponse.json(tags, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product tags" },
      { status: 500 },
    );
  }
}

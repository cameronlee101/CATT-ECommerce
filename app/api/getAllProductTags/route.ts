import { NextResponse } from "next/server";
import pool from "@/lib/pool";

export async function GET() {
  try {
    const tags = await getAllProductTags();
    return NextResponse.json(tags, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product tags" },
      { status: 500 },
    );
  }
}

//Fetches all unique product tags from the database.
//Parameters: none
//Returns: An array of all product tags as strings.
async function getAllProductTags() {
  try {
    const result = await pool.query("SELECT tag_name FROM tag;");
    return result.rows.map((row) => row.tag_name);
  } catch (error) {
    console.error("Error fetching product tags:", error);
  }
}

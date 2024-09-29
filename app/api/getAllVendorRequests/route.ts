import { NextRequest, NextResponse } from "next/server";
const db = require("@/app/api/db");

// theres some weird stuff with nextjs caching the result of this api call which causes a headache, this stops caching
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    // Fetch all vendor requests using the helper function
    const response = await db.getAllVendorRequests();

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Failed to get all vendor requests:", error);
    return NextResponse.json(
      { error: "Failed to get all vendor requests." },
      { status: 500 },
    );
  }
}

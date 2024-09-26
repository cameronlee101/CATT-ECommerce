import { NextRequest, NextResponse } from "next/server";
const { helpers } = require("../../db");

export async function GET(req: NextRequest) {
  try {
    // Fetch all vendor requests using the helper function
    const response = await helpers.getAllVendorRequests();

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Failed to get all vendor requests:", error);
    return NextResponse.json(
      { error: "Failed to get all vendor requests." },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
const { helpers } = require("../../db");

export async function POST(req: NextRequest) {
  try {
    const { user_email } = await req.json();

    // Call the helper function to post the vendor request by user email
    await helpers.postVendorRequestsByUserEmail(user_email);
    console.log("Vendor Request Posted Successfully!");

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error("Failed to post vendor request:", error);
    return NextResponse.json(
      { error: "Failed to post vendor request." },
      { status: 500 },
    );
  }
}

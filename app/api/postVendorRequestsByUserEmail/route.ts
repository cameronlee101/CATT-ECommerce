import { NextRequest, NextResponse } from "next/server";
const db = require("@/app/api/db");

export async function POST(req: NextRequest) {
  try {
    const { user_email } = await req.json();

    // Validate user_email
    if (!user_email || typeof user_email !== "string") {
      return NextResponse.json(
        { error: "Invalid user email!" },
        { status: 400 },
      );
    }

    // Call the helper function to post the vendor request by user email
    await db.postVendorRequestsByUserEmail(user_email);
    console.log("Vendor Request Posted Successfully!");

    return NextResponse.json(
      { msg: "Vendor Request Posted Successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to post vendor request:", error);
    return NextResponse.json(
      { error: "Failed to post vendor request." },
      { status: 500 },
    );
  }
}

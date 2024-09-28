import { NextRequest, NextResponse } from "next/server";
const { helpers } = require("../db");

export async function DELETE(req: NextRequest) {
  try {
    const { user_email } = await req.json();

    // Call the helper function to delete the vendor request by user email
    await helpers.deleteVendorRequestByUserEmail(user_email);
    console.log("Vendor Request Deleted Successfully!");

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error("Failed to delete vendor request:", error);
    return NextResponse.json(
      { error: "Failed to delete vendor request." },
      { status: 500 },
    );
  }
}

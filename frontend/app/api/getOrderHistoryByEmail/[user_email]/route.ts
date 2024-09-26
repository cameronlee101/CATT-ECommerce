import { NextRequest, NextResponse } from "next/server";
const { helpers } = require("../../db");

export async function GET(
  req: Request,
  { params }: { params: { user_email: string } },
) {
  try {
    const { user_email } = params;

    // Get the order history based on the email
    const history = await helpers.getOrderHistoryByEmail(user_email);

    return NextResponse.json(history, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to get order History" },
      { status: 500 },
    );
  }
}

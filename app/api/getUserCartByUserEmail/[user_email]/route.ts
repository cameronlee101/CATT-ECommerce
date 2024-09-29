import { NextRequest, NextResponse } from "next/server";
const db = require("@/app/api/db");

export async function GET(
  req: NextRequest,
  { params }: { params: { user_email: string } },
) {
  if (!params.user_email.trim()) {
    return NextResponse.json({ error: "Invalid user email!" }, { status: 400 });
  }

  const user_email = params.user_email.trim();

  try {
    const products = await db.getUserCartByUserEmail(user_email);
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Server failed to get user cart!" },
      { status: 500 },
    );
  }
}

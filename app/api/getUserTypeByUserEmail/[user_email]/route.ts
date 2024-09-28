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
    const users = await db.getUserTypeByUserEmail(user_email);

    if (users.length > 0) {
      return NextResponse.json({ type: users[0].type }, { status: 200 });
    } else {
      return NextResponse.json({ error: "User not found!" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Server failed to get user!" },
      { status: 500 },
    );
  }
}

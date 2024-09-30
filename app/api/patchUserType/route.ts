import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    let { user_email, user_type } = body;

    if (!user_email) {
      return NextResponse.json(
        { error: "Invalid user email!" },
        { status: 400 },
      );
    }
    user_email = user_email.trim();

    if (!user_type) {
      return NextResponse.json({ error: "Invalid type!" }, { status: 400 });
    }
    user_type = user_type.trim().toLowerCase();

    if (user_type !== "customer" && user_type !== "vendor") {
      return NextResponse.json({ error: "Invalid type2!" }, { status: 400 });
    }

    const type_id = user_type === "vendor" ? 1 : 2;

    await patchUserType(user_email, type_id);

    return NextResponse.json(
      { success: "User type modified successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Server failed to modify user type!" },
      { status: 500 },
    );
  }
}

//Updates the user type for a specific user identified by their email
//Parameters: user_email (String), user_type (String - "vendor" or "customer")
//Returns: None.
async function patchUserType(user_email: any, type: any) {
  try {
    await pool.query(`UPDATE users SET type_id = $1 WHERE user_email = $2`, [
      type,
      user_email,
    ]);
  } catch (error) {
    console.error("Error updating user type:", error);
  }
}

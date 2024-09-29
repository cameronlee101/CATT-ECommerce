import { NextRequest, NextResponse } from "next/server";
const db = require("@/app/api/db");

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    let { user_email, product_id } = body;

    if (!user_email) {
      return NextResponse.json(
        { error: "Invalid user email!" },
        { status: 400 },
      );
    }
    user_email = user_email.trim();

    product_id = parseInt(product_id);

    await db.deleteUserCartByPidUserEmail(user_email, product_id);

    return NextResponse.json(
      { msg: "Item removed from user cart successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Server failed to delete product from user cart!" },
      { status: 500 },
    );
  }
}
